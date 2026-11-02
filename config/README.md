# Branding configuration

`branding.json` is the default branding configuration for this fork. Edit it to customize the name and links in the application UI. `uiVersion` overrides only the version shown inside the software (the About menu and About dialog); it does not change package/build versions or the command-line version.

## Local overrides

For local development overrides, copy `branding.json` to `branding.local.json` and edit that file. It is ignored by Git and takes precedence over `branding.json`. The packaging configs explicitly include it when it exists. For a reproducible distributable, put the intended values in `branding.json` before building.

## Fields

- `appName`: application name in the window, editor, native and in-app About views, and packaged product display name when using the `npm run build:*` commands.
- `description`: application description; when omitted or `null`, it is generated from `appName`.
- `uiVersion`: optional string for in-app version displays; `null` uses the packaged version.
- `logoUrl`: optional absolute HTTP(S) URL or a bundled `images/...png` / `images/...svg` asset path for the application logo. `null` uses built-in logos. The configured image replaces app-brand marks in the splash screen, editor header, app logo placeholders and About dialog. The image loads at runtime; a failure falls back to the bundled Electron logo. Square or transparent images work best.
- `repositoryUrl` and `repositoryLabel`: destination and accessible label for the repository link.
- `copyright`: native About panel copyright line; `null` derives it from `appName`.

Branding URLs should point to stable, publicly accessible image assets. Remote logos are loaded by the renderer and require network access. The packaged app icon and taskbar/dock icon remain build-time platform icons. The app name changes the product display name during builds, but executable names, package IDs, file associations, and CLI output remain stable. The version field affects software UI only and does not change package/build versions or the command-line version.

Restart the app after editing either JSON file. Invalid JSON or an invalid field falls back to the corresponding default value.
