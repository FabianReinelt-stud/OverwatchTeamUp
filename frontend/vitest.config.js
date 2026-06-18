import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
        coverage: {
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/**/*.test.{ts,tsx}',
                'src/main.tsx',
                'src/data/**',
            ],
            reporter: ['text', 'lcov'],
        },
    },
});
