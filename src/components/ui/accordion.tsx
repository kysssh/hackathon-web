import type { DetailsHTMLAttributes, ReactNode } from 'react';

export interface AccordionProps {
  children: ReactNode;
  className?: string;
}

export function Accordion({ children, className = '' }: AccordionProps) {
  return <div className={`space-y-3 ${className}`}>{children}</div>;
}

export interface AccordionItemProps extends DetailsHTMLAttributes<HTMLDetailsElement> {
  title: string;
  children: ReactNode;
}

export function AccordionItem({
  title,
  children,
  className = '',
  ...props
}: AccordionItemProps) {
  return (
    <details className={`faq-item ${className}`} {...props}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold text-white transition-colors hover:text-purple-200">
        <span>{title}</span>
        <span aria-hidden="true" className="text-xl text-purple-300 font-light">
          +
        </span>
      </summary>
      <div className="px-5 pb-5 pt-1 text-sm text-slate-300 leading-relaxed">
        {children}
      </div>
    </details>
  );
}
