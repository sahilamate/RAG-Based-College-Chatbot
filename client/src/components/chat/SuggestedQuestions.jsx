import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "What is the hostel fee?",
  "When are the semester exams?",
  "What is the attendance requirement?",
  "What scholarships are available?",
  "What is the library borrowing limit?",
  "What are the placement statistics?"
];

const SuggestedQuestions = ({ onSelectQuestion }) => {
  return (
    <div className="my-6 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
        Suggested Questions
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SUGGESTED_QUESTIONS.map((question, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(question)}
            className="flex items-center justify-between p-3.5 rounded-xl bg-white hover:bg-indigo-50/70 border border-slate-200/90 hover:border-indigo-300 text-left text-xs font-semibold text-slate-700 hover:text-indigo-700 shadow-xs transition-all duration-200 group active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <HelpCircle className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 shrink-0" />
              <span className="truncate">{question}</span>
            </div>
            <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 font-bold shrink-0">
              Ask &rarr;
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
