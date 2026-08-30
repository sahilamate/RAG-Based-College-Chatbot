import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { User, Mail, Building2, IdCard, Shield, Settings, Bell, Palette, LogOut, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('personal');
  const [name, setName] = useState(user?.name || 'Sahil Sharma');
  const [department, setDepartment] = useState(user?.department || 'Computer Engineering');
  const [studentId, setStudentId] = useState(user?.studentId || 'STU2026042');
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleSavePersonal = (e) => {
    e.preventDefault();
    updateUserProfile({ name, department, studentId });
    addToast('Profile updated successfully!');
  };

  const handleLogout = async () => {
    await logout();
    addToast('Logged out successfully', 'info');
    navigate('/login');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 overflow-y-auto h-full">
      {/* Top Banner Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
          alt={user?.name}
          className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
        />

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black">{user?.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium">{user?.email}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 pt-2 text-xs font-semibold text-indigo-200">
            <span>• Dept: {user?.department}</span>
            <span>• Student ID: {user?.studentId}</span>
          </div>
        </div>

        <Button variant="danger" icon={LogOut} onClick={handleLogout}>
          Log Out
        </Button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'personal'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          Personal Information
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'account'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          Account Settings
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'appearance'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-4 h-4" />
          Appearance
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        {activeTab === 'personal' && (
          <form onSubmit={handleSavePersonal} className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Personal Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" icon={User} value={name} onChange={(e) => setName(e.target.value)} />
              <Input
                label="Student ID"
                icon={IdCard}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
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
                Save Changes
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'account' && (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Account & Security</h3>
            <p className="text-xs text-slate-500">Manage security settings and password preferences.</p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Two-Factor Authentication</p>
                  <p className="text-[11px] text-slate-500">Protect account with secondary email verification.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  Enabled
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Notification Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-800">Document Upload Alerts</p>
                  <p className="text-[11px] text-slate-500">Get notified when new exam dates or syllabus PDFs are added.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </label>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Theme & UI Preference</h3>
            <p className="text-xs text-slate-500">CollegeAI minimal SaaS theme styling is currently active.</p>
            <div className="p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50/50 flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900">Clean SaaS Light Theme (Default)</span>
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
