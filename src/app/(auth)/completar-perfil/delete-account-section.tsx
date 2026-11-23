'use client';

import { useState } from 'react';

import { useAction } from '@/components/private/hooks/use-action';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { deleteMyAccountAction } from '@/lib/auth/actions';

export function DeleteAccountSection({
  isTeamLeader,
  isJudge,
}: {
  isTeamLeader: boolean;
  isJudge: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { run, pending, error } = useAction(deleteMyAccountAction);

  function closeIfIdle() {
    if (!pending) setOpen(false);
  }

  return (
    <section
      aria-labelledby="delete-account-heading"
      className="mt-10 rounded-xl border border-red-400/40 bg-red-500/5 p-5"
      data-testid="delete-account-section"
    >
      <h2
        id="delete-account-heading"
        className="text-lg font-semibold text-red-100"
      >
        Zona de peligro
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Puedes eliminar tu cuenta de la plataforma desde aquí. Esta acción es
        permanente y requiere una confirmación adicional.
      </p>
      <Button
        type="button"
        variant="secondary"
        data-testid="delete-account-open"
        className="mt-4 border border-red-400/50 text-red-100 hover:bg-red-500/15"
        onClick={() => setOpen(true)}
      >
        Eliminar mi cuenta
      </Button>

      <Dialog
        open={open}
        onClose={closeIfIdle}
        title="¿Estás seguro de eliminar tu cuenta?"
        description="Esta acción es permanente y no se puede deshacer."
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              data-testid="delete-account-cancel"
              disabled={pending}
              onClick={closeIfIdle}
            >
              No, no quiero eliminar mi cuenta
            </Button>
            <Button
              type="button"
              variant="secondary"
              data-testid="delete-account-confirm"
              loading={pending}
              className="border border-red-400/50 text-red-100 hover:bg-red-500/15"
              onClick={() => run({})}
            >
              {pending ? 'Eliminando…' : 'Sí, quiero eliminar mi cuenta'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p>
            Se eliminará únicamente la cuenta con la que has iniciado sesión
            actualmente; no se afectarán otras cuentas que hayas usado antes.
          </p>
          <p>
            Se eliminarán permanentemente tu cuenta y los datos asociados a
            ella, incluidas las vinculaciones con Google o GitHub.
          </p>
          {isTeamLeader && (
            <p className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-red-100">
              Como líder, también se eliminarán tu equipo, su proyecto y sus
              archivos y evaluaciones. Las cuentas de los demás integrantes
              no se borrarán, pero dejarán de pertenecer a ese equipo.
            </p>
          )}
          {isJudge && (
            <p className="rounded-lg border border-amber-300/30 bg-amber-500/10 p-3 text-amber-100">
              También se eliminarán las evaluaciones asociadas a tu cuenta.
            </p>
          )}
          {error && (
            <p
              role="alert"
              data-testid="delete-account-error"
              className="text-sm text-red-300"
            >
              {error}
            </p>
          )}
        </div>
      </Dialog>
    </section>
  );
}
