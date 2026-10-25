'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAction } from '@/components/private/hooks/use-action';
import { LiveRefresh } from '@/components/private/live-refresh';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { eventConfig } from '@/config/event';
import type { TeamDto } from '@/lib/queries/dtos';
import { createTeamAction, joinTeamAction } from '@/lib/team/actions';

const { minMembers, maxMembers } = eventConfig.team;

// Límites copiados de createTeamSchema (src/lib/team/actions.ts), mismo caso que draft-form:
// el schema vive en un archivo 'use server' y no se puede importar desde el cliente.
const NAME_MIN = 3;
const NAME_MAX = 40;

/**
 * Sin equipo todavía: dos formularios, crear o unirse.
 * Al tener éxito, refrescamos la ruta para que el Server Component (page.tsx)
 * vuelva a llamar a getMyTeam() y muestre la tarjeta real.
 */
export function NoTeamForms() {
  const router = useRouter();
  const { showToast } = useToast();

  const create = useAction(createTeamAction);
  const join = useAction(joinTeamAction);

  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [nameError, setNameError] = useState<string>();
  const [codeError, setCodeError] = useState<string>();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const clean = name.trim().replace(/\s+/g, ' ');
    // Aviso local, sin viaje al servidor; el servidor igual vuelve a validar.
    if (clean.length < NAME_MIN) {
      setNameError(`El nombre debe tener al menos ${NAME_MIN} caracteres.`);
      return;
    }
    setNameError(undefined);
    create.run({ name: clean }, () => {
      showToast('Equipo creado.', 'success');
      router.refresh();
    });
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    // El backend acepta minúsculas y espacios, pero limpiamos antes de enviar
    // para que la persona vea de inmediato el código tal como quedará.
    const code = joinCode.trim().toUpperCase();
    if (code === '') {
      setCodeError('Ingresa el código de tu equipo.');
      return;
    }
    setCodeError(undefined);
    join.run({ joinCode: code }, () => {
      showToast('Te uniste al equipo.', 'success');
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <form
        onSubmit={handleCreate}
        noValidate
        aria-busy={create.pending}
        className="info-panel space-y-4 p-6"
        data-testid="team-create-form"
      >
        <h2 className="font-medium">Crear un equipo</h2>

        <Input
          id="team-name"
          label="Nombre del equipo"
          data-testid="team-create-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={NAME_MAX}
          error={nameError ?? create.fieldErrors.name?.[0]}
        />

        <Button
          type="submit"
          data-testid="team-create-submit"
          loading={create.pending}
          className="w-full"
        >
          {create.pending ? 'Creando…' : 'Crear equipo'}
        </Button>

        {create.error && (
          <p
            role="alert"
            data-testid="team-create-error"
            className="text-sm text-red-300"
          >
            {create.error}
          </p>
        )}
      </form>

      <form
        onSubmit={handleJoin}
        noValidate
        aria-busy={join.pending}
        className="info-panel space-y-4 p-6"
        data-testid="team-join-form"
      >
        <h2 className="font-medium">Unirme con un código</h2>

        <Input
          id="join-code"
          label="Código de invitación"
          data-testid="team-join-code"
          placeholder="HACK-0000"
          autoCapitalize="characters"
          autoComplete="off"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          maxLength={20}
          error={codeError ?? join.fieldErrors.joinCode?.[0]}
        />

        <Button
          type="submit"
          data-testid="team-join-submit"
          loading={join.pending}
          className="w-full"
        >
          {join.pending ? 'Uniéndote…' : 'Unirme al equipo'}
        </Button>

        {join.error && (
          <p
            role="alert"
            data-testid="team-join-error"
            className="text-sm text-red-300"
          >
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
      {/* Si otra cuenta se une al equipo, la tarjeta se actualiza sola mientras falten plazas. */}
      <LiveRefresh enabled={!team.isFull} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-medium">{team.name}</h2>
        {team.isFull ? (
          <Badge tone="success">Equipo completo</Badge>
        ) : team.hasMinimumMembers ? (
          <Badge tone="brand">Mínimo alcanzado</Badge>
        ) : (
          <Badge tone="warning">Falta gente para el mínimo</Badge>
        )}
      </div>

      <p
        data-testid="team-member-count"
        className="mt-1 text-sm text-slate-400"
      >
        {team.memberCount} de {maxMembers} integrantes (mínimo {minMembers})
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-400">Código:</span>
        <code
          data-testid="team-join-code-display"
          className="rounded bg-white/10 px-2 py-1"
        >
          {team.joinCode}
        </code>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          data-testid="team-copy-code"
          onClick={handleCopy}
          disabled={team.isFull}
        >
          {copied ? 'Copiado' : 'Copiar'}
        </Button>
        <span role="status" className="sr-only">
          {copied ? 'Código copiado' : ''}
        </span>
      </div>

      <ul className="mt-4 divide-y divide-white/10" data-testid="team-members">
        {team.members.map((m) => (
          <li key={m.userId} className="flex items-center gap-3 py-2">
            <span>{m.name ?? 'Sin nombre'}</span>
            {m.isLeader && <Badge tone="neutral">Líder</Badge>}
          </li>
        ))}
      </ul>
    </div>
  );
}

