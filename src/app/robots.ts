import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/cron/', '/api/wishlist'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/cron/'],
      },
    ],
    sitemap: 'https://bumper-deals-app.vercel.app/sitemap.xml',
    host: 'https://bumper-deals-app.vercel.app',
  };
}
