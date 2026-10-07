import { getMyProject } from '@/lib/project/queries';
import { requireUser } from '@/lib/auth/session';

import { DraftForm } from './draft-form';
import { FileUploader } from './file-uploader';
import { SubmitPanel } from './submit-panel';

export const dynamic = 'force-dynamic';

export default async function ProyectoPage() {
  const user = await requireUser();
  const project = await getMyProject();

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Tu proyecto</h1>

      <DraftForm project={project} />

      <div>
        <h2 className="mb-3 font-medium">Archivos</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FileUploader kind="PITCH_DECK" project={project} />
          <FileUploader kind="COVER_IMAGE" project={project} />
        </div>
      </div>

      {project && (
        <div>
          <h2 className="mb-3 font-medium">Enviar</h2>
          <SubmitPanel project={project} isTeamLeader={user.isTeamLeader} />
        </div>
      )}
    </div>
  );
}
