import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'Founder',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ full_name: '', email: '', password: '', role: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({ full_name: '', email: '', password: '', role: '' });
    setIsLoading(true);
    try {
      const newFieldErrors = { full_name: '', email: '', password: '', role: '' };
      if (!formData.full_name || formData.full_name.trim().length < 2) newFieldErrors.full_name = 'Full name must be at least 2 characters.';
      if (!formData.email || !formData.email.includes('@')) newFieldErrors.email = 'Enter a valid email address.';
      if (!formData.password || formData.password.length < 6) newFieldErrors.password = 'Password must be at least 6 characters.';
      if (!formData.role) newFieldErrors.role = 'Please select a role.';
      if (newFieldErrors.full_name || newFieldErrors.email || newFieldErrors.password || newFieldErrors.role) {
        setFieldErrors(newFieldErrors);
        setError('Please fix the highlighted fields.');
        setIsLoading(false);
        return;
      }
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  const roles = [
    { value: 'Founder',  label: 'Startup Founder',  icon: '🚀', desc: 'Build & scale your startup' },
    { value: 'Mentor',   label: 'Mentor',            icon: '◈',  desc: 'Guide the next generation' },
    { value: 'Investor', label: 'Investor',           icon: '⟡',  desc: 'Discover & fund startups' },
    { value: 'Admin',    label: 'Administrator',      icon: '◉',  desc: 'Manage the platform' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .rg-root {
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

        .rg-mesh {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 15% 20%, rgba(56,189,248,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 85% 80%, rgba(99,102,241,0.08) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(20,184,166,0.04) 0%, transparent 60%);
          pointer-events: none;
        }
        .rg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
        }
        .rg-orb {
          position: absolute; border-radius: 50%;
          filter: blur(80px); pointer-events: none;
          animation: rg-drift 12s ease-in-out infinite alternate;
        }
        .rg-orb-1 { width: 400px; height: 400px; background: rgba(56,189,248,0.06); top: -100px; right: -100px; }
        .rg-orb-2 { width: 500px; height: 500px; background: rgba(99,102,241,0.05); bottom: -150px; left: -100px; animation-delay: -4s; }
        .rg-orb-3 { width: 300px; height: 300px; background: rgba(20,184,166,0.06); top: 50%; left: 40%; transform: translate(-50%,-50%); animation-delay: -8s; }
        @keyframes rg-drift {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(30px,-20px) scale(1.05); }
        }

        /* Layout */
        .rg-wrapper {
          position: relative; z-index: 10;
          width: 100%; max-width: 1100px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .rg-wrapper.hidden  { opacity: 0; transform: translateY(20px); }
        .rg-wrapper.visible { opacity: 1; transform: translateY(0); }
        @media (max-width: 900px) {
          .rg-wrapper { grid-template-columns: 1fr; }
          .rg-left    { display: none; }
        }

        /* Left side */
        .rg-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px;
          border: 1px solid rgba(56,189,248,0.25);
          border-radius: 999px;
          background: rgba(56,189,248,0.06);
          backdrop-filter: blur(8px);
          margin-bottom: 2rem;
        }
        .rg-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: linear-gradient(135deg, #38bdf8, #818cf8);
          box-shadow: 0 0 8px rgba(56,189,248,0.8);
          animation: rg-pulse 2s ease-in-out infinite;
        }
        @keyframes rg-pulse {
          0%,100% { box-shadow: 0 0 6px rgba(56,189,248,0.6); }
          50%      { box-shadow: 0 0 14px rgba(56,189,248,1), 0 0 24px rgba(56,189,248,0.4); }
        }
        .rg-badge-text {
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .rg-heading {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.4rem, 4vw, 3.5rem);
          font-weight: 800; line-height: 1.1; letter-spacing: -0.03em;
          color: #f1f5f9; margin-bottom: 1rem;
        }
        .rg-heading span {
          background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #2dd4bf 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .rg-tagline { font-size: 15px; color: #64748b; line-height: 1.7; max-width: 360px; margin-bottom: 2.5rem; }

        /* Step list */
        .rg-steps { display: flex; flex-direction: column; gap: 0; }
        .rg-step { display: flex; gap: 16px; position: relative; }
        .rg-step:not(:last-child) .rg-step-line {
          position: absolute; left: 17px; top: 36px;
          width: 2px; height: calc(100% - 12px);
          background: linear-gradient(to bottom, rgba(56,189,248,0.3), transparent);
        }
        .rg-step-num {
          width: 36px; height: 36px; flex-shrink: 0;
          border-radius: 50%;
          border: 1px solid rgba(56,189,248,0.2);
          background: rgba(56,189,248,0.06);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
          color: #38bdf8;
        }
        .rg-step-body { padding-bottom: 28px; }
        .rg-step-label { font-family: 'Syne', sans-serif; font-size: 13.5px; font-weight: 600; color: #cbd5e1; }
        .rg-step-desc  { font-size: 12px; color: #475569; margin-top: 3px; }

        /* Testimonial */
        .rg-testimonial {
          margin-top: 2.5rem; padding: 20px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.02);
        }
        .rg-quote { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 12px; font-style: italic; }
        .rg-quote::before { content: '"'; color: #38bdf8; font-style: normal; }
        .rg-quote::after  { content: '"'; color: #38bdf8; font-style: normal; }
        .rg-author { display: flex; align-items: center; gap: 10px; }
        .rg-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; color: #fff;
        }
        .rg-author-name  { font-size: 13px; font-weight: 600; color: #94a3b8; }
        .rg-author-title { font-size: 11px; color: #334155; }

        /* Card */
        .rg-card {
          background: rgba(15,23,42,0.7);
          backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 28px; padding: 40px 36px;
          box-shadow: 0 0 0 1px rgba(56,189,248,0.04), 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
          position: relative; overflow: hidden;
        }
        .rg-card::before {
          content: '';
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 60%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent);
        }
        .rg-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.9rem; font-weight: 800; color: #f1f5f9;
          letter-spacing: -0.02em; margin-bottom: 4px;
        }
        .rg-card-sub { font-size: 14px; color: #475569; margin-bottom: 1.8rem; }

        /* Error */
        .rg-error {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; border-radius: 12px;
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.2);
          color: #f87171; font-size: 13.5px; margin-bottom: 1.4rem;
        }

        /* Fields */
        .rg-field { margin-bottom: 16px; }
        .rg-label {
          display: block; font-size: 12px; font-weight: 600;
          color: #94a3b8; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 7px;
        }
        .rg-input-wrap { position: relative; }
        .rg-input {
          width: 100%; padding: 13px 16px;
          border-radius: 13px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          color: #f1f5f9;
          font-family: 'DM Sans', sans-serif; font-size: 15px;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none; box-sizing: border-box;
        }
        .rg-input::placeholder { color: #334155; }
        .rg-input:focus {
          border-color: rgba(56,189,248,0.4);
          background: rgba(56,189,248,0.04);
          box-shadow: 0 0 0 3px rgba(56,189,248,0.08);
        }
        .rg-input.err { border-color: rgba(239,68,68,0.35); background: rgba(239,68,68,0.04); }
        .rg-input.err:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.08); }

        .rg-toggle-pw {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #475569; cursor: pointer;
          padding: 4px; font-size: 18px; line-height: 1; transition: color 0.2s;
        }
        .rg-toggle-pw:hover { color: #94a3b8; }

        .rg-field-error {
          font-size: 12px; color: #f87171; margin-top: 6px;
          display: flex; align-items: center; gap: 5px;
        }

        /* Role selector */
        .rg-roles { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .rg-role-btn {
          padding: 12px 10px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          cursor: pointer; text-align: left;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .rg-role-btn:hover {
          border-color: rgba(56,189,248,0.2);
          background: rgba(56,189,248,0.04);
        }
        .rg-role-btn.selected {
          border-color: rgba(56,189,248,0.45);
          background: rgba(56,189,248,0.08);
          box-shadow: 0 0 0 3px rgba(56,189,248,0.08);
        }
        .rg-role-icon { font-size: 18px; margin-bottom: 6px; display: block; }
        .rg-role-name {
          font-family: 'Syne', sans-serif; font-size: 12.5px; font-weight: 700;
          color: #cbd5e1; display: block;
        }
        .rg-role-desc { font-size: 11px; color: #475569; margin-top: 2px; display: block; }
        .rg-role-btn.selected .rg-role-name { color: #38bdf8; }

        /* Submit */
        .rg-btn {
          width: 100%; padding: 15px;
          border-radius: 14px; border: none;
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: #fff;
          font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 0.04em;
          cursor: pointer; position: relative; overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 8px 32px rgba(14,165,233,0.25);
          margin-top: 6px;
        }
        .rg-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .rg-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 40px rgba(14,165,233,0.4); }
        .rg-btn:hover:not(:disabled)::before { opacity: 1; }
        .rg-btn:active:not(:disabled) { transform: translateY(0); }
        .rg-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .rg-spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
          border-radius: 50%; animation: rg-spin 0.7s linear infinite;
          margin-right: 8px; vertical-align: middle;
        }
        @keyframes rg-spin { to { transform: rotate(360deg); } }

        .rg-divider { display: flex; align-items: center; gap: 12px; margin: 22px 0; }
        .rg-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
        .rg-divider-text { font-size: 12px; color: #334155; font-weight: 500; }

        .rg-footer { text-align: center; font-size: 14px; color: #475569; }
        .rg-footer a { color: #38bdf8; font-weight: 600; text-decoration: none; transition: color 0.2s; }
        .rg-footer a:hover { color: #7dd3fc; }
      `}</style>

      <div className="rg-root">
        <div className="rg-mesh" />
        <div className="rg-grid" />
        <div className="rg-orb rg-orb-1" />
        <div className="rg-orb rg-orb-2" />
        <div className="rg-orb rg-orb-3" />

        <div className={`rg-wrapper ${mounted ? 'visible' : 'hidden'}`}>

          {/* ── Left column ── */}
          <div className="rg-left">
            <div className="rg-badge">
              <div className="rg-badge-dot" />
              <span className="rg-badge-text">StartupNest</span>
            </div>

            <h1 className="rg-heading">
              Your journey<br />
              <span>starts here</span>
            </h1>
            <p className="rg-tagline">
              Join thousands of founders, mentors, and investors shaping the next generation of great companies.
            </p>

            <div className="rg-steps">
              {[
                { n: '01', label: 'Create your account',   desc: 'Pick your role and sign up in seconds' },
                { n: '02', label: 'Complete your profile',  desc: 'Share your story and expertise' },
                { n: '03', label: 'Connect & grow',         desc: 'Access mentors, capital, and resources' },
              ].map((s, i) => (
                <div className="rg-step" key={i}>
                  <div>
                    <div className="rg-step-num">{s.n}</div>
                    {i < 2 && <div className="rg-step-line" />}
                  </div>
                  <div className="rg-step-body">
                    <div className="rg-step-label">{s.label}</div>
                    <div className="rg-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rg-testimonial">
              <p className="rg-quote">StartupNest connected us with the right mentor at the right time. We closed our seed round six months later.</p>
              <div className="rg-author">
                <div className="rg-avatar">AK</div>
                <div>
                  <div className="rg-author-name">Arjun Kapoor</div>
                  <div className="rg-author-title">Co-founder, Veridian Labs</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column — card ── */}
          <div>
            <div className="rg-card">
              <h2 className="rg-card-title">Join StartupNest</h2>
              <p className="rg-card-sub">Create your account to get started</p>

              {error && (
                <div className="rg-error">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Full name */}
                <div className="rg-field">
                  <label className="rg-label">Full Name</label>
                  <input
                    type="text"
                    placeholder="Jane Smith"
                    className={`rg-input${fieldErrors.full_name ? ' err' : ''}`}
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    autoComplete="name"
                  />
                  {fieldErrors.full_name && <div className="rg-field-error">• {fieldErrors.full_name}</div>}
                </div>

                {/* Email */}
                <div className="rg-field">
                  <label className="rg-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className={`rg-input${fieldErrors.email ? ' err' : ''}`}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    autoComplete="email"
                  />
                  {fieldErrors.email && <div className="rg-field-error">• {fieldErrors.email}</div>}
                </div>

                {/* Password */}
                <div className="rg-field">
                  <label className="rg-label">Password</label>
                  <div className="rg-input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      className={`rg-input${fieldErrors.password ? ' err' : ''}`}
                      style={{ paddingRight: '44px' }}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="rg-toggle-pw"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '○' : '●'}
                    </button>
                  </div>
                  {fieldErrors.password && <div className="rg-field-error">• {fieldErrors.password}</div>}
                </div>

                {/* Role picker */}
                <div className="rg-field">
                  <label className="rg-label">I am a…</label>
                  <div className="rg-roles">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        className={`rg-role-btn${formData.role === r.value ? ' selected' : ''}`}
                        onClick={() => setFormData({ ...formData, role: r.value })}
                      >
                        <span className="rg-role-icon">{r.icon}</span>
                        <span className="rg-role-name">{r.label}</span>
                        <span className="rg-role-desc">{r.desc}</span>
                      </button>
                    ))}
                  </div>
                  {fieldErrors.role && <div className="rg-field-error" style={{ marginTop: '8px' }}>• {fieldErrors.role}</div>}
                </div>

                <button type="submit" className="rg-btn" disabled={isLoading}>
                  {isLoading && <span className="rg-spinner" />}
                  {isLoading ? 'Creating account…' : 'Create Account →'}
                </button>
              </form>

              <div className="rg-divider">
                <div className="rg-divider-line" />
                <span className="rg-divider-text">or</span>
                <div className="rg-divider-line" />
              </div>

              <p className="rg-footer">
                Already have an account?{' '}
                <Link to="/login">Sign in here</Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Register;
