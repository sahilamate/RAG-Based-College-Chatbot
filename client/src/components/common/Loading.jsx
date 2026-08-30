import React from 'react';

const Loading = ({ text = 'Loading...', fullScreen = false, size = 'md' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 gap-3">
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
        <div className="absolute w-4 h-4 rounded-full bg-indigo-600 animate-pulse"></div>
      </div>
      {text && <p className="text-sm font-medium text-slate-600 animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-xs">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default Loading;
