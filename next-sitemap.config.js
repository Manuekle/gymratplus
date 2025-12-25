/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: "https://gymratplus.com",
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: [
    '/dashboard',
    '/dashboard/**',
    '/auth/error',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/onboarding',
    '/error',
    '/api/**',
    '/profile/**',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/auth', '/onboarding', '/api', '/profile'],
      },
    ],
  },
  transform: async (config, path) => {
    // Páginas públicas con alta prioridad
    const highPriority = ['/', '/privacy', '/terms'];

    if (highPriority.includes(path)) {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      };
    }

    // Resto de páginas con prioridad normal
    return {
      loc: path,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};

module.exports = config;
