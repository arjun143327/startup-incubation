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
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
            Investor Pipeline
          </h1>
          <p className="text-neutral-400 mt-1">Track investor interest and manage introductions.</p>
        </div>
      </div>

      {loading ? (
        <Loading label="Loading investor pipeline..." />
      ) : error ? (
        <div className="glass rounded-2xl p-6 border border-red-500/30 bg-red-500/10 text-red-200">{error}</div>
      ) : (
        <>
          {(role === 'Investor' || role === 'Admin') && (
            <Card className="overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-700/50 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Pipeline Summary</h2>
              </div>
              {pipeline.length === 0 ? (
                <div className="p-6 text-neutral-400">No pipeline entries yet.</div>
              ) : (
                <Table>
                  <thead className="bg-neutral-900/50 text-neutral-400 text-sm uppercase tracking-wider border-b border-neutral-700/50">
                    <tr>
                      {Object.keys(pipeline[0]).map((k) => (
                        <th key={k} className="px-6 py-3 font-semibold">
                          {k}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-700/50">
                    {pipeline.slice(0, 50).map((row, idx) => (
                      <tr key={idx} className="hover:bg-neutral-800/80 transition-colors text-neutral-200">
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
            <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-lg font-semibold mb-4">Express Interest</h2>
              <form onSubmit={expressInterest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Startup</label>
                  <select
                    className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
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
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Investor</label>
                  <select
                    className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
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
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all">
                    Record Interest
                  </button>
                </div>
              </form>
            </div>
          )}

          {role === 'Admin' && (
            <Card className="overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-700/50 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Investor Interests</h2>
              </div>

              {adminInterestsLoading ? (
                <Loading label="Loading interests..." />
              ) : adminInterests.length === 0 ? (
                <div className="p-6 text-neutral-400">No interests found.</div>
              ) : (
                <Table>
                  <thead>
                    <tr className="bg-neutral-900/50 text-neutral-400 text-sm uppercase tracking-wider border-b border-neutral-700/50">
                      <th className="px-6 py-3 font-semibold text-left">Startup</th>
                      <th className="px-6 py-3 font-semibold text-left">Investor</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold">Created</th>
                      <th className="px-6 py-3 font-semibold text-right">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-700/50">
                    {adminInterests.map((it) => (
                      <tr key={it.interest_id} className="hover:bg-neutral-800/80 transition-colors text-neutral-200">
                        <td className="px-6 py-3">
                          {it.company_name ?? `Startup #${it.startup_id}`}
                        </td>
                        <td className="px-6 py-3">
                          {it.investor_id ? `Investor #${it.investor_id}` : '—'}
                        </td>
                        <td className="px-6 py-3">
                          <Badge tone={interestStatusTone(it.status)}>{it.status}</Badge>
                        </td>
                        <td className="px-6 py-3 text-neutral-300 text-sm">
                          {it.created_at ? String(it.created_at).slice(0, 10) : '—'}
                        </td>
                        <td className="px-6 py-3 text-right space-x-2">
                          <Button
                            type="button"
                            className="px-4 bg-yellow-600 hover:bg-yellow-500"
                            disabled={it.status === 'Pending'}
                            onClick={() => updateInterestStatus(it.interest_id, 'Pending')}
                          >
                            Pending
                          </Button>
                          <Button
                            type="button"
                            className="px-4 bg-blue-600 hover:bg-blue-500"
                            disabled={it.status === 'Introduced'}
                            onClick={() => updateInterestStatus(it.interest_id, 'Introduced')}
                          >
                            Introduced
                          </Button>
                          <Button
                            type="button"
                            className="px-4 bg-green-600 hover:bg-green-500"
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

