import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  id,
  label,
  error,
  hint,
  className = '',
  disabled,
  ...props
}: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-purple-200/90"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
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
