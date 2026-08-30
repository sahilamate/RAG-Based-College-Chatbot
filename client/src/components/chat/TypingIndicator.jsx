import React from 'react';
import { Sparkles, Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex gap-3 max-w-3xl my-4 animate-fade-in">
      {/* Bot Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
        <Bot className="w-5 h-5" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">CollegeAI</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            <Sparkles className="w-3 h-3 animate-spin" />
            RAG Semantic Search
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs inline-block">
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-slate-600">
              CollegeAI is searching the knowledge base...
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
