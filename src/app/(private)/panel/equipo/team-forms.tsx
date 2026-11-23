'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAction } from '@/components/private/hooks/use-action';
import { LiveRefresh } from '@/components/private/live-refresh';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { eventConfig } from '@/config/event';
import type { TeamDto } from '@/lib/queries/dtos';
import {
  createTeamAction,
  deleteMyTeamAction,
  joinTeamAction,
  leaveMyTeamAction,
  renameMyTeamAction,
} from '@/lib/team/actions';

const { minMembers, maxMembers } = eventConfig.team;

// Límites copiados de createTeamSchema (src/lib/team/actions.ts), mismo caso que draft-form:
// el schema vive en un archivo 'use server' y no se puede importar desde el cliente.
const NAME_MIN = 3;
const NAME_MAX = 40;

/**
 * Sin equipo todavía: dos formularios, crear o unirse.
 * Al tener éxito, continuamos a las secciones del proyecto.
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
      router.push('/panel/proyecto');
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
      router.push('/panel/proyecto');
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
        <p className="text-sm text-slate-400">
          El código de invitación te lo debe compartir el líder del equipo.
        </p>

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
  const router = useRouter();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState(team.name);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const rename = useAction(renameMyTeamAction);
  const leave = useAction(leaveMyTeamAction);
  const remove = useAction(deleteMyTeamAction);

  function handleRename(e: React.FormEvent) {
    e.preventDefault();
    const clean = name.trim().replace(/\s+/g, ' ');
    rename.run({ name: clean }, () => {
      showToast('Nombre del equipo actualizado.', 'success');
      router.refresh();
    });
  }

  function closeLeaveIfIdle() {
    if (!leave.pending) setLeaveOpen(false);
  }

  function closeDeleteIfIdle() {
    if (!remove.pending) setDeleteOpen(false);
  }

  async function handleCopy() {
    if (!team.joinCode) return;
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

      {team.isLeader && (
        <form
          onSubmit={handleRename}
          noValidate
          aria-busy={rename.pending}
          className="mt-4 flex flex-wrap items-end gap-3"
          data-testid="team-rename-form"
        >
          <div className="min-w-[220px] flex-1">
            <Input
              id="team-rename"
              label="Editar nombre del equipo"
              data-testid="team-rename-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={NAME_MAX}
              error={rename.fieldErrors.name?.[0]}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            data-testid="team-rename-submit"
            loading={rename.pending}
          >
            Guardar nombre
          </Button>
          {rename.error && (
            <p
              role="alert"
              data-testid="team-rename-error"
              className="w-full text-sm text-red-300"
            >
              {rename.error}
            </p>
          )}
        </form>
      )}

      <p
        data-testid="team-member-count"
        className="mt-1 text-sm text-slate-400"
      >
        {team.memberCount} de {maxMembers} integrantes (mínimo {minMembers})
      </p>

      {team.joinCode ? (
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
          >
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
          <span role="status" className="sr-only">
            {copied ? 'Código copiado' : ''}
          </span>
        </div>
      ) : (
        <p
          data-testid="team-join-code-private"
          className="mt-3 text-sm text-slate-400"
        >
          Solo el líder puede consultar el código de invitación. Pídeselo si
          quieres invitar a alguien más.
        </p>
      )}

      <h3 className="mt-6 text-sm font-semibold text-slate-300">Integrantes</h3>
      <ul className="mt-2 divide-y divide-white/10" data-testid="team-members">
        {team.members.map((m) => (
          <li
            key={m.userId}
            data-testid={`team-member-${m.userId}`}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium" data-testid="team-member-name">
                {m.fullName}
              </p>
              <p className="text-sm text-slate-400" data-testid="team-member-university">
                {m.university ?? 'Universidad no indicada'}
              </p>
            </div>
            {m.isLeader && <Badge tone="neutral">Líder</Badge>}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">
        {team.isLeader ? (
          <Button
            type="button"
            variant="secondary"
            data-testid="team-delete-open"
            className="border border-red-400/50 text-red-100 hover:bg-red-500/15"
            onClick={() => setDeleteOpen(true)}
          >
            Eliminar equipo
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            data-testid="team-leave-open"
            className="border border-amber-300/40 text-amber-100 hover:bg-amber-500/10"
            onClick={() => setLeaveOpen(true)}
          >
            Salirme del equipo
          </Button>
        )}
      </div>

      <Dialog
        open={leaveOpen}
        onClose={closeLeaveIfIdle}
        title="¿Quieres salir del equipo?"
        description="Tu cuenta no se eliminará."
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              data-testid="team-leave-cancel"
              disabled={leave.pending}
              onClick={closeLeaveIfIdle}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="secondary"
              data-testid="team-leave-confirm"
              loading={leave.pending}
              className="border border-amber-300/40 text-amber-100 hover:bg-amber-500/10"
              onClick={() =>
                leave.run({}, () => {
                  setLeaveOpen(false);
                  showToast('Saliste del equipo.', 'success');
                  router.refresh();
                })
              }
            >
              Sí, salir del equipo
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p>
            Solo se quitará tu membresía. El equipo y su proyecto seguirán
            existiendo.
          </p>
          <p>
            Si el equipo queda por debajo del mínimo de integrantes, no podrá
            entregar el proyecto hasta completar el mínimo.
          </p>
          {leave.error && (
            <p
              role="alert"
              data-testid="team-leave-error"
              className="text-sm text-red-300"
            >
              {leave.error}
            </p>
          )}
        </div>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={closeDeleteIfIdle}
        title="¿Eliminar el equipo?"
        description="Esta acción es permanente y no se puede deshacer."
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              data-testid="team-delete-cancel"
              disabled={remove.pending}
              onClick={closeDeleteIfIdle}
            >
              No, conservar el equipo
            </Button>
            <Button
              type="button"
              variant="secondary"
              data-testid="team-delete-confirm"
              loading={remove.pending}
              className="border border-red-400/50 text-red-100 hover:bg-red-500/15"
              onClick={() =>
                remove.run({}, () => {
                  setDeleteOpen(false);
                  showToast('Se eliminó el equipo.', 'success');
                  router.refresh();
                })
              }
            >
              Sí, eliminar equipo
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p>
            Se eliminarán el equipo, su proyecto, los archivos y las
            evaluaciones asociadas.
          </p>
          <p>
            Las cuentas de los demás integrantes permanecerán, pero quedarán
            sin equipo.
          </p>
          {remove.error && (
            <p
              role="alert"
              data-testid="team-delete-error"
              className="text-sm text-red-300"
            >
              {remove.error}
            </p>
          )}
        </div>
      </Dialog>
    </div>
  );
}

