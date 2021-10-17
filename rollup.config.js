import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
// import dts from 'rollup-plugin-dts';

import path from 'path';
import fs from 'fs-extra';

const basePath = fs.realpathSync(process.cwd());
const distPath = path.resolve(basePath, 'dist');

const packageName = 'tods-competition-factory';

const output = (format, minified) => {
  const development = format === 'cjs' && !minified ? '.development' : '';

  const base = {
    file: `${distPath}/${packageName}.${format}${development}.js`,
    format,
    sourcemap: true,
    esModule: true,
    freeze: false,
    name: packageName,
    globals: {},
    exports: 'named',
  };

  if (format === 'cjs' && minified) writeCjsIndex();

  return minified
    ? [
        {
          ...base,
          file: `${distPath}/${packageName}.production.${format}.min.js`,
          plugins: [terser()],
        },
      ]
    : [base];
};

function writeCjsIndex() {
  const fileImportRoot = `module.exports = require('./${packageName}`;
  const body = `'use strict'
if (process.env.NODE_ENV === 'production') {
  ${fileImportRoot}.cjs.production.min.js')
} else {
  ${fileImportRoot}.cjs.development.js')
}
`;
  return fs.outputFile(`${distPath}/index.js`, body);
}

export default [
  {
    plugins: [
      typescript({ sourceMap: true }),
      nodeResolve(),
      commonjs(),
      json(),
      babel({ babelHelpers: 'bundled' }),
    ],
    external: ['react', 'react-dom'],

    input: 'src/index.ts',
    output: [
      ...output('cjs', false),
      ...output('cjs', true),
      ...output('esm', false),
    ],
  },
  /*
  {
    input: 'src/index.ts',
    output: [{ file: `${distPath}/index.d.ts`, format: 'es' }],
    plugins: [dts()],
  },
  */
];
