'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAction } from '@/components/private/hooks/use-action';
import { submitProjectAction } from '@/lib/project/actions';
import type { ProjectDto } from '@/lib/queries/dtos';

function formatRemaining(closesAt: string, now: string) {
  const ms = Date.parse(closesAt) - Date.parse(now);
  if (ms <= 0) return null;
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${days} día${days === 1 ? '' : 's'}`;
  return `${hours} hora${hours === 1 ? '' : 's'}`;
}

export function SubmitPanel({
  project,
  isTeamLeader,
}: {
  project: ProjectDto;
  isTeamLeader: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const { run, pending, error } = useAction(submitProjectAction);

  const { status, closesAt, serverNow } = project.submissionWindow;
  const alreadySubmitted = project.submittedAt != null;
  const canSubmit = isTeamLeader && status === 'OPEN' && !alreadySubmitted;

  // Un integrante que no es líder nunca ve el botón de enviar, no solo deshabilitado.
  if (!isTeamLeader) {
    return (
      <p data-testid="submit-leader-only" className="text-sm text-slate-400">
        Solo quien lidera el equipo puede enviar el proyecto.
      </p>
    );
  }

  if (alreadySubmitted) {
    return (
      <p data-testid="submit-already-done" className="text-sm text-emerald-300">
        Proyecto enviado el {new Date(project.submittedAt!).toLocaleString('es-PE')}.
      </p>
    );
  }

  if (status === 'NOT_OPEN') {
    return (
      <p data-testid="submit-not-open" className="text-sm text-slate-400">
        Las entregas todavía no están abiertas.
      </p>
    );
  }

  if (status === 'CLOSED') {
    return (
      <p data-testid="submit-closed" className="text-sm text-red-300">
        Las entregas ya cerraron. Ya no es posible enviar el proyecto.
      </p>
    );
  }

  const remaining = formatRemaining(closesAt, serverNow);

  return (
    <div data-testid="submit-panel" className="info-panel p-6">
      {remaining && (
        <p className="text-sm text-amber-300">⏳ Quedan {remaining} para el cierre.</p>
      )}

      {!confirming ? (
        <button
          type="button"
          data-testid="submit-open-confirm"
          disabled={!canSubmit}
          onClick={() => setConfirming(true)}
          className="button-primary mt-3 disabled:opacity-50"
        >
          Enviar proyecto
        </button>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-sm">
            Una vez enviado no podrás editar el proyecto. ¿Confirmas el envío?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              data-testid="submit-confirm"
              disabled={pending}
              onClick={() => run({}, () => router.refresh())}
              className="button-primary disabled:opacity-50"
            >
              {pending ? 'Enviando…' : 'Sí, enviar'}
            </button>
            <button
              type="button"
              data-testid="submit-cancel"
              disabled={pending}
              onClick={() => setConfirming(false)}
              className="button-secondary disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" data-testid="submit-error" className="mt-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
