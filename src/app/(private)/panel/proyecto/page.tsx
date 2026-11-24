import Link from 'next/link';

import {
  SubmissionWindowProvider,
  DeadlineBanner,
} from '@/components/private/submission-window';
import { BackToPanel } from '@/components/private/back-to-panel';
import { getMyProject } from '@/lib/project/queries';
import { getMyTeam } from '@/lib/team/queries';
import { requireUserWithProfile } from '@/lib/auth/session';
import { serverNow } from '@/clock';
import { getEventPhase } from '@/lib/project/rules';

import { DraftForm } from './draft-form';
import { FileUploader } from './file-uploader';
import { SubmitPanel } from './submit-panel';

export const dynamic = 'force-dynamic';

const PROJECT_SECTIONS = [
  { id: 'details', label: 'Datos del proyecto' },
  { id: 'word', label: 'Documento Word' },
  { id: 'pitch', label: 'Pitch deck' },
  { id: 'cover', label: 'Portada' },
  { id: 'extra', label: 'Archivos extra' },
  { id: 'submit', label: 'Enviar proyecto' },
] as const;

type ProjectSection = (typeof PROJECT_SECTIONS)[number]['id'];

function isProjectSection(
  value: string | string[] | undefined
): value is ProjectSection {
  return (
    typeof value === 'string' &&
    PROJECT_SECTIONS.some((section) => section.id === value)
  );
}

export default async function ProyectoPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string | string[] }>;
}) {
  const params = await searchParams;
  const section = isProjectSection(params.section) ? params.section : null;
  const user = await requireUserWithProfile();
  const [project, team] = await Promise.all([getMyProject(), getMyTeam()]);
  const activePhase = getEventPhase(serverNow());

  // La URL del proyecto de Supabase y la llave *publicable* son públicas por
  // diseño (la secreta SUPABASE_SECRET_KEY nunca sale del servidor). El navegador
  // las necesita para subir directo a Storage con el token firmado de BK.
  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const storage =
    supabaseUrl && publishableKey ? { url: supabaseUrl, publishableKey } : null;

  const content = (
    <div className="space-y-8">
      <BackToPanel />
      <div>
        {section && (
          <Link
            href="/panel/proyecto"
            className="text-link mb-3 inline-flex text-sm"
          >
            ← Ver todas las secciones
          </Link>
        )}
        <h1 className="text-xl font-semibold">Tu proyecto</h1>
      </div>

      {!section && team && (
        <div
          className="info-panel flex flex-wrap items-center justify-between gap-3 p-4"
          data-testid="project-team-summary"
        >
          <p>
            Equipo: <span className="font-semibold">{team.name}</span>
            {team.joinCode ? (
              <>
                <span className="mx-2 text-slate-400">·</span>
                Código:{' '}
                <code className="rounded bg-white/10 px-2 py-1">
                  {team.joinCode}
                </code>
              </>
            ) : (
              <span className="ml-2 text-sm text-slate-400">
                El código solo lo puede consultar el líder del equipo.
              </span>
            )}
          </p>
          <Link href="/panel/equipo" className="text-link text-sm">
            Ver equipo
          </Link>
        </div>
      )}

      {/* Sin borrador todavía no hay datos del plazo: el banner aparece al guardarlo. */}
      {!section && project && <DeadlineBanner />}

      <nav aria-label="Secciones del proyecto" className="flex flex-wrap gap-2">
        {PROJECT_SECTIONS.filter((item) => {
          if (activePhase === 'FINAL') return item.id === 'details';
          if (activePhase === 'PHASE_1')
            return item.id === 'details' || item.id === 'word' || item.id === 'cover' || item.id === 'extra' || item.id === 'submit';
          return item.id === 'details' || item.id === 'pitch' || item.id === 'cover' || item.id === 'extra' || item.id === 'submit';
        }).map((item) => (
          <Link
            key={item.id}
            href={`/panel/proyecto?section=${item.id}`}
            aria-current={section === item.id ? 'page' : undefined}
            className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
              section === item.id
                ? 'border-purple-300/50 bg-purple-500/15 text-purple-100'
                : 'border-white/15 text-slate-300 hover:bg-white/5'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {(!section || section === 'details') && (
        <section>
          <h2 className="mb-3 font-medium">Datos del proyecto</h2>
          <DraftForm project={project} activePhase={activePhase} />
        </section>
      )}

      {activePhase === 'PHASE_1' && (!section || section === 'word') && (
        <section>
          <h2 className="mb-3 font-medium">Documento Word</h2>
          <FileUploader kind="WORD_DOCUMENT" project={project} storage={storage} />
        </section>
      )}

      {activePhase !== 'PHASE_1' && activePhase !== 'FINAL' && (!section || section === 'pitch') && (
        <section>
          <h2 className="mb-3 font-medium">Presentación / pitch deck</h2>
          <FileUploader kind="PITCH_DECK" project={project} storage={storage} />
        </section>
      )}

      {activePhase !== 'FINAL' && (!section || section === 'cover') && (
        <section>
          <h2 className="mb-3 font-medium">Portada</h2>
          <FileUploader
            kind="COVER_IMAGE"
            project={project}
            storage={storage}
          />
        </section>
      )}

      {activePhase !== 'FINAL' && (!section || section === 'extra') && (
        <section>
          <h2 className="mb-3 font-medium">Archivos extra</h2>
          <FileUploader kind="EXTRA" project={project} storage={storage} />
        </section>
      )}

      {activePhase !== 'FINAL' && project && (!section || section === 'submit') && (
        <section>
          <h2 className="mb-3 font-medium">Enviar</h2>
          <SubmitPanel project={project} isTeamLeader={user.isTeamLeader} />
        </section>
      )}

      {section === 'submit' && !project && (
        <p role="status" className="text-sm text-slate-300">
          Guarda primero los datos del proyecto para habilitar el envío.
        </p>
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

