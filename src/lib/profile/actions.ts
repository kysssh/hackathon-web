'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createAction } from '@/actions';
import { db } from '@/lib/db';

import {
  PROFILE_LIMITS,
  isValidPersonName,
  normalizeProfileText,
} from './rules';

const personName = (label: string) =>
  z
    .string()
    .transform(normalizeProfileText)
    .pipe(
      z
        .string()
        .min(PROFILE_LIMITS.nameMin, `Escribe tus ${label}.`)
        .max(PROFILE_LIMITS.nameMax, `Máximo ${PROFILE_LIMITS.nameMax} caracteres.`)
        .refine(isValidPersonName, `Usa solo letras en tus ${label}.`)
    );

const profileSchema = z.object({
  firstName: personName('nombres'),
  lastName: personName('apellidos'),
  university: z
    .string()
    .transform(normalizeProfileText)
    .pipe(
      z
        .string()
        .min(PROFILE_LIMITS.universityMin, 'Indica tu universidad.')
        .max(
          PROFILE_LIMITS.universityMax,
          `Máximo ${PROFILE_LIMITS.universityMax} caracteres.`
        )
    ),
});

/** Guarda nombres, apellidos y universidad de la persona que inició sesión. */
export const updateProfileAction = createAction(
  profileSchema,
  async ({ firstName, lastName, university }, user) => {
    await db.user.update({
      where: { id: user.id },
      data: {
        firstName,
        lastName,
        university,
        // `name` se usa en galería, jurado y organización: queda con el nombre real.
        name: `${firstName} ${lastName}`,
      },
    });
    // El nombre aparece en la cabecera y en las tarjetas de equipo de todos.
    revalidatePath('/', 'layout');
    return {};
  }
);
