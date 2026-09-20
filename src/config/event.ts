/**
 * Fechas y límites del evento.
 * Dueño: BK. UX (cronograma, cuenta regresiva) y FE leen de aquí; nadie copia fechas a mano.
 *
 * ⚠️  TODOS LOS VALORES DE ESTE ARCHIVO SON PROVISIONALES.
 *     Confirmarlos con la organización antes de la semana 4.
 *
 * Las fechas se escriben como texto ISO con la hora de Lima (-05:00).
 * Ejemplo: '2026-11-20T23:59:00-05:00' = 20 de noviembre, 11:59 pm en Lima.
 */

const MB = 1024 * 1024;

export const eventConfig = {
  name: 'Hackathon',

  dates: {
    /** Desde cuándo se pueden crear equipos y unirse. */
    registrationOpensAt: '2026-10-05T00:00:00-05:00',
    /** Hasta cuándo se pueden crear equipos y unirse (después: TEAM_REGISTRATION_CLOSED). */
    registrationClosesAt: '2026-11-13T23:59:00-05:00',
    /** Desde cuándo se puede enviar el proyecto (antes: SUBMISSION_NOT_OPEN). */
    submissionOpensAt: '2026-11-06T00:00:00-05:00',
    /** Hasta cuándo se puede enviar el proyecto (después: SUBMISSION_CLOSED). */
    submissionClosesAt: '2026-11-20T23:59:00-05:00',
    /** Hasta cuándo el jurado puede calificar (después: EVALUATION_CLOSED). */
    evaluationClosesAt: '2026-11-27T23:59:00-05:00',
  },

  team: {
    minMembers: 2,
    maxMembers: 5,
    /** Formato del código: HACK-XXXX */
    joinCodePrefix: 'HACK',
  },

  files: {
    /** Máximo de archivos EXTRA por proyecto. */
    maxExtraFiles: 5,
    limits: {
      PITCH_DECK: {
        maxBytes: 25 * MB,
        contentTypes: ['application/pdf'],
      },
      COVER_IMAGE: {
        maxBytes: 5 * MB,
        contentTypes: ['image/png', 'image/jpeg', 'image/webp'],
      },
      EXTRA: {
        maxBytes: 25 * MB,
        contentTypes: ['application/pdf', 'application/zip', 'image/png', 'image/jpeg'],
      },
    },
  },
} as const;

export type ProjectFileKind = keyof typeof eventConfig.files.limits;