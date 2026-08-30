import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Admin Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title="CollegeAI Admin Workspace"
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
