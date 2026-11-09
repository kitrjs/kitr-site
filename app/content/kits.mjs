// What kitr.dev adds to the kits on top of each kit package's `kitr.kit` block, which has the
// prose (who it is for, highlights, the commands). scripts/site-data.mjs merges the two.
//
// `order` is the order of the gallery: the base kits, then the presets. A kit that is not listed
// comes after them, by name.
// `blank` is built into the CLI and has no package to carry a block, so its block is here, in the
// same shape (docs/package-contract.md, "What a kit says about itself").

export const order = [
  'app',
  'dashboard',
  'fullstack',
  'server',
  'blank',
  'saas',
  'site',
  'realtime',
  'docs',
  'desktop',
  'tauri',
  'mobile',
]

export const blank = {
  name: 'blank',
  title: 'Blank kit',
  summary: 'The config files and nothing else: no platform, no React, no server.',
  kit: {
    audience:
      'Anyone who wants to choose every platform and package themselves, one kitr add at a time.',
    highlights: [
      {
        title: 'Only the wiring',
        text: '`package.json`, `tsconfig.json`, an empty `kitrrc.ts` and the ignore files.',
      },
      {
        title: 'Rules for your agent',
        text: '`AGENTS.md` starts with the conventions, and every `kitr add` appends its own.',
      },
      {
        title: 'Grows with kitr add',
        text: '`kitr add web site` brings a UI, `kitr add server api` a backend, each with its files and scripts.',
      },
    ],
    example: 'examples/blank',
    entry: 'kitrrc.ts',
    run: [
      ['kitr add web site', 'A web platform with React, the router and a dev server'],
      ['kitr add server api', 'An API server, with no React'],
      ['kitr doctor', 'Checks the wiring after each change'],
    ],
  },
}
