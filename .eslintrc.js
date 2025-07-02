module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', '@typescript-eslint/recommended', 'prettier'],
  env: {
    node: true,
    es6: true,
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    '.next',
    '.turbo',
    '*.js',
    '!.eslintrc.js',
    '!*.config.js',
  ],
  rules: {
    // General rules for all packages
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
  },
  overrides: [
    // API Gateway specific rules
    {
      files: ['./apps/api-gateway/**/*.ts'],
      rules: {
        'no-console': 'off', // Allow console in API Gateway for logging
        '@typescript-eslint/no-floating-promises': 'error',
      },
    },
    // Auth service specific rules
    {
      files: ['./services/**/*.ts'], //like auth, user, post, feed, etc.
      rules: {
        'no-console': 'off', // Allow console in services for logging
        '@typescript-eslint/no-floating-promises': 'error',
      },
    },
    // Shared packages rules
    {
      files: ['./packages/**/*.ts'], // like utils, types, redis, db, config
      rules: {
        'no-console': 'error', // Stricter for shared packages
      },
    },
    // Other specific rules
    // Test files
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
    // Config files
    {
      files: ['*.config.js', '.eslintrc.js'],
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
