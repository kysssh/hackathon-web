import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXTAUTH_URL ?? 'https://hackathon.local';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/panel',
        '/panel/*',
        '/jurado',
        '/jurado/*',
        '/organizacion',
        '/organizacion/*',
        '/api/*',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
