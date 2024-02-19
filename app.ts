#!/usr/bin/env node

import {
    name as appName,
    version as appVersion,
    description as appDescription,
    config as appConfig
} from './package.json';
import { Command } from 'commander';
import * as path from 'path';
import * as figlet from 'figlet';
import * as fs from 'fs';
import { confirm } from '@inquirer/prompts';
import { spawn } from 'child_process';


class ScriptRunner {
    running: boolean;
    program: Command;
    absoluteFilePath: string;
    banner: string;
    hideBanner: boolean;
    bannerFont: figlet.Options;

    defaultFont: figlet.Fonts = 'Pagga';

    constructor() {
        this.program = new Command();
        this.running = true;

        this.program
            .name('npmss')
            .version(appVersion)
            .description(appDescription)
            .option(appConfig.cliOptions.file.option, appConfig.cliOptions.file.description)
            .option(appConfig.cliOptions.banner.option, appConfig.cliOptions.banner.description)
            .option(appConfig.cliOptions.hideBanner.option, appConfig.cliOptions.hideBanner.description)
            .option(appConfig.cliOptions.bannerFont.option, appConfig.cliOptions.bannerFont.description)
            .parse(process.argv);

        const options = this.program.opts();
        const filePath = options.file;
        const banner = options.banner;
        const hideBanner = options.hideBanner;
        const bannerFont = options.bannerFont;

        if (!this.running) {
            process.exit(1);
        }
        if (!filePath) {
            console.error(appConfig.errorMessages.filePathArgMissing);
            process.exit(1);
        }

        // Resolve the absolute path to the file
        this.absoluteFilePath = path.resolve(filePath);
        this.banner = banner ?? appName;
        this.hideBanner = !!hideBanner;
        this.bannerFont = {
            font: bannerFont ?? this.defaultFont
        };
    }

    public async runProgram(): Promise<void> {
        if (!this.hideBanner) {
            console.log(figlet.textSync(this.banner, this.bannerFont));
            console.log(); // Put some spacing between the title and output
        }

        if (!fs.existsSync(this.absoluteFilePath)) {
            this.running = false;
            console.error(`${appConfig.errorMessages.fileNotFound} ${this.absoluteFilePath}`);
            process.exit(1);
        }

        await this.selectAndRunScript();

        console.log('Goodbye!');
    }

    private async selectAndRunScript(): Promise<void> {
        const { default: autocomplete } = await import(
            "inquirer-autocomplete-standalone"
        );

        const packageData = JSON.parse(fs.readFileSync(this.absoluteFilePath, 'utf8'));
        const scripts = packageData.scripts;

        if (!scripts) {
            this.running = false;
            console.log(appConfig.errorMessages.noScriptsFound);
            process.exit(1);
        }

        // Get the directory of the package.json file
        const packageDir = path.dirname(this.absoluteFilePath);
        // Change the current working directory to the package directory
        process.chdir(packageDir);

        const choices = Object.entries(scripts)
            .map(([key, value]) => ({
                name: key,
                value: value as string,
                description: value as string})
            );

        while (this.running) {
            const answers = await autocomplete({
                    message: 'Select a script to run:',
                    source: async (input: string | undefined) => {
                        return await this.searchScripts(choices, input);
                    }
            });

            const selectedScript = choices.find(s => s.value == answers);

            if (!selectedScript){
                this.running = false;
                return;
            }
            await this.runScript(selectedScript.name).then(async () => {
                // Ask the user if they want to continue
                const continueAnswer = await confirm(
                    {
                        message: 'Do you want to run another script?',
                        default: true
                    },
                );

                if (!continueAnswer) {
                    this.running = false; // Exit the loop if the user chooses not to continue
                    process.exit(1);
                }
            });
        }
    }

    private async searchScripts(choices: {
        name: string;
        description: string;
        value: string
    }[], input: string = ''): Promise<{
        name: string;
        description: string;
        value: string;
    }[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const results = choices.filter((s) =>
                    s.name.toLowerCase().includes(input.toLowerCase())
                );

                const all = results.map((r) => ({
                    value: r.value,
                    name: r.name,
                    description: r.description
                }));

                resolve(all);
            }, 300 + 30);
        });
    }

    private async runScript(scriptName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const child = spawn('npm', [`run ${scriptName}`], {
                stdio: 'inherit', // This line makes the child process use the same stdio as the parent.
                shell: true
            });

            child.on('error', (error) => {
                console.error(`Error starting script: ${error.message}`);
                reject(error);
            });

            child.on('exit', (code, signal) => {
                if (code === 0) {
                    console.log(`Script exited successfully.`);
                    resolve();
                } else {
                    console.error(`Script exited with code ${code} and signal ${signal}`);
                    reject(new Error(`Script exited with code ${code} and signal ${signal}`));
                }
            });
        });
    }
}


try {
    const runner = new ScriptRunner();
    // noinspection JSIgnoredPromiseFromCall
    runner.runProgram();
}
catch (e) {
    console.error(e);
    process.exit(1);
}
