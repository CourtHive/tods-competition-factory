import json from '@rollup/plugin-json';
// import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

const bundle = (config) => ({
  external: (id) => !/^[./]/.test(id),
  input: config.input,
  plugins: [esbuild(), json()],
  output: [
    {
      file: config.outputFile,
      name: config.outputName,
      format: 'es',
      sourcemap: true,
    },
  ],
});

const exports = [
  { input: 'src/index.ts', outputFile: 'dist/index.mjs' },
  {
    input: 'src/utilities/index.ts',
    outputName: 'utilities',
    outputFile: 'dist/forge/utilities.mjs',
  },
  {
    input: 'src/forge/generate/index.ts',
    outputName: 'generate',
    outputFile: 'dist/forge/generate.mjs',
  },
  {
    input: 'src/forge/transform/index.ts',
    outputName: 'transform',
    outputFile: 'dist/forge/transform.mjs',
  },
  {
    input: 'src/forge/query/index.ts',
    outputName: 'query',
    outputFile: 'dist/forge/query.mjs',
  },
];

const buildOutputs = [...exports.map(bundle)];

export default [
  ...buildOutputs,
  // {
  //   input: 'src/index.ts',
  //   plugins: [dts()],
  //   output: {
  //     file: `dist/tods-competition-factory.d.ts`,
  //     format: 'es',
  //   },
  // },
];
