/**
 * NOTE: Vitest requires tsconfigPaths for source files and aliases for test files
 */

import { configDefaults, defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths'; // necessary for vite to resolve tsconfig paths in factory source files

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // onConsoleLog: () => {},
    environment: 'node',
    include: ['src/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      reporter: ['html'],
      include: ['src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: [
        ...configDefaults.exclude,
        'src/**/*.config.{js,ts,jsx,tsx}',
        'src/**/*.test.{js,ts,jsx,tsx}',
        '**/conversion/**',
        '**/examples/**',
        '**/scratch/**',
        '**/server/**',
        'src/forge/**',
        '**/types/**',
      ],
      provider: 'v8',
    },
  },
  resolve: {
    // necessary for vitest to resolve tsconfig paths in test.ts files
    alias: {
      '@Generators': new URL('../assemblies/generators', import.meta.url).pathname,
      '@Assemblies': new URL('../assemblies', import.meta.url).pathname,
      '@Engines': new URL('../tests/engines', import.meta.url).pathname, // test engines
      '@Validators': new URL('../validators', import.meta.url).pathname,
      '@Constants': new URL('../constants', import.meta.url).pathname,
      '@Functions': new URL('../functions', import.meta.url).pathname,
      '@Fixtures': new URL('../fixtures', import.meta.url).pathname,
      '@Acquire': new URL('../acquire', import.meta.url).pathname,
      '@Helpers': new URL('../helpers', import.meta.url).pathname,
      '@Global': new URL('../global', import.meta.url).pathname,
      '@Mutate': new URL('../mutate', import.meta.url).pathname,
      '@Server': new URL('../server', import.meta.url).pathname,
      '@Query': new URL('../query', import.meta.url).pathname,
      '@Tools': new URL('../tools', import.meta.url).pathname,
      '@Types': new URL('../types', import.meta.url).pathname,
    },
  },
});
