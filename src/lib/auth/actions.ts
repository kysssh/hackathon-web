'use server';

import { z } from 'zod';

import { createAction } from '@/actions';

import { signIn, signOut } from './config';

/** Solo se aceptan rutas internas ("/panel"), para que nadie use el ingreso como redirección a otro sitio. */
const internalPath = z
  .string()
  .refine((path) => path.startsWith('/') && !path.startsWith('//') && !path.includes('\\'));

const signInSchema = z.object({
  provider: z.enum(['google', 'github']),
  next: internalPath.optional(),
});

/**
 * Inicia sesión con Google o GitHub. Si sale bien, Auth.js redirige (lanza un redirect que
 * createAction deja pasar), así que esta acción normalmente no llega a devolver nada.
 */
export const signInAction = createAction(
  signInSchema,
  async ({ provider, next }) => {
    await signIn(provider, { redirectTo: next ?? '/panel' });
  },
  { access: 'public' },
);

export const signOutAction = createAction(
  z.object({}),
  async () => {
    await signOut({ redirectTo: '/ingresar' });
  },
  { access: 'public' },
);
