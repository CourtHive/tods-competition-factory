#!/usr/bin/env node
import * as esbuild from 'esbuild';
import * as fsx from 'fs-extra';
import fs from 'fs';

const result = await esbuild.build({
  entryPoints: ['./src/index.ts'],
  outfile: './dist/index.mjs',
  platform: 'node',
  metafile: true,
  format: 'esm',
  minify: true,
  bundle: true,
});

fsx.ensureDirSync('./build');
fs.writeFileSync('./build/esbuild-meta.json', JSON.stringify(result.metafile));

// NOTE: load meta file here => https://esbuild.github.io/analyze/
