import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon = '✶',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`info-panel flex flex-col items-center justify-center p-8 text-center sm:p-12 ${className}`}
    >
      <div className="display-font text-5xl text-purple-300/80 mb-3" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white sm:text-2xl">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-slate-300 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
