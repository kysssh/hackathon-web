/**
 * ¿El error de Prisma es "ya existe" (P2002, restricción única)?
 * Se comprueba el código a mano para no depender de dónde genere Prisma su cliente.
 */
export function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}
