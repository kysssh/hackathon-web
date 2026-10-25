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
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={active ? 'nav-link nav-link-active' : 'nav-link'}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
