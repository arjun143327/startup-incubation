import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import Table from '../components/Table';

const Applications = () => {
  const { user } = useContext(AuthContext);
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    industry_sector: '',
    idea_description: '',
    pitch_deck_url: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchStartups();
  }, []);

  const fetchStartups = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/startups/');
      setStartups(res.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (id, status) => {
    try {
      await api.put(`/startups/${id}/evaluate`, { status });
      fetchStartups(); // refresh
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Evaluation failed');
    }
  };

  const createApplication = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.company_name.trim() || !form.idea_description.trim()) {
      setFormError('Company name and idea description are required.');
      return;
    }

    try {
      await api.post('/startups/', form);
      setShowCreate(false);
      setForm({ company_name: '', industry_sector: '', idea_description: '', pitch_deck_url: '' });
      await fetchStartups();
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to submit application');
    }
  };

  const statusTone = (status) => {
    if (status === 'Accepted') return 'success';
    if (status === 'Rejected') return 'danger';
    if (status === 'Under Review') return 'info';
    if (status === 'Submitted') return 'warning';
    if (status === 'Active') return 'purple';
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
            Applications
          </h1>
          <p className="text-neutral-400 mt-1">Track submissions and manage evaluation.</p>
        </div>
        {user.role === 'Founder' && (
          <Button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="bg-green-600 hover:bg-green-500"
          >
            {showCreate ? 'Cancel' : '+ New Application'}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10 text-neutral-400">Loading applications...</div>
      ) : startups.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center border border-neutral-700/50">
          <p className="text-neutral-400">No applications found.</p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          {error ? (
            <div className="p-6 border-b border-neutral-700/50 text-red-200 bg-red-500/10">{error}</div>
          ) : null}

          <Table>
            <thead>
              <tr className="bg-neutral-900/50 text-neutral-400 text-sm uppercase tracking-wider border-b border-neutral-700/50">
                <th className="px-6 py-4 font-semibold">Company Name</th>
                <th className="px-6 py-4 font-semibold">Industry</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                {user.role === 'Admin' && <th className="px-6 py-4 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700/50">
              {startups.map((s) => (
                <tr key={s.startup_id} className="hover:bg-neutral-800/80 transition-colors group text-neutral-200">
                  <td className="px-6 py-4 font-medium group-hover:text-blue-400 transition-colors">{s.company_name}</td>
                  <td className="px-6 py-4">{s.industry_sector || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                  </td>
                  {user.role === 'Admin' && (
                    <td className="px-6 py-4 text-right space-x-2">
                      {s.status !== 'Accepted' && (
                        <Button
                          type="button"
                          onClick={() => handleEvaluate(s.startup_id, 'Accepted')}
                          className="bg-green-600 hover:bg-green-500"
                        >
                          Accept
                        </Button>
                      )}
                      {s.status !== 'Rejected' && (
                        <Button
                          type="button"
                          onClick={() => handleEvaluate(s.startup_id, 'Rejected')}
                          variant="danger"
                        >
                          Reject
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {user.role === 'Founder' && showCreate && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">New Application</h2>
          {formError ? <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm">{formError}</div> : null}
          <form onSubmit={createApplication} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Company Name"
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="e.g., Acme Robotics"
                required
              />
            </div>

            <div>
              <Input
                label="Industry Sector (optional)"
                value={form.industry_sector}
                onChange={(e) => setForm({ ...form, industry_sector: e.target.value })}
                placeholder="e.g., FinTech"
              />
            </div>

            <div>
              <Input
                label="Pitch Deck URL (optional)"
                type="url"
                value={form.pitch_deck_url}
                onChange={(e) => setForm({ ...form, pitch_deck_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Idea Description</label>
              <textarea
                className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                value={form.idea_description}
                onChange={(e) => setForm({ ...form, idea_description: e.target.value })}
                placeholder="Describe the problem, solution, and why now."
                rows={5}
                required
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)} className="px-5">
                Cancel
              </Button>
              <Button type="submit" className="px-5 py-2.5 bg-green-600 hover:bg-green-500">
                Submit Application
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default Applications;
