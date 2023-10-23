const inquirerPromise = import('inquirer');
import * as fs from 'fs';
import { selectAndRunScript, DEFAULTS } from '../dist/app.js';
import { exec } from 'child_process';


describe('NPM Script Selector', async () => {

    const inquirer = await inquirerPromise;

    describe('selectAndRunScript', () => {
        // Create spies to mock external functions
        let fsReadFileSyncSpy;
        let inquirerPromptSpy;
        let execSpy;

        beforeEach(() => {
            // Mock the external functions
            fsReadFileSyncSpy = spyOn(fs, 'readFileSync');
            inquirerPromptSpy = spyOn(inquirer, 'prompt');
            execSpy = spyOn(exec, 'exec');
        });

        it('should run a selected script', async () => {
            // Mock the data returned by fs.readFileSync
            const packageData = {
                scripts: {
                    script1: 'echo script1',
                    script2: 'echo script2',
                },
            };

            // Mock the inquirer response
            inquirerPromptSpy.and.resolveTo({selectedScript: 'script1'});

            // Mock the exec callback
            execSpy.and.callFake((command, callback) => {
                callback(null, 'Script output', '');
            });

            await selectAndRunScript('package.json');

            // Expectations
            expect(fsReadFileSyncSpy).toHaveBeenCalledWith('package.json', 'utf8');
            expect(inquirerPromptSpy).toHaveBeenCalledWith([
                {
                    type: 'list',
                    name: 'selectedScript',
                    message: 'Select a script to run:',
                    choices: ['script1', 'script2'],
                },
            ]);
            expect(execSpy).toHaveBeenCalledWith('npm run script1', jasmine.any(Function));
        });

        it('should handle an error when running the script', async () => {
            // Mock the data returned by fs.readFileSync
            const packageData = {
                scripts: {
                    script1: 'echo script1',
                },
            };

            // Mock the inquirer response
            inquirerPromptSpy.and.resolveTo({selectedScript: 'script1'});

            // Mock the exec callback to simulate an error
            execSpy.and.callFake((command, callback) => {
                callback(new Error('Script execution error'), '', 'Error output');
            });

            // Redirect console.error to a spy to capture the error message
            const consoleErrorSpy = spyOn(console, 'error');

            await selectAndRunScript('package.json');

            // Expectations
            expect(fsReadFileSyncSpy).toHaveBeenCalledWith('package.json', 'utf8');
            expect(inquirerPromptSpy).toHaveBeenCalledWith([
                {
                    type: 'list',
                    name: 'selectedScript',
                    message: 'Select a script to run:',
                    choices: ['script1'],
                },
            ]);
            expect(execSpy).toHaveBeenCalledWith('npm run script1', jasmine.any(Function));
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error running script: Script execution error');
        });

        it('should handle missing "scripts" in package.json', async () => {
            // Mock the data returned by fs.readFileSync with missing "scripts" section
            const packageData = {};

            // Mock the inquirer response (should not be called)
            inquirerPromptSpy.and.callThrough();

            // Mock the exec (should not be called)
            execSpy.and.callThrough();

            // Redirect console.log to a spy to capture the message
            const consoleLogSpy = spyOn(console, 'log');

            await selectAndRunScript('package.json');

            // Expectations
            expect(fsReadFileSyncSpy).toHaveBeenCalledWith('package.json', 'utf8');
            expect(inquirerPromptSpy).not.toHaveBeenCalled();
            expect(execSpy).not.toHaveBeenCalled();
            expect(consoleLogSpy).toHaveBeenCalledWith(DEFAULTS.ErrorMessages.NoScriptsFound);
        });
    });
});
