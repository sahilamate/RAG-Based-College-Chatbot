import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Sparkles } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const ChatInput = ({ onSendMessage, disabled = false, placeholder = "Ask anything about your college..." }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const { addToast } = useToast();

  // Auto resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachmentClick = () => {
    addToast('Document attachment will be processed into vector embeddings in the backend.', 'info');
  };

  return (
    <div className="relative max-w-4xl mx-auto w-full px-4 pb-4 pt-2">
      <div className="relative rounded-2xl bg-white border border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-lg transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full resize-none bg-transparent py-3.5 pl-4 pr-24 text-sm text-slate-800 placeholder-slate-400 focus:outline-none max-h-36 overflow-y-auto"
        />

        {/* Right side Actions */}
        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
          {text.trim() && (
            <button
              onClick={() => setText('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Clear text"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleAttachmentClick}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Attach reference document"
          >
            <Paperclip className="w-4.5 h-4.5" />
          </button>

          <button
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            className={`p-2 rounded-xl text-white transition-all duration-200 flex items-center justify-center ${
              text.trim() && !disabled
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title="Send Message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1.5 px-2 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          CollegeAI responds strictly using verified college documents
        </span>
        <span className="hidden sm:inline">Press Shift + Enter for new line</span>
      </div>
    </div>
  );
};

export default ChatInput;
