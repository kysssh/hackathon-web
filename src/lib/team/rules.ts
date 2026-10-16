/**
 * Reglas de equipos: funciones puras (sin base de datos), para poder probarlas solas.
 * Dueño: BK.
 */
import { randomInt } from 'node:crypto';

import { eventConfig } from '@/config/event';

// Sin 0, O, 1, I ni L: se confunden al copiar el código a mano.
const JOIN_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const JOIN_CODE_LENGTH = 4;

const { joinCodePrefix, maxMembers } = eventConfig.team;

/** Genera un código nuevo con el formato HACK-XXXX. */
export function generateJoinCode(): string {
  let suffix = '';
  for (let i = 0; i < JOIN_CODE_LENGTH; i++) {
    suffix += JOIN_CODE_ALPHABET[randomInt(JOIN_CODE_ALPHABET.length)];
  }
  return `${joinCodePrefix}-${suffix}`;
}

/**
 * Deja el código que escribió la persona en el formato guardado.
 *   " hack-29xj " → "HACK-29XJ"      "hack 29xj" → "HACK-29XJ"      "29xj" → "HACK-29XJ"
 * Si no tiene forma de código, se devuelve tal cual (en mayúsculas y sin espacios) y la búsqueda no lo encuentra.
 */
export function normalizeJoinCode(raw: string): string {
  const compact = raw.replace(/\s+/g, '').toUpperCase();
  const match = compact.match(new RegExp(`^(?:${joinCodePrefix}-?)?([A-Z0-9]{${JOIN_CODE_LENGTH}})$`));
  return match ? `${joinCodePrefix}-${match[1]}` : compact;
}

/** Quita espacios de los bordes y junta los espacios repetidos: "  Byte   Force " → "Byte Force". */
export function normalizeTeamName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

/** ¿Ya pasó el cierre de inscripciones? (`nowIso` es la hora del servidor, de `serverNow()`.) */
export function isRegistrationClosed(nowIso: string): boolean {
  return Date.parse(nowIso) > Date.parse(eventConfig.dates.registrationClosesAt);
}

export function isTeamFull(memberCount: number): boolean {
  return memberCount >= maxMembers;
}
