import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    test: {
      onConsoleLog: () => {},
      environment: 'node',
      include: [
        'src/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'tests/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        // 'scratch/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
      exclude: ['src/global/tests/benchmarks/test.{js,ts,jsx,tsx}'],
      useAtomics: true,
      coverage: {
        reporter: ['text', 'lcov'],
        include: ['src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: [
          'src/**/*.test.{js,ts,jsx,tsx}',
          'src/**/*.config.{js,ts,jsx,tsx}',
          'src/global/tests/benchmarks/*.test.{js,ts,jsx,tsx}',
        ],
        all: true,
        checkCoverage: true,
        lines: 30,
        functions: 30,
        branches: 50,
        statements: 30,
        provider: 'c8',
      },
    },
    plugins: [],
  };
});
