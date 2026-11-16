import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'light' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'button-primary',
  secondary: 'button-secondary',
  light: 'button-light',
  danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-500/40 rounded-xl px-5 py-2.5 font-bold uppercase text-xs tracking-wider transition-colors disabled:opacity-50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs min-h-[36px]',
  md: 'px-5 py-2.5 text-xs min-h-[44px]',
  lg: 'px-6 py-3.5 text-sm min-h-[52px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClass = variantStyles[variant];
  const sizeClass = sizeStyles[size];

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${baseClass} ${sizeClass} ${className} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span>Cargando…</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
