import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Table from '../components/Table';
import EmptyState from '../components/EmptyState';

const Mentoring = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role;

  const [loadingBooking, setLoadingBooking] = useState(false);
  const [error, setError] = useState('');

  const [startups, setStartups] = useState([]);
  const [mentors, setMentors] = useState([]);

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [feedbackDrafts, setFeedbackDrafts] = useState({});

  const [form, setForm] = useState({
    startup_id: '',
    mentor_id: '',
    session_date: '',
    mode: 'Online',
  });

  const isIgnorable422 = (err) => err?.response?.status === 422;

  const statusTone = useMemo(() => {
    return (status) => {
      if (status === 'Completed') return 'success';
      if (status === 'Cancelled') return 'danger';
      return 'info';
    };
  }, []);

  const applySessions = (rows) => {
    setSessions(rows);
    const nextDrafts = {};
    rows.forEach((s) => {
      nextDrafts[s.session_id] = {
        rating: role === 'Founder' ? s.founder_rating ?? '' : s.mentor_rating ?? '',
        notes: s.notes ?? '',
      };
    });
    setFeedbackDrafts(nextDrafts);
  };

  const fetchSessions = async () => {
    setSessionsLoading(true);
    setError('');
    try {
      const res = await api.get('/mentors/sessions');
      applySessions(res.data ?? []);
    } catch (e) {
      if (isIgnorable422(e)) {
        applySessions([]);
      } else {
        setError(e?.response?.data?.message || e?.message || 'Failed to load sessions');
      }
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadBooking = async () => {
      setLoadingBooking(true);
      setError('');
      try {
        const [startupsRes, mentorsRes] = await Promise.allSettled([api.get('/startups/'), api.get('/mentors/')]);
        if (!mounted) return;
        setStartups(startupsRes.status === 'fulfilled' ? startupsRes.value.data ?? [] : []);
        setMentors(mentorsRes.status === 'fulfilled' ? mentorsRes.value.data ?? [] : []);

        const startupsError = startupsRes.status === 'rejected' ? startupsRes.reason : null;
        const mentorsError = mentorsRes.status === 'rejected' ? mentorsRes.reason : null;
        const blockingError = [startupsError, mentorsError].find((err) => err && !isIgnorable422(err));

        if (blockingError) {
          setError(blockingError?.response?.data?.message || blockingError?.message || 'Failed to load mentoring data');
        }
      } catch (e) {
        if (mounted) {
          setError(e?.response?.data?.message || e?.message || 'Failed to load mentoring data');
        }
      } finally {
        if (mounted) setLoadingBooking(false);
      }
    };

    loadBooking();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // RBAC affects which sessions endpoint returns
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const bookSession = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/mentors/sessions', {
        startup_id: Number(form.startup_id),
        mentor_id: Number(form.mentor_id),
        session_date: form.session_date,
        mode: form.mode,
      });
      alert('Session booked');
      setForm({ startup_id: '', mentor_id: '', session_date: '', mode: 'Online' });
      await fetchSessions();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to book session');
    }
  };

  const submitFeedback = async (session_id) => {
    setError('');
    const draft = feedbackDrafts[session_id] ?? {};
    const rating = draft.rating === '' ? null : Number(draft.rating);

    if (role === 'Founder' || role === 'Mentor') {
      if (rating === null || Number.isNaN(rating) || rating < 1 || rating > 5) {
        setError('Please provide a valid rating between 1 and 5.');
        return;
      }
    }

    const payload = { rating };
    if (role === 'Mentor') payload.notes = draft.notes ?? '';

    try {
      await api.put(`/mentors/sessions/${session_id}/feedback`, payload);
      await fetchSessions();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit feedback');
    }
  };

  return (
    <div className="app-page space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="page-header-title">Mentoring</h1>
          <p className="page-header-copy">Book sessions and submit feedback.</p>
        </div>
      </div>

      {error ? <div className="surface-card alert-error p-6">{error}</div> : null}

      {(role === 'Founder' || role === 'Admin') && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Book a Mentoring Session</h2>
          {loadingBooking ? (
            <Loading label="Loading booking data..." />
          ) : (
            <form onSubmit={bookSession} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Startup</label>
                <select
                  className="field-control"
                  value={form.startup_id}
                  onChange={(e) => setForm({ ...form, startup_id: e.target.value })}
                  required
                >
                  <option value="" disabled>
                    Select a startup
                  </option>
                  {startups.map((s) => (
                    <option key={s.startup_id} value={s.startup_id}>
                      {s.company_name} ({s.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Mentor</label>
                <select
                  className="field-control"
                  value={form.mentor_id}
                  onChange={(e) => setForm({ ...form, mentor_id: e.target.value })}
                  required
                >
                  <option value="" disabled>
                    Select a mentor
                  </option>
                  {mentors.map((m) => (
                    <option key={m.mentor_id} value={m.mentor_id}>
                      {m.domain_expertise}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Session Date</label>
                <input
                  type="datetime-local"
                  className="field-control"
                  value={form.session_date}
                  onChange={(e) => setForm({ ...form, session_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="field-label">Mode</label>
                <select
                  className="field-control"
                  value={form.mode}
                  onChange={(e) => setForm({ ...form, mode: e.target.value })}
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-500">
                  Book Session
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">My Sessions</h2>

        {sessionsLoading ? (
          <Loading label="Loading sessions..." />
        ) : sessions.length === 0 ? (
          <EmptyState title="No sessions found." description="Once sessions are booked, they will appear here." />
        ) : (
          <Table>
            <thead>
              <tr>
                <th className="px-6 py-4 font-semibold">Startup</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Mode</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const canFeedback = s.status !== 'Completed' && (role === 'Founder' || role === 'Mentor');
                return (
                  <tr key={s.session_id} className="align-top">
                    <td className="px-6 py-4">
                      <div className="font-medium">{s.company_name || `Startup #${s.startup_id}`}</div>
                    </td>
                    <td className="px-6 py-4">
                      {s.session_date ? String(s.session_date).slice(0, 16).replace('T', ' ') : '—'}
                    </td>
                    <td className="px-6 py-4">{s.mode}</td>
                    <td className="px-6 py-4">
                      <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {role === 'Founder' && (
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            max="5"
                            className="field-control w-24 px-3 py-2"
                            value={feedbackDrafts[s.session_id]?.rating ?? ''}
                            onChange={(e) =>
                              setFeedbackDrafts({
                                ...feedbackDrafts,
                                [s.session_id]: { ...feedbackDrafts[s.session_id], rating: e.target.value },
                              })
                            }
                            disabled={!canFeedback}
                          />
                          <Button
                            type="button"
                            className="px-5 bg-blue-600 hover:bg-blue-500"
                            disabled={!canFeedback}
                            onClick={() => submitFeedback(s.session_id)}
                          >
                            Submit
                          </Button>
                        </div>
                      )}

                      {role === 'Mentor' && (
                        <div className="space-y-2">
                          <input
                            type="number"
                            min="1"
                            max="5"
                            className="field-control w-24 px-3 py-2"
                            value={feedbackDrafts[s.session_id]?.rating ?? ''}
                            onChange={(e) =>
                              setFeedbackDrafts({
                                ...feedbackDrafts,
                                [s.session_id]: { ...feedbackDrafts[s.session_id], rating: e.target.value },
                              })
                            }
                            disabled={!canFeedback}
                          />
                          <textarea
                            className="field-control w-full px-3 py-2"
                            rows={2}
                            placeholder="Notes (optional)"
                            value={feedbackDrafts[s.session_id]?.notes ?? ''}
                            onChange={(e) =>
                              setFeedbackDrafts({
                                ...feedbackDrafts,
                                [s.session_id]: { ...feedbackDrafts[s.session_id], notes: e.target.value },
                              })
                            }
                            disabled={!canFeedback}
                          />
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              className="px-5 bg-blue-600 hover:bg-blue-500"
                              disabled={!canFeedback}
                              onClick={() => submitFeedback(s.session_id)}
                            >
                              Submit
                            </Button>
                          </div>
                        </div>
                      )}

                      {role === 'Admin' && <div className="text-sm text-slate-400">Founder/Mentor provide feedback.</div>}
                      {role !== 'Founder' && role !== 'Mentor' && role !== 'Admin' ? (
                        <div className="text-sm text-slate-400">Feedback unavailable.</div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default Mentoring;
