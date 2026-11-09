import { kitr } from '@kitr/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [kitr()],
  test: {
    environment: 'happy-dom',
    include: ['app/**/*.test.{ts,tsx}', 'test/**/*.test.{ts,tsx}'],
  },
})
