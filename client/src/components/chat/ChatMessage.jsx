import React from 'react';
import { Bot, User, ShieldCheck, AlertCircle } from 'lucide-react';
import Sources from './Sources';
import FeedbackButtons from './FeedbackButtons';

const ChatMessage = ({ message, onFeedback }) => {
  const isBot = message.role === 'assistant' || message.sender === 'bot';
  const textContent = message.content || message.text || '';
  const isUnknown = message.hasContext === false || message.isUnknown === true;

  const timestampStr = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex gap-3 sm:gap-4 max-w-4xl my-4 animate-fade-in ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
          isBot
            ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-indigo-600/20'
            : 'bg-slate-900 text-white'
        }`}
      >
        {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>

      {/* Message Content Bubble */}
      <div className={`flex-1 space-y-2.5 min-w-0 ${isBot ? '' : 'text-right'}`}>
        {/* Name Header */}
        <div className={`flex items-center gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}>
          <span className="text-xs font-bold text-slate-800">
            {isBot ? 'CollegeAI' : 'You'}
          </span>
          {isBot && !isUnknown && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              {message.sources && message.sources.some((s) => s.fileType === 'excel' || Boolean(s.sheetName))
                ? 'Grounded in Excel'
                : 'Grounded in Knowledge Base'}
            </span>
          )}
          <span className="text-[10px] font-medium text-slate-400">{timestampStr}</span>
        </div>

        {/* Text Content Container */}
        <div
          className={`p-4 sm:p-5 rounded-2xl text-sm leading-relaxed text-left transition-all ${
            isBot
              ? isUnknown
                ? 'bg-amber-50/70 border border-amber-200 text-slate-800'
                : 'bg-white border border-slate-200/90 text-slate-800 shadow-xs'
              : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15 font-normal'
          }`}
        >
          {isUnknown && (
            <div className="flex items-center gap-2 text-amber-800 font-bold mb-2 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Information Unavailable in Knowledge Base
            </div>
          )}

          <div className="whitespace-pre-line font-sans">{textContent}</div>
        </div>

        {/* RAG Sources Component (Bot Only, rendered only when hasContext !== false and sources present) */}
        {isBot && !isUnknown && <Sources sources={message.sources} />}

        {/* Feedback buttons (Bot Only) */}
        {isBot && (
          <div className="flex justify-start pt-1">
            <FeedbackButtons
              initialFeedback={message.feedback}
              onFeedback={(type) => onFeedback && onFeedback(message.id, type)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
