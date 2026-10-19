# Pixel Title Generator

Browser tool for generating pixel titles from sprite sheets in `assets/texture`.

## Sprite sheets

Sheets use this symbol order:

`1234567890-=,._qwertyuiopasdfghjklzxcvbnm`

The generator slices each glyph from transparent separators and supports uppercase input by mapping it to lowercase.

Sheet names follow `textsheet_atlas.png` or `textsheet_atlas_NAME.png`. `textsheet_atlas.png` is shown as `Purple`; for example `textsheet_atlas_blue.png` becomes `Blue` and `textsheet_atlas_gold.png` becomes `Gold`.

Browser-only static sites cannot list a server directory automatically. `assets/texture/manifest.json` is therefore used for automatic selector population. When adding another sheet, add its filename to that manifest. Known Purple, Blue and Gold filenames are also available as fallbacks.

## Controls

Enter text, choose a sheet, adjust letter spacing, Hue, Saturation, Brightness and Opacity. The preview can be zoomed with the mouse wheel or +/- controls and dragged with the mouse or pointer. Reset returns the preview to its original position and zoom.

Export supports 2x, 3x, 5x or a custom width and produces a transparent PNG with smoothing disabled.
