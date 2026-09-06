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

// Twelve colours, two rings of six, from D:\palette-lab\results\6+6-sharedC.json.
const PALETTE = [
  "#ff9ca9", "#f5aa6b", "#bdc567", "#56d6bc", "#61cbfb", "#c7acff",
  "#ab505e", "#a45c1d", "#777600", "#00865c", "#007aad", "#7a60ad",
];

function regionIndexOf(cell) {
  const m = cell.style.backgroundColor.match(/\d+/g);
  if (!m || m.length < 3) return -1;
  const idx = INDEX_BY_RGB.get(`${m[0]},${m[1]},${m[2]}`);
  return idx === undefined ? -1 : idx;
}

function repaint(board) {
  for (const cell of board.querySelectorAll(".cell")) {
    if (cell.dataset.mdRegion !== undefined) continue; // already ours
    const idx = regionIndexOf(cell);
    if (idx < 0) continue;
    cell.dataset.mdRegion = String(idx);
    cell.style.background = PALETTE[idx % PALETTE.length];
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
  repaint(board);
}
