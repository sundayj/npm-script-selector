# NPM Script Selector - AI Coding Instructions

## Project Overview
This is a TypeScript CLI tool that helps users discover and run npm scripts from package.json files interactively. The entire application is a single-class implementation in [app.ts](../app.ts).

## Architecture & Key Files

### Single-Class Design
The `ScriptRunner` class in [app.ts](../app.ts) handles all functionality:
- **Constructor**: Configures CLI using Commander.js, resolves file paths, and handles banner configuration
- **`runProgram()`**: Entry point that displays banner (configurable via figlet) and initiates script selection
- **`selectAndRunScript()`**: Changes to package directory, presents interactive autocomplete menu, and loops until user exits
- **`runScript()`**: Spawns npm scripts using child_process with `stdio: 'inherit'` to preserve interactive TTY

### Configuration Pattern
All user-facing strings (error messages, CLI options) are centralized in `package.json` under `config` section:
```json
{
  "config": {
    "scriptName": "npmss",
    "cliOptions": { /* option definitions */ },
    "errorMessages": { /* all error strings */ }
  }
}
```
When adding features or changing messages, always update `package.json` config first, then reference via `appConfig` import.

### Build & Distribution
- TypeScript compiles to `dist/` directory (configured in [tsconfig.json](../tsconfig.json))
- Entry point is `dist/app.js` with shebang `#!/usr/bin/env node`
- Binary name `npmss` defined in `package.json` bin field
- Module system: Node16 (ES modules with CommonJS interop)

## Development Workflows

### Essential Commands
```bash
npm run build          # Compile TypeScript to dist/
npm test               # Run Jasmine specs from spec/
npm run devstart       # Build and run with -h flag
npm run devStartWithFile # Build and run with test package.json path
```

### Testing with Jasmine
Tests are in [spec/app.spec.mjs](../spec/app.spec.mjs) using ES module syntax (`.mjs`).
- Jasmine config: [spec/support/jasmine.json](../spec/support/jasmine.json)
- Tests mock fs.readFileSync, inquirer prompts, and exec calls
- Run `npm test` to execute all specs

### Local Development Pattern
The `devStartWithFile` script uses an absolute Windows path - update with your local path when testing:
```json
"devStartWithFile": "npm run build && node ./dist/app.js -f C:\\Users\\justi\\npm-script-selector\\package.json"
```

## Project Conventions

### No Default Exports
All imports use named imports from package.json:
```typescript
import { name as appName, version, config as appConfig } from './package.json';
```

### Path Handling
Always resolve absolute paths using `path.resolve()` before file operations:
```typescript
this.absoluteFilePath = path.resolve(filePath);
```
Then change working directory to package location: `process.chdir(packageDir)`

### Error Handling Pattern
1. Check for error condition
2. Set `this.running = false`
3. Log error using `appConfig.errorMessages.*`
4. Call `process.exit(1)`

### Async/Promise Pattern
The tool uses async/await extensively:
- Dynamic imports for inquirer-autocomplete: `const { default: autocomplete } = await import(...)`
- Script execution returns Promise that resolves/rejects based on child process exit code
- Script search includes artificial 330ms delay for UX smoothness

### CLI Option Handling
Commander.js options are defined from `package.json` config. Four main options:
- `-f, --file`: Path to package.json (required)
- `-b, --banner`: Custom banner text (replaces "npm-script-selector")
- `-hb, --hide-banner`: Suppress banner entirely
- `-bf, --banner-font`: Figlet font name (default: "Pagga")

## Integration Points

### External Dependencies
- **figlet**: ASCII art banner generation - font names defined in DefinitelyTyped
- **commander**: CLI argument parsing
- **@inquirer/prompts**: Confirmation prompts
- **inquirer-autocomplete-standalone**: Fuzzy search script selection
- **child_process.spawn**: Script execution with shell and inherited stdio

### Process Management
Scripts run via `spawn('npm', ['run ${scriptName}'], { stdio: 'inherit', shell: true })`. The `stdio: 'inherit'` preserves TTY for interactive scripts (webpack dev server, test watchers, etc.).

## Common Tasks

### Adding New CLI Options
1. Add option definition to `package.json` under `config.cliOptions`
2. Add `.option()` call in ScriptRunner constructor using config
3. Read option value from `this.program.opts()`
4. Add validation/processing logic in constructor

### Modifying Banner Behavior
Banner configuration is in constructor. Three states:
- Default: Shows figlet banner with `appName` and `defaultFont` ("Pagga")
- Custom: User provides `--banner` and/or `--banner-font`
- Hidden: `--hide-banner` flag skips banner entirely

### Changing Script Execution
The `runScript()` method uses Promise wrapper around spawn. To modify:
- Script runs in package directory (set via `process.chdir()` in `selectAndRunScript()`)
- Exit code 0 = success, anything else = failure
- Stdout/stderr automatically piped to parent due to `stdio: 'inherit'`

## Deployment & Publishing

### NPM Publishing Workflow
1. Update version in `package.json` following semver
2. Run `npm run build` to compile TypeScript to dist/
3. Test locally: `npm link` then `npmss -f /path/to/test/package.json`
4. Publish: `npm publish`

### Pre-Publish Checklist
- Ensure `dist/app.js` has shebang: `#!/usr/bin/env node`
- Verify tsconfig compiles to `dist/` directory
- Test CLI works: `node dist/app.js -h`
- Binary name `npmss` properly mapped in package.json `bin` field
- Module system set to Node16 for ES module support

### Distribution Files
The package includes:
- `dist/` - Compiled JavaScript and source maps
- `app.ts` - Source TypeScript (for reference)
- `package.json` - Module manifest with config section
- `README.md` - User documentation
- `tsconfig.json` - TypeScript configuration

Files excluded via `.gitignore`:
- `node_modules/`, `.idea/`, coverage reports, logs
- Test files in `spec/` are included for transparency

## Troubleshooting

### TypeScript Compilation Issues
**Problem**: Module resolution errors when importing from package.json
**Solution**: Ensure `resolveJsonModule: true` and `esModuleInterop: true` in tsconfig.json

**Problem**: "Cannot find module" at runtime
**Solution**: Use Node16 module system, not CommonJS or ES2015. Check `module: "Node16"` in tsconfig.json

### CLI Execution Issues
**Problem**: CLI doesn't run after `npm link` or global install
**Solution**: 
1. Verify shebang at top of `dist/app.js`: `#!/usr/bin/env node`
2. Check file has execute permissions on Unix systems
3. Confirm `bin` field in package.json points to `dist/app.js`

**Problem**: "Cannot find package.json" errors
**Solution**: Use absolute paths or ensure current directory is correct. Path resolution uses `path.resolve()` which is relative to execution context, not script location.

### Script Execution Issues
**Problem**: Interactive scripts (webpack dev server, jest --watch) don't work
**Solution**: This should work - verify `stdio: 'inherit'` is set in spawn options. This preserves TTY for interactive processes.

**Problem**: Script output not showing
**Solution**: Check `stdio: 'inherit'` in spawn call. Without this, stdout/stderr won't pipe to parent process.

**Problem**: Script runs in wrong directory
**Solution**: Verify `process.chdir(packageDir)` is called before spawn. The tool intentionally changes CWD to package location.

### Test Failures
**Problem**: Tests import from `../dist/app.js` but file doesn't exist
**Solution**: Run `npm run build` before `npm test`. Tests use compiled output, not source TS files.

**Problem**: Jasmine can't find test specs
**Solution**: Check spec files use `.mjs` extension (not `.js`) and match pattern in [spec/support/jasmine.json](../spec/support/jasmine.json): `**/*[sS]pec.?(m)js`

## Additional Patterns

### IDE Inspection Comments
The codebase uses WebStorm/IntelliJ inspection suppressions:
```typescript
// noinspection JSIgnoredPromiseFromCall
runner.runProgram();
```
This is intentional - the main entry point launches async without await since it's the program root.

### Working Directory Management
Critical pattern for multi-project support:
1. Accept file path from CLI (can be relative or absolute)
2. Convert to absolute: `path.resolve(filePath)` (L56 in app.ts)
3. Extract directory: `path.dirname(this.absoluteFilePath)` (L96)
4. Change CWD: `process.chdir(packageDir)` (L98)
5. Run npm scripts in that context

This ensures scripts execute in the correct project directory, not where `npmss` was invoked from.

### Dynamic Imports for ES Modules
Inquirer-autocomplete uses dynamic import to handle default exports from ES modules:
```typescript
const { default: autocomplete } = await import("inquirer-autocomplete-standalone");
```
This pattern is necessary when importing packages that don't provide named exports in Node16 module system.

### UX Timing Patterns
The search function includes `setTimeout(..., 300 + 30)` - the 330ms delay is intentional for UX smoothness, preventing overly rapid UI updates during fuzzy search filtering.

### Test Mocking Strategy
Tests in [spec/app.spec.mjs](../spec/app.spec.mjs) mock at the API boundary:
- `fs.readFileSync` for file I/O
- `inquirer.prompt` for user input
- `exec` callback for process execution

This approach tests business logic without filesystem or process dependencies. Note: Tests are currently outdated and reference old function exports that don't exist in current implementation.
