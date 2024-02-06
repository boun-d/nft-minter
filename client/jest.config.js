module.exports = {
    rootDir: __dirname,
    roots:['<rootDir>/src'],
    preset: 'ts-jest',
    testEnvironment: 'node',
    modulePathIgnorePatterns: ['/dist/'],
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
}
