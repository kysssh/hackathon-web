import { z } from 'zod';
import type { ErrorCode } from './errors';

type ActionResult<T> =
    | { ok: true; data: T }
    | { ok: false; error: { code: ErrorCode; fieldErrors?: Record<string, string[]> } };

export function createAction<Input, Output>(
    schema: z.ZodType<Input>,
    handler: (input: Input) => Promise<Output>
) {
    return async (rawInput: unknown): Promise<ActionResult<Output>> => {
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
        try {
            const data = await handler(parsed.data);
            return { ok: true, data };
        } catch {
            return { ok: false, error: { code: 'INTERNAL_ERROR' } };
        }
    };
}