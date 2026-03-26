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

  const getMessage = (err, fallback) => err?.response?.data?.message || err?.message || fallback;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setError('');
        setLoading(true);
        if (role === 'Admin') {
          const [startupsRes, cohortsRes, progressRes, cohortSummaryRes] = await Promise.all([
            api.get('/startups/'),
            api.get('/cohorts/'),
            api.get('/reports/startup-progress'),
            api.get('/reports/cohort-summary'),
          ]);

          if (!mounted) return;
          setStartups(startupsRes.data ?? []);
          setCohorts(cohortsRes.data ?? []);
          setStartupProgress(progressRes.data ?? []);
          setCohortSummary(cohortSummaryRes.data ?? []);
          setInvestorPipeline([]);
          return;
        }

        if (role === 'Investor') {
          const pipelineRes = await api.get('/reports/investor-pipeline');
          if (!mounted) return;
          setInvestorPipeline(pipelineRes.data ?? []);
          setStartups([]);
          setCohorts([]);
          setStartupProgress([]);
          setCohortSummary([]);
          return;
        }

        if (role === 'Founder') {
          const startupsRes = await api.get('/startups/');
          if (!mounted) return;
          setStartups(startupsRes.data ?? []);
          setCohorts([]);
          setStartupProgress([]);
          setCohortSummary([]);
          setInvestorPipeline([]);
          return;
        }

        if (role === 'Mentor') {
          if (!mounted) return;
          setStartups([]);
          setCohorts([]);
          setStartupProgress([]);
          setCohortSummary([]);
          setInvestorPipeline([]);
          return;
        }
      } catch (e) {
        if (mounted) {
          if (role === 'Founder' && e?.response?.status === 422) {
            setStartups([]);
            setError('');
          } else {
            setError(getMessage(e, 'Failed to load dashboard'));
          }
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
    <div className="app-page space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="page-header-title">{headline}</h1>
          <p className="page-header-copy">Role-aware view of your program progress.</p>
        </div>
      </div>

      {loading ? (
        <Loading label="Loading dashboard..." />
      ) : error ? (
        <div className="surface-card alert-error p-6">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((c) => (
            <Card
              key={c.title}
              className="p-6 border-t-4"
              style={{
                borderTopColor:
                  c.accent === 'green' ? 'rgb(34 197 94)' : c.accent === 'purple' ? 'rgb(168 85 247)' : c.accent === 'yellow' ? 'rgb(250 204 21)' : c.accent === 'red' ? 'rgb(248 113 113)' : 'rgb(59 130 246)',
              }}
            >
              <h3 className="mb-2 font-medium text-slate-400">{c.title}</h3>
              <p className="text-4xl font-bold text-white">{c.value}</p>
            </Card>
          ))}
        </div>
      )}

      {role === 'Admin' && !loading && !error && (
        <div className="surface-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8">
            <h2 className="text-lg font-semibold">Cohort Summary</h2>
          </div>
          {cohortSummary.length === 0 ? (
            <div className="p-6 text-slate-400">No summary data yet.</div>
          ) : (
            <div className="table-shell">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {Object.keys(cohortSummary[0]).map((k) => (
                      <th key={k} className="px-6 py-3 font-semibold">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cohortSummary.slice(0, 20).map((row, idx) => (
                    <tr key={idx}>
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
