const base = require('../../jest-base.config');

module.exports = {
  ...base,
  displayName: 'aether-core',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts']
};
