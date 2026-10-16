'use client';

import { useState, type ReactNode } from 'react';

export interface AccordionItem {
  id: string;
  question: string;
  answer: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className = '',
}: AccordionProps) {
  const [open, setOpen] = useState<string[]>(defaultOpen);

  const toggle = (id: string) => {
    setOpen((prev) => {
      const isOpen = prev.includes(id);
      if (allowMultiple) {
        return isOpen ? prev.filter((x) => x !== id) : [...prev, id];
      }
      return isOpen ? [] : [id];
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-[14px] border border-white/10 bg-[#241a38]"
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-bold text-[#f1eaff] transition-colors hover:bg-white/5"
            >
              <span>{item.question}</span>
              <span
                className={`text-xl text-[#c5c0ff] transition-transform ${isOpen ? 'rotate-45' : ''}`}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            {isOpen && (
              <div className="border-t border-white/5 px-6 py-5 text-sm leading-7 text-[#cbd5e1]">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
