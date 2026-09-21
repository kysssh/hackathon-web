import { requireRole } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function OrganizacionPage() {
  await requireRole(['ORGANIZER']);

  return (
    <div>
      <h1 className="text-xl font-semibold">Panel de organización</h1>
      {/* TODO S4: listProjectsForOrganizer() y listTeamsForOrganizer() cuando BD publique los stubs */}
    </div>
  );
}

