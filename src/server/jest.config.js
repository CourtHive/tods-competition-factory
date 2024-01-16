module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testRegex: '.*\\.spec\\.ts$',
  testEnvironment: 'node',
  preset: 'ts-jest',
  rootDir: 'src',
};
