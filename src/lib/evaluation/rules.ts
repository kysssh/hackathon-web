import { criteria, type CriterionField } from '@/config/criteria';

export function computeWeightedScore(
  scores: Record<CriterionField, number>
): number {
  return (
    Math.round(
      criteria.reduce(
        (sum, criterion) => sum + scores[criterion.field] * criterion.weight,
        0
      )
    ) / 100
  );
}
