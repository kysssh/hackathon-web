import 'server-only';

import { db } from '@/lib/db';

export type EventStateDto = {
  finalistsPublishedAt: string | null;
  resultsPublishedAt: string | null;
};

export async function getEventState(): Promise<EventStateDto> {
  const eventState = await db.eventState.findUnique({ where: { id: 1 } });

  return {
    finalistsPublishedAt:
      eventState?.finalistsPublishedAt?.toISOString() ?? null,
    resultsPublishedAt: eventState?.resultsPublishedAt?.toISOString() ?? null,
  };
}
