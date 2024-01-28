import * as esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['./src/index.ts'],
  outfile: './dist/index.mjs',
  platform: 'node',
  format: 'esm',
  minify: true,
  bundle: true,
});
