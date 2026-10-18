import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div
      data-testid="private-loading"
      role="status"
      className="max-w-2xl space-y-4"
    >
      <span className="sr-only">Cargando…</span>
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-2/3" />
    </div>
  );
}

