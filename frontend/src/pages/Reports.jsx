import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api';
import Loading from '../components/Loading';
import Card from '../components/Card';

const Reports = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [startupProgress, setStartupProgress] = useState([]);
  const [cohortSummary, setCohortSummary] = useState([]);
  const [investorPipeline, setInvestorPipeline] = useState([]);

  const allowed = role === 'Admin' || role === 'Investor';
  const title = useMemo(() => {
    if (role === 'Admin') return 'Reports (Admin)';
    if (role === 'Investor') return 'Reports (Investor)';
    return 'Reports';
  }, [role]);

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
        const tasks = [];
        if (role === 'Admin') {
          tasks.push(api.get('/reports/startup-progress').then((r) => r.data ?? []).then((d) => setStartupProgress(d)));
          tasks.push(api.get('/reports/cohort-summary').then((r) => r.data ?? []).then((d) => setCohortSummary(d)));
        }
        if (role === 'Admin' || role === 'Investor') {
          tasks.push(
            api.get('/reports/investor-pipeline').then((r) => r.data ?? []).then((d) => setInvestorPipeline(d)),
          );
        }

        await Promise.all(tasks);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || 'Failed to load reports');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [allowed, role]);

  const renderTable = (rows) => {
    if (!rows || rows.length === 0) return <div className="p-6 text-neutral-400">No data available.</div>;
    const keys = Object.keys(rows[0]);
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-neutral-900/50 text-neutral-400 text-sm uppercase tracking-wider border-b border-neutral-700/50">
            <tr>
              {keys.map((k) => (
                <th key={k} className="px-6 py-3 font-semibold">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700/50">
            {rows.slice(0, 50).map((row, idx) => (
              <tr key={idx} className="hover:bg-neutral-800/80 transition-colors text-neutral-200">
                {keys.map((k) => (
                  <td key={k} className="px-6 py-3">
                    {String(row[k] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (!allowed) {
    return (
      <div className="glass rounded-2xl p-10 border border-neutral-700/50 text-neutral-300">
        You do not have access to reports.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">{title}</h1>
        <p className="text-neutral-400 mt-1">Aggregated program and pipeline reporting.</p>
      </div>

      {loading ? (
        <Loading label="Loading reports..." />
      ) : error ? (
        <div className="glass rounded-2xl p-6 border border-red-500/30 bg-red-500/10 text-red-200">{error}</div>
      ) : (
        <>
          {role === 'Admin' && (
            <>
              <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-neutral-700/50">
                  <h2 className="text-lg font-semibold">Startup Progress</h2>
                </div>
                {renderTable(startupProgress)}
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-neutral-700/50">
                  <h2 className="text-lg font-semibold">Cohort Summary</h2>
                </div>
                {renderTable(cohortSummary)}
              </div>
            </>
          )}

          {(role === 'Admin' || role === 'Investor') && (
            <Card className="overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-700/50">
                <h2 className="text-lg font-semibold">Investor Pipeline</h2>
              </div>
              {renderTable(investorPipeline)}
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;

