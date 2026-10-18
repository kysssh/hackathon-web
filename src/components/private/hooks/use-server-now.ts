'use client';

import { useEffect, useState } from 'react';

/**
 * Hora oficial del servidor (en milisegundos), estimada en el navegador.
 *
 * Los plazos (entrega y calificación) se deciden con la hora del servidor, no con la del
 * computador de la persona. Por eso medimos una sola vez la diferencia entre ambos relojes
 * y la aplicamos a cada tic: un reloj mal puesto no abre ni cierra el plazo antes de tiempo.
 * Esto es solo para MOSTRAR y bloquear la pantalla; el servidor siempre vuelve a validar.
 *
 * Devuelve null hasta que el componente se monta, así el HTML del servidor y el del
 * navegador coinciden y no hay errores de hidratación.
 */
export function useServerNow(
  serverNow: string,
  intervalMs = 1000
): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const skew = Date.parse(serverNow) - Date.now();
    const tick = () => setNow(Date.now() + skew);
    tick();
    const timer = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(timer);
  }, [serverNow, intervalMs]);

  return now;
}
