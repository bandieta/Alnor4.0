import { defineConfig } from 'vitest/config'

// The validation module is framework-free, so the test project needs no Vite
// plugins — keeping this config plugin-less also side-steps the plugin-type
// mismatch between Vite 8 (rolldown) and the Vite bundled inside Vitest.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
