import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);

  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title="College Information Assistant"
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-hidden relative">
          <Outlet context={{ activeConversationId, setActiveConversationId, handleNewChat }} />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
