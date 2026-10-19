# Pixel Title Generator

Browser tool for generating pixel titles from the sprite sheets in `assets/texture`.

## Sprite sheet format

The current sheets contain exactly these symbols in this exact order:

`1234567890-=,._qwertyuiopasdfghjklzxcvbnm`

Every glyph has the same height and width. There is exactly 1 transparent pixel between neighboring glyphs. The generator calculates glyph width from the image width and slices every symbol by its fixed position instead of trying to detect letter shapes from transparent pixels inside the glyph.

Uppercase input is normalized to lowercase, so `HELLO` uses the same sprite glyphs as `hello`.

## Included sheets

- `assets/texture/textsheet_atlas.png`
- `assets/texture/textsheet_atlas_blue.png`

## Usage

1. Open `index.html` through a static web server or GitHub Pages.
2. Enter text.
3. Select Default or Blue sprite sheet.
4. Adjust letter spacing.
5. Select 2x, 3x, 5x, or enter a custom output width.
6. Click `Download PNG`.

The exported PNG has a transparent background and image smoothing is disabled.
