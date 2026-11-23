import type { ReactNode } from 'react';

import { NavLinks, type NavItem } from '@/components/private/nav-links';

const items: NavItem[] = [
  {
    href: '/organizacion',
    label: 'Proyectos',
    match: ['/organizacion/proyectos'],
  },
  { href: '/organizacion/equipos', label: 'Equipos' },
];

// La protección real está en cada page.tsx (requireRole), no aquí:
// un layout no se vuelve a ejecutar al navegar entre sus páginas hijas.
export default function OrganizacionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <NavLinks label="Secciones de organización" items={items} />
      {children}
    </div>
  );
}
