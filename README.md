# drawapp-minimal

An unofficial, customizable Electron desktop diagram editor based on the Apache-2.0-licensed draw.io 32.6.9 source. The editor source is maintained directly in this repository; builds do not fetch or overwrite source from upstream.

## Start

Requirements: Node.js 22.12 or later and npm.

```sh
npm install
npm start
```

## Documentation

All project-specific guidance is indexed in [`docs/README.md`](docs/README.md): setup and development, application customization, local builds, and release versioning. Upstream draw.io documentation remains in `drawio/docs/` and its source subdirectories.

## Build

Platform build commands write artifacts to `dist/` and never publish them. The app name, product metadata, file associations, package IDs, and source logo are managed from [`config/app.json`](config/app.json). Build commands generate temporary platform icons under `.build/`.

```sh
npm run build:mac
npm run build:win
npm run build:win-arm64
npm run build:appx
npm run build:linux
npm run build:snap
```

Signing and notarization need your own credentials. See the [local build guide](docs/BUILDING.md).

## Licensing

The Electron shell and project-specific code are licensed under Apache-2.0; see [LICENSE](LICENSE). The embedded editor source retains its upstream Apache-2.0 terms and notices in `drawio/`. Third-party components and assets can have separate terms; retain their license and attribution files. This project is unofficial and is not affiliated with the draw.io maintainers.
