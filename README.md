# grblHAL Documentation

[![Build and publish documentation](https://github.com/grblHAL/grblhal_docs/actions/workflows/publish-docs.yml/badge.svg)](https://github.com/grblHAL/grblhal_docs/actions/workflows/publish-docs.yml)

Live documentation: [grblhal.org/docs](https://grblhal.org/docs)

This repository contains the Markdown source for the grblHAL documentation site.

## Edit documentation

Edit Markdown files in `content/markdown/` with any text editor, then commit and open a pull request. Images and other site assets belong in `content/images/`.

File and folder names are ordered by their numeric prefix:

```text
01-Getting-Started/
  01-what-is-grblhal.md
  02-grbl-vs-grblhal.md
```

## Build and publish

The GitHub Actions workflow builds the HTML site from committed Markdown and publishes it to [grblhal.org/docs](https://grblhal.org/docs) whenever a change is merged into `main`.

The generated `docs/` folder is a build artifact and is intentionally not committed. To generate it locally:

```bash
npm ci
npm run build
```

The build preserves the existing navigation, search, Markdown rendering, syntax highlighting, wiki links, admonitions, table of contents, and responsive styling. Do not edit `docs/` directly.

## Local preview

Edit Markdown and assets under `content/` in any editor or tool you prefer. The development server is only a local preview; it does not edit or publish documentation.

Start the preview in a terminal:

```bash
npm run dev
```

It rebuilds the site with the same production command (`scripts/build-docs.js --prefix=/docs`) whenever files under `content/` change. Open the URL printed in the terminal. The browser refreshes only after a successful rebuild and restores the current scroll position. To use another port, run `npm run dev -- --port=3104`.
