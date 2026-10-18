'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { formatScore } from '@/components/private/format-score';
import { useAction } from '@/components/private/hooks/use-action';
import { useServerNow } from '@/components/private/hooks/use-server-now';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { criteria, scoreRange, type CriterionField } from '@/config/criteria';
import { eventConfig } from '@/config/event';
import { formatEventDate } from '@/dates';
import { saveEvaluationAction } from '@/lib/evaluation/actions';
// Regla pura de BK (sin base de datos): la misma fórmula que guarda el servidor,
// así el puntaje en vivo y el guardado no pueden diferir.
import { computeWeightedScore } from '@/lib/evaluation/rules';
import type { JudgeProjectDetailDto } from '@/lib/queries/dtos';

type ScoresState = Record<CriterionField, number>;

export function EvaluationForm({
  project,
  serverNow,
}: {
  project: JudgeProjectDetailDto;
  /** Hora del servidor (ISO) al renderizar la página; el reloj del navegador no decide el plazo. */
  serverNow: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { run, pending, error, fieldErrors } = useAction(saveEvaluationAction);

  // Pasado el cierre de calificación el formulario queda en solo lectura (también si
  // vence con la pantalla abierta). El servidor igual responde EVALUATION_CLOSED.
  const { evaluationClosesAt } = eventConfig.dates;
  const now = useServerNow(serverNow);
  const closed =
    (now ?? Date.parse(serverNow)) > Date.parse(evaluationClosesAt);

  const initial: ScoresState = {
    innovationScore: project.myEvaluation?.innovationScore ?? scoreRange.min,
    technologyScore: project.myEvaluation?.technologyScore ?? scoreRange.min,
    impactScore: project.myEvaluation?.impactScore ?? scoreRange.min,
    presentationScore:
      project.myEvaluation?.presentationScore ?? scoreRange.min,
  };

  const [scores, setScores] = useState<ScoresState>(initial);
  const [comment, setComment] = useState(project.myEvaluation?.comment ?? '');

  const liveScore = useMemo(() => computeWeightedScore(scores), [scores]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (closed) return;
    run({ projectId: project.projectId, comment, ...scores }, () => {
      showToast('Calificación guardada.', 'success');
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="evaluation-form"
      aria-busy={pending}
      className="max-w-xl space-y-5"
    >
      {closed && (
        <div
          role="status"
          data-testid="evaluation-closed"
          className="rounded-[10px] border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-100"
        >
          La calificación cerró el {formatEventDate(evaluationClosesAt)}. Tu
          evaluación quedó en solo lectura.
        </div>
      )}

      <div className="info-panel space-y-1 text-center">
        <span className="eyebrow text-purple-300">Puntaje en vivo</span>
        <p
          data-testid="evaluation-live-score"
          className="display-font text-4xl"
        >
          {formatScore(liveScore)}
        </p>
        {project.myWeightedScore != null && (
          <p
            data-testid="evaluation-saved-score"
            className="text-xs text-slate-400"
          >
            Nota guardada: {formatScore(project.myWeightedScore)}
          </p>
        )}
      </div>

      {criteria.map((c) => (
        <div key={c.field}>
          <label
            htmlFor={c.field}
            className="text-sm font-semibold text-[#f1eaff]"
          >
            {c.label}{' '}
            <span className="text-xs font-normal text-slate-500">
              (peso {c.weight}%)
            </span>
          </label>
          <p id={`${c.field}-help`} className="mb-1 text-xs text-slate-500">
            {c.description}
          </p>
          <input
            id={c.field}
            type="range"
            data-testid={`evaluation-${c.key}`}
            aria-describedby={`${c.field}-help`}
            min={scoreRange.min}
            max={scoreRange.max}
            value={scores[c.field]}
            disabled={closed}
            onChange={(e) =>
              setScores((s) => ({ ...s, [c.field]: Number(e.target.value) }))
            }
            className="w-full accent-[#a981cf] disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>{scoreRange.min}</span>
            <span className="font-medium text-slate-200">
              {scores[c.field]}
            </span>
            <span>{scoreRange.max}</span>
          </div>
          {fieldErrors[c.field] && (
            <p className="mt-1 text-sm text-red-300">
              {fieldErrors[c.field][0]}
            </p>
          )}
        </div>
      ))}

      <Textarea
        id="comment"
        label="Comentario (opcional)"
        data-testid="evaluation-comment"
        rows={4}
        maxLength={2000}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        readOnly={closed}
        hint={`${comment.length}/2000`}
        error={fieldErrors.comment?.[0]}
      />

      {!closed && (
        <Button type="submit" data-testid="evaluation-save" loading={pending}>
          {pending ? 'Guardando…' : 'Guardar calificación'}
        </Button>
      )}

      {error && (
        <p
          role="alert"
          data-testid="evaluation-error"
          className="text-sm text-red-300"
        >
          {error}
        </p>
      )}
    </form>
  );
}
