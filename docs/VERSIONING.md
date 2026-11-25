# Versioning

`package.json` is the source of truth for the drawapp-minimal product version.
`package-lock.json` must carry the same root version. Electron reads this value
through `app.getVersion()`, and electron-builder uses it for the packaged app;
the About panel and Help menu display it with a `v` prefix.

Use Semantic Versioning:

- **PATCH** for compatible fixes, such as `1.0.0` → `1.0.1`.
- **MINOR** for compatible features, such as `1.0.0` → `1.1.0`.
- **MAJOR** for changes that break user-facing behavior, files, or settings,
  such as `1.0.0` → `2.0.0`.
- Use prerelease identifiers such as `1.1.0-beta.1` when distributing a test
  build before a release.

From the repository root, run one of:

```sh
npm version patch --no-git-tag-version
npm version minor --no-git-tag-version
npm version major --no-git-tag-version
```

These commands update both `package.json` and `package-lock.json`. Review and
commit those files with the release changes. Create the matching Git tag after
the commit, for example `git tag -a v1.0.1 -m "drawapp-minimal v1.0.1"`.
Build artifacts inherit the package version automatically.

`EditorUi.VERSION` belongs to the embedded diagram editor engine. Keep it
separate from the product version: change it only when updating that engine's
own version metadata, not for ordinary drawapp-minimal releases.

References: [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html)
defines the major/minor/patch rules. The [npm `version` command](https://docs.npmjs.com/cli/v11/commands/npm-version/)
updates package metadata and supports disabling automatic Git tagging.
