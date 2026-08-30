import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const FeedbackButtons = ({ initialFeedback, onFeedback }) => {
  const [feedback, setFeedback] = useState(initialFeedback);
  const { addToast } = useToast();

  const handleFeedback = (type) => {
    if (feedback === type) return;
    setFeedback(type);
    if (onFeedback) onFeedback(type);
    addToast(type === 'helpful' ? 'Thank you for your feedback!' : 'Feedback recorded. We will improve our knowledge base.');
  };

  return (
    <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
      <span className="font-medium text-slate-400">Was this answer helpful?</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleFeedback('helpful')}
          className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${
            feedback === 'helpful'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
          }`}
          title="Helpful"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          {feedback === 'helpful' && <Check className="w-3 h-3 text-emerald-600" />}
        </button>

        <button
          onClick={() => handleFeedback('not_helpful')}
          className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${
            feedback === 'not_helpful'
              ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
          }`}
          title="Not helpful"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          {feedback === 'not_helpful' && <Check className="w-3 h-3 text-rose-600" />}
        </button>
      </div>
    </div>
  );
};

export default FeedbackButtons;
