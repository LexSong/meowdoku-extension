"use strict";

// Region colours are written as an inline style by the page
// (`cellEl.style.background = REGION_COLORS[reg]` in game.js), and an inline
// declaration beats any author rule short of !important — which cannot vary
// per region anyway. game.js also keeps its palette in a top-level `const`
// binding, which never lands on `window`, so there is nothing to patch from
// the outside. That leaves one route: read each cell's inline colour back,
// recognise it as a palette entry, and overwrite it.

// The palette game.js ships today, and the one it replaced in a September
// 2026 update, which changed four entries — indices 0, 1, 8 and 11.
// Recognising both means a browser still holding a cached older game.js is
// repainted too.
const ORIGINAL_PALETTES = [
  ["#EDB9B9", "#B88357", "#EAB226", "#CCDCB3", "#68B685", "#00FFA2",
   "#8CADBB", "#5889C3", "#3B48BA", "#BDA9D0", "#AD59BA", "#C71370"],
  ["#FFB9B9", "#B88377", "#EAB226", "#CCDCB3", "#68B685", "#00FFA2",
   "#8CADBB", "#5889C3", "#5B68BA", "#BDA9D0", "#AD59BA", "#D13B89"],
];

const INDEX_BY_RGB = new Map();
for (const palette of ORIGINAL_PALETTES) {
  palette.forEach((hex, i) => {
    const n = parseInt(hex.slice(1), 16);
    INDEX_BY_RGB.set(`${n >> 16},${(n >> 8) & 255},${n & 255}`, i);
  });
}

// The active region palette, one of the named entries in palettes.js
// (loaded before this file). Starts on the default and is replaced once
// chrome.storage reports the user's saved choice, or whenever the popup
// changes it — see the chrome.storage.onChanged listener below.
let PALETTE = PALETTES[DEFAULT_PALETTE_KEY].colors;

// A crossed-out cell dims by scaling OKLab lightness and chroma, not by
// CSS `filter: brightness() saturate()`. That filter works in sRGB, so on a
// pale ring-0 colour it reads as a flat grey wash rather than a dimmed
// version of the same hue. OKLab separates lightness from chroma along
// perceptual axes, so scaling each independently keeps the hue intact and
// keeps ring-0 and ring-1 cells of the same region looking related.
//
// Lightness drops to 0.7 and chroma to 0.5 — dim enough that a crossed-out
// cell is unmistakably not live, while OKLab's separate lightness/chroma
// axes keep the hue intact so the cell still reads as its region.
const MD_MARK_LIGHTNESS = 0.7;
const MD_MARK_CHROMA = 0.5;

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c) {
  c = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, c)) * 255);
}

// sRGB hex -> OKLab, and back. Coefficients from Björn Ottosson's OKLab
// reference (https://bottosson.github.io/posts/oklab/).
function hexToOklab(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = srgbToLinear(((n >> 16) & 255) / 255);
  const g = srgbToLinear(((n >> 8) & 255) / 255);
  const b = srgbToLinear((n & 255) / 255);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  };
}

function oklabToHex({ L, a, b }) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;

  const r = linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const g = linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const bl = linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);

  return `#${[r, g, bl].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function dim(hex) {
  const { L, a, b } = hexToOklab(hex);
  return oklabToHex({
    L: L * MD_MARK_LIGHTNESS,
    a: a * MD_MARK_CHROMA,
    b: b * MD_MARK_CHROMA,
  });
}

let DIMMED_PALETTE = PALETTE.map(dim);

function setPalette(key) {
  const entry = PALETTES[key] || PALETTES[DEFAULT_PALETTE_KEY];
  PALETTE = entry.colors;
  DIMMED_PALETTE = PALETTE.map(dim);
}

function regionIndexOf(cell) {
  const m = cell.style.backgroundColor.match(/\d+/g);
  if (!m || m.length < 3) return -1;
  const idx = INDEX_BY_RGB.get(`${m[0]},${m[1]},${m[2]}`);
  return idx === undefined ? -1 : idx;
}

// game.js hands out region ids in order, and PALETTE walks its two rings in
// hue order, so id N and id N+1 landed on adjacent hues — the two hardest
// colours to tell apart next to each other on the board. Stepping by 7
// instead of 1 fixes that: 7 is coprime with the 12-colour palette, so the
// sequence visits every hue and alternates rings before it repeats, and
// consecutive ids always land 5 (or 7) slots apart — the largest gap a
// 12-colour cycle can give two neighbours. A per-game random shuffle can't
// promise that; it can just as easily deal two adjacent hues to two
// consecutive ids as this stride never does.
const PALETTE_STRIDE = 7;

function colorFor(idx, cell) {
  const slot = (idx * PALETTE_STRIDE) % PALETTE.length;
  const palette = cell.dataset.state === "1" ? DIMMED_PALETTE : PALETTE;
  return palette[slot];
}

function applyState(cell) {
  const idx = Number(cell.dataset.mdRegion);
  cell.style.background = colorFor(idx, cell);
}

function repaint(board) {
  for (const cell of board.querySelectorAll(".cell")) {
    if (cell.dataset.mdRegion !== undefined) continue; // already ours
    const idx = regionIndexOf(cell);
    if (idx < 0) continue;
    cell.dataset.mdRegion = String(idx);
    applyState(cell);
  }
}

const board = document.getElementById("board");
if (board) {
  // renderBoard() empties #board and appends the cells one at a time, so the
  // observer fires many times per level. Coalesce into one pass per frame.
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      repaint(board);
    });
  }).observe(board, { childList: true });

  // The page toggles a cell between live and crossed-out by changing its
  // own `data-state` attribute, which repaint() above never revisits once a
  // cell is coloured. Watch that attribute directly and re-derive the
  // background whenever it changes.
  new MutationObserver((mutations) => {
    for (const { target } of mutations) {
      if (target.dataset.mdRegion !== undefined) applyState(target);
    }
  }).observe(board, {
    attributes: true,
    attributeFilter: ["data-state"],
    subtree: true,
  });

  repaint(board);

  // Cells painted above used the default palette, since chrome.storage
  // hasn't reported the user's saved choice yet. Re-paint them once it has,
  // and again whenever the popup changes it while this tab is open.
  function repaintAll() {
    for (const cell of board.querySelectorAll(".cell")) {
      if (cell.dataset.mdRegion !== undefined) applyState(cell);
    }
  }

  chrome.storage.local.get(["paletteKey"], (result) => {
    setPalette(result.paletteKey);
    repaintAll();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.paletteKey) {
      setPalette(changes.paletteKey.newValue);
      repaintAll();
    }
  });
}
