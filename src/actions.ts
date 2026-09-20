import { unstable_rethrow } from 'next/navigation';
import { z } from 'zod';

import type { UserRole } from '@/lib/auth/roles';
import { getCurrentUser, type CurrentUser } from '@/lib/auth/session';

import { ActionError, type ErrorCode } from './errors';

export type ActionResult<T> =
    | { ok: true; data: T }
    | { ok: false; error: { code: ErrorCode; fieldErrors?: Record<string, string[]> } };

type ActionFn<Output> = (rawInput: unknown) => Promise<ActionResult<Output>>;

/**
 * Envuelve una acción del servidor. Se encarga, en este orden, de:
 *   1. Revisar la sesión y el rol  → UNAUTHENTICATED / FORBIDDEN
 *   2. Validar los datos con Zod   → VALIDATION_ERROR
 *   3. Ejecutar la acción          → { ok: true, data }
 *   4. Convertir los errores       → ActionError pasa con su código; el resto es INTERNAL_ERROR
 *
 * Quién puede usarla (tercer parámetro, por defecto 'user'):
 *   { access: 'public' }           cualquiera, con o sin sesión (el usuario puede ser null)
 *   { access: 'user' }             cualquier persona con sesión
 *   { access: ['JUDGE'] }          solo esos roles
 */

// Con { access: 'public' } el usuario puede ser null.
export function createAction<Input, Output>(
    schema: z.ZodType<Input>,
    handler: (input: Input, user: CurrentUser | null) => Promise<Output>,
    options: { access: 'public' },
): ActionFn<Output>;

// Con 'user' (por defecto) o una lista de roles, el usuario siempre existe.
export function createAction<Input, Output>(
    schema: z.ZodType<Input>,
    handler: (input: Input, user: CurrentUser) => Promise<Output>,
    options?: { access?: 'user' | UserRole[] },
): ActionFn<Output>;

export function createAction<Input, Output>(
    schema: z.ZodType<Input>,
    handler: (input: Input, user: CurrentUser) => Promise<Output>,
    options: { access?: 'public' | 'user' | UserRole[] } = {},
): ActionFn<Output> {
    const access = options.access ?? 'user';

    return async (rawInput: unknown) => {
        try {
            const user = await getCurrentUser();

            if (access !== 'public') {
                if (!user) throw new ActionError('UNAUTHENTICATED');
                if (Array.isArray(access) && !access.includes(user.role)) {
                    throw new ActionError('FORBIDDEN');
                }
            }

            const parsed = schema.safeParse(rawInput);
            if (!parsed.success) {
                return {
                    ok: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
                    },
                };
            }

            // En acciones 'public' el usuario puede ser null; las sobrecargas de arriba ya lo tipan bien.
            const data = await handler(parsed.data, user as CurrentUser);
            return { ok: true, data };
        } catch (error) {
            if (error instanceof ActionError) {
                return { ok: false, error: { code: error.code } };
            }
            // Las redirecciones de Next.js (redirect, notFound...) se lanzan como "errores":
            // hay que dejarlas pasar, si no signIn y redirect() dejan de funcionar.
            unstable_rethrow(error);

            console.error('[createAction] Error inesperado:', error);
            return { ok: false, error: { code: 'INTERNAL_ERROR' } };
        }
    };
}