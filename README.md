<p align="center">
  <img src="screenshots/12x12.png" alt="12 x 12 board with the extension applied, on the 6+6 palette">
</p>

# Meowdoku Restyle

A Chrome extension that restyles <https://yocox.github.io/meowdoku/>. It changes
nothing about the rules or the logic, only how the board looks.

## What it changes

1. **Less rounded cells, scaled to the board.** The page gives every cell a
   flat 10px radius, round enough that a run of same-colour cells reads as
   separate blobs rather than one region — and one cat per region is the rule
   being read. Replaced with 10% of the cell's own width: 4px at 12 x 12, 6px
   at 8 x 8, 8.5px at 6 x 6. A flat value cannot suit every board, because a
   cell is 40px wide at 12 x 12 and 85px at 6 x 6, so the page's 10px is a
   quarter of the small cell and an eighth of the large one — it gets less
   round exactly where cells get bigger. A percentage holds one shape at every
   size.
2. **A choice of four region palettes**, replacing the site's own. All four
   come from `D:\palette-lab`, which scored every one of the 66 pairs a
   twelve-colour palette makes and pushed the closest pair as far apart as it
   would go. `5+5+2` is the default and the clearest of the four; `bright12`
   is built for a screen turned down; `6+6` is the one game.js itself now
   ships; `5+7` is the most saturated. Click the extension icon to switch.
   The choice is saved and repaints any open game tab immediately.
3. **Colours are assigned with a stride of 7**, not in array order. game.js
   hands out region ids in order, and each palette is listed ring by ring in
   hue order, so assigning it straight would put adjacent hues on adjacent
   ids. Stepping by 7 (coprime with the 12-colour palette) spaces consecutive
   ids 5 slots apart every time, which a per-game random shuffle can't
   promise.
4. **Crossed-out cells are dimmed in OKLab.** A cell marked with an X gets a
   recoloured background: same hue, lightness scaled to 70% and chroma scaled
   to 50%, computed in OKLab rather than with a CSS `filter`. `filter:
   brightness() saturate()` runs in sRGB, so on a palette's pale colours it
   reads as a flat grey wash rather than a dimmed version of the same colour.
   OKLab separates lightness from chroma along perceptual axes, so scaling
   each on its own keeps the hue intact and keeps a crossed-out cell
   recognisable as its region.

## What game.js already does

Upstream liked this extension's OKLab dimming and 6+6 palette enough to fold
both into `game.js` — with a credit to this repo in a comment there, no less.
So a stock page already dims in OKLab and already runs 6+6.

What is left for the extension is the choice. Three of the four palettes are
ones `game.js` does not ship, and the dimming has to come along because
`game.js` precomputes its dim table for its own twelve colours only.

## How a region is recognised

`game.js` writes each region's colour as an inline style and keeps its two
palettes — live and crossed-out — in top-level `const`s, which never reach
`window`. So there is nothing to patch: the extension reads each cell's
inline colour back, looks it up in `ORIGINAL_PALETTES`, and overwrites it.

`game.js` baked the stride-7 permutation into `REGION_COLORS` itself rather
than applying it at paint time, so index *i* of that array is still region
*i* — the same thing every other array in `ORIGINAL_PALETTES` gives, and the
extension re-applies the stride for the palette you picked.

That makes the site's palette a hard dependency. `ORIGINAL_PALETTES` holds
the two arrays `game.js` ships today plus the two palettes it used before it
adopted this one, so a browser still serving a cached older `game.js` works
too.

**If regions stop being recoloured after a site update, check this first.**
Diff `REGION_COLORS` and `REGION_COLORS_DIM` in `game.js` against
`ORIGINAL_PALETTES` and prepend whatever changed.

## Install

1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and pick this folder.
4. Reload the game tab.

## Tuning

`restyle.css` holds `--md-radius` (cell corner radius, 10% of cell width
against the page's flat 10px).

`palettes.js` holds `PALETTES`, the named colour sets offered in the popup,
and `DEFAULT_PALETTE_KEY`. Add an entry there to offer another palette — no
change to `restyle.js` or `popup.js` needed. List its colours ring by ring,
each ring in hue order, which is what the stride assignment expects.

`restyle.js` holds `PALETTE_STRIDE`, the step used to spread a palette's
colours across region ids, and `MD_MARK_LIGHTNESS` / `MD_MARK_CHROMA`, the
OKLab scale factors applied to a region's colour for its crossed-out state.

Three rules carry the cell radius — the cell itself, the hover/press overlay
and the wrong-guess overlay — and the stylesheet moves all three together.
The page used `border-radius: inherit` on the overlays until a September 2026
update replaced it with a literal 10px, so they no longer follow the cell on
their own.

The radius is a percentage so it resolves against the cell's own box and
tracks cell size. Container query units are the wrong tool here even though
the page uses them for icon sizing: `.cell` is itself the query container, and
cq units resolve against an ancestor container, not the element declaring
them.

## Playing a local copy

`manifest.json` matches `https://yocox.github.io/meowdoku/*` only. To use it
against a local checkout, add that origin to `content_scripts[0].matches`,
e.g. `"http://localhost:8000/*"`.
