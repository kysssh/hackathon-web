import type { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  id,
  label,
  error,
  hint,
  maxLength,
  value,
  className = '',
  disabled,
  rows = 4,
  ...props
}: TextareaProps) {
  const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const currentLength = typeof value === 'string' ? value.length : 0;
  const remaining = maxLength ? maxLength - currentLength : null;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold uppercase tracking-wider text-purple-200/90"
          >
            {label}
          </label>
        )}
        {remaining !== null && (
          <span className="text-xs text-slate-400">
            {remaining} restantes
          </span>
        )}
      </div>
      <textarea
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        disabled={disabled}
        className={`w-full rounded-xl border bg-[#241a38] px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none transition-colors ${
          error
            ? 'border-red-400 focus:border-red-500'
            : 'border-white/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-slate-400">{hint}</p>
      )}
      {error && (
        <p role="alert" className="text-xs font-medium text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
