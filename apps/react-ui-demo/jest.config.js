const base = require('../../jest-base.config');

module.exports = {
  ...base,
  displayName: 'react-ui-demo',
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
