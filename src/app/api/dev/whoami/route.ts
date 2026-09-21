// SOLO PARA DESARROLLO: muestra quién soy según la sesión, para probar el ingreso
// mientras FE termina /ingresar. En producción responde 404.
// Se borra (o se deja así) antes de la semana 4.
import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }

  const user = await getCurrentUser();
  return NextResponse.json({ user });
}