module.exports = {
  root: true,
  extends: ['@labdigital/eslint-config-node'],
  ignorePatterns: ['**/*.js'],
  rules: {
    'jest/no-deprecated-functions': 'off',
    'jest/no-standalone-expect': 'off',
  },
}
