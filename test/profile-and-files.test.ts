import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ActionError } from '@/errors';
import {
  acceptAttribute,
  normalizeContentType,
  resolveContentType,
  safeFileName,
} from '@/lib/files/mime';
import { validateFile } from '@/lib/files/rules';
import {
  displayName,
  isProfileComplete,
  isValidPersonName,
  normalizeProfileText,
  splitOAuthName,
} from '@/lib/profile/rules';

describe('Perfil del participante', () => {
  it('normaliza espacios en nombres y universidad', () => {
    assert.equal(normalizeProfileText('  Ana   María '), 'Ana María');
  });

  it('acepta nombres con tildes, ñ, guion y apóstrofo', () => {
    assert.equal(isValidPersonName('María-José'), true);
    assert.equal(isValidPersonName("O'Neill Peña"), true);
    assert.equal(isValidPersonName('Ñuñez'), true);
  });

  it('rechaza nombres con números, símbolos o muy cortos', () => {
    assert.equal(isValidPersonName('Juan123'), false);
    assert.equal(isValidPersonName('<script>'), false);
    assert.equal(isValidPersonName('A'), false);
  });

  it('el perfil está completo solo con nombres, apellidos y universidad', () => {
    assert.equal(
      isProfileComplete({ firstName: 'Ana', lastName: 'Pérez', university: 'UNI' }),
      true
    );
    assert.equal(
      isProfileComplete({ firstName: 'Ana', lastName: 'Pérez', university: null }),
      false
    );
    assert.equal(
      isProfileComplete({ firstName: ' ', lastName: 'Pérez', university: 'UNI' }),
      false
    );
  });

  it('muestra nombres y apellidos, o el nombre de OAuth si faltan', () => {
    assert.equal(
      displayName({ name: 'anita99', firstName: 'Ana', lastName: 'Pérez', university: null }),
      'Ana Pérez'
    );
    assert.equal(
      displayName({ name: 'anita99', firstName: null, lastName: null, university: null }),
      'anita99'
    );
    assert.equal(
      displayName({ name: null, firstName: null, lastName: null, university: null }),
      'Sin nombre'
    );
  });

  it('separa el nombre de OAuth como sugerencia', () => {
    assert.deepEqual(splitOAuthName('Ana Pérez'), { firstName: 'Ana', lastName: 'Pérez' });
    assert.deepEqual(splitOAuthName('Ana María Pérez Gómez'), {
      firstName: 'Ana María',
      lastName: 'Pérez Gómez',
    });
    assert.deepEqual(splitOAuthName(null), { firstName: '', lastName: '' });
  });
});

describe('Tipos de archivo (subida)', () => {
  it('normaliza los tipos que reportan Windows y otros navegadores', () => {
    assert.equal(normalizeContentType('application/x-zip-compressed'), 'application/zip');
    assert.equal(normalizeContentType('image/jpg'), 'image/jpeg');
    assert.equal(normalizeContentType('Image/PNG; charset=binary'), 'image/png');
  });

  it('usa la extensión cuando el navegador no reporta tipo', () => {
    assert.equal(resolveContentType('pitch.PDF', ''), 'application/pdf');
    assert.equal(resolveContentType('codigo.zip', 'application/octet-stream'), 'application/zip');
    assert.equal(resolveContentType('foto.jfif', ''), 'image/jpeg');
    assert.equal(resolveContentType('sin-extension', ''), '');
  });

  it('acepta un zip de Windows como archivo EXTRA', () => {
    assert.doesNotThrow(() =>
      validateFile({ kind: 'EXTRA', contentType: 'application/x-zip-compressed', sizeBytes: 1024 })
    );
  });

  it('sigue rechazando tipos no permitidos', () => {
    assert.throws(
      () => validateFile({ kind: 'PITCH_DECK', contentType: 'application/zip', sizeBytes: 1024 }),
      (error: unknown) => error instanceof ActionError && error.code === 'FILE_TYPE_NOT_ALLOWED'
    );
  });

  it('recorta nombres largos conservando la extensión', () => {
    const name = safeFileName(`${'a'.repeat(300)}.pdf`);
    assert.equal(name.length, 200);
    assert.ok(name.endsWith('.pdf'));
    assert.equal(safeFileName('  pitch.pdf '), 'pitch.pdf');
  });

  it('el selector acepta tipos y extensiones', () => {
    assert.equal(acceptAttribute(['application/pdf']), 'application/pdf,.pdf');
    assert.ok(acceptAttribute(['application/zip']).includes('.zip'));
  });
});
