import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  moduleNameMapper: {
    '@Server/(.*)$': '<rootDir>/server/$1',
    '@Tools/(.*)$': '<rootDir>/tools/$1',
    '@Types/(.*)$': '<rootDir>/types/$1',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testRegex: '.*\\.spec\\.ts$',
  testEnvironment: 'node',
  preset: 'ts-jest',
  rootDir: 'src',
};

export default jestConfig;
