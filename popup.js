"use strict";

const container = document.getElementById("options");

function render(current) {
  container.innerHTML = "";
  for (const [key, { label, colors }] of Object.entries(PALETTES)) {
    const option = document.createElement("label");
    option.className = "option";

    const row = document.createElement("div");
    row.className = "row";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "palette";
    radio.value = key;
    radio.checked = key === current;
    radio.addEventListener("change", () => {
      chrome.storage.local.set({ paletteKey: key });
    });

    row.append(radio, document.createTextNode(label));

    const swatches = document.createElement("div");
    swatches.className = "swatches";
    for (const hex of colors) {
      const swatch = document.createElement("span");
      swatch.style.background = hex;
      swatches.appendChild(swatch);
    }

    option.append(row, swatches);
    container.appendChild(option);
  }
}

chrome.storage.local.get(["paletteKey"], (result) => {
  const current = PALETTES[result.paletteKey] ? result.paletteKey : DEFAULT_PALETTE_KEY;
  render(current);
});
