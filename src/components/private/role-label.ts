import type { UserRole } from '@/lib/auth/roles';

/** Nombre del rol en español para mostrar en pantalla (el valor interno sigue siendo el enum). */
export const ROLE_LABEL: Record<UserRole, string> = {
  PARTICIPANT: 'Participante',
  JUDGE: 'Jurado',
  ORGANIZER: 'Organización',
};
