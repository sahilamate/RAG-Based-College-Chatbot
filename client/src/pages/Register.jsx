import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { GraduationCap, Mail, Lock, User, IdCard, Building2 } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics & Comm.',
  'Electrical Engineering',
  'Information Technology'
];

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Computer Engineering',
    studentId: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        department: formData.department,
        studentId: formData.studentId.trim()
      });

      addToast('Registration successful! Please sign in.');
      navigate('/login');
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden p-6 sm:p-10 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight">
              College<span className="text-indigo-600">AI</span>
            </span>
          </Link>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Student Account Registration
          </span>
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900">Create Student Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Register to query campus policies, exam dates, hostel fees, and scholarships.
          </p>
        </div>

        {apiError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="e.g. Sahil Sharma"
              icon={User}
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              error={errors.fullName}
            />

            <Input
              label="Student ID"
              placeholder="STU2026042"
              icon={IdCard}
              value={formData.studentId}
              onChange={(e) => handleChange('studentId', e.target.value)}
              error={errors.studentId}
            />
          </div>

          <Input
            label="College Email Address"
            type="email"
            placeholder="sahil@college.com"
            icon={Mail}
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Account Role
              </label>
              <input
                type="text"
                value="Student (Default)"
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 text-slate-500 px-3.5 py-2.5 text-sm font-semibold cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-500 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
