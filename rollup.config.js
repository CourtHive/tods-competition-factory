import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';
// import dts from 'rollup-plugin-dts';
import fs from 'fs-extra';
import path from 'path';

const esmBundle = (config) => ({
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

const esmProfile = [
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

const esmExports = [...esmProfile.map(esmBundle)];

const basePath = fs.realpathSync(process.cwd());
const distPath = path.resolve(basePath, 'dist');

const buildOutput = ({
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

function createExport({ input, folder, packageName, cjs, esm }) {
  const output = [];
  if (esm) {
    const esmBuilds = [
      ...buildOutput({ format: 'esm', minified: true, folder, packageName }),
    ];
    output.push(...esmBuilds);
  }
  if (cjs) {
    const cjsBuilds = [
      ...buildOutput({ format: 'cjs', minified: false, folder, packageName }),
      ...buildOutput({ format: 'cjs', minified: true, folder, packageName }),
    ];
    output.push(...cjsBuilds);
  }
  return {
    plugins: [
      typescript({ sourceMap: true, declaration: false }),
      nodeResolve(),
      commonjs(),
      json(),
      babel({ babelHelpers: 'bundled' }),
    ],

    input,
    output,
  };
}

const cjsExports = [{ input: 'src/index.ts', cjs: true }].map(createExport);

export default [
  ...cjsExports,
  ...esmExports,
  /*
  {
    input: 'src/forge/query/index.ts',
    output: [{ file: `${distPath}/forge/query/index.d.ts`, format: 'es' }],
    plugins: [dts()],
  },
  */
];
