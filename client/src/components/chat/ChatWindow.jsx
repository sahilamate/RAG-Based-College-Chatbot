import React, { useState, useRef, useEffect } from 'react';
import { Bot, ChevronDown, Filter, Sparkles } from 'lucide-react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import SuggestedQuestions from './SuggestedQuestions';
import ChatInput from './ChatInput';

const DEPARTMENTS = [
  'All Departments',
  'General College',
  'Computer Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics & Comm.'
];

const ChatWindow = ({ conversation, onSendMessage, onFeedback, isTyping = false }) => {
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, isTyping]);

  const messages = conversation?.messages || [];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Knowledge Base Header Bar */}
      <div className="h-13 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></div>
          <span className="text-xs font-bold text-slate-700">RAG Knowledge Engine:</span>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 hidden sm:inline">
            Active Vector Database
          </span>
        </div>

        {/* Department Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            /* Welcome Area */
            <div className="my-6 space-y-6 animate-fade-in">
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                    <Bot className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">
                    Hello! I'm <span className="text-indigo-400">CollegeAI</span>
                  </h2>
                  <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                    I am your AI-powered college information assistant. Ask me questions about:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-semibold text-indigo-200">
                    <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                      • Admissions & Fees
                    </span>
                    <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                      • Exams & Schedules
                    </span>
                    <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                      • Hostel Rules
                    </span>
                    <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                      • Scholarships & Jobs
                    </span>
                  </div>
                </div>
              </div>

              {/* Suggested Questions Grid */}
              <SuggestedQuestions onSelectQuestion={(q) => onSendMessage(q, selectedDept)} />
            </div>
          ) : (
            /* Chat Messages List */
            <div className="space-y-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} onFeedback={onFeedback} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Chat Input Bar */}
      <div className="bg-white border-t border-slate-200/80 shrink-0">
        <ChatInput
          onSendMessage={(text) => onSendMessage(text, selectedDept)}
          disabled={isTyping}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
