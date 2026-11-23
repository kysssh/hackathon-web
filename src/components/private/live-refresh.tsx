'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Vuelve a pedir al servidor los datos de la página cada cierto tiempo, para que cambios
 * hechos desde OTRA cuenta (por ejemplo, alguien se une al equipo) se vean sin recargar a mano.
 *
 * - No hace nada si la pestaña está oculta; refresca apenas la persona vuelve a ella.
 * - Apágalo con `enabled={false}` cuando ya no haya nada que esperar (equipo completo).
 * - No lo uses en pantallas con formularios largos: router.refresh conserva lo escrito,
 *   pero cada refresco es una consulta al servidor.
 */
export function LiveRefresh({
  enabled = true,
  intervalMs = 10_000,
}: {
  enabled?: boolean;
  intervalMs?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };
    const timer = window.setInterval(refreshIfVisible, intervalMs);
    document.addEventListener('visibilitychange', refreshIfVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [enabled, intervalMs, router]);

  return null;
}
