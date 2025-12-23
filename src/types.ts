import type { IconInput } from './IconInput';

export type RepositoryName =
    | 'bootstrap-icons'
    | 'boxicons'
    | 'bytesize-icons'
    | 'css-gg'
    | 'eva-icons'
    | 'feather'
    | 'font-awesome'
    | 'heroicons'
    | 'ionicons'
    | 'lucide'
    | 'tabler-icons';

export interface RepositoryConfig {
    /**
     * Repository unique name
     * Example: "heroicons"
     */
    name: RepositoryName;

    /**
     * GitHub repository owner
     * Example: "tailwindlabs" for heroicons
     */
    owner: string;

    /**
     * GitHub repository name
     * Example: "heroicons"
     */
    repo: string;

    /**
     * Branch to fetch from
     * Default: "master" or "main"
     */
    branch?: string;

    /**
     * Path template for icon files
     * Use {variant} and {iconName} as placeholders
     * Example: "optimized/24/{variant}/{iconName}.svg"
     */
    pathTemplate: string;

    /**
     * Available variants and their path mappings
     * Example: { "outline": "outline", "solid": "solid" }
     */
    variantMap?: Record<string, string>;

    /**
     * Demo site URL for the icon repository
     * Example: "https://heroicons.com"
     */
    demoUrl?: string;
}

export interface CommandOptions {
    /**
     * Path to icons input file.
     * Default: "icons.input.json"
     */
    configFile: string;

    verbose: boolean;
}

// Repository-specific variant types
type BoxiconsVariant = 'regular' | 'solid' | 'logos';
type EvaIconsVariant = 'fill' | 'outline';
type FontAwesomeVariant = 'regular' | 'solid' | 'brands';
type HeroiconsVariant = '16/solid' | '20/solid' | '24/solid' | '24/outline';
type TablerIconsVariant = 'outline' | 'filled';

// Base icon configuration
interface BaseIconConfig {
    name: string;
    size?: number;
    output?: string;
    saveAs?: string;
    overwrite?: boolean;
    tsxTransform?: boolean;
}

// Icon configurations with repository-specific variants
type BoxiconsConfig = BaseIconConfig & {
    repository: 'boxicons';
    variant?: BoxiconsVariant;
};

type EvaIconsConfig = BaseIconConfig & {
    repository: 'eva-icons';
    variant?: EvaIconsVariant;
};

type FontAwesomeConfig = BaseIconConfig & {
    repository: 'font-awesome';
    variant?: FontAwesomeVariant;
};

type HeroiconsConfig = BaseIconConfig & {
    repository: 'heroicons';
    variant?: HeroiconsVariant;
};

type TablerIconsConfig = BaseIconConfig & {
    repository: 'tabler-icons';
    variant?: TablerIconsVariant;
};

// Repositories without variants
type NoVariantConfig = BaseIconConfig & {
    repository: 'bootstrap-icons' | 'bytesize-icons' | 'css-gg' | 'feather' | 'ionicons' | 'lucide';
    variant?: never;
};

// Discriminated union of all icon configurations
export type IconConfig =
    | BoxiconsConfig
    | EvaIconsConfig
    | FontAwesomeConfig
    | HeroiconsConfig
    | TablerIconsConfig
    | NoVariantConfig;

export interface Config {
    /**
     * Global repository. Use as default for icons which don't specify one.
     */
    repository?: RepositoryName;

    /**
     * Default output folder for icons
     */
    output?: string;

    icons: IconConfig[];
}

export type LoadAndParseIconInputsFunc = (pathToInputFile: string) => Promise<IconInput[]>;
