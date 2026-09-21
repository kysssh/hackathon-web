// Rutas que Auth.js necesita (login, callback de Google/GitHub, logout).
// Dueño: BK. No se toca.
import { handlers } from '@/lib/auth/config';

export const { GET, POST } = handlers;