import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { GraduationCap, Mail, Lock, Shield, User, Sparkles, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email.trim(), password);
      addToast(`Welcome back, ${loggedUser.name}!`);

      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/chat');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (mockEmail, mockPass) => {
    setEmail(mockEmail);
    setPassword(mockPass);
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(mockEmail, mockPass);
      addToast(`Logged in as ${loggedUser.role}: ${loggedUser.name}`);

      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/chat');
      }
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Branding Area */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-6 relative z-10">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                College<span className="text-indigo-400">AI</span>
              </span>
            </Link>

            <div>
              <h2 className="text-2xl font-black leading-snug">
                Welcome to CollegeAI Portal
              </h2>
              <p className="text-xs text-indigo-200/80 mt-2 leading-relaxed">
                Access instant RAG-grounded answers for admissions, fees, hostel regulations, and academic policies.
              </p>
            </div>
          </div>

          {/* Preset Quick Login Helper Card */}
          <div className="relative z-10 pt-6 border-t border-white/10 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Demo Quick Credentials
            </span>

            <div className="space-y-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('student@college.com', 'student123')}
                className="w-full p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left flex items-center justify-between text-xs transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-300" />
                  <div>
                    <p className="font-bold">Student Portal</p>
                    <p className="text-[10px] text-indigo-200">student@college.com (Pass: student123)</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-300" />
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('admin@college.com', 'admin123')}
                className="w-full p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left flex items-center justify-between text-xs transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-300" />
                  <div>
                    <p className="font-bold">Admin Workspace</p>
                    <p className="text-[10px] text-indigo-200">admin@college.com (Pass: admin123)</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Log In</h3>
            <p className="text-xs text-slate-500 mt-1">Enter your account credentials to proceed</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="student@college.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password (Default: student123 or admin123)"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 font-medium text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In to Account'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Account Password"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Enter your college email address. We will send you a password reset link.
          </p>
          <Input
            label="College Email"
            type="email"
            placeholder="student@college.com"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setForgotModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                addToast('Password reset link sent to your email.');
                setForgotModalOpen(false);
              }}
            >
              Send Reset Link
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
