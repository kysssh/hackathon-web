import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXTAUTH_URL;
  if (!siteUrl) {
    throw new Error('NEXTAUTH_URL es obligatoria para generar robots.txt.');
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
