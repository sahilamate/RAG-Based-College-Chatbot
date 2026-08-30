import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  GraduationCap,
  History,
  User,
  Search,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { chatService } from '../../services/chatService';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../common/ConfirmDialog';

const Sidebar = ({ isOpen, onClose, activeConversationId, onSelectConversation, onNewChat }) => {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const loadConversations = async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [activeConversationId, location.pathname]);

  // Group conversations by Today, Yesterday, Previous 7 Days, Older
  const groupConversations = () => {
    const today = [];
    const yesterday = [];
    const previous7Days = [];
    const older = [];

    const now = new Date();
    const oneDay = 86400000;

    const filtered = (conversations || []).filter((c) =>
      (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.forEach((conv) => {
      const date = new Date(conv.updatedAt || conv.createdAt);
      const diffDays = Math.floor((now - date) / oneDay);

      if (diffDays === 0) today.push(conv);
      else if (diffDays === 1) yesterday.push(conv);
      else if (diffDays <= 7) previous7Days.push(conv);
      else older.push(conv);
    });

    return { today, yesterday, previous7Days, older };
  };

  const handleStartRename = (e, conv) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = async (id) => {
    if (!editTitle.trim()) return;
    const convs = conversations.map((c) => (c.id === id ? { ...c, title: editTitle.trim() } : c));
    setConversations(convs);
    setEditingId(null);
    addToast('Conversation renamed');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await chatService.deleteConversation(deleteId);
    setConversations((prev) => prev.filter((c) => c.id !== deleteId));
    addToast('Conversation deleted');
    setDeleteId(null);
    if (activeConversationId === deleteId) {
      onNewChat();
    }
  };

  const groups = groupConversations();

  const renderConvGroup = (title, items) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4">
        <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          {title}
        </h3>
        <div className="space-y-1">
          {items.map((conv) => {
            const isActive = activeConversationId === conv.id;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => {
                  if (onSelectConversation) onSelectConversation(conv.id);
                  if (onClose) onClose();
                  navigate('/chat');
                }}
                className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                    }`}
                  />

                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleSaveRename(conv.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(conv.id);
                      }}
                      autoFocus
                      className="w-full bg-white text-slate-900 px-2 py-0.5 rounded border border-indigo-400 text-xs focus:outline-none"
                    />
                  ) : (
                    <span className="truncate">{conv.title}</span>
                  )}
                </div>

                {!isEditing && (
                  <div
                    className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    <button
                      onClick={(e) => handleStartRename(e, conv)}
                      className="p-1 rounded hover:bg-black/10 transition-colors"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(conv.id);
                      }}
                      className="p-1 rounded hover:bg-rose-500/20 text-rose-500 hover:text-rose-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-50 border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-white">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight">
                College<span className="text-indigo-600">AI</span>
              </span>
              <p className="text-[10px] font-semibold text-slate-500">Student Portal</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action: + New Chat */}
        <div className="p-4">
          <button
            onClick={() => {
              if (onNewChat) onNewChat();
              if (onClose) onClose();
              navigate('/chat');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all duration-200 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 mb-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Chat History Grouped Lists */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Sparkles className="w-6 h-6 text-indigo-400 mx-auto mb-2 opacity-60" />
              <p className="text-xs font-semibold text-slate-600">No conversations yet</p>
              <p className="text-[11px] text-slate-400 mt-1">Start asking college questions!</p>
            </div>
          ) : (
            <>
              {renderConvGroup('Today', groups.today)}
              {renderConvGroup('Yesterday', groups.yesterday)}
              {renderConvGroup('Previous 7 Days', groups.previous7Days)}
              {renderConvGroup('Older', groups.older)}
            </>
          )}
        </div>

        {/* Bottom Quick Links */}
        <div className="p-3 border-t border-slate-200/80 bg-white space-y-1">
          <Link
            to="/history"
            onClick={onClose}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              location.pathname === '/history'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-slate-400" />
            All Conversations
          </Link>
          <Link
            to="/profile"
            onClick={onClose}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              location.pathname === '/profile'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-slate-400" />
            Profile & Settings
          </Link>
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Conversation"
        message="Are you sure you want to delete this chat history? This action cannot be undone."
        confirmText="Delete Chat"
      />
    </>
  );
};

export default Sidebar;
