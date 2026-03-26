import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api';
import Card from '../components/Card';
import Loading from '../components/Loading';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [startups, setStartups] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [startupProgress, setStartupProgress] = useState([]);
  const [cohortSummary, setCohortSummary] = useState([]);
  const [investorPipeline, setInvestorPipeline] = useState([]);

  const role = user?.role;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setError('');
        setLoading(true);

        const startupReq = api.get('/startups/');
        const cohortReq = api.get('/cohorts/');
        const progressReq =
          role === 'Admin'
            ? api.get('/reports/startup-progress')
            : role === 'Investor'
              ? api.get('/reports/investor-pipeline')
              : Promise.resolve({ data: [] });
        const cohortSummaryReq = role === 'Admin' ? api.get('/reports/cohort-summary') : Promise.resolve({ data: [] });
        const investorPipelineReq = role === 'Investor' ? api.get('/reports/investor-pipeline') : Promise.resolve({ data: [] });

        const [startupsRes, cohortsRes, progressRes, cohortSummaryRes, investorPipelineRes] = await Promise.all([
          startupReq,
          cohortReq,
          progressReq,
          cohortSummaryReq,
          investorPipelineReq,
        ]);

        if (!mounted) return;
        setStartups(startupsRes.data ?? []);
        setCohorts(cohortsRes.data ?? []);
        setStartupProgress(progressRes.data ?? []);
        setCohortSummary(cohortSummaryRes.data ?? []);
        setInvestorPipeline(investorPipelineRes.data ?? []);
      } catch (e) {
        if (mounted) {
          setError(e?.response?.data?.message || e?.message || 'Failed to load dashboard');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [role]);

  const headline = useMemo(() => {
    if (role === 'Admin') return 'Admin Overview';
    if (role === 'Investor') return 'Investor Pipeline';
    if (role === 'Founder') return 'Founder Overview';
    if (role === 'Mentor') return 'Mentor Overview';
    return 'Dashboard';
  }, [role]);

  const cards = useMemo(() => {
    if (role === 'Admin') {
      const totalStartups = startupProgress.length ? startupProgress.length : startups.length;
      const activeCohorts = cohorts.filter((c) => c.status === 'Active').length;
      const upcomingCohorts = cohorts.filter((c) => c.status === 'Upcoming').length;
      return [
        { title: 'Startups Tracked', value: String(totalStartups), accent: 'blue' },
        { title: 'Active Cohorts', value: String(activeCohorts), accent: 'green' },
        { title: 'Upcoming Cohorts', value: String(upcomingCohorts), accent: 'purple' },
      ];
    }
    if (role === 'Investor') {
      const total = investorPipeline.length;
      const pending = investorPipeline.filter((x) => x.status === 'Pending').length;
      return [
        { title: 'Interests', value: String(total), accent: 'blue' },
        { title: 'Pending', value: String(pending), accent: 'yellow' },
        { title: 'Active Deals', value: String(Math.max(0, total - pending)), accent: 'green' },
      ];
    }
    // Founder / Mentor: simple view from startups/cohorts
    const total = startups.length;
    const accepted = startups.filter((s) => s.status === 'Accepted').length;
    const rejected = startups.filter((s) => s.status === 'Rejected').length;
    return [
      { title: 'Applications', value: String(total), accent: 'blue' },
      { title: 'Accepted', value: String(accepted), accent: 'green' },
      { title: 'Rejected', value: String(rejected), accent: 'red' },
    ];
  }, [role, startupProgress, startups, cohorts, investorPipeline]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
            {headline}
          </h1>
          <p className="text-neutral-400 mt-1">Role-aware view of your program progress.</p>
        </div>
      </div>

      {loading ? (
        <Loading label="Loading dashboard..." />
      ) : error ? (
        <div className="glass rounded-2xl p-6 border border-red-500/30 bg-red-500/10 text-red-200">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((c) => (
            <Card
              key={c.title}
              className="bg-neutral-800/60 p-6 border-t-4"
              style={{
                borderTopColor:
                  c.accent === 'green' ? 'rgb(34 197 94)' : c.accent === 'purple' ? 'rgb(168 85 247)' : c.accent === 'yellow' ? 'rgb(250 204 21)' : c.accent === 'red' ? 'rgb(248 113 113)' : 'rgb(59 130 246)',
              }}
            >
              <h3 className="text-neutral-400 font-medium mb-2">{c.title}</h3>
              <p className="text-4xl font-bold text-white">{c.value}</p>
            </Card>
          ))}
        </div>
      )}

      {role === 'Admin' && !loading && !error && (
        <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-neutral-700/50">
            <h2 className="text-lg font-semibold">Cohort Summary</h2>
          </div>
          {cohortSummary.length === 0 ? (
            <div className="p-6 text-neutral-400">No summary data yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-neutral-900/50 text-neutral-400 text-sm uppercase tracking-wider border-b border-neutral-700/50">
                  <tr>
                    {Object.keys(cohortSummary[0]).map((k) => (
                      <th key={k} className="px-6 py-3 font-semibold">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700/50">
                  {cohortSummary.slice(0, 20).map((row, idx) => (
                    <tr key={idx} className="hover:bg-neutral-800/80 transition-colors text-neutral-200">
                      {Object.keys(cohortSummary[0]).map((k) => (
                        <td key={k} className="px-6 py-3">
                          {String(row[k] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

