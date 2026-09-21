/**
 * Criterios de evaluación y sus pesos.
 * Dueño: BK. La página /criterios (UX) y el formulario del jurado (FE) leen de aquí.
 *
 * Los nombres de `field` son los del contrato (sección 3.4 del plan):
 * innovationScore, technologyScore, impactScore, presentationScore.
 */

export const criteria = [
  {
    key: 'innovation',
    field: 'innovationScore',
    label: 'Innovación',
    description: 'Qué tan nueva u original es la idea frente a lo que ya existe.',
    weight: 25,
  },
  {
    key: 'technology',
    field: 'technologyScore',
    label: 'Tecnología',
    description: 'Calidad técnica de la solución: cómo está construida y si funciona.',
    weight: 30,
  },
  {
    key: 'impact',
    field: 'impactScore',
    label: 'Impacto',
    description: 'Qué problema real resuelve y a cuántas personas puede ayudar.',
    weight: 25,
  },
  {
    key: 'presentation',
    field: 'presentationScore',
    label: 'Presentación',
    description: 'Claridad al explicar el proyecto: pitch, demo y video.',
    weight: 20,
  },
] as const;

export type CriterionField = (typeof criteria)[number]['field'];

/** PROVISIONAL: confirmar con la organización la escala de notas. */
export const scoreRange = { min: 1, max: 10 } as const;

/** Los pesos deben sumar 100. Si alguien los cambia mal, el proyecto avisa al arrancar. */
export const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

if (totalWeight !== 100) {
  throw new Error(`Los pesos de src/config/criteria.ts deben sumar 100 (ahora suman ${totalWeight}).`);
}