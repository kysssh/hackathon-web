/** Puntaje con dos decimales y coma, como en el plan: 4,20 · 4,17 · 3,05. */
export function formatScore(value: number): string {
  return value.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
  
