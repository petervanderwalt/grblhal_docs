# grblHAL Documentation

This repo contains the **source** and **built output** for the grblHAL documentation site.

## Repository structure

```
grblhal_docs/
├── content/                # ✏️  EDIT THESE — raw Markdown source files
│   ├── markdown/           #     .md files organized in numbered sections
│   │   ├── 01-Getting-Started/
│   │   ├── 02-Core-Concepts/
│   │   ├── 03-Machine-Calibration/
│   │   ├── 04-Reference/
│   │   ├── 05-Guides/
│   │   ├── 06-Advanced-Topics/
│   │   └── 07-Vendors/
│   ├── images/             #     Images, screenshots, logo.svg
│   ├── videos/             #     Video files (if any)
│   └── misc/               #     PDFs, zips, etc.
├── docs/                   # 🚀  BUILT OUTPUT — served by GitHub Pages
│   ├── index.html
│   ├── 01-Getting-Started/
│   ├── ...
│   ├── assets/css/site.css
│   └── images/
└── README.md
```

- **`content/`** — your raw source. Edit these `.md` files. This is what you track in git.
- **`docs/`** — auto-generated HTML. **Do not edit manually.** Run the Deploy command in cheetah to regenerate. This folder is what GitHub Pages serves (configured in repo Settings → Pages → Deploy from branch `main`, folder `/docs`).

## How to edit

This repo does **not** contain the editor. The editor lives in a separate engine repo.

### 1. Set up the engine

```bash
git clone https://github.com/petervanderwalt/cheetah.git
cd cheetah
npm install
```

### 2. Start the editor

```bash
npm run edit
```

### 3. Point it at this project

On **first run only**, the editor asks for your project path. Enter the full path to this folder (e.g. `C:\Users\you\grblhal_docs` or `/home/you/grblhal_docs`).

The editor remembers this path in `.cheetah-path` (inside the cheetah engine folder).

### 4. Edit

- Browse and click files in the sidebar tree
- Right-click files/folders for Rename, Move to folder, Delete (trashes to `content/trash/`)
- Use the toolbar for formatting (bold, headings, tables, admonitions, etc.)
- Drag-and-drop images to upload them to `content/images/`

### 5. Preview

The right pane shows a live rendered preview as you type.

### 6. Build & deploy

Click **Deploy** in the editor toolbar. A prompt asks for the **base path**:

- **For GitHub Pages** with this repo: enter `/grblhal_docs`
- **For FTP to a domain root**: leave empty

The build outputs to `docs/`. Push this repo to GitHub:

```bash
git add .
git commit -m "Update docs"
git push
```

GitHub Pages (configured at Settings → Pages → Deploy from `main` `/docs`) will update automatically after a minute.

## Updating the engine

The cheetah engine is a separate repo. To get updates:

```bash
cd cheetah
git pull origin main
npm install   # if dependencies changed
```

This will never touch your content — your `.md` files, images, and logo live only in this project repo.

## File naming conventions

Files are sorted by their numeric prefix:

```
01-introduction.md
02-installation.md
03-advanced.md
```

The prefix determines order in the navigation. Rename files via right-click in the editor tree view.

Folders work the same way and can be nested:
```
01-Getting-Started/
├── 01-what-is-grblhal.md
├── 02-grbl-vs-grblhal.md
└── ...
```

## Logo

Place your logo at `content/images/logo.svg`. It appears in the editor sidebar and on every built page. Recommended max width: 120px.
