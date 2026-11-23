import Link from 'next/link';

import { EmptyState } from '@/components/ui/empty-state';

// Se muestra cuando una página privada llama a notFound(), por ejemplo un proyecto que
// no existe en /jurado/[projectId] o /organizacion/proyectos/[projectId]. Sin este archivo
// Next usa el 404 público, con su cabecera y pie, dentro del layout privado.
export default function PrivateNotFound() {
  return (
    <div data-testid="private-not-found" className="max-w-2xl space-y-4">
      <EmptyState
        title="No encontramos lo que buscas"
        description="Puede que el enlace esté mal o que el proyecto ya no exista."
      />
      <Link href="/panel" className="text-link text-sm">
        ← Volver al panel
      </Link>
    </div>
  );
}
