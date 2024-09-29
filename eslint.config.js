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
  // ...compat.extends('./eslint.vite.js'),
  js.configs.recommended,
  ...compat.extends(
    'eslint:recommended',
    'plugin:compat/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:sonarjs/recommended-legacy',
    'plugin:prettier/recommended',
  ),
  { plugins: { sonarjs: eslintPluginSonarjs } },
  {
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts'],
          paths: ['src'],
        },
      },
    },
  },
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
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-useless-escape': 'off',
      'array-callback-return': 'warn',
      'import/named': 'off',
      'import/namespace': 'off',
      'import/no-duplicates': 'error',
      'import/no-named-as-default-member': 'off',
      'import/no-named-as-default': 'off',
      'import/no-unresolved': 'off',
      'no-console': 'off',
      'no-debugger': 'error',
      'no-duplicate-imports': 0,
      'no-nested-ternary': 'warn',
      'no-unneeded-ternary': 'warn',
      'no-unused-expressions': 'off',
      'no-unused-vars': 'off',
      'sonarjs/cognitive-complexity': ['off', 100],
      'sonarjs/no-all-duplicated-branches': 'warn',
      'sonarjs/no-collapsible-if': 'warn',
      'sonarjs/no-collection-size-mischeck': 'warn',
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-duplicated-branches': 'warn',
      'sonarjs/no-empty-collection': 'warn',
      'sonarjs/no-empty-string-repetition': 'warn',
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
      'sonarjs/todo-tag': 'off',
      complexity: ['off', 25],
      eqeqeq: ['warn', 'smart'],
    },
  },
  { ignores: ['node_modules/', 'dist/', 'coverage/', '**/scratch/', 'server/', '**/*.test.ts'] },
];
