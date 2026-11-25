# Application customization

Edit [`config/app.json`](../config/app.json) to change the app's branding and packaging metadata from one place. There is no separate local branding override: the values in this file are the values used for development and packaging.

## Where project custom files go

Keep every new project-specific customization setting and source file under `config/`. Use `app.json` for settings, `config/branding/` for original brand images, `config/mxlib/` for custom shape libraries, and `config/templates/` for custom template sources. Do not add project-specific source assets to the embedded `drawio/` tree or the packaging `build/` directory. Build-generated platform icons and temporary packager files belong in the ignored `.build/` directory.

## Branding fields

- `appName`: product name in the window, editor, About views, and installers.
- `description`: app description; `null` or an omitted value derives it from `appName`.
- `uiVersion`: optional version shown in the app UI. The actual product version still comes from `package.json`.
- `logoUrl`: path relative to `config/` to the original PNG or SVG, for example `branding/logo.png`. This same source is used by the startup splash, editor header, About dialog, and generated platform icons. Bundled logos are required for packaged icons; remote URLs can only be used for runtime UI.
- `repositoryUrl` and `repositoryLabel`: About view link destination and label.
- `copyright`: About view and package copyright; `null` derives it from the app name and current year.

## Shape libraries

Use the top-level `libraries` setting in `config/app.json` to manage shape libraries included in desktop builds:

```json
"libraries": {
  "builtIn": {
    "included": ["general", "uml", "er", "bpmn", "flowchart", "basic", "arrows2"],
    "default": ["general", "uml", "er", "bpmn", "flowchart", "basic", "arrows2"]
  },
  "custom": ["company.xml"]
}
```

`builtIn.included` selects which built-in library resources ship in the app and remain available from More Shapes. `builtIn.default` selects which included libraries are shown by default. A default library must also be included. Library IDs are the sidebar IDs used by the embedded draw.io editor. These lists apply to all desktop build targets.

Custom libraries use draw.io's native `.xml` format: the document has an `<mxlibrary>` root containing a JSON array of entries. Create one in the editor with **File > New Library**, add shapes, groups, or images, and save/export it. You can also import an existing `.xml` library with **File > Open Library**. Copy the file into `config/mxlib/`, then add its path relative to that directory to `libraries.custom`. For example, `"custom": ["company.xml"]` refers to `config/mxlib/company.xml`; subdirectories are supported. Registered libraries are loaded automatically when the desktop app starts and are included in every build target. Builds check that each listed file exists and is a valid `mxlibrary` document.

Build the app using the existing platform command, such as `npm run build:linux` or `npm run build:win`. The complete XML format and editor workflow are documented by [draw.io](https://www.drawio.com/docs/reference/format-custom-shape-library/) and [the custom library guide](https://www.drawio.com/docs/manual/advanced/custom-shape-libraries/).

## Packaging fields

The `packaging` object in the same file controls the app ID, `packageName`, executable name, author, output directory, artifact naming, platform categories, AppX identity and publisher, and file associations. `packageName` is the directory name Electron uses for per-user settings under the platform's app data directory (for example, `~/Library/Application Support/<packageName>` on macOS). Signing, target architecture, and other platform-specific build mechanics remain in the `electron-builder-*.json` files; those files are build templates and are populated from `app.json` by `scripts/build.js`.

## Icons

Install dependencies once, set `logoUrl` to a bundled source image, then run any `npm run build:*` command. [Sharp](https://sharp.pixelplumbing.com/) resizes the original into the PNG sizes required by Linux and AppX; the build script also emits Windows ICO and, when building on macOS, macOS ICNS formats. Generated files and temporary builder configuration live in `.build/`, which is ignored by Git. To regenerate icons without packaging, run `npm run generate:icons`.

Changing `app.json` applies when the app is restarted or rebuilt. The editor's own `Extras > Configuration` settings are separate per-user preferences and are deliberately not used as product defaults here. See [Versioning](VERSIONING.md) for the package release version.
