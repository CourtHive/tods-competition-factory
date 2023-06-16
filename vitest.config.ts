import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    onConsoleLog: () => {},
    environment: 'node',
    useAtomics: true,
    include: [
      'src/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    coverage: {
      reporter: ['html'],
      include: ['src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: [
        ...configDefaults.exclude,
        'src/**/*.config.{js,ts,jsx,tsx}',
        'src/**/*.test.{js,ts,jsx,tsx}',
        '**/conversion/**',
        '**/examples/**',
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
});
