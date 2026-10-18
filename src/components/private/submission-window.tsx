'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

import { useServerNow } from '@/components/private/hooks/use-server-now';
import { Badge } from '@/components/ui/badge';
import { formatEventDate } from '@/dates';
import type { ProjectDto } from '@/lib/queries/dtos';

type SubmissionWindow = ProjectDto['submissionWindow'];
type WindowStatus = SubmissionWindow['status'];

export type WindowState = {
  status: WindowStatus;
  /** Milisegundos que faltan para el cierre. null hasta que la pantalla se monta. */
  remainingMs: number | null;
  opensAt: string;
  closesAt: string;
};

const SubmissionWindowContext = createContext<WindowState | null>(null);

/** Misma regla que getSubmissionWindow (src/lib/project/rules.ts): cerrado solo DESPUÉS de closesAt. */
function deriveStatus(w: SubmissionWindow, now: number | null): WindowStatus {
  if (now === null) return w.status;
  if (now < Date.parse(w.opensAt)) return 'NOT_OPEN';
  if (now > Date.parse(w.closesAt)) return 'CLOSED';
  return 'OPEN';
}

/** "3 d 04 h" cuando falta más de un día; "04:12:09" cuando falta menos. */
export function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const seconds = totalSeconds % 60;
  const two = (n: number) => String(n).padStart(2, '0');
  if (days >= 1) return `${days} d ${two(hours)} h`;
  return `${two(hours)}:${two(minutes)}:${two(seconds)}`;
}

/**
 * Comparte el estado del plazo de entrega con TODA la pantalla /panel/proyecto
 * (banner, formulario, subida de archivos y botón de enviar), para que se bloqueen
 * juntos en el mismo segundo. Cuando el plazo vence con la página abierta, pide al
 * servidor los datos nuevos (router.refresh) para que lo que se ve coincida con la base.
 */
export function SubmissionWindowProvider({
  submissionWindow,
  children,
}: {
  submissionWindow: SubmissionWindow;
  children: ReactNode;
}) {
  const router = useRouter();
  const now = useServerNow(submissionWindow.serverNow);
  const status = deriveStatus(submissionWindow, now);
  const remainingMs =
    now === null
      ? null
      : Math.max(0, Date.parse(submissionWindow.closesAt) - now);

  const previous = useRef<WindowStatus>(submissionWindow.status);
  useEffect(() => {
    if (previous.current !== 'CLOSED' && status === 'CLOSED') router.refresh();
    previous.current = status;
  }, [status, router]);

  const value: WindowState = {
    status,
    remainingMs,
    opensAt: submissionWindow.opensAt,
    closesAt: submissionWindow.closesAt,
  };

  return (
    <SubmissionWindowContext.Provider value={value}>
      {children}
    </SubmissionWindowContext.Provider>
  );
}

/**
 * Estado del plazo. Dentro del Provider es el estado "en vivo"; fuera de él usa el
 * estado que llegó del servidor (`fallback`), así los componentes también funcionan solos.
 */
export function useSubmissionWindow(fallback: SubmissionWindow): WindowState;
export function useSubmissionWindow(
  fallback?: SubmissionWindow | null
): WindowState | null;
export function useSubmissionWindow(
  fallback?: SubmissionWindow | null
): WindowState | null {
  const live = useContext(SubmissionWindowContext);
  if (live) return live;
  if (!fallback) return null;
  return {
    status: fallback.status,
    remainingMs: null,
    opensAt: fallback.opensAt,
    closesAt: fallback.closesAt,
  };
}

function formatLocal(iso: string): string {
  return new Date(iso).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

/** Aviso del plazo: hora oficial (Lima), hora local de la persona y cuenta regresiva. */
export function DeadlineBanner() {
  const w = useSubmissionWindow();
  if (!w) return null;

  const mounted = w.remainingMs !== null;
  const lessThanADay = mounted && w.remainingMs! < 86_400_000;

  const badge =
    w.status === 'OPEN' ? (
      <Badge tone={lessThanADay ? 'warning' : 'success'}>
        Entregas abiertas
      </Badge>
    ) : w.status === 'CLOSED' ? (
      <Badge tone="danger">Entregas cerradas</Badge>
    ) : (
      <Badge tone="neutral">Entregas aún no abiertas</Badge>
    );

  const reference = w.status === 'NOT_OPEN' ? w.opensAt : w.closesAt;
  const verb =
    w.status === 'NOT_OPEN'
      ? 'Abren el'
      : w.status === 'OPEN'
        ? 'Cierran el'
        : 'Cerraron el';

  return (
    <div
      data-testid="deadline-banner"
      data-status={w.status}
      className="info-panel flex flex-wrap items-center justify-between gap-3 !p-4"
    >
      <div className="space-y-1">
        <span role="status">{badge}</span>
        <p className="text-sm text-slate-300">
          {verb} {formatEventDate(reference)}{' '}
          <span className="text-slate-500">(hora de Lima)</span>
        </p>
        {mounted && (
          <p
            data-testid="deadline-local-time"
            className="text-xs text-slate-500"
          >
            Tu hora local: {formatLocal(reference)}
          </p>
        )}
      </div>

      {w.status === 'OPEN' && mounted && (
        <p data-testid="deadline-remaining" className="text-right">
          <span className="eyebrow block text-slate-400">Tiempo restante</span>
          <span
            className={`display-font text-2xl ${lessThanADay ? 'text-amber-300' : 'text-purple-200'}`}
          >
            {formatRemaining(w.remainingMs!)}
          </span>
        </p>
      )}
    </div>
  );
}
