import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { IconInput } from './IconInput';
import type { RepositoryConfig } from './types';

describe('IconInput', () => {
    let mockRepository: RepositoryConfig;

    beforeEach(() => {
        mockRepository = {
            name: 'heroicons',
            owner: 'tailwindlabs',
            repo: 'heroicons',
            branch: 'master',
            pathTemplate: 'optimized/24/{variant}/{iconName}.svg',
        };
    });

    describe('constructor', () => {
        test('creates instance with all properties', () => {
            const icon = new IconInput({
                output: './icons',
                name: 'arrow-right',
                filename: 'arrow-right',
                variant: 'outline',
                size: 24,
                repository: mockRepository,
            });

            expect(icon.output).toBe('./icons');
            expect(icon.name).toBe('arrow-right');
            expect(icon.filename).toBe('arrow-right');
            expect(icon.variant).toBe('outline');
            expect(icon.size).toBe(24);
            expect(icon.repository).toEqual(mockRepository);
        });

        test('creates instance without optional properties', () => {
            const icon = new IconInput({
                output: './icons',
                name: 'home',
                filename: 'home',
                repository: mockRepository,
            });

            expect(icon.variant).toBeUndefined();
            expect(icon.size).toBeUndefined();
        });
    });

    describe('buildUrl', () => {
        test('builds URL with all placeholders', () => {
            const icon = new IconInput({
                output: './icons',
                name: 'arrow-right',
                filename: 'arrow-right',
                variant: 'outline',
                size: 24,
                repository: mockRepository,
            });

            const url = icon.buildUrl();

            expect(url).toBe(
                'https://raw.githubusercontent.com/tailwindlabs/heroicons/master/optimized/24/outline/arrow-right.svg',
            );
        });

        test('builds URL without variant', () => {
            const repoWithoutVariant: RepositoryConfig = {
                name: 'feather',
                owner: 'feathericons',
                repo: 'feather',
                pathTemplate: 'icons/{iconName}.svg',
            };

            const icon = new IconInput({
                output: './icons',
                name: 'home',
                filename: 'home',
                repository: repoWithoutVariant,
            });

            const url = icon.buildUrl();

            expect(url).toBe('https://raw.githubusercontent.com/feathericons/feather/main/icons/home.svg');
        });

        test('uses main as default branch when not specified', () => {
            const repoWithoutBranch: RepositoryConfig = {
                name: 'lucide',
                owner: 'lucide-icons',
                repo: 'lucide',
                pathTemplate: 'icons/{iconName}.svg',
            };

            const icon = new IconInput({
                output: './icons',
                name: 'settings',
                filename: 'settings',
                repository: repoWithoutBranch,
            });

            const url = icon.buildUrl();

            expect(url).toContain('/main/');
        });

        test('handles size placeholder', () => {
            const repoWithSize: RepositoryConfig = {
                name: 'heroicons',
                owner: 'test',
                repo: 'test',
                pathTemplate: 'icons/{size}/{iconName}.svg',
            };

            const icon = new IconInput({
                output: './icons',
                name: 'star',
                filename: 'star',
                size: 48,
                repository: repoWithSize,
            });

            const url = icon.buildUrl();

            expect(url).toContain('/48/');
        });
    });

    describe('download', () => {
        test('downloads icon successfully', async () => {
            const icon = new IconInput({
                output: './icons',
                name: 'arrow-right',
                filename: 'arrow-right',
                variant: 'outline',
                repository: mockRepository,
            });

            const mockSvgContent =
                '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>';

            // Mock the fetch function
            globalThis.fetch = mock(async () => {
                return {
                    ok: true,
                    status: 200,
                    text: async () => mockSvgContent,
                } as Response;
            }) as unknown as typeof fetch;

            await icon.download();

            expect(icon.rawSvgText).toBe(mockSvgContent);
            expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        });

        test('throws error when download fails', async () => {
            const icon = new IconInput({
                output: './icons',
                name: 'nonexistent',
                filename: 'nonexistent',
                repository: mockRepository,
            });

            globalThis.fetch = mock(async () => {
                return {
                    ok: false,
                    status: 404,
                    statusText: 'Not Found',
                } as Response;
            }) as unknown as typeof fetch;

            await expect(icon.grabSvgText()).rejects.toThrow('Failed to download icon');
        });

        test('does not re-download if already downloaded', async () => {
            const icon = new IconInput({
                output: './icons',
                name: 'arrow-right',
                filename: 'arrow-right',
                repository: mockRepository,
            });

            icon.rawSvgText = '<svg>existing</svg>';

            globalThis.fetch = mock() as unknown as typeof fetch;

            await icon.grabSvgText();

            expect(globalThis.fetch).not.toHaveBeenCalled();
            expect(icon.rawSvgText).toBe('<svg>existing</svg>');
        });
    });

    describe('processSvgForReact', () => {
        test('removes XML declaration', () => {
            const icon = new IconInput({
                output: './icons',
                name: 'test',
                filename: 'test',
                repository: mockRepository,
            });

            icon.rawSvgText = '<?xml version="1.0" encoding="UTF-8"?><svg><path d="M0 0"/></svg>';

            const processed = icon.processSvgForReact();

            expect(processed).not.toContain('<?xml');
        });

        test('converts kebab-case attributes to camelCase', () => {
            const icon = new IconInput({
                output: './icons',
                name: 'test',
                filename: 'test',
                repository: mockRepository,
            });

            icon.rawSvgText =
                '<svg stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill-rule="evenodd"><path d="M0 0"/></svg>';

            const processed = icon.processSvgForReact();

            expect(processed).toContain('strokeWidth');
            expect(processed).toContain('strokeLinecap');
            expect(processed).toContain('strokeLinejoin');
            expect(processed).toContain('fillRule');
            expect(processed).not.toContain('stroke-width');
        });

        test('replaces fixed width and height with props', () => {
            const icon = new IconInput({
                output: './icons',
                name: 'test',
                filename: 'test',
                repository: mockRepository,
            });

            icon.rawSvgText = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M0 0"/></svg>';

            const processed = icon.processSvgForReact();

            expect(processed).toContain('width={width}');
            expect(processed).toContain('height={height}');
            expect(processed).not.toContain('width="24"');
            expect(processed).not.toContain('height="24"');
        });

        test('adds rest props to svg', () => {
            const icon = new IconInput({
                output: './icons',
                name: 'test',
                filename: 'test',
                repository: mockRepository,
            });

            icon.rawSvgText = '<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>';

            const processed = icon.processSvgForReact();

            expect(processed).toContain('{...rest}');
        });

        test('adds title element', () => {
            const icon = new IconInput({
                output: './icons',
                name: 'test',
                filename: 'test',
                repository: mockRepository,
            });

            icon.rawSvgText = '<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>';

            const processed = icon.processSvgForReact();

            expect(processed).toContain('<title>{title}</title>');
        });

        test('throws error when rawSvgText is not available', () => {
            const icon = new IconInput({
                output: './icons',
                name: 'test',
                filename: 'test',
                repository: mockRepository,
            });

            expect(() => icon.processSvgForReact()).toThrow('SVG text is not available');
        });
    });

    describe('generateTsxContent', () => {
        test('generates valid TSX content', () => {
            const icon = new IconInput({
                output: './icons',
                name: 'arrow-right',
                filename: 'arrow-right',
                repository: mockRepository,
            });

            const svgContent = '<svg><path d="M0 0"/></svg>';
            const tsx = icon.generateTsxContent(svgContent, 'ArrowRight');

            expect(tsx).toContain('export default function ArrowRight');
            expect(tsx).toContain('title = "arrow-right"');
            expect(tsx).toContain('React.InputHTMLAttributes<HTMLOrSVGElement>');
            expect(tsx).toContain(svgContent);
        });

        test('uses correct component name', () => {
            const icon = new IconInput({
                output: './icons',
                name: 'my-icon',
                filename: 'my-icon',
                repository: mockRepository,
            });

            const tsx = icon.generateTsxContent('<svg/>', 'MyIcon');

            expect(tsx).toContain('function MyIcon');
        });
    });

    describe('saveToFile', () => {
        test('saves raw SVG file', async () => {
            const icon = new IconInput({
                output: '/tmp/test-icons',
                name: 'test-icon',
                filename: 'test-icon',
                repository: mockRepository,
                tsxTransform: false,
            });

            icon.rawSvgText = '<svg><path d="M0 0"/></svg>';

            await icon.saveToFile();

            const file = Bun.file('/tmp/test-icons/test-icon.svg');
            const content = await file.text();

            expect(content).toBe('<svg><path d="M0 0"/></svg>');
        });

        test('saves TSX file', async () => {
            const icon = new IconInput({
                output: '/tmp/test-icons',
                name: 'test-icon',
                filename: 'test-icon',
                repository: mockRepository,
                tsxTransform: true,
            });

            icon.rawSvgText = '<svg width="24" height="24"><path d="M0 0"/></svg>';

            await icon.saveToFile();

            const file = Bun.file('/tmp/test-icons/test-icon.tsx');
            const content = await file.text();

            expect(content).toContain('export default function TestIcon');
            expect(content).toContain('width={width}');
            expect(content).toContain('height={height}');
        });

        test('throws error when rawSvgText is not available', async () => {
            const icon = new IconInput({
                output: '/tmp/test-icons',
                name: 'test-icon',
                filename: 'test-icon',
                repository: mockRepository,
            });

            await expect(icon.saveToFile()).rejects.toThrow('Icon data is not downloaded');
        });
    });

    describe('download', () => {
        test('downloads and saves icon as raw SVG', async () => {
            const icon = new IconInput({
                output: '/tmp/test-icons',
                name: 'test-icon',
                filename: 'test-icon',
                repository: mockRepository,
                tsxTransform: false,
            });

            const mockSvgContent = '<svg><path d="M0 0"/></svg>';

            globalThis.fetch = mock(async () => {
                return {
                    ok: true,
                    status: 200,
                    text: async () => mockSvgContent,
                } as Response;
            }) as unknown as typeof fetch;

            await icon.download();

            const file = Bun.file('/tmp/test-icons/test-icon.svg');
            const content = await file.text();

            expect(content).toBe(mockSvgContent);
        });

        test('downloads and saves icon as TSX', async () => {
            const icon = new IconInput({
                output: '/tmp/test-icons',
                name: 'test-tsx',
                filename: 'test-tsx',
                repository: mockRepository,
                tsxTransform: true,
            });

            const mockSvgContent = '<svg width="24" height="24"><path d="M0 0"/></svg>';

            globalThis.fetch = mock(async () => {
                return {
                    ok: true,
                    status: 200,
                    text: async () => mockSvgContent,
                } as Response;
            }) as unknown as typeof fetch;

            await icon.download();

            const file = Bun.file('/tmp/test-icons/test-tsx.tsx');
            const content = await file.text();

            expect(content).toContain('export default function TestTsx');
        });
    });
});
