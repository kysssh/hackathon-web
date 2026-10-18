import {
  SubmissionWindowProvider,
  DeadlineBanner,
} from '@/components/private/submission-window';
import { getMyProject } from '@/lib/project/queries';
import { requireUser } from '@/lib/auth/session';

import { DraftForm } from './draft-form';
import { FileUploader } from './file-uploader';
import { SubmitPanel } from './submit-panel';

export const dynamic = 'force-dynamic';

export default async function ProyectoPage() {
  const user = await requireUser();
  const project = await getMyProject();

  // La URL del proyecto de Supabase y la llave *publicable* son públicas por
  // diseño (la secreta SUPABASE_SECRET_KEY nunca sale del servidor). El navegador
  // las necesita para subir directo a Storage con el token firmado de BK.
  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const storage =
    supabaseUrl && publishableKey ? { url: supabaseUrl, publishableKey } : null;

  const content = (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Tu proyecto</h1>

      {/* Sin borrador todavía no hay datos del plazo: el banner aparece al guardarlo. */}
      {project && <DeadlineBanner />}

      <DraftForm project={project} />

      <div>
        <h2 className="mb-3 font-medium">Archivos</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FileUploader kind="PITCH_DECK" project={project} storage={storage} />
          <FileUploader
            kind="COVER_IMAGE"
            project={project}
            storage={storage}
          />
          <div className="sm:col-span-2">
            <FileUploader kind="EXTRA" project={project} storage={storage} />
          </div>
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

  // El Provider comparte el estado del plazo con banner, formulario, archivos y envío
  // para que se bloqueen juntos cuando el plazo vence con la página abierta.
  return project ? (
    <SubmissionWindowProvider submissionWindow={project.submissionWindow}>
      {content}
    </SubmissionWindowProvider>
  ) : (
    content
  );
}

