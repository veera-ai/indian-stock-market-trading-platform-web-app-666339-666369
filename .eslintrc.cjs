module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    project: undefined, // Not using type-aware linting for speed; keep strict TS via tsc
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'prettier',
  ],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    // Keep strictness while ensuring practical DX
    'react/react-in-jsx-scope': 'off', // new JSX transform
    'react/jsx-uses-react': 'off',
    'react/prop-types': 'off', // using TS
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/ban-ts-comment': [
      'error',
      { 'ts-expect-error': 'allow-with-description' }
    ],
    // Encourage explicit return types for exported functions
    '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
  },
  overrides: [
    {
      files: ['*.tsx'],
      rules: {
        // Accessibility lint for JSX
        'jsx-a11y/heading-has-content': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    // Allow vite type refs file
    'vite-env.d.ts',
  ],
};
