import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Table from '../components/Table';
import EmptyState from '../components/EmptyState';
import Select from '../components/Select';

const Milestones = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [cohorts, setCohorts] = useState([]);
  const [startups, setStartups] = useState([]);

  // Admin view
  const [selectedCohortId, setSelectedCohortId] = useState('');
  const [cohortStartupMilestones, setCohortStartupMilestones] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  // Founder view
  const [selectedStartupId, setSelectedStartupId] = useState('');
  const [startupMilestones, setStartupMilestones] = useState([]);
  const [founderLoading, setFounderLoading] = useState(false);
  const [evidenceDrafts, setEvidenceDrafts] = useState({});

  const [milestoneForm, setMilestoneForm] = useState({
    cohort_id: '',
    title: '',
    description: '',
    deadline: '',
  });

  const cohortOptions = useMemo(() => {
    return [
      { value: '', label: 'Select a cohort', disabled: true },
      ...cohorts.map((c) => ({
        value: String(c.cohort_id),
        label: `${c.cohort_name} (${c.status})`,
      })),
    ];
  }, [cohorts]);

  const startupOptions = useMemo(() => {
    return [
      { value: '', label: 'Select a startup', disabled: true },
      ...startups.map((s) => ({
        value: String(s.startup_id),
        label: `${s.company_name} (${s.status})`,
      })),
    ];
  }, [startups]);

  const statusTone = useMemo(() => {
    return (status) => {
      if (status === 'Completed') return 'success';
      if (status === 'In Progress') return 'info';
      if (status === 'Not Started') return 'warning';
      return 'neutral';
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [cohortsRes, startupsRes] = await Promise.all([api.get('/cohorts/'), api.get('/startups/')]);
        if (!mounted) return;
        setCohorts(cohortsRes.data ?? []);
        setStartups(startupsRes.data ?? []);
      } catch (e) {
        if (mounted) {
          setError(e?.response?.data?.message || e?.message || 'Failed to load milestones page');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (role === 'Admin' && cohorts.length && !selectedCohortId) {
      setSelectedCohortId(String(cohorts[0].cohort_id));
    }
  }, [role, cohorts, selectedCohortId]);

  useEffect(() => {
    if (role === 'Founder' && startups.length && !selectedStartupId) {
      setSelectedStartupId(String(startups[0].startup_id));
    }
  }, [role, startups, selectedStartupId]);

  useEffect(() => {
    if (role !== 'Admin' || !selectedCohortId) return;

    let mounted = true;
    const loadCohort = async () => {
      setAdminLoading(true);
      try {
        const res = await api.get(`/milestones/cohort/${selectedCohortId}`);
        if (!mounted) return;
        setCohortStartupMilestones(res.data ?? []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || 'Failed to load cohort milestones');
      } finally {
        if (mounted) setAdminLoading(false);
      }
    };
    loadCohort();
    return () => {
      mounted = false;
    };
  }, [role, selectedCohortId]);

  useEffect(() => {
    if (role !== 'Founder' || !selectedStartupId) return;

    let mounted = true;
    const loadStartup = async () => {
      setFounderLoading(true);
      try {
        const res = await api.get(`/milestones/startup/${selectedStartupId}`);
        if (!mounted) return;
        const data = res.data ?? [];
        setStartupMilestones(data);

        const nextDrafts = {};
        data.forEach((row) => {
          nextDrafts[row.milestone_id] = row.evidence_url ?? '';
        });
        setEvidenceDrafts(nextDrafts);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || 'Failed to load startup milestones');
      } finally {
        if (mounted) setFounderLoading(false);
      }
    };

    loadStartup();
    return () => {
      mounted = false;
    };
  }, [role, selectedStartupId]);

  const onCreateMilestone = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/milestones/', {
        cohort_id: Number(milestoneForm.cohort_id),
        title: milestoneForm.title,
        description: milestoneForm.description,
        deadline: milestoneForm.deadline,
      });
      alert('Milestone created');
      const createdCohortId = milestoneForm.cohort_id;
      setMilestoneForm({ cohort_id: '', title: '', description: '', deadline: '' });
      if (role === 'Admin' && createdCohortId) {
        setSelectedCohortId(String(createdCohortId));
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create milestone');
    }
  };

  const approveMilestone = async (startupMilestoneId) => {
    setError('');
    try {
      await api.put(`/milestones/${startupMilestoneId}/approve`, { admin_approved: true });
      // Refresh list
      if (selectedCohortId) {
        const res = await api.get(`/milestones/cohort/${selectedCohortId}`);
        setCohortStartupMilestones(res.data ?? []);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to approve milestone');
    }
  };

  const submitEvidence = async (milestoneId) => {
    setError('');
    try {
      await api.put(`/milestones/${milestoneId}/submit`, {
        startup_id: Number(selectedStartupId),
        evidence_url: evidenceDrafts[milestoneId] ?? '',
        status: 'In Progress',
      });
      // Refresh
      const res = await api.get(`/milestones/startup/${selectedStartupId}`);
      const data = res.data ?? [];
      setStartupMilestones(data);
      const nextDrafts = {};
      data.forEach((row) => {
        nextDrafts[row.milestone_id] = row.evidence_url ?? '';
      });
      setEvidenceDrafts(nextDrafts);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit evidence');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="page-header-title">Milestones</h1>
          <p className="page-header-copy">Create milestone templates and track startup progress.</p>
        </div>
      </div>

      {loading ? (
        <Loading label="Loading milestones..." />
      ) : error ? (
        <div className="surface-card alert-error p-6">{error}</div>
      ) : role !== 'Admin' && role !== 'Founder' ? (
        <div className="surface-card p-10 text-center">
          <p className="text-slate-400">Milestones are available to Admin and Founder roles.</p>
        </div>
      ) : (
        <>
          {role === 'Admin' && (
            <>
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Create Milestone</h2>
                <form onSubmit={onCreateMilestone} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Select
                      label="Cohort"
                      value={milestoneForm.cohort_id}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, cohort_id: e.target.value })}
                      options={cohortOptions}
                      required
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="field-label">Title</label>
                    <input
                      className="field-control"
                      value={milestoneForm.title}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                      placeholder="e.g., MVP Completed"
                      required
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="field-label">Deadline</label>
                    <input
                      type="date"
                      className="field-control"
                      value={milestoneForm.deadline}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, deadline: e.target.value })}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="field-label">Description</label>
                    <textarea
                      className="field-control"
                      value={milestoneForm.description}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                      placeholder="What evidence should founders provide?"
                      rows={4}
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-500">
                      Create Milestone
                    </Button>
                  </div>
                </form>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Approve Startup Milestones</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Select
                      label="Cohort"
                      value={selectedCohortId}
                      onChange={(e) => setSelectedCohortId(e.target.value)}
                      options={cohortOptions}
                      required
                    />
                  </div>
                </div>

                {adminLoading ? (
                  <Loading label="Loading cohort milestones..." />
                ) : cohortStartupMilestones.length === 0 ? (
                  <EmptyState title="No milestone assignments found." description="Enroll startups and/or create milestones for this cohort." />
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <th className="px-6 py-4 font-semibold">Startup</th>
                        <th className="px-6 py-4 font-semibold">Milestone</th>
                        <th className="px-6 py-4 font-semibold">Deadline</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Evidence</th>
                        <th className="px-6 py-4 font-semibold">Approval</th>
                        <th className="px-6 py-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cohortStartupMilestones.map((row) => (
                        <tr key={row.startup_milestone_id}>
                          <td className="px-6 py-4 font-medium">{row.company_name}</td>
                          <td className="px-6 py-4">{row.milestone_title}</td>
                          <td className="px-6 py-4">{row.deadline ?? '—'}</td>
                          <td className="px-6 py-4">
                            <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            {row.evidence_url ? (
                              <a className="text-blue-400 hover:text-blue-300" href={row.evidence_url} target="_blank" rel="noopener noreferrer">
                                View
                              </a>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {row.admin_approved ? <Badge tone="success">Approved</Badge> : <Badge tone="warning">Pending</Badge>}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              type="button"
                              className="px-5 py-2 bg-blue-600 hover:bg-blue-500"
                              disabled={Boolean(row.admin_approved)}
                              onClick={() => approveMilestone(row.startup_milestone_id)}
                            >
                              {row.admin_approved ? 'Approved' : 'Approve'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card>
            </>
          )}

          {role === 'Founder' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Submit Evidence</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Select
                    label="Startup"
                    value={selectedStartupId}
                    onChange={(e) => setSelectedStartupId(e.target.value)}
                    options={startupOptions}
                    required
                  />
                </div>
              </div>

              {founderLoading ? (
                <Loading label="Loading assigned milestones..." />
              ) : startupMilestones.length === 0 ? (
                <EmptyState title="No milestones assigned." description="Your milestones will show up once the program assigns them." />
              ) : (
                <Table>
                  <thead>
                      <tr>
                      <th className="px-6 py-4 font-semibold">Milestone</th>
                      <th className="px-6 py-4 font-semibold">Deadline</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Evidence URL</th>
                      <th className="px-6 py-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {startupMilestones.map((row) => (
                      <tr key={row.startup_milestone_id}>
                        <td className="px-6 py-4">
                          <div className="font-medium">{row.milestone_title}</div>
                        </td>
                        <td className="px-6 py-4">{row.deadline ?? '—'}</td>
                        <td className="px-6 py-4">
                          <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="url"
                            className="field-control w-full px-4 py-2"
                            value={evidenceDrafts[row.milestone_id] ?? ''}
                            onChange={(e) => setEvidenceDrafts({ ...evidenceDrafts, [row.milestone_id]: e.target.value })}
                            placeholder="https://..."
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            type="button"
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-500"
                            disabled={founderLoading}
                            onClick={() => submitEvidence(row.milestone_id)}
                          >
                            Submit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Milestones;
