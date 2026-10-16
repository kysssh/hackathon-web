import type { HTMLAttributes } from 'react';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'winner';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  neutral: 'bg-white/10 text-[#f1eaff]',
  brand: 'bg-[#7413a8]/40 text-[#e6b4ff] ring-1 ring-[#a981cf]/50',
  success: 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40',
  warning: 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40',
  danger: 'bg-red-500/20 text-red-200 ring-1 ring-red-400/40',
  winner: 'bg-yellow-500/20 text-yellow-100 ring-1 ring-yellow-400/60',
};

export function Badge({ tone = 'neutral', className = '', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${tones[tone]} ${className}`}
      {...props}
    />
  );
}