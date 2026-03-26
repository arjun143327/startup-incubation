import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';
import Badge from '../components/Badge';
import Select from '../components/Select';

const Cohorts = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role;

  const [cohorts, setCohorts] = useState([]);
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [createForm, setCreateForm] = useState({
    cohort_name: '',
    start_date: '',
    end_date: '',
  });

  const [enrollForm, setEnrollForm] = useState({
    cohort_id: '',
    startup_id: '',
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const cohortRes = await api.get('/cohorts/');
        if (!mounted) return;
        setCohorts(cohortRes.data ?? []);

        if (role === 'Admin') {
          const startupsRes = await api.get('/startups/');
          if (!mounted) return;
          setStartups(startupsRes.data ?? []);
        } else {
          setStartups([]);
        }
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || 'Failed to load cohorts');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [role]);

  const statusTone = useMemo(() => {
    return (status) => {
      if (status === 'Active') return 'success';
      if (status === 'Completed') return 'info';
      return 'warning';
    };
  }, []);

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

  const submitCreateCohort = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!createForm.cohort_name.trim() || !createForm.start_date || !createForm.end_date) {
      setFormError('Cohort name, start date, and end date are required.');
      return;
    }

    try {
      await api.post('/cohorts/', createForm);
      setCreateForm({ cohort_name: '', start_date: '', end_date: '' });
      setFormError('');

      const cohortRes = await api.get('/cohorts/');
      setCohorts(cohortRes.data ?? []);
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to create cohort');
    }
  };

  const submitEnroll = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!enrollForm.cohort_id || !enrollForm.startup_id) {
      setFormError('Select both a cohort and a startup.');
      return;
    }

    try {
      await api.post(`/cohorts/${enrollForm.cohort_id}/enroll`, { startup_id: Number(enrollForm.startup_id) });
      setFormError('');
      alert('Startup enrolled successfully');

      const cohortRes = await api.get('/cohorts/');
      setCohorts(cohortRes.data ?? []);
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to enroll startup');
    }
  };

  const renderCohortCards = () => {
    if (cohorts.length === 0) {
      return (
        <div className="surface-card p-10 text-center">
          <p className="text-slate-400">No cohorts found.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cohorts.map((cohort) => (
          <div
            key={cohort.cohort_id}
            className="surface-card group p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/30 hover:shadow-[0_0_30px_rgba(56,189,248,0.12)]"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white transition-colors group-hover:text-sky-300">
                {cohort.cohort_name}
              </h3>
              <Badge tone={statusTone(cohort.status)}>{cohort.status}</Badge>
            </div>
            <div className="space-y-2 text-sm text-slate-400">
              <p>
                Starts:{' '}
                <span className="text-slate-200">{new Date(cohort.start_date).toLocaleDateString()}</span>
              </p>
              <p>
                Ends: <span className="text-slate-200">{new Date(cohort.end_date).toLocaleDateString()}</span>
              </p>
            </div>
            <div className="mt-6 flex justify-end border-t border-white/8 pt-4">
              <div className="text-sm font-medium text-sky-300">Active Program</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className="page-header-title">Cohorts</h1>
          <p className="page-header-copy">Manage cohort cycles and enroll startups.</p>
        </div>

        {role === 'Admin' ? <Badge tone="info">Admin Actions</Badge> : null}
      </div>

      {role === 'Admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Create Cohort</h2>
            {formError ? (
              <div className="alert-error mb-4 text-sm">{formError}</div>
            ) : null}

            <form onSubmit={submitCreateCohort} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Cohort Name"
                  value={createForm.cohort_name}
                  onChange={(e) => setCreateForm({ ...createForm, cohort_name: e.target.value })}
                  placeholder="e.g., Spring 2026 Batch"
                  required
                />
              </div>

              <div>
                <Input
                  label="Start Date"
                  type="date"
                  value={createForm.start_date}
                  onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Input
                  label="End Date"
                  type="date"
                  value={createForm.end_date}
                  onChange={(e) => setCreateForm({ ...createForm, end_date: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-500">
                  Create Cohort
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Enroll Startup</h2>
            <form onSubmit={submitEnroll} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Cohort"
                  value={enrollForm.cohort_id}
                  onChange={(e) => setEnrollForm({ ...enrollForm, cohort_id: e.target.value })}
                  options={cohortOptions}
                  required
                />
              </div>
              <div>
                <Select
                  label="Startup"
                  value={enrollForm.startup_id}
                  onChange={(e) => setEnrollForm({ ...enrollForm, startup_id: e.target.value })}
                  options={startupOptions}
                  required
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-500">
                  Enroll
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {loading ? (
        <Loading label="Loading cohorts..." />
      ) : error ? (
        <div className="surface-card alert-error p-6">{error}</div>
      ) : (
        renderCohortCards()
      )}
    </div>
  );
};

export default Cohorts;
