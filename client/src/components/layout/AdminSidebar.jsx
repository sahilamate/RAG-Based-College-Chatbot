import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  Database,
  BarChart3,
  User,
  Shield,
  X,
  GraduationCap
} from 'lucide-react';

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Documents', path: '/admin/documents', icon: FileText },
    { label: 'Upload Document', path: '/admin/documents/upload', icon: UploadCloud },
    { label: 'Knowledge Base', path: '/admin/knowledge-base', icon: Database },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Admin Profile', path: '/admin/profile', icon: User }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Admin Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Admin Brand Logo Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight">
                College<span className="text-indigo-400">AI</span>
              </span>
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Admin
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Administration
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* RAG Engine Status Card */}
        <div className="p-4 m-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-200">Vector Engine</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Pinecone vector database active. 8,426 knowledge embeddings indexed.
          </p>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>CollegeAI v1.0 SaaS</span>
          <Link to="/chat" className="text-indigo-400 hover:underline font-medium">
            Student View &rarr;
          </Link>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
