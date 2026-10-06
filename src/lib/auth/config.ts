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
import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth, { type DefaultSession } from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

import { db } from '@/lib/db';

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

/**
 * Guarda usuarios y cuentas en las tablas `users` y `accounts` (esquema de BD).
 * El adaptador estándar de Auth.js no calza del todo con ese esquema, así que se ajustan dos cosas:
 *   - createUser: el esquema no tiene `emailVerified`, y el rol sale de las listas de correos.
 *   - linkAccount: Auth.js entrega los campos en snake_case (access_token) y el esquema los tiene en camelCase.
 */
function buildAdapter(): Adapter {
  const base = PrismaAdapter(db as unknown as Parameters<typeof PrismaAdapter>[0]);

  return {
    ...base,

    async createUser(data) {
      const user = await db.user.create({
        data: {
          name: data.name,
          email: data.email,
          image: data.image,
          role: resolveRoleForEmail(data.email),
        },
      });
      return { ...user, emailVerified: null };
    },

    async linkAccount(account) {
      await db.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refreshToken: account.refresh_token,
          accessToken: account.access_token,
          expiresAt: account.expires_at,
          tokenType: account.token_type,
          scope: account.scope,
          idToken: account.id_token,
          sessionState: typeof account.session_state === 'string' ? account.session_state : undefined,
        },
      });
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: buildAdapter(),
  providers: [Google, GitHub],
  // Con adaptador, Auth.js usaría sesiones en la base por defecto; aquí se sigue con la cookie firmada (JWT).
  session: { strategy: 'jwt' },

  // Descomentar cuando FE tenga lista la página /ingresar.
  // Mientras tanto, se puede probar con la página que trae Auth.js en /api/auth/signin.
  // pages: { signIn: '/ingresar' },

  events: {
    // Si cambian las listas ORGANIZER_EMAILS / JUDGE_EMAILS, el rol guardado se actualiza en el siguiente ingreso.
    async signIn({ user }) {
      if (!user.id || !user.email) return;
      const role = resolveRoleForEmail(user.email);
      await db.user.updateMany({ where: { id: user.id, NOT: { role } }, data: { role } });
    },
  },

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