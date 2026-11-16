import type { MetadataRoute } from 'next';

import { listGalleryProjects } from '@/lib/project/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXTAUTH_URL ?? 'https://hackathon.local';
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
    priority: route === '' ? 1.0 : route === '/galeria' ? 0.9 : 0.7,
  }));

  if (process.env.DATABASE_URL?.trim()) {
    try {
      const projects = await listGalleryProjects({ filter: 'ALL' });
      for (const project of projects) {
        routes.push({
          url: `${siteUrl}/galeria/${encodeURIComponent(project.slug)}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    } catch {
      // Si la base no responde o está en build sin conexión, devuelve las rutas base
    }
  }

  return routes;
}
