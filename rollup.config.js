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

const output = ({ format, minified, folder }) => {
  const development = format === 'cjs' && !minified ? 'development.' : '';
  const subFolder = folder ? `/${folder}` : '';
  const file = `${distPath}${subFolder}/${packageName}.${development}${format}.js`;

  const base = {
    file,
    format,
    sourcemap: true,
    esModule: true,
    freeze: false,
    name: packageName,
    globals: {},
    exports: 'named',
  };

  if (format === 'cjs' && minified) writeCjsIndex({ subFolder });

  return minified
    ? [
        {
          ...base,
          file: `${distPath}${subFolder}/${packageName}.production.${format}.min.js`,
          plugins: [terser()],
        },
      ]
    : [base];
};

function writeCjsIndex({ subFolder }) {
  const fileImportRoot = `module.exports = require('./${packageName}`;
  const body = `'use strict';
if (process.env.NODE_ENV === 'production') {
  ${fileImportRoot}.production.cjs.min.js')
} else {
  ${fileImportRoot}.development.cjs.js')
}
`;
  return fs.outputFile(`${distPath}${subFolder}/index.js;`, body);
}

function createExport({ input, folder }) {
  return {
    plugins: [
      typescript({ sourceMap: true, declaration: false }),
      nodeResolve(),
      commonjs(),
      json(),
      babel({ babelHelpers: 'bundled' }),
    ],

    input,
    output: [
      ...output({ format: 'cjs', minified: false, folder }),
      ...output({ format: 'cjs', minified: true, folder }),
      ...output({ format: 'esm', minified: true, folder }),
    ],
  };
}

const exports = [
  { input: 'src/index.ts' },
  { input: 'src/utilities/index.ts', folder: 'utilities ' },
].map(createExport);

export default [
  ...exports,
  /*
  {
    input: 'src/index.ts',
    output: [{ file: `${distPath}/index.d.ts`, format: 'es' }],
    plugins: [dts()],
  },
  */
];
