# Application customization

Edit [`config/app.json`](../config/app.json) to change the app's branding and packaging metadata from one place. There is no separate local branding override: the values in this file are the values used for development and packaging.

## Where project custom files go

Keep every new project-specific customization setting and source file under `config/`. Use `app.json` for settings, `config/branding/` for original brand images, `config/mxlib/` for custom shape libraries, and `config/templates/` for custom template sources. Do not add project-specific source assets to the embedded `drawio/` tree or the packaging `build/` directory. Build-generated platform icons and temporary packager files belong in the ignored `.build/` directory.

## Branding fields

- `appName`: product name in the window, editor, About views, and installers.
- `description`: app description; `null` or an omitted value derives it from `appName`.
- `uiVersion`: optional version shown in the app UI. The actual product version still comes from `package.json`.
- `logoUrl`: path relative to `config/` to the original PNG or SVG, for example `branding/logo.png`. This same source is used by the startup splash, editor header, About dialog, and generated platform icons. Bundled logos are required for packaged icons; remote URLs can only be used for runtime UI.
- `logoScale`: independent size multipliers for `header`, `about`, and `splash` logos. `1` keeps the current size, `1.25` makes that logo 25% larger, and `0.8` makes it 20% smaller. Each value is limited to `0.25`–`2`; invalid or omitted values use `1`. For example, set `header` to `1.5` to enlarge the top-left editor logo without changing the other locations.
- `repositoryUrl` and `repositoryLabel`: About view link destination and label. Clicking the editor's top-left app logo opens the same `repositoryUrl`.
- `aboutHtml`: optional HTML content inserted in the About dialog between the repository link and copyright. Use a string for language-independent content, or an object keyed by language codes such as `en`, `zh-CN`, plus optional `main` fallback content. Scripts and active content are removed; the combined content is limited to 20,000 characters.
- `copyright`: About view and package copyright; `null` derives it from the app name and current year.

## About dialog customization

The About dialog's content can be customized. The heading and Close controls stay fixed while the content area scrolls. Its elements appear in this order:

| About dialog element | Setting | Behavior |
| --- | --- | --- |
| Heading | `appName` | Uses the localized “About” label followed by the app name. |
| Logo | `logoUrl`, `logoScale.about` | Uses the shared logo image and the About-specific size multiplier. |
| Version | `uiVersion` | Uses this value when set; otherwise uses the product version from `package.json`. |
| Link | `repositoryUrl`, `repositoryLabel` | Sets the destination and visible link text. |
| Custom content | `aboutHtml` | Optional supported HTML inserted below the link and above the copyright. |
| Copyright | `copyright` | Uses this text; `null` generates a default from the current year and app name. |

The “About” and “Close” labels use the editor's current language. A string in `aboutHtml` is used for every language. For localized content, keys should match the editor language (for example `zh-CN`); the base language (such as `zh`) is tried next, followed by `main`. For example:

```json
"aboutHtml": {
  "en": "<p>Diagram tools for the team.</p>",
  "zh-CN": "<p>团队图表工具。</p>",
  "main": "<p>Diagram tools.</p>"
}
```

The custom HTML is intended for presentation content: scripts, event-handler attributes, embedded frames, and unsafe URL schemes are removed. `description` is used for app metadata and the startup screen, but is not shown in the About dialog.

## Shape libraries

Use the top-level `libraries` setting in `config/app.json` to manage shape libraries included in desktop builds:

```json
"libraries": {
  "builtIn": {
    "included": ["general", "misc", "advanced", "uml", "er", "bpmn", "flowchart", "basic", "arrows2"],
    "default": ["general", "misc", "advanced", "uml", "er", "bpmn", "flowchart", "basic", "arrows2"]
  },
  "custom": [
    {"path": "company.xml", "name": "Company Shapes"},
    "network/topology.xml"
  ],
  "customGroupName": "Company Libraries",
  "customLibraryControls": false,
  "moreShapesOrder": ["builtIn", "custom"]
}
```

`builtIn.included` selects which built-in library resources ship in the app and remain available from More Shapes. `builtIn.default` selects which included libraries are shown by default. A default library must also be included. Library IDs are the sidebar IDs used by the embedded draw.io editor. These lists apply to all desktop build targets. The General, Misc, and Advanced palettes are independent IDs; include and default each one separately. For example, setting both arrays to `["general"]` packages and shows only General, while Misc and Advanced remain unavailable.

`moreShapesOrder` controls whether the built-in More Shapes categories or the packaged Custom Libraries category appears first. It must contain `"builtIn"` and `"custom"` exactly once. If omitted, the existing custom-first order is kept. Set it to `["builtIn", "custom"]` to show Standard and the other built-in categories before Custom Libraries. This changes category placement only; each library's More Shapes checkbox and saved visibility preference are independent.

Custom libraries use draw.io's native `.xml` format: the document has an `<mxlibrary>` root containing a JSON array of entries. Create one in the editor with **File > New Library**, add shapes, groups, or images, and save/export it. You can also import an existing `.xml` library with **File > Open Library**. Copy the file into `config/mxlib/`, then add its path relative to that directory to `libraries.custom`. A string such as `"company.xml"` refers to `config/mxlib/company.xml`; subdirectories are supported. An object entry can set a More Shapes label with `{"path": "company.xml", "name": "Company Shapes"}`. String entries remain supported and use the filename without `.xml` as their label. Registered libraries are loaded automatically when the desktop app starts and are included in every build target. Builds check that each listed file exists and is a valid `mxlibrary` document.

Each packaged custom library appears as its own checkbox in **More Shapes > Custom Libraries**. `customGroupName` changes the category heading, and the optional `name` on a custom library entry changes that library's checkbox label. Without these settings the heading is `Custom Libraries` and the label comes from the filename without `.xml`. All packaged custom libraries are enabled for a new user. The editor saves each selection in the user's `.drawio-config` settings under `customLibraryVisibility`, keyed by the library's packaged ID. Missing preference entries use the enabled default; saved choices remain authoritative across restarts and language changes. Renaming or moving a library changes its ID and initializes that library to enabled. This setting only controls packaged libraries declared in `libraries.custom`; `builtIn.default` continues to control built-in libraries.

`customLibraryControls` defaults to `false`, so packaged libraries behave like native palettes and their add, edit, and close buttons are hidden. This also makes the packaged library read-only in the editor. Set it to `true` to retain the normal controls for those libraries.

Build the app using the existing platform command, such as `npm run build:linux` or `npm run build:win`. The complete XML format and editor workflow are documented by [draw.io](https://www.drawio.com/docs/reference/format-custom-shape-library/) and [the custom library guide](https://www.drawio.com/docs/manual/advanced/custom-shape-libraries/).

## Packaging fields

The `packaging` object in the same file controls the app ID, `packageName`, executable name, author, output directory, artifact naming, platform categories, AppX identity and publisher, and file associations. `packageName` is the directory name Electron uses for per-user settings under the platform's app data directory (for example, `~/Library/Application Support/<packageName>` on macOS). Signing, target architecture, and other platform-specific build mechanics remain in the `electron-builder-*.json` files; those files are build templates and are populated from `app.json` by `scripts/build.js`.

## Icons

Install dependencies once, set `logoUrl` to a bundled source image, then run any `npm run build:*` command. [Sharp](https://sharp.pixelplumbing.com/) resizes the original into the PNG sizes required by Linux and AppX; the build script also emits Windows ICO and, when building on macOS, macOS ICNS formats. Generated files and temporary builder configuration live in `.build/`, which is ignored by Git. To regenerate icons without packaging, run `npm run generate:icons`.

Changing `app.json` applies when the app is restarted or rebuilt. The editor's own `Extras > Configuration` settings are separate per-user preferences and are deliberately not used as product defaults here. See [Versioning](VERSIONING.md) for the package release version.
