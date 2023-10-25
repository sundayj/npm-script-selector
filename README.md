![License](https://img.shields.io/badge/license-MIT-lightgrey?label=License&link=https%3A%2F%2Fraw.githubusercontent.com%2Fsundayj%2FDevSculptor%2Fmain%2FLICENSE.txt)
![npm](https://img.shields.io/npm/v/npm-script-selector?link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fnpm-script-selector)
![npm](https://img.shields.io/npm/dt/npm-script-selector?label=NPM%20Downloads&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fnpm-script-selector)
![Donate to this project using Buy Me A Coffee](https://img.shields.io/badge/Buy_me_a_coffee-donate-yellow?label=Buy%20me%20a%20coffee!&link=https%3A%2F%2Fwww.buymeacoffee.com%2Fjustinsunday)
[![wakatime](https://wakatime.com/badge/user/8161045b-e258-4932-ba45-d84d199eb2f2/project/018b4d38-ec4c-4311-b4a9-19f37f6b7efd.svg)](https://wakatime.com/badge/user/8161045b-e258-4932-ba45-d84d199eb2f2/project/018b4d38-ec4c-4311-b4a9-19f37f6b7efd)



```text
░█▀█░█▀█░█▄█░░░░░█▀▀░█▀▀░█▀▄░▀█▀░█▀█░▀█▀░░░░░█▀▀░█▀▀░█░░░█▀▀░█▀▀░▀█▀░█▀█░█▀▄
░█░█░█▀▀░█░█░▄▄▄░▀▀█░█░░░█▀▄░░█░░█▀▀░░█░░▄▄▄░▀▀█░█▀▀░█░░░█▀▀░█░░░░█░░█░█░█▀▄
░▀░▀░▀░░░▀░▀░░░░░▀▀▀░▀▀▀░▀░▀░▀▀▀░▀░░░░▀░░░░░░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀░░▀░░▀▀▀░▀░▀
```

**By**: Justin Sunday<br>
**GitHub**: <a href="https://github.com/sundayj/npm-script-selector" target="_blank" rel="noopener noreferrer" title="sundayj/npm-script-selector">sundayj/npm-script-selector</a><br>
**Website**: <a href="https://jlsunday.com" target="_blank" rel="noopener noreferrer" title="JLSunday.com">JLSunday.com</a><br>
**NPM**: <a href="https://www.npmjs.com/package/npm-script-selector" target="_blank" rel="noopener noreferrer" title="npm-script-selector">npm-script-selector</a><br>

---------------------
# NPM Script Selector

The NPM Script Selector is a CLI tool for discovering and running project scripts within `package.json` files. Have you ever worked on a project that contains so many scripts that you can't always remember the available options? That's what happened to me. I currently contribute to a project with 30+ scripts. I became tired of having to open the package file and/or IDE in order to find and run the needed the scripts, so I created this small CLI.

Currently, you provide the path to the `package.json` file, the NPM Script Selector will then list the available scripts for you, where you can interactively select the one you want. It will then run the script for you within the selected project's directory. I plan to add more functionality in the near future.

Uses `figlet`, `commander`, and `inquirer`.

-------------
## Sponsoring

If you like this package, please consider sponsoring:

<a href="https://www.buymeacoffee.com/justinsunday" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174">
</a>

---------------------------
## Feature Requests or Bugs

For feature requests, or bugs, please create an issue [here](https://github.com/sundayj/npm-script-selector/issues)

-----------
## Features

- Accepts path to a `package.json` as an input.
- Lists scripts contained within that `package.json`.
- Allows interactive selection of script.
- Prints output from selected script.
- Asks if you would like to run another script when the current one is finished.

-------------------
### Future Features

- [ ] - Allow subcommands/options to be passed to selected scripts.
- [ ] - Option to search for `package.json` files within a directory.
- [ ] - Option to store the paths of frequently used files.
- [ ] - Option to run the selected scripts in a new window.
- [ ] - React GUI

-------------------------
## Installation and Usage

Install NPM Script Selector with npm:

```bash
  npm i -g npm-script-selector
```

To run:

```bash
> npmss -f path/to/desired/package.json
```

For Help:

```bash
> npmss -h

Usage: npmss [options]

A CLI for finding npm scripts within a `package.json` and allowing a user to run them from the command line.

Options:
  -V, --version       output the version number
  -f, --file <value>  Path to the package.json.
  -h, --help          display help for command

```
Path can be relative to current directory, or absolute.

![NPM Script Selector Screenshot 20231025](assets/npm-script-selector-screenshot-20231025.png)

---------------
## Contributing

Bug reports and pull requests are welcome on GitHub at <a href="https://github.com/sundayj/npm-script-selector" target="_blank" rel="noopener noreferrer" title="sundayj/npm-script-selector">sundayj/npm-script-selector</a>. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.

----------
## License

The package is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
