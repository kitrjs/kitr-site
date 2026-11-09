import { defineConfig, transitions } from '@kitr/animation'

export default defineConfig({
  // 'user' follows the visitor's "reduce motion" setting: movement stops, fades still run.
  reducedMotion: 'user',
  // Every motion element uses this unless it sets its own transition.
  transition: transitions.base,
  // Animations finish instantly under Vitest. Set true for screenshot tests too.
  // skipAnimations: true,
})
