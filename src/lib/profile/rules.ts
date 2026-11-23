/**
 * Reglas del perfil del participante: funciones puras (sin base de datos), para
 * poder probarlas solas y usarlas tanto en el servidor como en el navegador.
 *
 * Google y GitHub solo entregan un "nombre visible" (a veces un apodo), así que
 * al primer ingreso se piden nombres, apellidos y universidad.
 */

export const PROFILE_LIMITS = {
  nameMin: 2,
  nameMax: 60,
  universityMin: 2,
  universityMax: 120,
} as const;

/** Sugerencias para el campo universidad (se puede escribir cualquier otra). */
export const UNIVERSITY_SUGGESTIONS = [
  'Universidad Nacional de Ingeniería (UNI)',
  'Universidad Nacional Mayor de San Marcos (UNMSM)',
  'Pontificia Universidad Católica del Perú (PUCP)',
  'Universidad Peruana de Ciencias Aplicadas (UPC)',
  'Universidad de Ingeniería y Tecnología (UTEC)',
  'Universidad de Lima (ULima)',
  'Universidad del Pacífico (UP)',
  'Universidad Peruana Cayetano Heredia (UPCH)',
  'Universidad Nacional Agraria La Molina (UNALM)',
  'Universidad Nacional del Callao (UNAC)',
  'Universidad Nacional Federico Villarreal (UNFV)',
  'Universidad San Ignacio de Loyola (USIL)',
  'Universidad de San Martín de Porres (USMP)',
  'Universidad Ricardo Palma (URP)',
  'Universidad Tecnológica del Perú (UTP)',
  'Universidad Científica del Sur (UCSUR)',
  'Universidad César Vallejo (UCV)',
  'Universidad Privada del Norte (UPN)',
  'Universidad ESAN',
  'Universidad Nacional de San Agustín de Arequipa (UNSA)',
  'Universidad Nacional de Trujillo (UNT)',
  'Universidad Nacional San Antonio Abad del Cusco (UNSAAC)',
] as const;

/** Quita espacios sobrantes: "  juan   carlos " → "juan carlos". */
export function normalizeProfileText(raw: string): string {
  return raw.normalize('NFC').trim().replace(/\s+/g, ' ');
}

/** Letras (con tildes y ñ), espacios, apóstrofo, punto y guion: "María-José O'Neill". */
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u;

export function isValidPersonName(value: string): boolean {
  return (
    value.length >= PROFILE_LIMITS.nameMin &&
    value.length <= PROFILE_LIMITS.nameMax &&
    NAME_PATTERN.test(value)
  );
}

export type ProfileFields = {
  firstName: string | null;
  lastName: string | null;
  university: string | null;
};

export function isProfileComplete(profile: ProfileFields): boolean {
  return Boolean(
    profile.firstName?.trim() &&
      profile.lastName?.trim() &&
      profile.university?.trim()
  );
}

/** Nombre a mostrar: nombres y apellidos si los completó; si no, el de OAuth. */
export function displayName(
  user: ProfileFields & { name: string | null },
  fallback = 'Sin nombre'
): string {
  const full = [user.firstName, user.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
  return full || user.name?.trim() || fallback;
}

/**
 * Separa el nombre de OAuth para precargar el formulario.
 * "Ana María Pérez Gómez" → { firstName: "Ana María", lastName: "Pérez Gómez" }.
 * Es solo una sugerencia: la persona la corrige antes de guardar.
 */
export function splitOAuthName(name: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const parts = normalizeProfileText(name ?? '').split(' ').filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] ?? '', lastName: '' };
  if (parts.length === 2) return { firstName: parts[0], lastName: parts[1] };
  const half = Math.ceil(parts.length / 2);
  return {
    firstName: parts.slice(0, half).join(' '),
    lastName: parts.slice(half).join(' '),
  };
}
