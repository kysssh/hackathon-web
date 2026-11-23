import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[18px] border border-dashed border-white/15 bg-[#241a38]/60 px-6 py-14 text-center ${className}`}
    >
      {icon && <div className="mb-4 text-4xl text-[#c5c0ff]">{icon}</div>}
      <h3 className="display-font text-2xl uppercase text-[#f1eaff]">{title}</h3>
      {description && (
        <p className="mt-3 max-w-md text-sm leading-6 text-[#c5bfd3]">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}