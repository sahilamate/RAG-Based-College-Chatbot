import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Shield, User, Mail, Building2, IdCard, LogOut, Key, CheckCircle2 } from 'lucide-react';

const AdminProfile = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || 'Dr. Rajesh Varma');
  const [department, setDepartment] = useState(user?.department || 'Academic Affairs');
  const [employeeId, setEmployeeId] = useState(user?.employeeId || 'ADM1004');

  const handleSave = (e) => {
    e.preventDefault();
    updateUserProfile({ name, department, employeeId });
    addToast('Admin profile updated!');
  };

  const handleLogout = async () => {
    await logout();
    addToast('Logged out successfully', 'info');
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Admin Profile Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'}
          alt={user?.name}
          className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/40 shadow-md"
        />

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black">{user?.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500 text-white flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              System Admin
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">{user?.email}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 pt-2 text-xs font-semibold text-slate-300">
            <span>• Dept: {user?.department}</span>
            <span>• Emp ID: {user?.employeeId || 'ADM1004'}</span>
          </div>
        </div>

        <Button variant="danger" icon={LogOut} onClick={handleLogout}>
          Log Out
        </Button>
      </div>

      {/* Admin Information Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <h3 className="text-base font-extrabold text-slate-900">Administrator Details</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" icon={User} value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              label="Employee ID"
              icon={IdCard}
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Email Address" icon={Mail} value={user?.email} disabled />
            <Input
              label="Department"
              icon={Building2}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary">
              Update Admin Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
