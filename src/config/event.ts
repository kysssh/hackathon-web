/**
 * Fechas y límites oficiales del evento.
 * Dueño: BK. UX (cronograma, cuenta regresiva) y FE leen de aquí; nadie copia fechas a mano.
 *
 * Sede oficial: Universidad Nacional de Ingeniería (UNI).
 * Las fechas se escriben como texto ISO con la hora de Lima (-05:00).
 */

const MB = 1024 * 1024;

export const eventConfig = {
  name: 'Hackathon UNI 2026',
  venue: 'Universidad Nacional de Ingeniería (UNI)',

  dates: {
    /** 10 de noviembre: Anuncio oficial y apertura de registro. */
    registrationOpensAt: '2026-11-10T00:00:00-05:00',
    /** 24 de noviembre: Kickoff e inauguración (cierre de inscripciones). */
    registrationClosesAt: '2026-11-24T23:59:00-05:00',
    /** 24 de noviembre: Apertura de plataforma para entregas. */
    submissionOpensAt: '2026-11-24T00:00:00-05:00',
    /** 1 de diciembre: Segundo entregable y selección de 10 equipos. */
    submissionClosesAt: '2026-12-01T23:59:00-05:00',
    /** 5 de diciembre: Demo Day y presentación final de proyectos. */
    evaluationClosesAt: '2026-12-05T22:00:00-05:00',
  },

  team: {
    minMembers: 4,
    maxMembers: 4,
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