import Ajv from 'ajv';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { IconInput } from './IconInput';
import schema from './icons.input.schema.json';
import repositoryPresets from './presets.yaml';
import type { Config, LoadAndParseIconInputsFunc, RepositoryConfig } from './types';

interface Presets {
    repositories: RepositoryConfig[];
}

const ajv = new Ajv({ strict: false, validateSchema: false });
const validate = ajv.compile(schema);

// Convert array of repositories to a map for faster lookup
const presets = repositoryPresets as Presets;
const repositoryMap = new Map<string, RepositoryConfig>();
for (const repo of presets.repositories) {
    repositoryMap.set(repo.name, repo);
}

export const loadAndParseIconInputsFromFile: LoadAndParseIconInputsFunc = async (path) => {
    const absolutePath = resolve(process.cwd(), path);
    const fileContent = await readFile(absolutePath, 'utf-8');
    const data = JSON.parse(fileContent) as Config;

    if (!validate(data)) {
        console.log('Validation errors:', validate.errors);
        throw new Error(`Invalid icons input file: ${ajv.errorsText(validate.errors)}`);
    }

    const iconConfigs: IconInput[] = [];

    for (const icon of data.icons) {
        const repository = repositoryMap.get(icon.repository);
        if (!repository) {
            throw new Error(`Unknown repository preset: ${icon.repository}`);
        }

        const output = icon.output || data.output || '.';
        const filename = icon.saveAs || santizeFilename(icon.name);

        iconConfigs.push(
            new IconInput({
                output,
                name: icon.name,
                filename,
                variant: icon.variant,
                size: icon.size,
                repository,
                overwrite: icon.overwrite,
                tsxTransform: icon.tsxTransform,
            }),
        );
    }

    return iconConfigs;
};

export const santizeFilename = (rawFilename: string): string => {
    return rawFilename
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '-');
};

export const logError = (data: { icon?: IconInput, method?: string, error: Error }) => {
    // TODO: Implement proper error reporting/logging
    console.warn(data.error.message);
};