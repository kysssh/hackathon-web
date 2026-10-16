'use client';

import { useEffect, type ReactNode } from 'react';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

export function Dialog({ open, onClose, title, description, children, footer }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        className="w-full max-w-md rounded-[18px] border border-white/10 bg-[#241a38] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <div className="border-b border-white/10 px-6 py-5">
            {title && (
              <h2 id="dialog-title" className="text-lg font-bold text-[#f1eaff]">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-[#c5bfd3]">{description}</p>
            )}
          </div>
        )}
        {children && <div className="px-6 py-5 text-sm text-[#f1eaff]">{children}</div>}
        {footer && (
          <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}