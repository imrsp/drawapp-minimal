# Local builds

The project builds from the working tree, including the editor source in `drawio/`. No upstream checkout, submodule initialization, version synchronization, or network source fetch is part of the build.

## Requirements

Install Node.js 22.12 or later and npm:

```sh
npm install
```

## Run from source

```sh
npm start
```

Set `DRAWIO_ENV=dev` to open DevTools.

## Build a macOS app

On Apple Silicon:

```sh
DRAWIO_UNSIGNED=true CSC_IDENTITY_AUTO_DISCOVERY=false npm run build:mac
```

On Intel Macs, run the equivalent command with `--x64`:

```sh
DRAWIO_UNSIGNED=true CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --config electron-builder-linux-mac.json --mac dir --x64 --publish never
```

The output is placed under `dist/`. Without a Developer ID certificate, the app is ad-hoc signed and not notarized; macOS may require clearing quarantine if the app is moved to another Mac.

Other local packaging commands are listed in `package.json` (`build:win`, `build:win-arm64`, `build:linux`, `build:appx`, and `build:snap`). All build scripts disable publishing.
