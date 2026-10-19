# Pixel Title Generator

A small browser-based tool for generating pixel-style title images from sprite sheet atlases.

## Features

- Enter custom text and render it using the sprite sheet letters.
- Switch between the included `textsheet_atlas` and `textsheet_atlas_blue` sheets.
- Adjust letter spacing from negative spacing up to wider gaps.
- Preview the generated title directly in the browser.
- Export the title as a transparent PNG.
- Export at 2x, 3x, or 5x scale.
- Export to a custom pixel width while preserving the aspect ratio.
- Pixel-perfect rendering with image smoothing disabled.
- Simple black, dark gray, and blue interface.

## Included sprite sheets

The current sheets are stored in:

- `assets/texture/textsheet_atlas.png`
- `assets/texture/textsheet_atlas_blue.png`

## How to use

1. Open `index.html` in a browser, or serve the repository with any static web server.
2. Enter the title text in the text field.
3. Choose a sprite sheet from the selector.
4. Adjust letter spacing with the slider.
5. Choose 2x, 3x, or 5x export scale.
6. If you need an exact output size, enter a custom width in pixels. This overrides the scale setting.
7. Press `Download PNG` to save the generated title with a transparent background.

## Supported characters

The generator maps the sprite sheet to this character order:

`ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?.,:-+()/`

Spaces and line breaks are supported. Unsupported characters are skipped and shown below the preview.

## Adding another sprite sheet

Add the PNG file to `assets/texture/` and add another option to the sprite-sheet selector in `index.html`. The new sheet should use the same glyph order as the existing atlases.

## Files

- `index.html` — interface structure
- `styles.css` — dark interface styling
- `script.js` — sprite rendering, spacing, preview, and PNG export
- `assets/texture/` — sprite sheets
