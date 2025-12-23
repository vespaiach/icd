import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';
import * as prettier from 'prettier';
import type { RepositoryConfig } from './types';
import { logError } from './utils';

export class IconInput {
    /**
     * The folder where icons will be downloaded
     */
    output: string;

    /**
     * Icon name to download (without file extension)
     * Example: "arrow-right"
     */
    name: string;

    /**
     * Filename to save the icon as (without extension)
     * Example: "arrow-to-right"
     * Note:
     *  - All letters will be converted to lowercase
     *  - Whitespace and special characters will be replaced with hyphens
     */
    filename: string;

    /**
     * Icon variant: "outline" | "solid" | "mini" (20x20) | "micro" (16x16)
     */
    variant?: string;

    /**
     * Size of the icon (if applicable)
     */
    size?: number;

    /**
     * Repository configuration
     */
    repository: RepositoryConfig;

    overwrite: boolean;
    tsxTransform: boolean;

    /**
     * Raw SVG text downloaded from the repository
     */
    svgText?: string;

    constructor(data: {
        output: string;
        name: string;
        filename: string;
        variant?: string;
        size?: number;
        repository: RepositoryConfig;
        overwrite?: boolean;
        tsxTransform?: boolean;
    }) {
        this.output = data.output;
        this.name = data.name;
        this.filename = data.filename;
        this.variant = data.variant;
        this.size = data.size;
        this.repository = data.repository;
        this.overwrite = data.overwrite || false;
        this.tsxTransform = data.tsxTransform || false;
    }

    public async download() {
        await this.grabSvgText();
        await this.transform();
        // TODO: Enable formatting again once issues are resolved
        // await this.format();
        await this.saveToFile();
    }

    buildUrl() {
        const baseUrl = `https://raw.githubusercontent.com/${this.repository.owner}/${this.repository.repo}/${this.repository.branch || 'main'}`;

        let path = this.repository.pathTemplate;

        // Simple replacement for repositories without variant mapping
        path = path
            .replace('{variant}', this.variant || '')
            .replace('{size}', this.size?.toString() || '')
            .replace('{iconName}', this.name);

        return `${baseUrl}/${path}`;
    }

    async grabSvgText() {
        if (this.svgText) {
            return;
        }

        const url = this.buildUrl();
        const response = await fetch(url);
        if (!response.ok) {
            const error = new Error(
                `Failed to download icon ${this.name} from ${url}: ${response.status} ${response.statusText}`,
            );
            logError({
                icon: this,
                method: 'grabSvgText',
                error,
            });
            throw error;
        }
        const data = await response.text();
        this.svgText = data;
    }

    async format() {
        if (!this.svgText) {
            throw new Error(`SVG text is not available for icon ${this.name}`);
        }

        try {
            const formatted = await prettier.format(this.svgText, {
                parser: this.tsxTransform ? 'babel' : 'html',
                printWidth: 110,
                tabWidth: 4,
                useTabs: false,
                singleQuote: true,
                bracketSameLine: true,
            });

            this.svgText = formatted;
        } catch (error) {
            logError({
                icon: this,
                method: 'formatSvgText',
                error: error instanceof Error ? error : new Error(String(error)),
            });
            // Continue without formatting if it fails
        }
    }

    async saveToFile() {
        if (!this.svgText) {
            throw new Error(`Icon data is not downloaded for ${this.name}`);
        }

        let filePath = `${this.output}/${this.filename}.svg`;
        if (this.tsxTransform) {
            filePath = `${this.output}/${this.filename}.tsx`;
        }
        await mkdir(dirname(filePath), { recursive: true });
        await writeFile(filePath, this.svgText, 'utf-8');
    }

    transform() {
        if (!this.svgText) {
            throw new Error(`Icon data is not downloaded for ${this.name}`);
        }

        if (this.tsxTransform) {
            const componentName = this.filename
                .split('-')
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join('');
            this.svgText = this.processSvgForReact(componentName);
        }
    }

    processSvgForReact(componentName: string): string {
        if (!this.svgText) {
            throw new Error(`SVG text is not available for icon ${this.name}`);
        }

        // Remove XML declaration if present
        let processed = this.svgText.replace(/<\?xml[^?]*\?>/g, '');

        // Convert common SVG attributes to camelCase
        const attributeMap: Record<string, string> = {
            'stroke-width': 'strokeWidth',
            'stroke-linecap': 'strokeLinecap',
            'stroke-linejoin': 'strokeLinejoin',
            'fill-rule': 'fillRule',
            'clip-rule': 'clipRule',
            'fill-opacity': 'fillOpacity',
            'stroke-opacity': 'strokeOpacity',
        };

        Object.entries(attributeMap).forEach(([kebab, camel]) => {
            const regex = new RegExp(kebab, 'g');
            processed = processed.replace(regex, camel);
        });

        // Replace fixed width/height with props, or add them if not present
        if (processed.includes('width=')) {
            processed = processed.replace(/width="[^"]*"/g, 'width={width}');
        } else {
            processed = processed.replace(/<svg/, '<svg width={width}');
        }
        if (processed.includes('height=')) {
            processed = processed.replace(/height="[^"]*"/g, 'height={height}');
        } else {
            processed = processed.replace(/<svg/, '<svg height={height}');
        }

        processed = processed.replace(/<svg([^>]*)>/, '<svg$1>\n        <title>{title}</title>');

        // Remove class attribute to avoid conflicts
        processed = processed.replace(/class="[^"]*"/g, '');

        // Add className prop and width/height if not present
        processed = processed.replace(/<svg/, '<svg {...rest}');

        return `
import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
    title?: string;
}

export default function BootstrapHeart({
    title = '${this.name}',
    width,
    height,
    ...rest
}: IconProps): React.ReactNode {
    return (
        ${processed.trim()}
    );
}
        `;
    }
}
