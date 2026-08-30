import React from 'react';
import Button from './Button';
import { FolderOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'There are no items to display at this moment.',
  actionLabel,
  onAction,
  actionIcon
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} icon={actionIcon}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
