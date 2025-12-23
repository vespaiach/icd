#!/usr/bin/env node

import { Command } from 'commander';
import type { CommandOptions } from './types';
import { loadAndParseIconInputsFromFile } from './utils';

const program = new Command();

program
    .option('-c, --config-file [configFile]', 'Path to input file', './icons.input.json')
    .option('-v, --verbose', 'Enable verbose logging', false)
    .action(async (options: CommandOptions) => {
        const showError = (error: unknown) => {
            if (options.verbose) {
                const message = error instanceof Error ? error.message : String(error);
                console.error(message);
            }
        };

        try {
            const icons = await loadAndParseIconInputsFromFile(options.configFile);
            icons.forEach(async (icon) => {
                try {
                    await icon.download();
                } catch (error) {
                    showError(error);
                }
            });
        } catch (error) {
            showError(error);
        }
    });

program.parse(process.argv);
