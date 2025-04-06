module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/packages/$1/src'
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['**/src/**/*.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/']
};
