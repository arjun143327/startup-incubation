import React, { useContext } from 'react';
import { Outlet, Navigate, Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" />;

  const role = user?.role;
  const menuByRole = {
    Admin: [
      { to: '/', label: 'Dashboard' },
      { to: '/applications', label: 'Applications' },
      { to: '/cohorts', label: 'Cohorts' },
      { to: '/milestones', label: 'Milestones' },
      { to: '/mentoring', label: 'Mentoring' },
      { to: '/resources', label: 'Resources' },
      { to: '/investors', label: 'Investor Pipeline' },
      { to: '/reports', label: 'Reports' },
      { to: '/funding', label: 'Funding' },
    ],
    Founder: [
      { to: '/', label: 'Dashboard' },
      { to: '/applications', label: 'Applications' },
      { to: '/milestones', label: 'Milestones' },
      { to: '/mentoring', label: 'Mentoring' },
      { to: '/resources', label: 'Resources' },
      { to: '/funding', label: 'Funding' },
    ],
    Mentor: [
      { to: '/', label: 'Dashboard' },
      { to: '/mentoring', label: 'Mentoring' },
      { to: '/resources', label: 'Resources' },
    ],
    Investor: [
      { to: '/', label: 'Dashboard' },
      { to: '/investors', label: 'Investor Pipeline' },
      { to: '/reports', label: 'Reports' },
      { to: '/resources', label: 'Resources' },
    ],
  };

  const menuItems = menuByRole[role] ?? menuByRole.Founder;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <div className="app-orb app-orb-a" />
      <div className="app-orb app-orb-b" />
      <div className="app-orb app-orb-c" />

      <div className="app-content">
        <nav className="app-nav sticky top-0 z-50 px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="brand-chip">
                <span className="brand-chip-label">StartupNest</span>
              </Link>
              <div className="hidden md:block">
                <h1 className="brand-mark text-2xl">StartupNest</h1>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
              <span className="hidden text-slate-300 sm:block">
                {user.full_name}
                <span className="ml-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-300">
                  {user.role}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="rounded-2xl border border-rose-400/15 bg-rose-400/8 px-4 py-2 text-sm font-medium text-rose-300 transition-all hover:bg-rose-400/14 hover:text-rose-200"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
          <aside className="surface-card h-fit w-full overflow-hidden lg:sticky lg:top-24 lg:w-72">
            <div className="border-b border-white/8 px-5 py-4">
              <div className="text-sm font-medium text-slate-500">Navigation</div>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        [
                          'block rounded-2xl px-4 py-3 text-sm font-medium transition-all',
                          isActive
                            ? 'border border-sky-400/20 bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(99,102,241,0.14))] text-sky-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white',
                        ].join(' ')
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mx-auto max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
