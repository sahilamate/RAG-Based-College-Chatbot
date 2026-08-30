import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles, Database, FileText, Layers, Cpu, Check } from 'lucide-react';
import Button from '../common/Button';

const STEPS = [
  { id: 1, label: 'Document uploaded', icon: FileText },
  { id: 2, label: 'Text extracted from PDF', icon: FileText },
  { id: 3, label: 'Text chunked into segments', icon: Layers },
  { id: 4, label: 'Generating vector embeddings', icon: Cpu },
  { id: 5, label: 'Updating vector database index', icon: Database },
  { id: 6, label: 'Completed & active in RAG engine', icon: Sparkles }
];

const ProcessingStatus = ({ documentTitle, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < 6) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setIsDone(true);
          if (onComplete) onComplete();
          return 6;
        }
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            RAG Ingestion Pipeline
          </span>
          <h3 className="text-lg font-black text-slate-900 truncate mt-0.5">{documentTitle}</h3>
        </div>
        <div className="flex items-center gap-2">
          {isDone ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Processed
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              Processing Step {currentStep}/6
            </span>
          )}
        </div>
      </div>

      {/* Steps Visual Timeline */}
      <div className="space-y-4">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.id < currentStep || (step.id === 6 && isDone);
          const isCurrent = step.id === currentStep && !isDone;

          return (
            <div key={step.id} className="flex items-center gap-4 group">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.id}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs font-bold transition-colors ${
                      isCompleted || isCurrent ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <span className="text-[11px] font-semibold text-indigo-600 animate-pulse">
                      In Progress...
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-slate-700 leading-relaxed">
        <p className="font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          RAG Architecture Info
        </p>
        Your document is being chunked and converted into vector embeddings. Uploading a document updates the knowledge base and does <strong>NOT</strong> retrain the underlying LLM.
      </div>
    </div>
  );
};

export default ProcessingStatus;
