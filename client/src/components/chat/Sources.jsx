import React from 'react';
import { FileText } from 'lucide-react';
import SourceCard from './SourceCard';

/**
 * Sources list container component for displaying RAG citations below assistant answers.
 */
const Sources = ({ sources }) => {
  if (!Array.isArray(sources) || sources.length === 0) {
    return null;
  }

  return (
    <div className="pt-3 text-left space-y-2.5 animate-fade-in">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
        <FileText className="w-3.5 h-3.5 text-indigo-600" />
        <span>Retrieved Document Sources ({sources.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {sources.map((src, idx) => (
          <SourceCard key={idx} source={src} />
        ))}
      </div>
    </div>
  );
};

export default Sources;
