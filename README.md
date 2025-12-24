# icd

A CLI tool for downloading icons from popular icon repositories directly from GitHub.

## Installation

```bash
npm install -g icd
# or
bun install -g icd
```

For development:

```bash
bun install
```

## Usage

### Basic Usage

```bash
icd -c ./icons.input.json
```

### Command Line Options

- `-c, --config-file [configFile]` - Path to input file (default: `./icons.input.json`)
- `-v, --verbose` - Enable verbose logging

### Configuration File

Create an `icons.input.json` file to specify which icons to download:

```json
{
  "$schema": "https://cdn.jsdelivr.net/gh/vespaiach/icd@main/src/icons.input.schema.json",
  "repository": "heroicons",
  "output": "./icons",
  "icons": [
    {
      "name": "heart",
      "variant": "24/solid",
      "saveAs": "heart-solid"
    },
    {
      "repository": "bootstrap-icons",
      "name": "github",
      "saveAs": "github-icon"
    }
  ]
}
```

### Configuration Options

#### Global Options

- `repository` (optional) - Default repository for all icons
- `output` (optional) - Default output folder for downloaded icons

#### Icon Options

Each icon in the `icons` array can have:

- `name` (required) - Icon name in kebab-case
- `repository` (optional) - Icon repository (overrides global setting)
- `variant` (optional) - Icon variant (e.g., `outline`, `solid`, `24/solid`)
- `size` (optional) - Icon size in pixels
- `output` (optional) - Output folder for this icon (overrides global setting)
- `saveAs` (optional) - Custom filename without extension
- `overwrite` (optional) - Overwrite existing file (boolean)
- `tsxTransform` (optional) - Transform SVG to React TSX component (boolean)

### Supported Icon Repositories

- `bootstrap-icons` - [Bootstrap Icons](https://icons.getbootstrap.com)
- `boxicons` - [Boxicons](https://boxicons.com) (variants: regular, solid, logos)
- `bytesize-icons` - [Bytesize Icons](https://danklammer.com/bytesize-icons)
- `css-gg` - [css.gg](https://css.gg)
- `eva-icons` - [Eva Icons](https://akveo.github.io/eva-icons) (variants: fill, outline)
- `feather` - [Feather Icons](https://feathericons.com)
- `font-awesome` - [Font Awesome](https://fontawesome.com) (variants: regular, solid, brands)
- `heroicons` - [Heroicons](https://heroicons.com) (variants: 16/solid, 20/solid, 24/solid, 24/outline)
- `ionicons` - [Ionicons](https://ionic.io/ionicons)
- `lucide` - [Lucide](https://lucide.dev)
- `tabler-icons` - [Tabler Icons](https://tabler.io/icons)

### Examples

#### Download a single icon

```json
{
  "output": "./icons",
  "icons": [
    {
      "repository": "heroicons",
      "name": "home",
      "variant": "24/outline"
    }
  ]
}
```

#### Download multiple icons from different repositories

```json
{
  "output": "./icons",
  "icons": [
    {
      "repository": "bootstrap-icons",
      "name": "heart"
    },
    {
      "repository": "feather",
      "name": "github"
    },
    {
      "repository": "heroicons",
      "name": "user",
      "variant": "24/solid",
      "saveAs": "user-solid-24"
    }
  ]
}
```

#### Transform SVG to React TSX component

```json
{
  "output": "./components/icons",
  "icons": [
    {
      "repository": "heroicons",
      "name": "heart",
      "variant": "24/solid",
      "tsxTransform": true,
      "saveAs": "HeartIcon"
    }
  ]
}
```

## Development

To run in development:

```bash
bun run index.ts
```

To build:

```bash
bun run build
```

To run tests:

```bash
bun test
```
