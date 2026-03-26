import React, { useContext, useEffect, useMemo, useState } from 'react';
import api from '../api';
import { AuthContext } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Loading from '../components/Loading';
import Badge from '../components/Badge';

const Resources = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role;

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  const [cohorts, setCohorts] = useState([]);

  const [resourceForm, setResourceForm] = useState({
    category_id: '',
    title: '',
    file_url: '',
    cohort_id: '',
  });

  const [error, setError] = useState('');

  const cohortOptions = useMemo(() => {
    return [{ value: '', label: 'Optional cohort (none)', disabled: false }].concat(
      cohorts.map((c) => ({ value: String(c.cohort_id), label: `${c.cohort_name} (${c.status})` })),
    );
  }, [cohorts]);

  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({ value: String(c.id), label: c.name }));
  }, [categories]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/resources/');
        if (!mounted) return;
        setResources(res.data ?? []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || 'Failed to load resources');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (role !== 'Admin') return;
    let mounted = true;
    const loadAdmin = async () => {
      setCategoryLoading(true);
      setError('');
      try {
        const [catsRes, cohortsRes] = await Promise.all([api.get('/resources/categories'), api.get('/cohorts/')]);
        if (!mounted) return;
        setCategories(catsRes.data ?? []);
        setCohorts(cohortsRes.data ?? []);

        // default selection
        if (!resourceForm.category_id && (catsRes.data ?? []).length) {
          setResourceForm((p) => ({ ...p, category_id: String((catsRes.data ?? [])[0].id) }));
        }
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || 'Failed to load admin setup');
      } finally {
        if (mounted) setCategoryLoading(false);
      }
    };
    loadAdmin();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const refreshResources = async () => {
    try {
      const res = await api.get('/resources/');
      setResources(res.data ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load resources');
    }
  };

  const refreshCategories = async () => {
    try {
      const res = await api.get('/resources/categories');
      setCategories(res.data ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load categories');
    }
  };

  const createCategory = async (e) => {
    e.preventDefault();
    setError('');
    const name = categoryName.trim();
    if (!name) {
      setError('Category name is required.');
      return;
    }
    try {
      await api.post('/resources/categories', { category_name: name });
      setCategoryName('');
      await refreshCategories();
    } catch (e2) {
      setError(e2?.response?.data?.message || e2?.message || 'Failed to create category');
    }
  };

  const uploadResource = async (e) => {
    e.preventDefault();
    setError('');

    if (!resourceForm.category_id || !resourceForm.title.trim() || !resourceForm.file_url.trim()) {
      setError('Category, title, and file URL are required.');
      return;
    }

    try {
      const payload = {
        category_id: Number(resourceForm.category_id),
        title: resourceForm.title,
        file_url: resourceForm.file_url,
        ...(resourceForm.cohort_id ? { cohort_id: Number(resourceForm.cohort_id) } : {}),
      };
      await api.post('/resources/', payload);
      setResourceForm({ category_id: resourceForm.category_id, title: '', file_url: '', cohort_id: '' });
      await refreshResources();
      alert('Resource uploaded');
    } catch (e2) {
      setError(e2?.response?.data?.message || e2?.message || 'Failed to upload resource');
    }
  };

  return (
    <div className="app-page space-y-6">
      <div>
        <h1 className="page-header-title">Resource Library</h1>
        <p className="page-header-copy">Access guides, templates, and recordings to help you grow.</p>
      </div>

      {loading ? (
        <Loading label="Loading resources..." />
      ) : resources.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="text-slate-400">No resources available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {resources.map((r) => (
            <a
              key={r.id}
              href={r.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="surface-card group block p-5 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <Badge tone="info">{r.category_id}</Badge>
              </div>
              <h3 className="mb-1 truncate font-semibold text-slate-200 group-hover:text-white">{r.title}</h3>
              <p className="text-xs text-slate-500">Click to view document</p>
            </a>
          ))}
        </div>
      )}

      {role === 'Admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            {error && <div className="alert-error mb-4 text-sm">{error}</div>}
            {categoryLoading ? (
              <Loading label="Loading categories..." />
            ) : (
              <>
                <form onSubmit={createCategory} className="space-y-4">
                  <Input
                    label="New Category Name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g., Pitch Decks"
                  />
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-500">
                    Create Category
                  </Button>
                </form>

                {categories.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-2 text-sm font-semibold text-slate-200">Existing</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.slice(0, 12).map((c) => (
                        <Badge key={c.id} tone="neutral">
                          {c.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Upload Resource</h2>
            <form onSubmit={uploadResource} className="space-y-4">
              <Select
                label="Category"
                value={resourceForm.category_id}
                onChange={(e) => setResourceForm({ ...resourceForm, category_id: e.target.value })}
                options={categories.length ? categoryOptions : [{ value: '', label: 'No categories yet', disabled: true }]}
                required
              />
              <Input
                label="Title"
                value={resourceForm.title}
                onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                placeholder="e.g., Fundraising Checklist"
              />
              <Input
                label="File URL"
                value={resourceForm.file_url}
                onChange={(e) => setResourceForm({ ...resourceForm, file_url: e.target.value })}
                placeholder="https://..."
              />
              <Select
                label="Cohort (optional)"
                value={resourceForm.cohort_id}
                onChange={(e) => setResourceForm({ ...resourceForm, cohort_id: e.target.value })}
                options={cohortOptions}
              />
              <Button type="submit" className="bg-green-600 hover:bg-green-500">
                Upload
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Resources;
