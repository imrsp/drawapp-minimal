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
- `drawio/src/main/webapp/`: embedded diagram editor, UI, assets, and translations.
- `config/`: application settings, original branding assets, and project-owned library/template sources. Follow [Customization](CUSTOMIZATION.md) for placement rules.
- `scripts/`: build orchestration and icon generation.
- `build/`: Electron packaging hooks, entitlements, and platform resources.
- `.build/`: ignored generated icons and temporary electron-builder configuration. Keep only generated build output here.
- `electron-builder-*.json`: platform-specific packaging templates.
- `docs/`: project-owned documentation, indexed in this directory's `README.md`.

## Packaging

Build scripts use the local source tree and write artifacts to `dist/`. They use `--publish never`; publishing and signing are separate release decisions and require project-owned credentials. See [Building](BUILDING.md) and [Customization](CUSTOMIZATION.md).
