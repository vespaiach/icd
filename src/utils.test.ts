import { describe, expect, test } from 'bun:test';
import { IconInput } from './IconInput';
import { loadAndParseIconInputsFromFile, santizeFilename } from './utils';

describe('santizeFilename', () => {
    test('converts to lowercase', () => {
        expect(santizeFilename('MyIcon')).toBe('myicon');
    });

    test('replaces spaces with hyphens', () => {
        expect(santizeFilename('my icon name')).toBe('my-icon-name');
    });

    test('replaces special characters with hyphens', () => {
        expect(santizeFilename('icon@name#test')).toBe('icon-name-test');
    });

    test('handles multiple consecutive spaces', () => {
        expect(santizeFilename('icon   name')).toBe('icon-name');
    });

    test('handles mixed case with special characters', () => {
        expect(santizeFilename('Arrow_Right Icon!')).toBe('arrow-right-icon-');
    });

    test('handles already sanitized names', () => {
        expect(santizeFilename('arrow-right')).toBe('arrow-right');
    });
});

describe('loadAndParseIconInputsFromFile', () => {
    test('loads and parses valid icon input file', async () => {
        // Create a temporary test file
        const testFilePath = '/tmp/test-icons-input.json';
        const testData = {
            output: './icons',
            icons: [
                {
                    repository: 'heroicons',
                    name: 'arrow-right',
                    variant: 'outline',
                    size: 24,
                },
            ],
        };

        await Bun.write(testFilePath, JSON.stringify(testData));

        const result = await loadAndParseIconInputsFromFile(testFilePath);

        expect(result).toBeArrayOfSize(1);
        expect(result[0]).toBeInstanceOf(IconInput);
        expect(result[0]?.name).toBe('arrow-right');
        expect(result[0]?.filename).toBe('arrow-right');
        expect(result[0]?.variant).toBe('outline');
        expect(result[0]?.size).toBe(24);
        expect(result[0]?.output).toBe('./icons');
    });

    test('uses default output if not specified', async () => {
        const testFilePath = '/tmp/test-icons-input-2.json';
        const testData = {
            icons: [
                {
                    repository: 'heroicons',
                    name: 'home',
                },
            ],
        };

        await Bun.write(testFilePath, JSON.stringify(testData));

        const result = await loadAndParseIconInputsFromFile(testFilePath);

        expect(result[0]?.output).toBe('.');
    });

    test('uses custom saveAs filename', async () => {
        const testFilePath = '/tmp/test-icons-input-3.json';
        const testData = {
            icons: [
                {
                    repository: 'heroicons',
                    name: 'arrow-right',
                    saveAs: 'custom-arrow',
                },
            ],
        };

        await Bun.write(testFilePath, JSON.stringify(testData));

        const result = await loadAndParseIconInputsFromFile(testFilePath);

        expect(result[0]?.filename).toBe('custom-arrow');
    });

    test('sanitizes filename when saveAs is not provided', async () => {
        const testFilePath = '/tmp/test-icons-input-4.json';
        const testData = {
            icons: [
                {
                    repository: 'heroicons',
                    name: 'arrow-right-icon',
                },
            ],
        };

        await Bun.write(testFilePath, JSON.stringify(testData));

        const result = await loadAndParseIconInputsFromFile(testFilePath);

        expect(result[0]?.filename).toBe('arrow-right-icon');
    });

    test('throws error for invalid schema', async () => {
        const testFilePath = '/tmp/test-icons-input-invalid.json';
        const testData = {
            // Missing required 'icons' array
            output: './icons',
        };

        await Bun.write(testFilePath, JSON.stringify(testData));

        await expect(loadAndParseIconInputsFromFile(testFilePath)).rejects.toThrow('Invalid icons input file');
    });

    test('throws error for unknown repository preset', async () => {
        const testFilePath = '/tmp/test-icons-input-unknown-repo.json';
        const testData = {
            icons: [
                {
                    repository: 'unknown-repo',
                    name: 'icon',
                },
            ],
        };

        await Bun.write(testFilePath, JSON.stringify(testData));

        await expect(loadAndParseIconInputsFromFile(testFilePath)).rejects.toThrow('Invalid icons input file');
    });

    test('handles multiple icons', async () => {
        const testFilePath = '/tmp/test-icons-input-multiple.json';
        const testData = {
            output: './icons',
            icons: [
                {
                    repository: 'heroicons',
                    name: 'arrow-right',
                    variant: 'outline',
                },
                {
                    repository: 'feather',
                    name: 'home',
                },
                {
                    repository: 'lucide',
                    name: 'settings',
                },
            ],
        };

        await Bun.write(testFilePath, JSON.stringify(testData));

        const result = await loadAndParseIconInputsFromFile(testFilePath);

        expect(result).toBeArrayOfSize(3);
        expect(result[0]?.name).toBe('arrow-right');
        expect(result[1]?.name).toBe('home');
        expect(result[2]?.name).toBe('settings');
    });

    test('icon-specific output overrides global output', async () => {
        const testFilePath = '/tmp/test-icons-input-override.json';
        const testData = {
            output: './global',
            icons: [
                {
                    repository: 'heroicons',
                    name: 'icon1',
                },
                {
                    repository: 'heroicons',
                    name: 'icon2',
                    output: './specific',
                },
            ],
        };

        await Bun.write(testFilePath, JSON.stringify(testData));

        const result = await loadAndParseIconInputsFromFile(testFilePath);

        expect(result[0]?.output).toBe('./global');
        expect(result[1]?.output).toBe('./specific');
    });
});
