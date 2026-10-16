import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-[#f1eaff]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={
            'h-11 rounded-[10px] border bg-[#120826] px-4 text-sm text-[#f1eaff] ' +
            'placeholder:text-[#f1eaff]/40 focus:outline-none focus:ring-2 ' +
            (error
              ? 'border-red-400/60 focus:ring-red-400/40'
              : 'border-white/10 focus:ring-[#a39ee7]/60') +
            ' ' + className
          }
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-300">{error}</p>
        ) : hint ? (
          <p className="text-xs text-[#c5bfd3]">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';