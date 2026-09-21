/**
 * Decide qué rol tiene una persona según su correo.
 *
 * Las listas vienen del .env:
 *   ORGANIZER_EMAILS="a@gmail.com,b@gmail.com"
 *   JUDGE_EMAILS="c@gmail.com"
 *
 * Si un correo está en las dos listas, gana ORGANIZER.
 * Si no está en ninguna, es PARTICIPANT.
 */

export type UserRole = 'PARTICIPANT' | 'JUDGE' | 'ORGANIZER';

/** Convierte "a@x.com, B@x.com" en un conjunto {"a@x.com", "b@x.com"}. */
function parseEmailList(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0),
  );
}

export function resolveRoleForEmail(email: string | null | undefined): UserRole {
  if (!email) return 'PARTICIPANT';

  const normalized = email.trim().toLowerCase();

  if (parseEmailList(process.env.ORGANIZER_EMAILS).has(normalized)) return 'ORGANIZER';
  if (parseEmailList(process.env.JUDGE_EMAILS).has(normalized)) return 'JUDGE';
  return 'PARTICIPANT';
}