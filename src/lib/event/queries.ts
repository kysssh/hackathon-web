import "server-only";

export type EventStateDto = {
  finalistsPublishedAt: string | null;
  resultsPublishedAt: string | null;
};

export async function getEventState(): Promise<EventStateDto> {
  return { finalistsPublishedAt: null, resultsPublishedAt: null };
}
