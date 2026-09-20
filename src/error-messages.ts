// src/lib/error-messages.ts
import { ERROR_CODES, type ErrorCode } from './errors'

const MESSAGES: Record<ErrorCode, string> = {
  UNAUTHENTICATED: 'Necesitas iniciar sesión para continuar.',
  FORBIDDEN: 'No tienes permiso para hacer esto.',
  VALIDATION_ERROR: 'Revisa los datos marcados en el formulario.',
  NOT_FOUND: 'No encontramos lo que buscabas.',
  INTERNAL_ERROR: 'Algo salió mal de nuestro lado. Inténtalo de nuevo.',
  TEAM_REQUIRED: 'Primero debes pertenecer a un equipo.',
  TEAM_NAME_TAKEN: 'Ya existe un equipo con ese nombre.',
  TEAM_ALREADY_MEMBER: 'Ya perteneces a un equipo.',
  TEAM_JOIN_CODE_INVALID: 'El código no corresponde a ningún equipo.',
  TEAM_FULL: 'El equipo ya está completo.',
  TEAM_REGISTRATION_CLOSED: 'Las inscripciones de equipos ya cerraron.',
  TEAM_TOO_SMALL: 'Tu equipo necesita más integrantes para enviar el proyecto.',
  TEAM_LEADER_REQUIRED: 'Solo el líder del equipo puede hacer esto.',
  PROJECT_INCOMPLETE: 'Completa los campos faltantes antes de enviar.',
  PROJECT_NOT_SUBMITTED: 'Este proyecto todavía no fue enviado.',
  SUBMISSION_NOT_OPEN: 'Las entregas todavía no están abiertas.',
  SUBMISSION_CLOSED: 'Las entregas ya cerraron.',
  FILE_TOO_LARGE: 'El archivo supera el tamaño permitido.',
  FILE_TYPE_NOT_ALLOWED: 'Ese tipo de archivo no está permitido aquí.',
  FILE_LIMIT_REACHED: 'Alcanzaste el número máximo de archivos.',
  FILE_NOT_UPLOADED: 'No pudimos confirmar la subida del archivo.',
  EVALUATION_CLOSED: 'El plazo para calificar ya cerró.',
}

export function getErrorMessage(code: string): string {
  return MESSAGES[code as ErrorCode] ?? MESSAGES.INTERNAL_ERROR
}
