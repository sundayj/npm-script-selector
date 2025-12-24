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
