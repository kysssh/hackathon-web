/** Nombres legibles de los campos que devuelve `missingFields` (computeMissingFields, BK). */
export const MISSING_FIELD_LABELS: Record<string, string> = {
  title: 'Título',
  summary: 'Resumen',
  description: 'Descripción',
  pitchDeck: 'Pitch deck',
};

export function describeMissingFields(fields: string[]): string {
  return fields.map((f) => MISSING_FIELD_LABELS[f] ?? f).join(', ');
}
