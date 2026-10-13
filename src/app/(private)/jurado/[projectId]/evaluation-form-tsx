'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAction } from '@/components/private/hooks/use-action';
import { criteria, scoreRange, type CriterionField } from '@/config/criteria';
import { saveEvaluationAction } from '@/lib/evaluation/actions';
import type { JudgeProjectDetailDto } from '@/lib/queries/dtos';

/**
 * CONTRATO pendiente con BK: calculateWeightedScore vive privada (no exportada)
 * en src/lib/project/queries.ts. Pedido: exportarla (o moverla a
 * src/config/criteria.ts, que ya es público) para que FE la importe en vez de
 * repetir la fórmula. Mientras tanto, esta copia usa los mismos pesos de
 * src/config/criteria.ts (que sí es público) y el mismo redondeo
 * (Math.round(x * 100) / 100), así que el resultado debe coincidir con el de
 * BK siempre que nadie cambie uno de los dos lados sin el otro.
 */
function calculateWeightedScoreLocal(scores: Record<CriterionField, number>): number {
  const weighted = criteria.reduce(
    (total, c) => total + scores[c.field] * c.weight,
    0,
  );
  return Math.round((weighted / 100) * 100) / 100;
}

type ScoresState = Record<CriterionField, number>;

export function EvaluationForm({ project }: { project: JudgeProjectDetailDto }) {
  const router = useRouter();
  const { run, pending, error, fieldErrors } = useAction(saveEvaluationAction);

  const initial: ScoresState = {
    innovationScore: project.myEvaluation?.innovationScore ?? scoreRange.min,
    technologyScore: project.myEvaluation?.technologyScore ?? scoreRange.min,
    impactScore: project.myEvaluation?.impactScore ?? scoreRange.min,
    presentationScore: project.myEvaluation?.presentationScore ?? scoreRange.min,
  };

  const [scores, setScores] = useState<ScoresState>(initial);
  const [comment, setComment] = useState(project.myEvaluation?.comment ?? '');

  const liveScore = useMemo(() => calculateWeightedScoreLocal(scores), [scores]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    run(
      { projectId: project.projectId, comment, ...scores },
      () => router.refresh(),
    );
  }

  return (
    <form onSubmit={handleSubmit} data-testid="evaluation-form" className="space-y-5 max-w-xl">
      <div className="info-panel p-4 text-center">
        <span className="eyebrow text-purple-300">Puntaje en vivo</span>
        <p data-testid="evaluation-live-score" className="display-font text-4xl">
          {liveScore}
        </p>
      </div>

      {criteria.map((c) => (
        <div key={c.field}>
          <label htmlFor={c.field} className="text-sm text-slate-300">
            {c.label} <span className="text-xs text-slate-500">(peso {c.weight}%)</span>
          </label>
          <p className="text-xs text-slate-500 mb-1">{c.description}</p>
          <input
            id={c.field}
            type="range"
            data-testid={`evaluation-${c.key}`}
            min={scoreRange.min}
            max={scoreRange.max}
            value={scores[c.field]}
            onChange={(e) =>
              setScores((s) => ({ ...s, [c.field]: Number(e.target.value) }))
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>{scoreRange.min}</span>
            <span className="font-medium text-slate-200">{scores[c.field]}</span>
            <span>{scoreRange.max}</span>
          </div>
          {fieldErrors[c.field] && (
            <p className="mt-1 text-sm text-red-300">{fieldErrors[c.field][0]}</p>
          )}
        </div>
      ))}

      <div>
        <label htmlFor="comment" className="text-sm text-slate-300">
          Comentario (opcional)
        </label>
        <textarea
          id="comment"
          data-testid="evaluation-comment"
          className="mt-1 w-full rounded border border-white/15 bg-transparent px-3 py-2"
          rows={4}
          maxLength={2000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <button
        type="submit"
        data-testid="evaluation-save"
        disabled={pending}
        className="button-primary disabled:opacity-50"
      >
        {pending ? 'Guardando…' : 'Guardar calificación'}
      </button>

      {error && (
        <p role="alert" data-testid="evaluation-error" className="text-sm text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
