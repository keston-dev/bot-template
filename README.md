# bot-template

A simple-to-use template I use for my bots.

## Features

- Support for all application commands (msg, usr, chatInput)
- Permissions system
- DB connection with mongodb

### installation

Clone the repository

```bash
git clone https://github.com/keston-dev/bot-template
```

To install dependencies:

```bash
bun install
```

To run:

```bash
bun dev
```

### ENV

See `.example.env`

### How To Use

Review the included `*.example.ts` files, as well as the completed example commands `ping`, `codeblock`, and `getId`.
All values have been documented.

### Loading/unloading commands

Done via the `bun load-commands` and `bun delete-commands` respectively. (or the docker compose variants, `bun docker:load-commands` and `bun docker:delete-commands`).
Done separately to avoid spamming the API by loading every refresh, **only call when adding new commands/editing the OPTIONS (i.e. description, subcommands, etc) of existing ones, not the execute blocks.**
