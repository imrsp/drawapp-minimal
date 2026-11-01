# drawapp-minimal

**drawapp-minimal is an unofficial, simplified fork of [draw.io](https://github.com/jgraph/drawio), packaged as an Electron desktop app and intended as a customizable foundation for developers.** Use it to build diagramming tools for a particular domain, with focused workflows, terminology, shapes, templates, and UI.

This repository keeps the full editor source in `drawio/` alongside the Electron shell in `src/`. It is maintained as a standalone codebase: `drawio/` is not a submodule, and development or builds do not fetch or overwrite source from upstream.

## Why this fork

The goal is to make the general-purpose draw.io editor a leaner base that developers can adapt into specialized flowchart and chart-making software. This repository is not just a packaged copy of the upstream desktop app; the editor and desktop integration are developed together here.

The embedded editor is based on draw.io **32.6.9**, the last upstream version this project adopted under Apache License 2.0. Upstream changed the license for subsequent releases starting with **31.5.2**; this project therefore keeps that Apache-licensed codebase and does not incorporate later upstream editor versions. The upstream project and its current licensing information are available at [jgraph/drawio](https://github.com/jgraph/drawio).

## Get started

### Requirements

- Node.js 22.12 or later
- npm

### Run from source

```sh
npm install
npm start
```

Run `npm test` to execute the Node.js test suite. See [DEVELOPMENT.md](DEVELOPMENT.md) for repository structure and development notes.

## Build

Build commands write local artifacts to `dist/` and do not publish them:

```sh
# macOS app for the current architecture
DRAWIO_UNSIGNED=true CSC_IDENTITY_AUTO_DISCOVERY=false npm run build:mac

# Other targets
npm run build:win
npm run build:win-arm64
npm run build:linux
npm run build:appx
npm run build:snap
```

Windows signing and macOS signing/notarization require your own credentials. The macOS app built without a Developer ID certificate is ad-hoc signed and may require clearing quarantine when moved to another Mac. More packaging notes are in [doc/BUILDING_FOR_PERSONAL_USE.md](doc/BUILDING_FOR_PERSONAL_USE.md).

## Licensing and attribution

The Electron desktop shell and project-specific code are licensed under Apache-2.0; see [LICENSE](LICENSE). The embedded draw.io source is retained under its upstream Apache License 2.0 terms; see [drawio/LICENSE](drawio/LICENSE). Third-party components and assets may have separate terms, so retain and review the license and attribution files alongside the components, especially the licenses in `drawio/src/main/webapp/img/`, `shapes/`, `stencils/`, and `templates/`.

This is an unofficial fork and is not affiliated with, endorsed by, or sponsored by draw.io or its maintainers. The draw.io name and marks identify the upstream project only; this project's branding and icons are separate.
