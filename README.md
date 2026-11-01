# drawapp-minimal

An independently maintained Electron desktop diagram editor. The desktop shell lives in `src/`; the editor source is developed in the ordinary `drawio/` directory as part of this repository. It is not a Git submodule and this project does not fetch or sync from an upstream repository during development or builds.

The editor was initially based on the [draw.io project](https://github.com/jgraph/drawio). Upstream copyright notices and license files are retained. The application branding and icons are specific to drawapp-minimal. This project is unofficial and is not affiliated with or endorsed by the upstream maintainers.

## Requirements

- Node.js 22.12 or later
- npm

## Develop

```sh
npm install
npm start
```

Run the test suite with `npm test`. The editor code and desktop integration are developed together in this repository.

## Build

Build commands create local artifacts under `dist/` and never publish them:

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

Windows signing and macOS signing/notarization require your own credentials. The `drawapp-minimal.app` produced without a Developer ID certificate is ad-hoc signed and may require clearing quarantine when moved to another Mac.

## License

The desktop project is licensed under Apache-2.0. The editor and bundled third-party components retain their own copyright and license notices; see `LICENSE`, `drawio/LICENSE`, and component-level license files.
