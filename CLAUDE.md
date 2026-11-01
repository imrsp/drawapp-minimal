# Project Guide

## Overview

`drawapp-minimal` is an Electron desktop diagram editor developed as a single repository. The editor source is in `drawio/`, which is an ordinary directory tracked with the rest of the project. Builds use the checked-out working tree and do not synchronize with another repository.

## Commands

```sh
npm install
npm start
npm test
```

For an unsigned macOS app on Apple Silicon:

```sh
DRAWIO_UNSIGNED=true CSC_IDENTITY_AUTO_DISCOVERY=false npm run build:mac
```

All packaging commands write to `dist/` and use `--publish never`.

## Structure

- `src/main/`: Electron main process and preload code.
- `src/test/`: Node.js tests.
- `drawio/src/main/webapp/`: editor UI and client code.
- `build/`: packaging hooks and platform resources.
- `electron-builder-*.json`: platform packaging settings.
- `doc/`: development and local build notes.

Preserve upstream copyright and license notices when editing imported editor code. Component-level licenses are kept with their respective sources.
