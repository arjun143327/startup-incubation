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
    if (!rows || rows.length === 0) return <div className="p-6 text-slate-400">No data available.</div>;
    const keys = Object.keys(rows[0]);
    return (
      <div className="table-shell">
        <table className="w-full text-left">
          <thead>
            <tr>
              {keys.map((k) => (
                <th key={k} className="px-6 py-3 font-semibold">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 50).map((row, idx) => (
              <tr key={idx}>
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
      <div className="surface-card p-10 text-slate-300">
        You do not have access to reports.
      </div>
    );
  }

  return (
    <div className="app-page space-y-6">
      <div>
        <h1 className="page-header-title">{title}</h1>
        <p className="page-header-copy">Aggregated program and pipeline reporting.</p>
      </div>

      {loading ? (
        <Loading label="Loading reports..." />
      ) : error ? (
        <div className="surface-card alert-error p-6">{error}</div>
      ) : (
        <>
          {role === 'Admin' && (
            <>
              <div className="surface-card overflow-hidden">
                <div className="border-b border-white/8 px-6 py-4">
                  <h2 className="text-lg font-semibold">Startup Progress</h2>
                </div>
                {renderTable(startupProgress)}
              </div>
              <div className="surface-card overflow-hidden">
                <div className="border-b border-white/8 px-6 py-4">
                  <h2 className="text-lg font-semibold">Cohort Summary</h2>
                </div>
                {renderTable(cohortSummary)}
              </div>
            </>
          )}

          {(role === 'Admin' || role === 'Investor') && (
            <Card className="overflow-hidden">
              <div className="border-b border-white/8 px-6 py-4">
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
