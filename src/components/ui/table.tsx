import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

export function Table({
  className = '',
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={`w-full text-left text-sm text-slate-200 border-collapse ${className}`}
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className = '',
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={`border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-400 ${className}`}
      {...props}
    />
  );
}

export function TableBody({
  className = '',
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`divide-y divide-white/10 ${className}`} {...props} />
  );
}

export function TableRow({
  className = '',
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`transition-colors hover:bg-white/[0.04] ${className}`}
      {...props}
    />
  );
}

export function TableHead({
  className = '',
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`px-4 py-3 font-medium text-slate-300 ${className}`} {...props} />
  );
}

export function TableCell({
  className = '',
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-4 py-3 text-sm ${className}`} {...props} />
  );
}
