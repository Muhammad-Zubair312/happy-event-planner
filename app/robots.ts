import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://happyeventplanner.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/cart',
          '/checkout',
          '/orders',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
