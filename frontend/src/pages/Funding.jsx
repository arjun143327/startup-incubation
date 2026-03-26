import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api';
import Loading from '../components/Loading';
import Card from '../components/Card';
import Button from '../components/Button';

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

  const isIgnorable422 = (err) => err?.response?.status === 422;

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
        const [startupsRes, investorsRes] = await Promise.allSettled([api.get('/startups/'), api.get('/investors/')]);
        if (!mounted) return;
        setStartups(startupsRes.status === 'fulfilled' ? startupsRes.value.data ?? [] : []);
        setInvestors(investorsRes.status === 'fulfilled' ? investorsRes.value.data ?? [] : []);

        const startupsError = startupsRes.status === 'rejected' ? startupsRes.reason : null;
        const investorsError = investorsRes.status === 'rejected' ? investorsRes.reason : null;
        const blockingError = [startupsError, investorsError].find((err) => err && !isIgnorable422(err));

        if (blockingError) {
          setError(blockingError?.response?.data?.message || blockingError?.message || 'Failed to load funding data');
        }
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
      <div className="surface-card p-10 text-slate-300">
        Funding is only available to Admin and Founder roles.
      </div>
    );
  }

  return (
    <div className="app-page space-y-6">
      <div>
        <h1 className="page-header-title">Funding</h1>
        <p className="page-header-copy">Document funding rounds for startups.</p>
      </div>

      {loading ? (
        <Loading label="Loading funding..." />
      ) : error ? (
        <div className="surface-card alert-error p-6">{error}</div>
      ) : (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add Funding Round</h2>
          <form onSubmit={submitFunding} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="field-label">Round Type</label>
              <select
                className="field-control"
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
              <label className="field-label">Amount</label>
              <input
                type="number"
                step="0.01"
                className="field-control"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g., 250000"
                required
              />
            </div>

            <div>
              <label className="field-label">Round Date</label>
              <input
                type="date"
                className="field-control"
                value={form.round_date}
                onChange={(e) => setForm({ ...form, round_date: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="field-label">Lead Investor (optional)</label>
              <select
                className="field-control"
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

            <div className="md:col-span-2 flex justify-end" style={{ marginTop: '0.5rem' }}>
              <Button type="submit">
                Submit Funding
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default Funding;
