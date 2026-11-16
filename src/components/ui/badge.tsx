import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'default' | 'winner' | 'finalist' | 'neutral' | 'success' | 'warning';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-purple-400/20 text-purple-200 border border-purple-400/30',
  winner: 'bg-amber-400/20 text-amber-200 border border-amber-400/40',
  finalist: 'bg-indigo-400/20 text-indigo-200 border border-indigo-400/40',
  neutral: 'bg-white/10 text-slate-300 border border-white/15',
  success: 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30',
  warning: 'bg-amber-500/20 text-amber-200 border border-amber-500/30',
};

export function Badge({
  variant = 'default',
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={`eyebrow inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${badgeVariants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
