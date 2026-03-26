import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'Founder'
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ full_name: '', email: '', password: '', role: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({ full_name: '', email: '', password: '', role: '' });
    try {
      const newFieldErrors = { full_name: '', email: '', password: '', role: '' };
      if (!formData.full_name || formData.full_name.trim().length < 2) newFieldErrors.full_name = 'Full name is required.';
      if (!formData.email || !formData.email.includes('@')) newFieldErrors.email = 'Enter a valid email.';
      if (!formData.password || formData.password.length < 6) newFieldErrors.password = 'Password must be at least 6 characters.';
      if (!formData.role) newFieldErrors.role = 'Role is required.';
      if (newFieldErrors.full_name || newFieldErrors.email || newFieldErrors.password || newFieldErrors.role) {
        setFieldErrors(newFieldErrors);
        setError('Please fix the highlighted fields.');
        return;
      }

      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 flex items-center justify-center bg-neutral-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-neutral-950 to-neutral-950">
      <Card className="w-full max-w-md p-8 bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-white mb-2 text-center tracking-tight">Join StartupNest</h2>
        <p className="text-neutral-400 text-center mb-8">Create your account to get started</p>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            type="text"
            required
            placeholder="John Doe"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            error={fieldErrors.full_name}
          />

          <Input
            label="Email"
            type="email"
            required
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={fieldErrors.email}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={fieldErrors.password}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-neutral-300">I am a...</label>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              error={fieldErrors.role}
              options={[
                { value: 'Founder', label: 'Startup Founder' },
                { value: 'Mentor', label: 'Mentor' },
                { value: 'Investor', label: 'Investor' },
                { value: 'Admin', label: 'Administrator' },
              ]}
            />
          </div>

          <Button type="submit" className="w-full py-3.5 mt-2 transform hover:-translate-y-0.5">
            Create Account
          </Button>
        </form>
        <p className="mt-8 text-center text-sm text-neutral-400">
          Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in here</Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
