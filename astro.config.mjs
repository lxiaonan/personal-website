import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.DEPLOY_SITE_URL || 'https://yunan.aiutil.cloud',
  base: process.env.DEPLOY_BASE_PATH || '/',
  devToolbar: {
    enabled: false
  },
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark'
    }
  }
});
