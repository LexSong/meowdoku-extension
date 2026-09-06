<p align="center">
  <img src="screenshots/12x12.png" alt="12 x 12 board with the extension applied">
</p>

# Meowdoku Restyle

A Chrome extension that restyles <https://yocox.github.io/meowdoku/>. It changes
nothing about the rules or the logic, only how the board looks.

## What it changes

**Less rounded cells, scaled to the board.** The page gives every cell a flat
10px radius, round enough that a run of same-colour cells reads as separate
blobs rather than one region — and one cat per region is the rule being read.
Replaced with 10% of the cell's own width: 4px at 12 x 12, 6px at 8 x 8, 8.5px
at 6 x 6. A flat value cannot suit every board, because a cell is 40px wide at
12 x 12 and 85px at 6 x 6, so the page's 10px is a quarter of the small cell
and an eighth of the large one — it gets less round exactly where cells get
bigger. A percentage holds one shape at every size.

This extension's OKLab dimming and two-ring palette came first, and it's
great that upstream liked them enough to fold both into `game.js` — with a
credit to this repo in a comment there, no less. So this extension no longer
needs to carry them; it only changes the corner radius.

## Install

1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and pick this folder.
4. Reload the game tab.

## Tuning

`restyle.css` holds `--md-radius` (cell corner radius, 10% of cell width
against the page's flat 10px).

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
