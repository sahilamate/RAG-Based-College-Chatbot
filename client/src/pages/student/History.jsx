import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { chatService } from '../../services/chatService';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { MessageSquare, Search, Trash2, ArrowUpRight, Calendar, MessageCircle } from 'lucide-react';

const History = () => {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setActiveConversationId } = useOutletContext();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    const data = await chatService.getConversations();
    setConversations(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenConv = (id) => {
    setActiveConversationId(id);
    navigate('/chat');
  };

  const handleDeleteConv = async () => {
    if (!deleteId) return;
    await chatService.deleteConversation(deleteId);
    setConversations((prev) => prev.filter((c) => c.id !== deleteId));
    addToast('Conversation deleted');
    setDeleteId(null);
  };

  const filtered = (conversations || []).filter((c) =>
    (c.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 overflow-y-auto h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Conversation History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and manage all your past RAG AI queries and source references.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input
            icon={Search}
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations found"
          description={
            search ? 'No conversations match your search query.' : 'You have not started any AI conversations yet.'
          }
          actionLabel="Start New Chat"
          onAction={() => {
            setActiveConversationId(null);
            navigate('/chat');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((conv) => {
            const firstUserMsg = Array.isArray(conv.messages) ? conv.messages.find((m) => m.sender === 'user' || m.role === 'user') : null;
            const snippet = conv.snippet || (firstUserMsg ? (firstUserMsg.text || firstUserMsg.content) : conv.title);
            const count = conv.messagesCount !== undefined ? conv.messagesCount : (Array.isArray(conv.messages) ? conv.messages.length : 1);
            const dateStr = new Date(conv.updatedAt || conv.createdAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric'
            });

            return (
              <div
                key={conv.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {conv.department || 'General'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {dateStr}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {conv.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                    "{snippet}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />
                    {count} messages
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeleteId(conv.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={ArrowUpRight}
                      onClick={() => handleOpenConv(conv.id)}
                    >
                      Open
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConv}
        title="Delete Conversation"
        message="Are you sure you want to permanently delete this chat record?"
      />
    </div>
  );
};

export default History;
