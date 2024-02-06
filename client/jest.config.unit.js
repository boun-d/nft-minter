module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts', 'jest-enzyme'],
    setupFiles: ['<rootDir>/src/setupTests.ts', '<rootDir>/src/setupEnzyme.ts'],
    // ignore .js files
    testRegex: '(/__tests__/.*|(\\.|/)(test))\\.[t]sx?$',
    coverageReporters: ['lcov', 'text'],
    coverageDirectory: 'test-coverage',
    coverageThreshold: {
        global: {
            branches: 0,
            functions: 0,
            lines: 0,
            statements: 0,
        },
    },
}
