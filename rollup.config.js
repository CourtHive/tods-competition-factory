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

const output = ({
  packageName = 'tods-competition-factory',
  minified,
  folder,
  format,
}) => {
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

  if (format === 'cjs' && minified) writeCjsIndex({ subFolder, packageName });

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

function writeCjsIndex({ subFolder, packageName }) {
  const fileImportRoot = `module.exports = require('./${packageName}`;
  const body = `'use strict';
if (process.env.NODE_ENV === 'production') {
  ${fileImportRoot}.production.cjs.min.js')
} else {
  ${fileImportRoot}.development.cjs.js')
}
`;
  return fs.outputFile(`${distPath}${subFolder}/index.js`, body);
}

function createExport({ input, folder, packageName }) {
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
      ...output({ format: 'cjs', minified: false, folder, packageName }),
      ...output({ format: 'cjs', minified: true, folder, packageName }),
      ...output({ format: 'esm', minified: true, folder, packageName }),
    ],
  };
}

const exports = [
  { input: 'src/index.ts' },
  {
    input: 'src/utilities/index.ts',
    packageName: 'utilities',
    folder: 'forge/utilities',
  },
  {
    input: 'src/forge/generate/index.ts',
    packageName: 'generate',
    folder: 'forge/generate',
  },
  {
    input: 'src/forge/transform/index.ts',
    packageName: 'transform',
    folder: 'forge/transform',
  },
  {
    input: 'src/forge/query/index.ts',
    packageName: 'query',
    folder: 'forge/query',
  },
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
