import { defineConfig } from 'astro/config';

// Dev server only: directory URLs (e.g. /logo/) have no file behind them, so
// serve the index page and let the client-side file browser render the listing.
const directoryBrowsing = {
  name: 'directory-browsing',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const url = new URL(req.url ?? '/', 'http://localhost');
      const isAppPath = /^\/(@|_astro|node_modules|src)/.test(url.pathname);
      const hasExtension = /\.[^/]+$/.test(url.pathname);
      if (req.method === 'GET' && !isAppPath && !hasExtension) {
        req.url = '/';
      }
      next();
    });
  },
};

export default defineConfig({
  site: 'https://media.esphome.io',
  // The assets directory is served from the root of the site.
  publicDir: './assets',
  vite: {
    plugins: [directoryBrowsing],
  },
});
