// What kitr.dev adds to each platform on top of `kitr catalog --json`, which has the prose
// (tagline, highlights, snippet, run commands, resources). scripts/site-data.mjs merges the two.
//
// `order` is the order of the platform tiles.
// `exclude` drops packages that run on the client or the server in general but make no sense
// on that platform (server actions and SEO need a web platform that renders HTML).
// `native` are packages whose drivers switch to the platform's own APIs there.
// `kits` are the kits that start with the platform.

export const order = ['web', 'server', 'desktop', 'tauri', 'mobile']

export const choices = {
  web: {
    exclude: [],
    native: ['seo'],
    nativeLabel: 'Built for the web',
    kits: ['app', 'fullstack', 'site', 'saas', 'realtime'],
  },
  server: {
    exclude: ['actions', 'seo', 'platform', 'secure-storage', 'vite'],
    native: ['api', 'db', 'cache', 'jobs', 'mail', 'shield', 'uploads'],
    nativeLabel: 'Built for the server',
    kits: ['server', 'fullstack', 'saas'],
  },
  desktop: {
    exclude: ['actions', 'seo'],
    native: ['storage', 'platform'],
    nativeLabel: 'Switch to native here',
    kits: ['desktop'],
  },
  tauri: {
    exclude: ['actions', 'seo'],
    native: ['storage', 'platform'],
    nativeLabel: 'Switch to native here',
    kits: ['tauri'],
  },
  mobile: {
    exclude: ['actions', 'seo'],
    native: ['storage', 'platform'],
    nativeLabel: 'Switch to native here',
    kits: ['mobile'],
  },
}

/** The mix-and-match builder on the home page and /platforms: one line per named platform. */
export const builder = {
  // Each choice: the kitrrc.ts name, the type, the platforms line and the command that adds it.
  choices: [
    {
      id: 'site',
      type: 'web',
      line: "site: web({ mode: 'ssr' }),",
      cmd: 'kitr add web site --mode ssr',
      dev: 'http://localhost:3000',
      on: true,
    },
    {
      id: 'admin',
      type: 'web',
      line: "admin: web({ mode: 'spa', port: 3002 }),",
      cmd: 'kitr add web admin --mode spa --port 3002',
      dev: 'http://localhost:3002',
    },
    {
      id: 'api',
      type: 'server',
      line: "api: server({ runtime: 'node' }),",
      cmd: 'kitr add server api',
      dev: 'http://localhost:3001',
      on: true,
    },
    {
      id: 'desktop',
      type: 'desktop',
      line: "app: desktop({ title: 'Acme' }),",
      cmd: 'kitr add desktop app',
      dev: 'Electron window',
      on: true,
      group: 'shell',
    },
    {
      id: 'tauri',
      type: 'tauri',
      line: "app: tauri({ title: 'Acme' }),",
      cmd: 'kitr add tauri app',
      dev: 'Tauri window',
      group: 'shell',
    },
    {
      id: 'phone',
      type: 'mobile',
      line: "phone: mobile({ appId: 'com.acme.app' }),",
      cmd: 'kitr add mobile phone',
      dev: 'live reload on your phone',
      on: true,
    },
  ],
}
