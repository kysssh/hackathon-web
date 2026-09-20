export const ERROR_CODES = [
    'UNAUTHENTICATED', 'FORBIDDEN', 'VALIDATION_ERROR', 'NOT_FOUND', 'INTERNAL_ERROR',
    'TEAM_REQUIRED', 'TEAM_NAME_TAKEN', 'TEAM_ALREADY_MEMBER', 'TEAM_JOIN_CODE_INVALID',
    'TEAM_FULL', 'TEAM_REGISTRATION_CLOSED', 'TEAM_TOO_SMALL', 'TEAM_LEADER_REQUIRED',
    'PROJECT_INCOMPLETE', 'PROJECT_NOT_SUBMITTED', 'SUBMISSION_NOT_OPEN', 'SUBMISSION_CLOSED',
    'FILE_TOO_LARGE', 'FILE_TYPE_NOT_ALLOWED', 'FILE_LIMIT_REACHED', 'FILE_NOT_UPLOADED',
    'EVALUATION_CLOSED',
] as const;

export type ErrorCode = typeof ERROR_CODES[number];

/**
 * Error "esperado" que una acción lanza cuando una regla no se cumple.
 * Ejemplo:  throw new ActionError('TEAM_NAME_TAKEN');
 * createAction lo convierte en { ok: false, error: { code: 'TEAM_NAME_TAKEN' } }.
 */
export class ActionError extends Error {
    readonly code: ErrorCode;

    constructor(code: ErrorCode) {
        super(code);
        this.name = 'ActionError';
        this.code = code;
    }
}