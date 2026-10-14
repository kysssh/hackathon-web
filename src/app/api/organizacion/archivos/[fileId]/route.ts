import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth/session';
import { createSignedDownloadUrl } from '@/lib/organizer/downloads';
import { getFileForDownload } from '@/lib/organizer/queries';

export const dynamic = 'force-dynamic';

/** Descarga de un archivo de proyecto: solo organizadores, vía URL firmada de 60 s. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse('Necesitas iniciar sesión.', { status: 401 });
  if (user.role !== 'ORGANIZER') {
    return new NextResponse('No tienes permiso para descargar archivos.', { status: 403 });
  }

  const { fileId } = await params;

  try {
    const file = await getFileForDownload(fileId);
    if (!file) return new NextResponse('Archivo no encontrado.', { status: 404 });

    const signedUrl = await createSignedDownloadUrl(
      file.bucket,
      file.storagePath,
      file.originalName
    );

    const response = NextResponse.redirect(signedUrl, 302);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('[descarga de archivo] No se pudo generar la URL firmada:', error);
    return new NextResponse('No se pudo generar la descarga. Inténtalo de nuevo.', {
      status: 502,
    });
  }
}
