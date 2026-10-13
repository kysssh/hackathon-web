'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [['/', 'Inicio'], ['/informacion', 'Información y retos'], ['/cronograma', 'Cronograma'], ['/mentores-y-jurado', 'Mentores y jurado'], ['/criterios', 'Criterios'], ['/galeria', 'Galería']] as const;

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1280px)');
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);
  return <><div className="bg-[#120826] px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[.12em] text-purple-200 sm:text-xs"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />Hackathon 2026 · Crea cultura digital en comunidad</div><header className="sticky top-0 z-50 border-b border-white/10 bg-[#120826]/95 backdrop-blur-xl"><div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-3 px-4 sm:gap-5 sm:px-5"><Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3" onClick={() => setOpen(false)}><span className="brand-mark" aria-hidden="true">N</span><span className="font-bold uppercase leading-tight tracking-wide">Núcleo<small className="block text-[10px] font-semibold tracking-widest text-purple-200">Centro Cultural</small></span></Link><nav aria-label="Navegación principal" className="hidden items-center gap-5 xl:flex">{links.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined} className={pathname === href ? 'nav-link nav-link-active' : 'nav-link'}>{label}</Link>)}</nav><Link href="/ingresar" className="button-primary header-cta shrink-0 px-4 py-3 text-xs">Inscribirse / Entrar</Link><button type="button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} aria-controls="public-mobile-menu" onClick={() => setOpen(!open)} className="menu-button shrink-0"><span aria-hidden="true">{open ? '✕' : '☰'}</span></button></div>{open && <nav id="public-mobile-menu" aria-label="Navegación móvil" className="grid gap-1 border-t border-white/10 px-5 py-4 xl:hidden">{links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={pathname === href ? 'page' : undefined} className="rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/10">{label}</Link>)}<Link href="/ingresar" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-purple-200 md:hidden">Inscribirse / Entrar</Link></nav>}</header></>;
}
