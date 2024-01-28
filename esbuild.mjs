#!/usr/bin/env node
// import tsPaths from 'esbuild-ts-paths';
import * as esbuild from 'esbuild';

esbuild.build({
  // plugins: [tsPaths('./tsconfig.base.json')],
  entryPoints: ['./src/index.ts'],
  outfile: './dist/index.mjs',
  platform: 'node',
  format: 'esm',
  minify: true,
  bundle: true,
});
