"use strict";

// Named region palettes, shared between restyle.js (which paints the board)
// and popup.js (which lets the user pick one). All four come from
// D:\palette-lab, which scored every one of the 66 pairs a twelve-colour
// palette makes and pushed the closest pair as far apart as it would go.
//
// Each list is ring by ring, and each ring in hue order — the order
// restyle.js's stride assignment expects. A ring is one lightness level:
// palettes separate their twelve colours by lightness as well as hue,
// because twelve hues alone are not twelve distinguishable colours.
const PALETTES = {
  "5+5+2": {
    label: "5+5+2",
    note: "Clearest",
    // Five muted, five vivid, two bright, from
    // D:\palette-lab\results\5+5+2.json. Three lightness levels, which is
    // most of why palette-lab scores it clearest of the four.
    colors: [
      "#904839", "#705f00", "#007153", "#00688f", "#724e8a",
      "#fc7d92", "#f58d3d", "#6dc364", "#16b8ff", "#b993ff",
      "#ffde54", "#00fff7",
    ],
  },
  "bright12": {
    label: "bright12",
    note: "For a dim screen",
    // Twelve lightness levels, one per colour, all between OKLab L 0.60 and
    // 0.85, from D:\palette-lab\results\bright12.json. That band is what a
    // display turned down to a tenth of its output can still render, so
    // nothing here sinks into the background. The same ceiling makes it the
    // faintest of the four on a white page.
    colors: [
      "#c25a6f", "#ff9676", "#b66c00", "#fdc35e", "#828900", "#bcdd76",
      "#009865", "#4feacf", "#41d1ff", "#3584cd", "#946dc5", "#ff9fdb",
    ],
  },
  "6+6": {
    label: "6+6",
    note: "Most uniform",
    // Two rings of six — a light and a dark version of the same six hues —
    // from D:\palette-lab\results\6+6-sharedC.json. This is the palette
    // game.js adopted, so picking it reproduces the site's own board.
    colors: [
      "#ff9ca9", "#f5aa6b", "#bac669", "#56d6bc", "#61cbfb", "#c7acff",
      "#ab505e", "#a45c1d", "#777600", "#00865c", "#007aad", "#7a60ad",
    ],
  },
  "5+7": {
    label: "5+7",
    note: "Most vivid",
    // A ring of five and a ring of seven, from
    // D:\palette-lab\results\5+7-sharedC.json. The uneven split buys extra
    // saturation, so the board comes out livelier than 6+6.
    colors: [
      "#a73f52", "#a34a00", "#2c7b2c", "#006bb1", "#7b4fa6",
      "#f48870", "#da9d33", "#9cb74d", "#00c6a8", "#00bce8", "#98a0ff", "#e685bf",
    ],
  },
};

// game.js now ships the 6+6 palette itself, so defaulting to 6+6 would make
// this extension a no-op on a fresh install. 5+5+2 is the one palette-lab
// scores clearest, so that is the default instead.
const DEFAULT_PALETTE_KEY = "5+5+2";
