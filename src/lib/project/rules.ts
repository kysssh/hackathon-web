/**
 * Reglas del proyecto: funciones puras (sin base de datos).
 * Dueño: BK. BD las usa en getMyProject para llenar `missingFields` y `submissionWindow`,
 * así el valor que ve la pantalla es el mismo que usan las acciones.
 */
import { eventConfig } from '@/config/event';

const { submissionOpensAt, submissionClosesAt } = eventConfig.dates;

export type EventPhase = 'PHASE_1' | 'PHASE_2' | 'SEMIFINAL' | 'FINAL';

export function getEventPhase(nowIso: string): EventPhase {
  const now = Date.parse(nowIso);
  if (now <= Date.parse(eventConfig.dates.phaseOneClosesAt)) return 'PHASE_1';
  if (now <= Date.parse(eventConfig.dates.phaseTwoClosesAt)) return 'PHASE_2';
  if (now <= Date.parse(eventConfig.dates.semifinalAt)) return 'SEMIFINAL';
  return 'FINAL';
}

export function isValidDriveUrl(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      (url.hostname === 'drive.google.com' || url.hostname.endsWith('.googleusercontent.com'))
    );
  } catch {
    return false;
  }
}

export function isValidDomainUrl(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isValidGitHubUrl(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      (url.hostname === 'github.com' || url.hostname === 'www.github.com')
    );
  } catch {
    return false;
  }
}

/**
 * Qué le falta al proyecto para poder enviarse. Son nombres del contrato (ProjectDto.missingFields):
 * 'title' · 'summary' · 'description' · 'pitchDeck'
 */
export function computeMissingFields(project: {
  title: string;
  summary: string;
  description: string;
  repositoryUrl?: string | null;
  videoUrl?: string | null;
  demoUrl?: string | null;
  hasWordDocument?: boolean;
  hasPitchDeck?: boolean;
  hasCoverImage?: boolean;
  hasUpdatedPitchDeck?: boolean;
  hasUpdatedCoverImage?: boolean;
  phase?: EventPhase;
}): string[] {
  const missing: string[] = [];
  if (!project.title.trim()) missing.push('title');
  if (!project.summary.trim()) missing.push('summary');
  if (!project.description.trim()) missing.push('description');
  const phase = project.phase ?? getEventPhase(new Date().toISOString());

  if (phase === 'PHASE_1') {
    if (!project.hasWordDocument) missing.push('wordDocument');
    if (!project.hasCoverImage) missing.push('coverImage');
  }
  if (phase === 'PHASE_2') {
    if (!project.hasUpdatedPitchDeck) missing.push('pitchDeck');
    if (!project.hasUpdatedCoverImage) missing.push('coverImage');
    if (!isValidDriveUrl(project.videoUrl)) missing.push('driveUrl');
  }
  if (phase === 'SEMIFINAL') {
    if (!project.hasUpdatedPitchDeck) missing.push('pitchDeck');
    if (!project.hasUpdatedCoverImage) missing.push('coverImage');
    if (!isValidDomainUrl(project.demoUrl)) missing.push('domainUrl');
    if (!isValidGitHubUrl(project.repositoryUrl)) missing.push('githubUrl');
  }
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
