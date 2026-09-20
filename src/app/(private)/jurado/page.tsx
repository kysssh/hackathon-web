import { requireRole } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function JuradoPage() {
  await requireRole(['JUDGE']);

  return (
    <div>
      <h1 className="text-xl font-semibold">Proyectos para calificar</h1>
      {/* TODO S3: listProjectsForJudge() cuando BD publique el stub */}
    </div>
  );
}

