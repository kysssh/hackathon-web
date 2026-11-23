import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? '';
  if (!siteUrl) {
    // Si no hay URL configurada, devolvemos robots.txt mínimo sin crashear el sitio.
    return { rules: [{ userAgent: '*', allow: '/' }] };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/panel',
          '/panel/*',
          '/jurado',
          '/jurado/*',
          '/organizacion',
          '/organizacion/*',
          '/dev',
          '/dev/*',
          '/api',
          '/api/*',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
