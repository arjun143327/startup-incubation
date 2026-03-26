import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api';
import Loading from '../components/Loading';
import Card from '../components/Card';

const Funding = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role;

  const allowed = role === 'Admin' || role === 'Founder';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [startups, setStartups] = useState([]);
  const [investors, setInvestors] = useState([]);

  const selfInvestor = useMemo(() => {
    if (!user?.id) return null;
    return investors.find((i) => Number(i.user_id) === Number(user.id)) ?? null;
  }, [investors, user?.id]);

  const [form, setForm] = useState({
    startup_id: '',
    round_type: 'Seed',
    amount: '',
    round_date: '',
    lead_investor_id: '',
  });

  useEffect(() => {
    if (!allowed) {
      setLoading(false);
      return;
    }
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [startupsRes, investorsRes] = await Promise.all([api.get('/startups/'), api.get('/investors/')]);
        if (!mounted) return;
        setStartups(startupsRes.data ?? []);
        setInvestors(investorsRes.data ?? []);
      } catch (e) {
        if (mounted) {
          setError(e?.response?.data?.message || e?.message || 'Failed to load funding data');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [allowed]);

  useEffect(() => {
    if (allowed && selfInvestor) {
      setForm((p) => ({ ...p, lead_investor_id: String(selfInvestor.investor_id) }));
    }
  }, [allowed, selfInvestor]);

  const submitFunding = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/investors/funding', {
        startup_id: Number(form.startup_id),
        round_type: form.round_type,
        amount: Number(form.amount),
        round_date: form.round_date,
        lead_investor_id: form.lead_investor_id ? Number(form.lead_investor_id) : null,
      });
      alert('Funding round documented');
      setForm({
        startup_id: '',
        round_type: 'Seed',
        amount: '',
        round_date: '',
        lead_investor_id: selfInvestor ? String(selfInvestor.investor_id) : '',
      });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit funding');
    }
  };

  if (!allowed) {
    return (
      <div className="glass rounded-2xl p-10 border border-neutral-700/50 text-neutral-300">
        Funding is only available to Admin and Founder roles.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">Funding</h1>
        <p className="text-neutral-400 mt-1">Document funding rounds for startups.</p>
      </div>

      {loading ? (
        <Loading label="Loading funding..." />
      ) : error ? (
        <div className="glass rounded-2xl p-6 border border-red-500/30 bg-red-500/10 text-red-200">{error}</div>
      ) : (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add Funding Round</h2>
          <form onSubmit={submitFunding} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Startup</label>
              <select
                className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
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
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Round Type</label>
              <select
                className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                value={form.round_type}
                onChange={(e) => setForm({ ...form, round_type: e.target.value })}
              >
                <option value="Seed">Seed</option>
                <option value="Series A">Series A</option>
                <option value="Series B">Series B</option>
                <option value="Pre-Seed">Pre-Seed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Amount</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g., 250000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Round Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                value={form.round_date}
                onChange={(e) => setForm({ ...form, round_date: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Lead Investor (optional)</label>
              <select
                className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                value={form.lead_investor_id}
                onChange={(e) => setForm({ ...form, lead_investor_id: e.target.value })}
              >
                <option value="">None</option>
                {investors.map((i) => (
                  <option key={i.investor_id} value={i.investor_id}>
                    {i.sector_focus || `Investor ${i.investor_id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all">
                Submit Funding
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default Funding;

