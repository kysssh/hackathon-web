import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calculateWeightedScore } from '@/config/criteria';
import { eventConfig } from '@/config/event';
import { formatEventDate } from '@/dates';
import { ActionError } from '@/errors';
import { getErrorMessage } from '@/error-messages';
import {
  assertFileLimit,
  bucketForKind,
  validateFile,
} from '@/lib/files/rules';
import {
  computeMissingFields,
  getEventPhase,
  getSubmissionWindow,
  isValidDriveUrl,
  isValidGitHubUrl,
  slugify,
} from '@/lib/project/rules';
import {
  generateJoinCode,
  isRegistrationClosed,
  isTeamFull,
  normalizeJoinCode,
  normalizeTeamName,
} from '@/lib/team/rules';

describe('Reglas de Equipos (Team Rules)', () => {
  it('genera códigos con formato HACK-XXXX válidos sin caracteres confusos', () => {
    const code = generateJoinCode();
    assert.match(code, /^HACK-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/);
  });

  it('normaliza joinCode eliminando espacios y convirtiendo a mayúsculas', () => {
    assert.equal(normalizeJoinCode(' hack-29xj '), 'HACK-29XJ');
    assert.equal(normalizeJoinCode('hack 29xj'), 'HACK-29XJ');
    assert.equal(normalizeJoinCode('29xj'), 'HACK-29XJ');
    assert.equal(normalizeJoinCode('HACK-29XJ'), 'HACK-29XJ');
  });

  it('normaliza nombres de equipos eliminando espacios repetidos', () => {
    assert.equal(normalizeTeamName('  Byte   Force '), 'Byte Force');
    assert.equal(normalizeTeamName('Eco  Ruta'), 'Eco Ruta');
  });

  it('detecta correctamente cuándo un equipo está lleno', () => {
    assert.equal(isTeamFull(eventConfig.team.maxMembers - 1), false);
    assert.equal(isTeamFull(eventConfig.team.maxMembers), true);
    assert.equal(isTeamFull(eventConfig.team.maxMembers + 1), true);
  });

  it('verifica correctamente el cierre de inscripciones según la fecha', () => {
    // Antes del cierre
    assert.equal(isRegistrationClosed('2026-10-10T12:00:00-05:00'), false);
    // Después del cierre
    assert.equal(isRegistrationClosed('2026-12-06T12:00:00-05:00'), true);
  });
});

describe('Reglas del Proyecto (Project Rules)', () => {
  it('clasifica las fechas en las fases oficiales', () => {
    assert.equal(getEventPhase('2026-12-05T12:00:00-05:00'), 'PHASE_1');
    assert.equal(getEventPhase('2026-12-07T12:00:00-05:00'), 'PHASE_2');
    assert.equal(getEventPhase('2026-12-09T12:00:00-05:00'), 'SEMIFINAL');
    assert.equal(getEventPhase('2026-12-11T12:00:00-05:00'), 'FINAL');
  });

  it('exige Word y portada en la primera fase', () => {
    const missing = computeMissingFields({
      title: 'Proyecto',
      summary: 'Resumen',
      description: 'Descripción',
      phase: 'PHASE_1',
      hasWordDocument: false,
      hasCoverImage: false,
    });
    assert.deepEqual(missing, ['wordDocument', 'coverImage']);
  });

  it('exige presentación actualizada y Drive en la segunda fase', () => {
    const missing = computeMissingFields({
      title: 'Proyecto',
      summary: 'Resumen',
      description: 'Descripción',
      phase: 'PHASE_2',
      hasUpdatedPitchDeck: true,
      hasUpdatedCoverImage: true,
      videoUrl: 'https://drive.google.com/file/d/demo/view',
    });
    assert.deepEqual(missing, []);
  });

  it('valida enlaces de Drive de Google', () => {
    assert.equal(isValidDriveUrl('https://drive.google.com/file/d/demo/view'), true);
    assert.equal(isValidDriveUrl('https://example.com/video'), false);
  });

  it('exige GitHub solo en semifinal', () => {
    assert.equal(isValidGitHubUrl('https://github.com/equipo/proyecto'), true);
    assert.equal(isValidGitHubUrl('https://example.com/proyecto'), false);

    const phaseOneMissing = computeMissingFields({
      title: 'Proyecto',
      summary: 'Resumen',
      description: 'Descripción',
      phase: 'PHASE_1',
      repositoryUrl: null,
      hasWordDocument: true,
      hasCoverImage: true,
    });
    assert.equal(phaseOneMissing.includes('githubUrl'), false);

    const semifinalMissing = computeMissingFields({
      title: 'Proyecto',
      summary: 'Resumen',
      description: 'Descripción',
      phase: 'SEMIFINAL',
      repositoryUrl: null,
      demoUrl: 'https://demo.example.com',
      hasUpdatedPitchDeck: true,
      hasUpdatedCoverImage: true,
    });
    assert.deepEqual(semifinalMissing, ['githubUrl']);
  });

  it('convierte nombres a slugs limpios para la URL de galería', () => {
    assert.equal(slugify('Byte Force'), 'byte-force');
    assert.equal(slugify('¡Innovación & Cultura!'), 'innovacion-cultura');
    assert.equal(slugify('Eco-Ruta 2026'), 'eco-ruta-2026');
  });

  it('calcula los campos faltantes obligatorios para entregar', () => {
    const empty = computeMissingFields({
      title: '',
      summary: '',
      description: '',
      phase: 'PHASE_1',
      hasWordDocument: false,
      hasCoverImage: false,
    });
    assert.deepEqual(empty, ['title', 'summary', 'description', 'wordDocument', 'coverImage']);

    const complete = computeMissingFields({
      title: 'Plataforma Virtual',
      summary: 'Resumen conciso del proyecto.',
      description: 'Descripción completa detallando el valor del proyecto...',
      phase: 'PHASE_1',
      hasWordDocument: true,
      hasCoverImage: true,
    });
    assert.deepEqual(complete, []);
  });

  it('determina correctamente el estado de la ventana de entregas (SubmissionWindow)', () => {
    const before = getSubmissionWindow('2026-11-15T00:00:00-05:00');
    assert.equal(before.status, 'NOT_OPEN');

    const during = getSubmissionWindow('2026-12-06T12:00:00-05:00');
    assert.equal(during.status, 'OPEN');

    const after = getSubmissionWindow('2026-12-13T00:00:00-05:00');
    assert.equal(after.status, 'CLOSED');
  });
});

describe('Reglas de Archivos (File Rules)', () => {
  it('asigna el bucket correcto según el tipo de archivo', () => {
    assert.equal(bucketForKind('COVER_IMAGE'), 'portadas');
    assert.equal(bucketForKind('PITCH_DECK'), 'entregables');
    assert.equal(bucketForKind('EXTRA'), 'entregables');
  });

  it('rechaza pitch deck si no es PDF', () => {
    assert.throws(
      () =>
        validateFile({
          kind: 'PITCH_DECK',
          contentType: 'image/png',
          sizeBytes: 1024 * 1024,
        }),
      (err: unknown) => err instanceof ActionError && err.code === 'FILE_TYPE_NOT_ALLOWED'
    );
  });

  it('rechaza archivos que exceden el límite de tamaño', () => {
    const overLimit = 26 * 1024 * 1024; // 26 MB (límite pitch es 25 MB)
    assert.throws(
      () =>
        validateFile({
          kind: 'PITCH_DECK',
          contentType: 'application/pdf',
          sizeBytes: overLimit,
        }),
      (err: unknown) => err instanceof ActionError && err.code === 'FILE_TOO_LARGE'
    );
  });

  it('acepta archivos válidos dentro de los límites', () => {
    assert.doesNotThrow(() =>
      validateFile({
        kind: 'PITCH_DECK',
        contentType: 'application/pdf',
        sizeBytes: 5 * 1024 * 1024,
      })
    );
  });

  it('controla el límite de cantidad de archivos extra', () => {
    assert.doesNotThrow(() => assertFileLimit('EXTRA', 4));
    assert.throws(
      () => assertFileLimit('EXTRA', 5),
      (err: unknown) => err instanceof ActionError && err.code === 'FILE_LIMIT_REACHED'
    );
  });
});

describe('Evaluación y Criterios (Criteria & Scoring)', () => {
  it('calcula la nota ponderada exacta según pesos oficiales (25/30/25/20)', () => {
    // Ejemplo oficial del plan de pruebas: 8, 7, 9, 6 => 7.55
    const score = calculateWeightedScore({
      innovationScore: 8,
      technologyScore: 7,
      impactScore: 9,
      presentationScore: 6,
    });
    assert.equal(score, 7.55);
  });

  it('calcula notas extremas (mínimo 1, máximo 10)', () => {
    const minScore = calculateWeightedScore({
      innovationScore: 1,
      technologyScore: 1,
      impactScore: 1,
      presentationScore: 1,
    });
    assert.equal(minScore, 1.0);

    const maxScore = calculateWeightedScore({
      innovationScore: 10,
      technologyScore: 10,
      impactScore: 10,
      presentationScore: 10,
    });
    assert.equal(maxScore, 10.0);
  });
});

describe('Utilidades de Fecha y Errores', () => {
  it('formatea fechas en zona horaria de Lima (America/Lima)', () => {
    const formatted = formatEventDate('2026-11-20T23:59:00-05:00');
    assert.match(formatted, /2026/);
    assert.match(formatted, /11:59/);
  });

  it('devuelve mensajes en español para códigos de error oficiales', () => {
    assert.equal(
      getErrorMessage('TEAM_NAME_TAKEN'),
      'Ya existe un equipo con ese nombre.',
    );
    assert.equal(
      getErrorMessage('TEAM_JOIN_CODE_INVALID'),
      'El código no corresponde a ningún equipo.',
    );
    assert.equal(
      getErrorMessage('SUBMISSION_CLOSED'),
      'Las entregas ya cerraron.',
    );
  });

  it('devuelve mensaje de error interno para códigos no reconocidos', () => {
    assert.equal(
      getErrorMessage('CODIGO_INVENTADO'),
      'Algo salió mal de nuestro lado. Inténtalo de nuevo.',
    );
  });
});
