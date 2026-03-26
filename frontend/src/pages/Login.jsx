import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({ email: '', password: '' });
    try {
      const newFieldErrors = { email: '', password: '' };
      if (!email || !email.includes('@')) newFieldErrors.email = 'Enter a valid email.';
      if (!password || password.length < 6) newFieldErrors.password = 'Password must be at least 6 characters.';
      if (newFieldErrors.email || newFieldErrors.password) {
        setFieldErrors(newFieldErrors);
        setError('Please fix the highlighted fields.');
        return;
      }

      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 bg-linear-to-br from-slate-50 via-white to-blue-50">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-blue-400/30 to-cyan-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-tr from-purple-400/25 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-linear-to-r from-indigo-300/20 to-blue-300/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      <div className="relative w-full max-w-7xl py-10 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Feature highlight */}
          <div className="hidden lg:block space-y-8">
            {/* Logo/Brand */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200/50 rounded-full">
                <div className="h-2 w-2 rounded-full bg-linear-to-r from-blue-500 to-cyan-500 shadow-lg" />
                <span className="text-sm font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-cyan-600">StartupNest</span>
              </div>
            </div>

            {/* Main heading */}
            <div className="space-y-3">
              <h1 className="text-5xl lg:text-6xl font-black tracking-tight">
                <span className="text-slate-900">Empower your </span>
                <span className="block bg-clip-text text-transparent bg-linear-to-r from-blue-600 via-cyan-500 to-teal-500">startup ecosystem</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-md">
                Streamline applications, mentoring, funding, and milestone tracking in one unified platform.
              </p>
            </div>

            {/* Features list */}
            <div className="space-y-3 pt-4">
              {[
                { icon: '✓', title: 'Multi-role management', desc: 'Admin, Founder, Mentor, Investor' },
                { icon: '⚡', title: 'Real-time collaboration', desc: 'Track progress seamlessly' },
                { icon: '🔒', title: 'Enterprise security', desc: 'JWT-based authentication' },
              ].map((feature, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-500/20 to-cyan-500/20 border border-blue-200/50 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-blue-600">{feature.icon}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{feature.title}</div>
                    <div className="text-xs text-slate-500">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="w-full">
            <div className="p-8 md:p-10 rounded-3xl border border-slate-200/60 bg-white/95 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
              {/* Form header */}
              <div className="mb-8 space-y-2">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Welcome back</h2>
                <p className="text-slate-600">Sign in to your StartupNest account</p>
              </div>

              {/* Error message */}
              {error ? (
                <div className="mb-6 p-4 rounded-2xl bg-linear-to-r from-red-50 to-pink-50 border border-red-200/60 text-red-700 text-sm font-medium flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              ) : null}

              {/* Login form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">Email address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    className={[
                      'w-full px-4 py-3.5 rounded-xl text-slate-900',
                      'border transition-all duration-200',
                      'placeholder-slate-400',
                      fieldErrors.email
                        ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                        : 'border-slate-300 bg-slate-50/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                      'focus:outline-none',
                      'font-medium'
                    ].join(' ')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {fieldErrors.email && (
                    <div className="text-sm text-red-600 font-medium flex items-center gap-1">
                      <span>•</span> {fieldErrors.email}
                    </div>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className={[
                      'w-full px-4 py-3.5 rounded-xl text-slate-900',
                      'border transition-all duration-200',
                      'placeholder-slate-400',
                      fieldErrors.password
                        ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                        : 'border-slate-300 bg-slate-50/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                      'focus:outline-none',
                      'font-medium'
                    ].join(' ')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {fieldErrors.password && (
                    <div className="text-sm text-red-600 font-medium flex items-center gap-1">
                      <span>•</span> {fieldErrors.password}
                    </div>
                  )}
                </div>

                {/* Sign in button */}
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full py-3.5 mt-7 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_40px_rgba(59,130,246,0.4)] transition-all duration-200 text-base"
                >
                  Sign In
                </Button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-500 font-medium">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Register link */}
              <p className="text-center text-sm text-slate-600">
                New to StartupNest?{' '}
                <Link
                  to="/register"
                  className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
