/**
 * Reglas del proyecto: funciones puras (sin base de datos).
 * Dueño: BK. BD las usa en getMyProject para llenar `missingFields` y `submissionWindow`,
 * así el valor que ve la pantalla es el mismo que usan las acciones.
 */
import { eventConfig } from '@/config/event';

const { submissionOpensAt, submissionClosesAt } = eventConfig.dates;

/**
 * Qué le falta al proyecto para poder enviarse. Son nombres del contrato (ProjectDto.missingFields):
 * 'title' · 'summary' · 'description' · 'pitchDeck'
 */
export function computeMissingFields(project: {
  title: string;
  summary: string;
  description: string;
  hasPitchDeck: boolean;
}): string[] {
  const missing: string[] = [];
  if (!project.title.trim()) missing.push('title');
  if (!project.summary.trim()) missing.push('summary');
  if (!project.description.trim()) missing.push('description');
  if (!project.hasPitchDeck) missing.push('pitchDeck');
  return missing;
}

export type SubmissionWindow = {
  status: 'NOT_OPEN' | 'OPEN' | 'CLOSED';
  opensAt: string;
  closesAt: string;
  serverNow: string;
};

/** Estado del plazo de entrega a la hora del servidor (`nowIso`, de `serverNow()`). */
export function getSubmissionWindow(nowIso: string): SubmissionWindow {
  const now = Date.parse(nowIso);
  const status =
    now < Date.parse(submissionOpensAt) ? 'NOT_OPEN' : now > Date.parse(submissionClosesAt) ? 'CLOSED' : 'OPEN';

  return {
    status,
    opensAt: new Date(submissionOpensAt).toISOString(),
    closesAt: new Date(submissionClosesAt).toISOString(),
    serverNow: nowIso,
  };
}

/** "Byte Force" → "byte-force". Sirve de base para la dirección pública /galeria/[projectSlug]. */
export function slugify(text: string): string {
  const slug = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
  return slug || 'proyecto';
}
