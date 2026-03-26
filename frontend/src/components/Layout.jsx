import React, { useContext, useEffect, useState } from 'react';
import { Outlet, Navigate, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <div className="app-orb app-orb-a" />
      <div className="app-orb app-orb-b" />
      <div className="app-orb app-orb-c" />

      <div className="app-content">
        <nav className="app-nav sticky top-0 z-50">
          <div className="app-frame">
            <div className="app-topbar">
              <div className="app-brand">
              <button
                type="button"
                className="menu-toggle"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMenuOpen}
              >
                <span />
                <span />
                <span />
              </button>
              <Link to="/" className="brand-chip">
                <span className="brand-chip-label">StartupNest</span>
              </Link>
              <div>
                <h1 className="brand-mark text-2xl">StartupNest</h1>
              </div>
              </div>

              <div className="app-userpanel">
                <div className="app-usercopy">
                  <span>{user.full_name}</span>
                  <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-300">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-2xl border border-rose-400/15 bg-rose-400/8 px-4 py-2 text-sm font-medium text-rose-300 transition-all hover:bg-rose-400/14 hover:text-rose-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {isMenuOpen ? (
          <>
            <button
              type="button"
              className="menu-backdrop"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close navigation overlay"
            />

            <aside className="app-sidebar is-open surface-card h-fit overflow-hidden">
              <div className="p-4">
                <ul className="app-nav-list">
                  {menuItems.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.to === '/'}
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) =>
                          [
                            'app-nav-link',
                            isActive ? 'is-active' : '',
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
          </>
        ) : null}

        <main className="app-main app-frame">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
