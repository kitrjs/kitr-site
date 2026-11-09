import changelogJson from '#app/generated/changelog.json'
import releaseJson from '#app/generated/release.json'

/** The `@kitr/kitr` release the site documents, from the kitrjs/kitr checkout it was built from. */
export const release = releaseJson as { name: string; version: string }

/** A package a release published; `to` is its page here, when it has one. */
export interface ReleasePackage {
  name: string
  to?: string
}

/** One change (one changeset), listed once with every package it touched. */
export interface ReleaseEntry {
  hash: string
  kind: 'major' | 'minor' | 'patch'
  html: string
  packages: ReleasePackage[]
}

/** One version, newest first. `id` is its anchor on /changelog: `v0-6-0`. */
export interface Release {
  version: string
  id: string
  published: ReleasePackage[]
  entries: ReleaseEntry[]
}

/**
 * Every release of the @kitr/* packages, from each package's Changesets CHANGELOG.md
 * (scripts/site-data.mjs). Dependency updates are left out.
 */
export const changelog = changelogJson as Release[]
