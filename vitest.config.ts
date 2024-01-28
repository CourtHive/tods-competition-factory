/**
 * NOTE: Vitest requires tsconfigPaths for source files and aliases for test files
 */

import { configDefaults, defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths'; // necessary for vite to resolve tsconfig paths in factory source files

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    onConsoleLog: () => {},
    environment: 'node',
    useAtomics: true,
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
      statements: 30,
      provider: 'v8',
      functions: 30,
      branches: 50,
      lines: 30,
      all: true,
    },
  },
  resolve: {
    // necessary for vitest to resolve tsconfig paths in test.ts files
    alias: {
      '@Generators': './src/assemblies/generators',
      '@Assemblies': './src/assemblies',
      '@Engines': './src/tests/engines', // test engines
      '@Validators': './src/validators',
      '@Constants': './src/constants',
      '@Functions': './src/functions',
      '@Acquire': './src/acquire',
      '@Helpers': './src/helpers',
      '@Global': './src/global',
      '@Mutate': './src/mutate',
      '@Server': './src/server',
      '@Query': './src/query',
      '@Tools': './src/tools',
      '@Types': './src/types',
    },
  },
});
