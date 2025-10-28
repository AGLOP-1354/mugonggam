import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://mugonggam.vercel.app/';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/chat/[sessionId]'], // API와 개인 채팅 세션은 크롤링 제외
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/chat/[sessionId]'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
