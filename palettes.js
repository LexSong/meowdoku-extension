"use strict";

// Named region palettes, shared between restyle.js (which paints the board)
// and popup.js (which lets the user pick one). All four come from
// D:\palette-lab — hex codes and order both copied from its README, so the
// two can be diffed line against line. That repo picked the colours and
// settled their order. Why they are what they are is its business.
//
// The order is OKLab hue order, which restyle.js's stride assumes. Keep it
// if you add an entry.
const PALETTES = {
  "5+5+2": {
    label: "5+5+2",
    note: "Clearest",
    colors: [
      "#fc7d92", "#904839", "#f58d3d", "#ffde54", "#705f00", "#6dc364",
      "#007153", "#00fff7", "#00688f", "#16b8ff", "#b993ff", "#724e8a",
    ],
  },
  "bright12": {
    label: "bright12",
    note: "For a dim screen",
    colors: [
      "#c25a6f", "#ff9676", "#b66c00", "#fdc35e", "#828900", "#bcdd76",
      "#009865", "#4feacf", "#41d1ff", "#3584cd", "#946dc5", "#ff9fdb",
    ],
  },
  "6+6": {
    label: "6+6",
    note: "Most uniform",
    // game.js adopted this palette, but not this order, so its board differs.
    colors: [
      "#ff9ca9", "#ab505e", "#a45c1d", "#f5aa6b", "#777600", "#bac669",
      "#00865c", "#56d6bc", "#61cbfb", "#007aad", "#7a60ad", "#c7acff",
    ],
  },
  "5+7": {
    label: "5+7",
    note: "Most vivid",
    colors: [
      "#a73f52", "#f48870", "#a34a00", "#da9d33", "#9cb74d", "#2c7b2c",
      "#00c6a8", "#00bce8", "#006bb1", "#98a0ff", "#7b4fa6", "#e685bf",
    ],
  },
};

// palette-lab rates 5+5+2 its clearest, so it is the default.
const DEFAULT_PALETTE_KEY = "5+5+2";
