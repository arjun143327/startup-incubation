import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';

const InvestorPipeline = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [pipeline, setPipeline] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [startups, setStartups] = useState([]);

  const [adminInterests, setAdminInterests] = useState([]);
  const [adminInterestsLoading, setAdminInterestsLoading] = useState(false);

  const selfInvestor = useMemo(() => {
    if (!user?.id) return null;
    return investors.find((i) => Number(i.user_id) === Number(user.id)) ?? null;
  }, [investors, user?.id]);

  const [interestForm, setInterestForm] = useState({
    startup_id: '',
    investor_id: '',
  });

  const interestStatusTone = useMemo(() => {
    return (status) => {
      if (status === 'Pending') return 'warning';
      if (status === 'Introduced') return 'info';
      if (status === 'Passed') return 'success';
      return 'neutral';
    };
  }, []);

  const fetchAdminInterests = async () => {
    if (role !== 'Admin') return;
    setAdminInterestsLoading(true);
    setError('');
    try {
      const res = await api.get('/investors/interest');
      setAdminInterests(res.data ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load interests');
    } finally {
      setAdminInterestsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [pipeRes, investorsRes, startupsRes] = await Promise.all([
          api.get('/reports/investor-pipeline'),
          api.get('/investors/'),
          api.get('/startups/'),
        ]);
        if (!mounted) return;
        setPipeline(pipeRes.data ?? []);
        setInvestors(investorsRes.data ?? []);
        setStartups(startupsRes.data ?? []);

        if (role === 'Investor' && selfInvestor) {
          setInterestForm((p) => ({ ...p, investor_id: String(selfInvestor.investor_id) }));
        }
      } catch (e) {
        if (mounted) {
          setError(e?.response?.data?.message || e?.message || 'Failed to load investor pipeline');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    fetchAdminInterests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    if (role === 'Investor' && selfInvestor) {
      setInterestForm((p) => ({ ...p, investor_id: String(selfInvestor.investor_id) }));
    }
  }, [role, selfInvestor]);

  const expressInterest = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/investors/interest', {
        startup_id: Number(interestForm.startup_id),
        investor_id: Number(interestForm.investor_id),
      });
      alert('Interest recorded');
      // Pipeline refresh would require backend updates; re-fetch quickly for now.
      const pipeRes = await api.get('/reports/investor-pipeline');
      setPipeline(pipeRes.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to express interest');
    }
  };

  const updateInterestStatus = async (interest_id, status) => {
    setError('');
    try {
      await api.put(`/investors/interest/${interest_id}/status`, { status });
      await fetchAdminInterests();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update interest status');
    }
  };

  return (
    <div className="app-page space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="page-header-title">Investor Pipeline</h1>
          <p className="page-header-copy">Track investor interest and manage introductions.</p>
        </div>
      </div>

      {loading ? (
        <Loading label="Loading investor pipeline..." />
      ) : error ? (
        <div className="surface-card alert-error p-6">{error}</div>
      ) : (
        <>
          {(role === 'Investor' || role === 'Admin') && (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
                <h2 className="text-lg font-semibold">Pipeline Summary</h2>
              </div>
              {pipeline.length === 0 ? (
                <div className="p-6 text-slate-400">No pipeline entries yet.</div>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      {Object.keys(pipeline[0]).map((k) => (
                        <th key={k} className="px-6 py-3 font-semibold">
                          {k}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pipeline.slice(0, 50).map((row, idx) => (
                      <tr key={idx}>
                        {Object.keys(pipeline[0]).map((k) => (
                          <td key={k} className="px-6 py-3">
                            {String(row[k] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card>
          )}

          {role === 'Investor' && (
            <div className="surface-card p-6">
              <h2 className="text-lg font-semibold mb-4">Express Interest</h2>
              <form onSubmit={expressInterest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Startup</label>
                  <select
                    className="field-control"
                    value={interestForm.startup_id}
                    onChange={(e) => setInterestForm({ ...interestForm, startup_id: e.target.value })}
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
                  <label className="field-label">Investor</label>
                  <select
                    className="field-control"
                    value={interestForm.investor_id}
                    onChange={(e) => setInterestForm({ ...interestForm, investor_id: e.target.value })}
                    required
                    disabled={Boolean(selfInvestor)}
                  >
                    <option value="" disabled>
                      Select your investor profile
                    </option>
                    {investors.map((i) => (
                      <option key={i.investor_id} value={i.investor_id}>
                        {i.sector_focus || `Investor ${i.investor_id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit">
                    Record Interest
                  </Button>
                </div>
              </form>
            </div>
          )}

          {role === 'Admin' && (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
                <h2 className="text-lg font-semibold">Investor Interests</h2>
              </div>

              {adminInterestsLoading ? (
                <Loading label="Loading interests..." />
              ) : adminInterests.length === 0 ? (
                <div className="p-6 text-slate-400">No interests found.</div>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <th className="px-6 py-3 font-semibold text-left">Startup</th>
                      <th className="px-6 py-3 font-semibold text-left">Investor</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold">Created</th>
                      <th className="px-6 py-3 font-semibold text-right">Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminInterests.map((it) => (
                      <tr key={it.interest_id}>
                        <td className="px-6 py-3">
                          {it.company_name ?? `Startup #${it.startup_id}`}
                        </td>
                        <td className="px-6 py-3">
                          {it.investor_id ? `Investor #${it.investor_id}` : '—'}
                        </td>
                        <td className="px-6 py-3">
                          <Badge tone={interestStatusTone(it.status)}>{it.status}</Badge>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-300">
                          {it.created_at ? String(it.created_at).slice(0, 10) : '—'}
                        </td>
                        <td className="px-6 py-3 text-right" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <Button
                            type="button"
                            style={{ background: 'linear-gradient(135deg, #ca8a04, #eab308)', boxShadow: '0 8px 24px rgba(202,138,4,0.25)' }}
                            disabled={it.status === 'Pending'}
                            onClick={() => updateInterestStatus(it.interest_id, 'Pending')}
                          >
                            Pending
                          </Button>
                          <Button
                            type="button"
                            disabled={it.status === 'Introduced'}
                            onClick={() => updateInterestStatus(it.interest_id, 'Introduced')}
                          >
                            Introduced
                          </Button>
                          <Button
                            type="button"
                            variant="green"
                            disabled={it.status === 'Passed'}
                            onClick={() => updateInterestStatus(it.interest_id, 'Passed')}
                          >
                            Passed
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

export default InvestorPipeline;
