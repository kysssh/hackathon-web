// src/lib/error-messages.ts

export const ERROR_MESSAGES: Record<string, string> = {
  // Sesión y permisos
  UNAUTHENTICATED: 'Tenés que iniciar sesión para continuar.',
  FORBIDDEN: 'No tenés permiso para hacer esta acción.',
  VALIDATION_ERROR: 'Revisá los datos: hay algo mal completado.',
  NOT_FOUND: 'No encontramos lo que buscabas.',
  INTERNAL_ERROR: 'Algo salió mal de nuestro lado. Probá de nuevo en un momento.',

  // Equipo
  TEAM_REQUIRED: 'Primero tenés que crear un equipo o unirte a uno.',
  TEAM_NAME_TAKEN: 'Ya existe un equipo con ese nombre. Probá con otro.',
  TEAM_ALREADY_MEMBER: 'Ya pertenecés a un equipo. Un usuario solo puede estar en uno.',
  TEAM_JOIN_CODE_INVALID: 'El código no es válido. Revisalo y probá de nuevo.',
  TEAM_FULL: 'Ese equipo ya está completo.',
  TEAM_REGISTRATION_CLOSED: 'Las inscripciones ya están cerradas.',
  TEAM_TOO_SMALL: 'Tu equipo todavía no tiene la cantidad mínima de integrantes.',
  TEAM_LEADER_REQUIRED: 'Solo el líder del equipo puede hacer esta acción.',

  // Proyecto
  PROJECT_INCOMPLETE: 'Todavía falta completar datos del proyecto antes de enviarlo.',
  PROJECT_NOT_SUBMITTED: 'El proyecto todavía no fue enviado.',
  SUBMISSION_NOT_OPEN: 'La entrega de proyectos todavía no está abierta.',
  SUBMISSION_CLOSED: 'El plazo de entrega ya cerró.',

  // Archivos
  FILE_TOO_LARGE: 'El archivo es demasiado grande.',
  FILE_TYPE_NOT_ALLOWED: 'Ese tipo de archivo no está permitido.',
  FILE_LIMIT_REACHED: 'Ya alcanzaste el límite de archivos para este proyecto.',
  FILE_NOT_UPLOADED: 'El archivo no terminó de subirse. Probá de nuevo.',

  // Evaluación
  EVALUATION_CLOSED: 'El período de calificación ya cerró.',
};

/**
 * Devuelve el texto en español de un código de error.
 * Si el código no existe, devuelve un mensaje genérico.
 */
export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? 'Ocurrió un error inesperado.';
}