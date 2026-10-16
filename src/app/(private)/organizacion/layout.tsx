import type { ReactNode } from 'react';
import Link from 'next/link';

// La protección real está en cada page.tsx (requireRole), no aquí:
// un layout no se vuelve a ejecutar al navegar entre sus páginas hijas.
export default function OrganizacionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <nav aria-label="Secciones de organización" className="flex items-center gap-5">
        <Link href="/organizacion" className="nav-link">
          Proyectos
        </Link>
        <Link href="/organizacion/equipos" className="nav-link">
          Equipos
        </Link>
      </nav>
      {children}
    </div>
  );
}
