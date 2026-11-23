'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = {
  href: string;
  label: string;
  /** Rutas que también cuentan como "estás aquí" (por ejemplo, las páginas hijas). */
  match?: string[];
};

/** Enlaces de navegación que marcan la sección actual (color y aria-current). */
export function NavLinks({
  items,
  label,
}: {
  items: NavItem[];
  label: string;
}) {
  const pathname = usePathname();

  const isActive = (item: NavItem) =>
    pathname === item.href ||
    (item.match ?? []).some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

  return (
    <nav
      aria-label={label}
      className="flex flex-wrap items-center gap-x-5 gap-y-2"
    >
      {items.map((item) => {
        const active = isActive(item);
        const isPanel = item.href === '/panel';
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={
              isPanel
                ? `nav-link inline-flex items-center rounded-lg border px-4 py-2 text-sm transition-colors ${
                    active
                      ? 'border-purple-300/50 bg-purple-500/15 font-bold text-purple-100'
                      : 'border-white/15 hover:border-purple-300/40 hover:bg-white/5'
                  }`
                : active
                  ? 'nav-link nav-link-active'
                  : 'nav-link'
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
