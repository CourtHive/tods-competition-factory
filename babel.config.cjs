module.exports = {
  presets: [
    '@babel/preset-typescript',
    ['@babel/preset-env', { targets: { node: 'current' } }],
  ],
  plugins: [
    // Adds syntax support for optional chaining (.?)
    '@babel/plugin-proposal-optional-chaining',
    // Adds syntax support for default value using ?? operator
    '@babel/plugin-proposal-nullish-coalescing-operator',
  ],
};
