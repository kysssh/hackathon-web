import type { MetadataRoute } from 'next';

import { listGalleryProjects } from '@/lib/project/queries';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? '';
  if (!siteUrl) {
    // Si no hay URL configurada, devolvemos sitemap mínimo sin crashear el sitio.
    return [];
  }
  const now = new Date();

  const publicRoutes = [
    '',
    '/informacion',
    '/cronograma',
    '/mentores-y-jurado',
    '/criterios',
    '/faq',
    '/galeria',
  ];

  const routes: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' || route === '/galeria' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route === '/galeria' ? 0.9 : 0.7,
  }));

  const projects = await listGalleryProjects({ filter: 'ALL' });
  for (const project of projects) {
    routes.push({
      url: `${siteUrl}/galeria/${encodeURIComponent(project.slug)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  return routes;
}
