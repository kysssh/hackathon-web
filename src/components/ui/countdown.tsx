'use client';

import { useEffect, useState } from 'react';

function getRemaining(target: string) {
  const seconds = Math.max(0, Math.floor((Date.parse(target) - Date.now()) / 1000));
  return [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
}

export function Countdown({ target }: { target: string }) {
  const [remaining, setRemaining] = useState<number[] | null>(null);
  useEffect(() => {
    const update = () => setRemaining(getRemaining(target));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [target]);
  return <div className="grid grid-cols-4 gap-2 sm:gap-4" aria-label="Tiempo restante">
    {['Días', 'Horas', 'Minutos', 'Segundos'].map((label, index) => <div className="rounded-xl bg-[#2c2042] px-1 py-4 text-center sm:py-5" key={label}><span className="display-font block text-3xl leading-none text-purple-200 sm:text-5xl" suppressHydrationWarning>{remaining ? String(remaining[index]).padStart(2, '0') : '—'}</span><span className="eyebrow mt-2 block text-[10px] text-slate-400 sm:text-xs">{label}</span></div>)}
  </div>;
}
