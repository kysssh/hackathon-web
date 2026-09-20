/**
 * Configuración de Auth.js (v5)
 *
 * Las variables AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_GITHUB_ID y
 * AUTH_GITHUB_SECRET las detecta Auth.js solo desde el .env: no hay que pasarlas a mano.
 *
 * Sesión tipo JWT: el esquema del plan tiene `users` y `accounts`, pero no `sessions`,
 * así que la sesión viaja en una cookie firmada con AUTH_SECRET.
 *
 * NOTA: las pantallas y componentes NO importan este archivo directamente.
 * Usan `getCurrentUser`, `requireUser` y `requireRole` de `session.ts`.
 */
import NextAuth, { type DefaultSession } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

import { resolveRoleForEmail, type UserRole } from './roles';

// Le decimos a TypeScript que la sesión trae nuestro id y rol.
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google, GitHub],
  session: { strategy: 'jwt' },

  // Descomentar cuando FE tenga lista la página /ingresar.
  // Mientras tanto, se puede probar con la página que trae Auth.js en /api/auth/signin.
  // pages: { signIn: '/ingresar' },

  callbacks: {
    // Se ejecuta al iniciar sesión y cada vez que se lee la sesión.
    async jwt({ token }) {
      token.role = resolveRoleForEmail(token.email);
      return token;
    },

    // Lo que devuelve `auth()`: copiamos id y rol del token a la sesión.
    async session({ session, token }) {
      session.user.id = token.sub ?? '';
      session.user.role = (token.role as UserRole | undefined) ?? 'PARTICIPANT';
      return session;
    },
  },
});