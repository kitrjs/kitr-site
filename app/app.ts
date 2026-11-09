import { config } from 'virtual:kitr/config'
import { providers } from 'virtual:kitr/providers'
import { createApp, loadRc } from '@kitr/kitr/app'
import { env } from './env'

/** One app object: providers from kitrrc.ts, config from config/*.ts, both as static imports. */
export const app = createApp({ ...loadRc({ providers }, config), env })
