import React, { useContext } from 'react';
import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans">
      <nav className="bg-neutral-800 border-b border-neutral-700 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <h1 className="text-2xl font-bold text-blue-400 tracking-tight">StartupNest</h1>
        <div className="flex items-center gap-6">
          <span className="text-neutral-300">
            {user.full_name} <span className="ml-2 px-2 py-1 text-xs font-semibold bg-neutral-700 text-blue-300 rounded-lg">{user.role}</span>
          </span>
          <button 
            onClick={handleLogout} 
            className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors bg-neutral-700/50 hover:bg-neutral-700 px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="flex">
        <aside className="w-64 bg-neutral-800/50 border-r border-neutral-700 min-h-[calc(100vh-73px)] p-6">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="block py-2 px-3 rounded-lg hover:bg-neutral-700 transition-colors text-neutral-300 hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
