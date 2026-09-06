"use strict";

// Named region palettes, shared between restyle.js (which paints the board)
// and popup.js (which lets the user pick one). Each is twelve colours in
// restyle.js's ring-then-ring order, ready for its stride assignment.
const PALETTES = {
  "6+6": {
    label: "6+6",
    // Two rings of six, from D:\palette-lab\results\6+6-sharedC.json.
    colors: [
      "#ff9ca9", "#f5aa6b", "#bdc567", "#56d6bc", "#61cbfb", "#c7acff",
      "#ab505e", "#a45c1d", "#777600", "#00865c", "#007aad", "#7a60ad",
    ],
  },
  "5+7": {
    label: "5+7",
    // A ring of five and a ring of seven, from
    // D:\palette-lab\results\5+7-sharedC.json.
    colors: [
      "#a73f52", "#a34a00", "#2d7b2c", "#006bb1", "#7b4fa6",
      "#f48870", "#da9d33", "#9cb74d", "#00c6a8", "#00bce8", "#98a0ff", "#e685bf",
    ],
  },
};

const DEFAULT_PALETTE_KEY = "6+6";
