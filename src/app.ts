#!/usr/bin/env node

import { Command } from 'commander';
import figlet from 'figlet';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { exec } from 'child_process';

export const DEFAULTS = {
    ProgramName: 'NPM Script Selector',
    Version: '1.0.5',
    Description: 'A CLI for finding npm scripts within a package and allowing a user to run them from the command line.',
    Options: {
        File: {
            Option: '-f, --file <value>',
            Description: 'Path to the package.json.'
        }
    },
    ErrorMessages: {
        FilePathArgMissing: 'Please provide a path to the package.json file using the -f or --file option.',
        FileNotFound: 'File not found at:',
        NoScriptsFound: 'No "scripts" section found in the package.json file. Did you provide the right package path?',
        ErrorParsingJson: 'Error reading or parsing JSON file:'
    }
}

export async function selectAndRunScript(filePath: string): Promise<void> {
    const packageData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const scripts = packageData.scripts;

    if (!scripts) {
        console.log(DEFAULTS.ErrorMessages.NoScriptsFound);
        return;
    }

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedScript',
            message: 'Select a script to run:',
            choices: Object.keys(scripts),
        },
    ]);

    const selectedScript = answers.selectedScript;

    // Get the directory of the package.json file
    const packageDir = path.dirname(filePath);

    // Change the current working directory to the package directory
    process.chdir(packageDir);

    // Execute the selected script using `npm run`
    exec(`npm run ${selectedScript}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error running script: ${error.message}`);
            return;
        }
        console.log(`Script output:\n${stdout}`);
    });
}

export async function runProgram(filePath: string): Promise<void> {
    console.log(figlet.textSync(DEFAULTS.ProgramName, { font: 'Pagga' }));
    console.log(); // Put some spacing between the title and output

    if (!fs.existsSync(filePath)) {
        console.error(`${DEFAULTS.ErrorMessages.FileNotFound} ${filePath}`);
        process.exit(1);
    }

    let continueRunning = true;

    while (continueRunning) {
        await selectAndRunScript(filePath);

        const answer = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'continue',
                message: 'Do you want to run another script?',
                default: true,
            },
        ]);

        continueRunning = answer.continue;
    }

    console.log('Goodbye!');
}



const program = new Command();

program
    .version(DEFAULTS.Version)
    .description(DEFAULTS.Description)
    .option(DEFAULTS.Options.File.Option, DEFAULTS.Options.File.Description)
    .parse(process.argv);

const options = program.opts();
const filePath = options.file;

if (!filePath) {
    console.error(DEFAULTS.ErrorMessages.FilePathArgMissing);
    process.exit(1);
}

// Resolve the absolute path to the file
const absoluteFilePath = path.resolve(filePath);

runProgram(absoluteFilePath);
