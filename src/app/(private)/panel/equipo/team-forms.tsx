'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAction } from '@/components/private/hooks/use-action';
import type { TeamDto } from '@/lib/queries/dtos';
import { createTeamAction, joinTeamAction } from '@/lib/team/actions';

/**
 * Sin equipo todavía: dos formularios, crear o unirse.
 * Al tener éxito, refrescamos la ruta para que el Server Component (page.tsx)
 * vuelva a llamar a getMyTeam() y muestre la tarjeta real.
 * Esto ya queda listo para cuando getMyTeam deje de ser un stub.
 */
export function NoTeamForms() {
  const router = useRouter();

  const create = useAction(createTeamAction);
  const join = useAction(joinTeamAction);

  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    create.run({ name }, () => router.refresh());
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    // El backend acepta minúsculas y espacios, pero limpiamos antes de enviar
    // para que el usuario vea de inmediato el código tal como quedará.
    join.run({ joinCode: joinCode.trim().toUpperCase() }, () => router.refresh());
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <form onSubmit={handleCreate} className="info-panel p-6" data-testid="team-create-form">
        <h2 className="font-medium mb-3">Crear un equipo</h2>

        <label htmlFor="team-name" className="text-sm text-zinc-500">
          Nombre del equipo
        </label>
        <input
          id="team-name"
          data-testid="team-create-name"
          className="mt-1 w-full rounded border px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={3}
          maxLength={40}
          required
        />
        {create.fieldErrors.name && (
          <p className="mt-1 text-sm text-red-600">{create.fieldErrors.name[0]}</p>
        )}

        <button
          type="submit"
          data-testid="team-create-submit"
          disabled={create.pending}
          className="button-primary mt-4 w-full disabled:opacity-50"
        >
          {create.pending ? 'Creando…' : 'Crear equipo'}
        </button>

        {create.error && (
          <p role="alert" data-testid="team-create-error" className="mt-3 text-sm text-red-600">
            {create.error}
          </p>
        )}
      </form>

      <form onSubmit={handleJoin} className="info-panel p-6" data-testid="team-join-form">
        <h2 className="font-medium mb-3">Unirme con un código</h2>

        <label htmlFor="join-code" className="text-sm text-zinc-500">
          Código de invitación
        </label>
        <input
          id="join-code"
          data-testid="team-join-code"
          className="mt-1 w-full rounded border px-3 py-2 uppercase"
          placeholder="HACK-0000"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          maxLength={20}
          required
        />
        {join.fieldErrors.joinCode && (
          <p className="mt-1 text-sm text-red-600">{join.fieldErrors.joinCode[0]}</p>
        )}

        <button
          type="submit"
          data-testid="team-join-submit"
          disabled={join.pending}
          className="button-primary mt-4 w-full disabled:opacity-50"
        >
          {join.pending ? 'Uniéndote…' : 'Unirme al equipo'}
        </button>

        {join.error && (
          <p role="alert" data-testid="team-join-error" className="mt-3 text-sm text-red-600">
            {join.error}
          </p>
        )}
      </form>
    </div>
  );
}

/** Ya tienes equipo: la tarjeta con integrantes y el botón de copiar código. */
export function TeamCard({ team }: { team: TeamDto }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(team.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Si el navegador bloquea el portapapeles, no rompemos la pantalla;
      // el código sigue visible como texto para copiar a mano.
    }
  }

  return (
    <div className="info-panel p-6" data-testid="team-card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{team.name}</h2>
        {!team.hasMinimumMembers && (
          <span className="text-xs rounded bg-amber-100 text-amber-800 px-2 py-1">
            Falta gente para el mínimo
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="text-zinc-500">Código:</span>
        <code data-testid="team-join-code-display" className="rounded bg-zinc-100 px-2 py-1">
          {team.joinCode}
        </code>
        <button
          type="button"
          data-testid="team-copy-code"
          onClick={handleCopy}
          disabled={team.isFull}
          className="text-link text-sm disabled:opacity-50"
        >
          {copied ? 'Copiado' : 'Copiar'}
        </button>
        {team.isFull && <span className="text-xs text-zinc-500">Equipo completo</span>}
      </div>

      <ul className="mt-4 divide-y" data-testid="team-members">
        {team.members.map((m) => (
          <li key={m.userId} className="flex items-center gap-3 py-2">
            <span>{m.name ?? 'Sin nombre'}</span>
            {m.isLeader && (
              <span className="text-xs rounded bg-zinc-100 px-2 py-0.5">Líder</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

