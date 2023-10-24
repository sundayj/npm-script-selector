#!/usr/bin/env node

import { name as appName, version as appVersion, description as appDescription, config as appConfig } from './package.json';
import { Command } from 'commander';
import * as path from 'path';
import * as figlet from 'figlet';
import * as fs from 'fs';
import { select } from '@inquirer/prompts';
import { confirm } from '@inquirer/prompts';
import { exec } from 'child_process';


class ScriptRunner {
    running: boolean;
    program: Command;
    absoluteFilePath: string;

    constructor() {
        this.program = new Command();
        this.running = true;

        this.program
            .version(appVersion)
            .description(appDescription)
            .option(appConfig.cliOptions.file.option, appConfig.cliOptions.file.description)
            .parse(process.argv);

        const options = this.program.opts();
        const filePath = options.file;

        if (!this.running) {
            process.exit(1);
        }
        if (!filePath) {
            console.error(appConfig.errorMessages.filePathArgMissing);
            process.exit(1);
        }

        // Resolve the absolute path to the file
        this.absoluteFilePath = path.resolve(filePath);
    }

    public async runProgram(): Promise<void> {
        console.log(figlet.textSync(appName, { font: 'Pagga' }));
        console.log(); // Put some spacing between the title and output

        if (!fs.existsSync(this.absoluteFilePath)) {
            this.running = false;
            console.error(`${appConfig.errorMessages.fileNotFound} ${this.absoluteFilePath}`);
            process.exit(1);
        }

        await this.selectAndRunScript();

        console.log('Goodbye!');
    }

    private async selectAndRunScript(): Promise<void> {
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

        const choices = Object.entries(scripts).map(([key, value]) => ({name: key, value: value as string, description: value as string}));

        while (this.running) {
            const answers = await select(
                {
                    message: 'Select a script to run:',
                    choices
                },
            );

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

    private async runScript(scriptName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            exec(`npm run ${scriptName}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error running script: ${error.message}`);
                    reject(error);
                } else {
                    console.log(`Script output:\n${stdout}`);
                    resolve();
                }
            });
        });
    }
}


try {
    const runner = new ScriptRunner();
    runner.runProgram();
}
catch (e) {
    console.error(e);
    process.exit(1);
}
