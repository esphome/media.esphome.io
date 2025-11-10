# media.esphome.io

Static media hosting for ESPHome websites, code repositories, and related projects. This website provides a centralized location for logos, badges, fonts, and other assets used across the ESPHome ecosystem.

## Overview

This is a simple static website built with [11ty](https://www.11ty.dev/) that automatically generates a file tree of all assets in the `assets/` directory. All assets are served from the root of the site at https://media.esphome.io.

## Features

- **Automatic file tree generation** - Browse all available assets with an interactive tree view
- **Clickable file links** - Direct links to download or view any asset
- **License documentation** - Clear licensing information for all hosted assets
- **Simple build process** - Static site generation with 11ty

## Project Structure

```
media.esphome.io/
├── .eleventy.js          # 11ty configuration
├── package.json          # Node.js dependencies
├── assets/               # Media files (merged to root at build)
│   ├── LICENSE.md        # License information for assets
│   ├── logo/            # ESPHome logos
│   ├── made-for-esphome/ # "Made for ESPHome" badges
│   └── ...
└── src/                  # Source files
    ├── index.md          # Homepage (markdown)
    └── _includes/
        └── base.njk      # Base HTML template
```

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
npm install
```

### Building

Build the static site:

```bash
npm run build
```

The built site will be in the `_site/` directory.

### Local Development

Start a local development server with live reload:

```bash
npm run serve
```

The site will be available at `http://localhost:8080`.

### Cleaning

Remove the built site:

```bash
npm run clean
```

## Adding Assets

1. Place your media files in the appropriate subdirectory under `assets/`
2. Run `npm run build` to regenerate the site
3. The file tree will automatically update to include your new assets

Assets will be accessible at:
```
https://media.esphome.io/<path-relative-to-assets>
```

For example:
- `assets/logo/logo.svg` → `https://media.esphome.io/logo/logo.svg`
- `assets/fonts/custom.woff2` → `https://media.esphome.io/fonts/custom.woff2`

## License

The code for this website is licensed under the MIT License (see [LICENSE](LICENSE)).

**Important:** The assets in the `assets/` directory are **NOT** covered by this license. See [assets/LICENSE.md](assets/LICENSE.md) for details on asset licensing.

## Deployment

The `_site/` directory contains the complete static website ready for deployment to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).