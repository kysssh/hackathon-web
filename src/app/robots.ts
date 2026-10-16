import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hackathon.example.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/panel', '/panel/', '/jurado', '/jurado/', '/organizacion', '/organizacion/', '/dev/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
