import { getMyProject } from '@/lib/project/queries';
import { requireUser } from '@/lib/auth/session';

import { DraftForm } from './draft-form';

export const dynamic = 'force-dynamic';

export default async function ProyectoPage() {
  await requireUser();
  const project = await getMyProject();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Tu proyecto</h1>
      <DraftForm project={project} />
    </div>
  );
}
