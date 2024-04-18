const typescriptEslintParser = require('@typescript-eslint/parser');
const eslintPluginSonarjs = require('eslint-plugin-sonarjs');
const { FlatCompat } = require('@eslint/eslintrc');
const globals = require('globals');
const js = require('@eslint/js');

const compat = new FlatCompat({
  recommendedConfig: js.configs.recommended,
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends('./eslint.vite.js'),
  js.configs.recommended,
  ...compat.extends(
    'plugin:compat/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:sonarjs/recommended',
    'plugin:prettier/recommended',
  ),
  { plugins: { sonarjs: eslintPluginSonarjs } },
  {
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es6,
        ...globals.jest,
      },
    },
  },
  {
    rules: {
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-useless-escape': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-unresolved': 'off',
      'import/namespace': 'off',
      'sonarjs/cognitive-complexity': ['off', 100],
      'sonarjs/no-all-duplicated-branches': 'warn',
      'sonarjs/no-collapsible-if': 'warn',
      'sonarjs/no-collection-size-mischeck': 'warn',
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-duplicated-branches': 'warn',
      'sonarjs/no-empty-collection': 'warn',
      'sonarjs/no-extra-arguments': 'warn',
      'sonarjs/no-gratuitous-expressions': 'warn',
      'sonarjs/no-identical-expressions': 'warn',
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-ignored-return': 'off',
      'sonarjs/no-misleading-array-reverse': 'off',
      'sonarjs/no-nested-template-literals': 'warn',
      'sonarjs/no-redundant-boolean': 'warn',
      'sonarjs/no-redundant-jump': 'warn',
      'sonarjs/no-small-switch': 'warn',
      'sonarjs/no-unused-collection': 'warn',
      'sonarjs/prefer-object-literal': 'warn',
      'sonarjs/prefer-single-boolean-return': 'warn',
    },
  },
  { ignores: ['node_modules/', 'dist/', 'coverage/', '**/scratch/', 'server/', '**/*.test.ts'] },
];
