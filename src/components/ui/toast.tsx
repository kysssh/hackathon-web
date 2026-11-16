'use client';

import type { ReactNode } from 'react';

export type ToastVariant = 'info' | 'success' | 'error' | 'warning';

export interface ToastProps {
  variant?: ToastVariant;
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const toastStyles: Record<ToastVariant, { border: string; bg: string; text: string; icon: string }> = {
  info: {
    border: 'border-purple-500/40',
    bg: 'bg-[#281b42]',
    text: 'text-purple-200',
    icon: 'ℹ️',
  },
  success: {
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-950/80',
    text: 'text-emerald-200',
    icon: '✓',
  },
  error: {
    border: 'border-red-500/40',
    bg: 'bg-red-950/80',
    text: 'text-red-200',
    icon: '⚠',
  },
  warning: {
    border: 'border-amber-500/40',
    bg: 'bg-amber-950/80',
    text: 'text-amber-200',
    icon: '!',
  },
};

export function Toast({
  variant = 'info',
  title,
  children,
  onDismiss,
  className = '',
}: ToastProps) {
  const current = toastStyles[variant];

  return (
    <div
      role="status"
      className={`flex items-start justify-between gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md ${current.border} ${current.bg} ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-base leading-tight font-bold" aria-hidden="true">
          {current.icon}
        </span>
        <div className="space-y-0.5">
          {title && (
            <h4 className={`text-sm font-bold ${current.text}`}>
              {title}
            </h4>
          )}
          <div className="text-xs text-slate-200 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar notificación"
          className="text-xs text-slate-400 hover:text-white"
        >
          ✕
        </button>
      )}
    </div>
  );
}
