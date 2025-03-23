import type { IConfig } from "next-sitemap";

const config: IConfig = {
  siteUrl: "https://gymratplus.vercel.app", // Cambia esto por tu dominio real
  generateRobotsTxt: true, // Genera robots.txt automáticamente
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  },
};

export default config;
