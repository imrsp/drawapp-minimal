# Development

This repository is developed as one project. `drawio/` contains the editor source directly; do not initialize it as a submodule or run a script that overwrites its version or source from another repository.

## Setup

Install Node.js 22.12 or newer, then run:

```sh
npm install
npm start
```

Set `DRAWIO_ENV=dev` to open DevTools when launching from source. Run `npm test` for the Node.js test suite.

## Main areas

- `src/main/`: Electron main process, preload bridge, CLI argument handling, window state, and file operations.
- `drawio/src/main/webapp/`: diagram editor, UI, assets, and translations.
- `build/`: Electron packaging hooks, entitlements, and platform resources.
- `electron-builder-*.json`: platform packaging configuration.
- `doc/BUILDING_FOR_PERSONAL_USE.md`: local packaging notes.

## Packaging

Build scripts use the local source tree and write artifacts to `dist/`. They use `--publish never`; publishing and signing are separate release decisions and require project-owned credentials.
