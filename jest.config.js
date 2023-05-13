module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test))\\.(ts|js)$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  resetMocks: true,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        suiteName: 'Unit Tests',
        outputDirectory: './junit/unit',
        addFileAttribute: 'true'
      }
    ]
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!node_modules/**',
  ]
};
