import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';

/* ── Floating particle component ── */
const Particle = ({ style }) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={style}
  />
);

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({ email: '', password: '' });
    setIsLoading(true);
    try {
      const newFieldErrors = { email: '', password: '' };
      if (!email || !email.includes('@')) newFieldErrors.email = 'Enter a valid email address.';
      if (!password || password.length < 6) newFieldErrors.password = 'Password must be at least 6 characters.';
      if (newFieldErrors.email || newFieldErrors.password) {
        setFieldErrors(newFieldErrors);
        setError('Please fix the highlighted fields.');
        setIsLoading(false);
        return;
      }
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const features = [
    { icon: '◈', label: 'Multi-role management', sub: 'Admin · Founder · Mentor · Investor' },
    { icon: '⟳', label: 'Real-time collaboration', sub: 'Track milestones seamlessly' },
    { icon: '◉', label: 'Enterprise security', sub: 'JWT-based authentication' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .sn-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #080c14;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
        }

        /* ── Background mesh ── */
        .sn-mesh {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 15% 20%, rgba(56,189,248,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 85% 80%, rgba(99,102,241,0.08) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(20,184,166,0.04) 0%, transparent 60%);
          pointer-events: none;
        }

        /* ── Grid overlay ── */
        .sn-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
        }

        /* ── Floating orbs ── */
        .sn-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: sn-drift 12s ease-in-out infinite alternate;
        }
        .sn-orb-1 { width: 400px; height: 400px; background: rgba(56,189,248,0.06); top: -100px; right: -100px; animation-delay: 0s; }
        .sn-orb-2 { width: 500px; height: 500px; background: rgba(99,102,241,0.05); bottom: -150px; left: -100px; animation-delay: -4s; }
        .sn-orb-3 { width: 300px; height: 300px; background: rgba(20,184,166,0.06); top: 50%; left: 40%; transform: translate(-50%, -50%); animation-delay: -8s; }

        @keyframes sn-drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, -20px) scale(1.05); }
        }

        /* ── Layout ── */
        .sn-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1100px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .sn-container.hidden { opacity: 0; transform: translateY(20px); }
        .sn-container.visible { opacity: 1; transform: translateY(0); }

        @media (max-width: 900px) {
          .sn-container { grid-template-columns: 1fr; gap: 2rem; }
          .sn-left { display: none; }
        }

        /* ── Left side ── */
        .sn-brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border: 1px solid rgba(56,189,248,0.25);
          border-radius: 999px;
          background: rgba(56,189,248,0.06);
          backdrop-filter: blur(8px);
          margin-bottom: 2rem;
        }
        .sn-brand-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: linear-gradient(135deg, #38bdf8, #818cf8);
          box-shadow: 0 0 8px rgba(56,189,248,0.8);
          animation: sn-pulse 2s ease-in-out infinite;
        }
        @keyframes sn-pulse {
          0%, 100% { box-shadow: 0 0 6px rgba(56,189,248,0.6); }
          50% { box-shadow: 0 0 14px rgba(56,189,248,1), 0 0 24px rgba(56,189,248,0.4); }
        }
        .sn-brand-text {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-transform: uppercase;
        }

        .sn-heading {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.4rem, 4vw, 3.5rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: #f1f5f9;
          margin-bottom: 1rem;
        }
        .sn-heading span {
          background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #2dd4bf 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sn-tagline {
          font-size: 15px;
          color: #64748b;
          line-height: 1.7;
          max-width: 360px;
          margin-bottom: 2.5rem;
        }

        /* ── Feature list ── */
        .sn-features { display: flex; flex-direction: column; gap: 12px; }
        .sn-feature {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.04);
          background: rgba(255,255,255,0.02);
          transition: border-color 0.2s, background 0.2s;
        }
        .sn-feature:hover {
          border-color: rgba(56,189,248,0.15);
          background: rgba(56,189,248,0.04);
        }
        .sn-feature-icon {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px;
          background: rgba(56,189,248,0.08);
          border: 1px solid rgba(56,189,248,0.15);
          font-size: 16px;
          color: #38bdf8;
          flex-shrink: 0;
        }
        .sn-feature-label {
          font-family: 'Syne', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          color: #cbd5e1;
        }
        .sn-feature-sub {
          font-size: 12px;
          color: #475569;
          margin-top: 1px;
        }

        /* Stats row */
        .sn-stats {
          display: flex;
          gap: 2rem;
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .sn-stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          color: #f1f5f9;
        }
        .sn-stat-label { font-size: 12px; color: #475569; margin-top: 2px; }

        /* ── Card ── */
        .sn-card {
          background: rgba(15,23,42,0.7);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 28px;
          padding: 44px 40px;
          box-shadow:
            0 0 0 1px rgba(56,189,248,0.04),
            0 32px 80px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.06);
          position: relative;
          overflow: hidden;
        }
        .sn-card::before {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent);
        }

        .sn-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .sn-card-sub { font-size: 14px; color: #475569; margin-bottom: 2rem; }

        /* ── Error ── */
        .sn-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.2);
          color: #f87171;
          font-size: 13.5px;
          margin-bottom: 1.5rem;
        }

        /* ── Form inputs ── */
        .sn-field { margin-bottom: 18px; }
        .sn-label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .sn-input-wrap { position: relative; }
        .sn-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          color: #f1f5f9;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none;
          box-sizing: border-box;
        }
        .sn-input::placeholder { color: #334155; }
        .sn-input:focus {
          border-color: rgba(56,189,248,0.4);
          background: rgba(56,189,248,0.04);
          box-shadow: 0 0 0 3px rgba(56,189,248,0.08);
        }
        .sn-input.error {
          border-color: rgba(239,68,68,0.35);
          background: rgba(239,68,68,0.04);
        }
        .sn-input.error:focus {
          box-shadow: 0 0 0 3px rgba(239,68,68,0.08);
        }
        .sn-field-error {
          font-size: 12px;
          color: #f87171;
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .sn-toggle-pw {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #475569;
          cursor: pointer;
          padding: 4px;
          font-size: 18px;
          line-height: 1;
          transition: color 0.2s;
        }
        .sn-toggle-pw:hover { color: #94a3b8; }

        /* ── Submit button ── */
        .sn-btn {
          width: 100%;
          padding: 15px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 8px 32px rgba(14,165,233,0.25);
          margin-top: 8px;
        }
        .sn-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .sn-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 40px rgba(14,165,233,0.4);
        }
        .sn-btn:hover:not(:disabled)::before { opacity: 1; }
        .sn-btn:active:not(:disabled) { transform: translateY(0); }
        .sn-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* Loading spinner */
        .sn-spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: sn-spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
        @keyframes sn-spin { to { transform: rotate(360deg); } }

        /* ── Divider ── */
        .sn-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 24px 0;
        }
        .sn-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
        .sn-divider-text { font-size: 12px; color: #334155; font-weight: 500; }

        /* ── Footer ── */
        .sn-footer { text-align: center; font-size: 14px; color: #475569; }
        .sn-footer a {
          color: #38bdf8;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .sn-footer a:hover { color: #7dd3fc; }
      `}</style>

      <div className="sn-root">
        {/* Background */}
        <div className="sn-mesh" />
        <div className="sn-grid" />
        <div className="sn-orb sn-orb-1" />
        <div className="sn-orb sn-orb-2" />
        <div className="sn-orb sn-orb-3" />

        <div className={`sn-container ${mounted ? 'visible' : 'hidden'}`}>
          {/* ── Left column ── */}
          <div className="sn-left">
            <div className="sn-brand-badge">
              <div className="sn-brand-dot" />
              <span className="sn-brand-text">StartupNest</span>
            </div>

            <h1 className="sn-heading">
              Empower your<br />
              <span>startup ecosystem</span>
            </h1>

            <p className="sn-tagline">
              Streamline applications, mentoring, funding, and milestone tracking in one unified platform built for modern builders.
            </p>

            <div className="sn-features">
              {features.map((f, i) => (
                <div className="sn-feature" key={i} style={{ transitionDelay: `${i * 60}ms` }}>
                  <div className="sn-feature-icon">{f.icon}</div>
                  <div>
                    <div className="sn-feature-label">{f.label}</div>
                    <div className="sn-feature-sub">{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sn-stats">
              {[
                { num: '2.4k+', label: 'Active startups' },
                { num: '480+', label: 'Expert mentors' },
                { num: '$120M', label: 'Funded to date' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="sn-stat-num">{s.num}</div>
                  <div className="sn-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column — card ── */}
          <div>
            <div className="sn-card">
              <h2 className="sn-card-title">Welcome back</h2>
              <p className="sn-card-sub">Sign in to your StartupNest account</p>

              {error && (
                <div className="sn-error">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <div className="sn-field">
                  <label className="sn-label">Email address</label>
                  <div className="sn-input-wrap">
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className={`sn-input${fieldErrors.email ? ' error' : ''}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  {fieldErrors.email && (
                    <div className="sn-field-error">
                      <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {fieldErrors.email}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="sn-field">
                  <label className="sn-label">Password</label>
                  <div className="sn-input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className={`sn-input${fieldErrors.password ? ' error' : ''}`}
                      style={{ paddingRight: '44px' }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="sn-toggle-pw"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '○' : '●'}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <div className="sn-field-error">
                      <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {fieldErrors.password}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="sn-btn"
                  disabled={isLoading}
                >
                  {isLoading && <span className="sn-spinner" />}
                  {isLoading ? 'Signing in…' : 'Sign In →'}
                </button>
              </form>

              <div className="sn-divider">
                <div className="sn-divider-line" />
                <span className="sn-divider-text">or</span>
                <div className="sn-divider-line" />
              </div>

              <p className="sn-footer">
                New to StartupNest?{' '}
                <Link to="/register">Create an account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
