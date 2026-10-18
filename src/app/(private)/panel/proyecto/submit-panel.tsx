'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAction } from '@/components/private/hooks/use-action';
import {
  formatRemaining,
  useSubmissionWindow,
} from '@/components/private/submission-window';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { formatEventDate } from '@/dates';
import { submitProjectAction } from '@/lib/project/actions';
import type { ProjectDto } from '@/lib/queries/dtos';

import { MISSING_FIELD_LABELS } from './field-labels';

export function SubmitPanel({
  project,
  isTeamLeader,
}: {
  project: ProjectDto;
  isTeamLeader: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const { run, pending, error } = useAction(submitProjectAction);

  // Estado "en vivo" del plazo: si vence con la pantalla abierta, todo pasa a bloqueado.
  const { status, remainingMs, opensAt } = useSubmissionWindow(
    project.submissionWindow
  );
  const alreadySubmitted = project.submittedAt != null;
  const missing = project.missingFields;

  // Un integrante que no es líder nunca ve el botón de enviar, no solo deshabilitado.
  if (!isTeamLeader) {
    return (
      <p data-testid="submit-leader-only" className="text-sm text-slate-400">
        Solo quien lidera el equipo puede enviar el proyecto.
      </p>
    );
  }

  if (status === 'NOT_OPEN') {
    return (
      <p data-testid="submit-not-open" className="text-sm text-slate-400">
        Las entregas todavía no están abiertas. Abren el{' '}
        {formatEventDate(opensAt)}.
      </p>
    );
  }

  if (status === 'CLOSED') {
    return (
      <div data-testid="submit-closed" className="space-y-2 text-sm">
        <p className="text-red-300">
          Las entregas ya cerraron. Ya no es posible enviar el proyecto.
        </p>
        {alreadySubmitted && (
          <p className="text-slate-300">
            Tu último envío fue el {formatEventDate(project.submittedAt!)}{' '}
            (envío {project.submissionCount}).
          </p>
        )}
      </div>
    );
  }

  function handleConfirm() {
    run({}, () => {
      setOpen(false);
      showToast('Proyecto enviado.', 'success');
      router.refresh();
    });
  }

  return (
    <div data-testid="submit-panel" className="info-panel space-y-3">
      {alreadySubmitted && (
        <p
          data-testid="submit-already-done"
          className="flex flex-wrap items-center gap-2 text-sm"
        >
          <Badge tone="success">
            Enviado · envío {project.submissionCount}
          </Badge>
          <span className="text-emerald-300">
            {formatEventDate(project.submittedAt!)}
          </span>
        </p>
      )}

      {remainingMs !== null && (
        <p className="text-sm text-amber-300">
          ⏳ Quedan {formatRemaining(remainingMs)} para el cierre.
        </p>
      )}

      <Button
        type="button"
        data-testid="submit-open-confirm"
        onClick={() => setOpen(true)}
      >
        {alreadySubmitted ? 'Volver a enviar proyecto' : 'Enviar proyecto'}
      </Button>

      <Dialog
        open={open}
        onClose={() => {
          if (!pending) setOpen(false);
        }}
        title={
          alreadySubmitted
            ? 'Volver a enviar el proyecto'
            : 'Enviar el proyecto'
        }
        description="Puedes editar y volver a enviar el proyecto hasta el cierre del plazo."
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              data-testid="submit-cancel"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              data-testid="submit-confirm"
              loading={pending}
              disabled={missing.length > 0}
              onClick={handleConfirm}
            >
              {pending ? 'Enviando…' : 'Sí, enviar'}
            </Button>
          </>
        }
      >
        {missing.length > 0 ? (
          <div data-testid="submit-missing-fields" className="space-y-2">
            <p>Antes de enviar, completa lo que falta:</p>
            <ul className="list-disc pl-5 text-amber-200">
              {missing.map((f) => (
                <li key={f}>{MISSING_FIELD_LABELS[f] ?? f}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p>¿Confirmas el envío?</p>
        )}

        {error && (
          <p
            role="alert"
            data-testid="submit-error"
            className="mt-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}
      </Dialog>
    </div>
  );
}
