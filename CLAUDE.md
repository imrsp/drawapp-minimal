# Repository instructions

Start with [`docs/README.md`](docs/README.md) for project-owned guides. Keep new project-specific settings and source assets under `config/`; use `config/app.json` for app branding and packaging metadata. Generated build output belongs in ignored `.build/`. Platform build templates are generated through `scripts/build.js`.

`drawio/` is the embedded editor source, tracked as part of this repository. Do not turn it into a submodule or overwrite it from upstream. Preserve imported copyright and license notices when changing editor code.
