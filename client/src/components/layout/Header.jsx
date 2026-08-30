import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Bell, Menu, User, LogOut, Shield, ChevronDown, CheckCircle2 } from 'lucide-react';

const Header = ({ onToggleSidebar, title = 'CollegeAI' }) => {
  const { user, logout, isStudent, isAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    addToast('Logged out successfully', 'info');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none lg:hidden"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">{title}</h1>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Assistant Active
          </span>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-3" ref={dropdownRef}>
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileDropdownOpen(false);
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-scale-up">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifications</h4>
                <span className="text-xs text-indigo-600 font-semibold cursor-pointer">Mark all as read</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                <div className="p-3.5 hover:bg-slate-50 transition-colors flex gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Knowledge Base Updated</p>
                    <p className="text-xs text-slate-500 mt-0.5">Academic Regulations 2026 PDF was updated.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">10 mins ago</span>
                  </div>
                </div>
                <div className="p-3.5 hover:bg-slate-50 transition-colors flex gap-3">
                  <Bell className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">System Notification</p>
                    <p className="text-xs text-slate-500 mt-0.5">Welcome to CollegeAI RAG Assistant.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200"></div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/20"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">{user?.name}</p>
              <p className="text-[10px] font-medium text-slate-500">{user?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-scale-up">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="mt-1.5 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  {user?.role}
                </span>
              </div>

              <div className="py-1">
                <Link
                  to={isAdmin ? '/admin/profile' : '/profile'}
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Portal
                  </Link>
                )}
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
