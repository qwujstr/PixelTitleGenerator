const textInput = document.getElementById('textInput');
const atlasSelect = document.getElementById('atlasSelect');
const spacingInput = document.getElementById('spacingInput');
const spacingValue = document.getElementById('spacingValue');
const customWidth = document.getElementById('customWidth');
const downloadButton = document.getElementById('downloadButton');
const canvas = document.getElementById('titleCanvas');
const sizeLabel = document.getElementById('sizeLabel');
const notice = document.getElementById('notice');
const scaleButtons = [...document.querySelectorAll('.scale-button')];
const ctx = canvas.getContext('2d');

const characters = '1234567890-=,._qwertyuiopasdfghjklzxcvbnm';
const atlas = new Image();
let selectedScale = 2;
let glyphs = new Map();
let glyphHeight = 0;

function getOccupiedColumns() {
  const temp = document.createElement('canvas');
  temp.width = atlas.width;
  temp.height = atlas.height;
  const tempCtx = temp.getContext('2d', { willReadFrequently: true });
  tempCtx.drawImage(atlas, 0, 0);
  const pixels = tempCtx.getImageData(0, 0, atlas.width, atlas.height).data;
  const occupied = new Array(atlas.width).fill(false);
  for (let x = 0; x < atlas.width; x++) {
    for (let y = 0; y < atlas.height; y++) {
      if (pixels[(y * atlas.width + x) * 4 + 3] !== 0) {
        occupied[x] = true;
        break;
      }
    }
  }
  return occupied;
}

function buildGlyphMap() {
  glyphs = new Map();
  glyphHeight = atlas.height;
  const occupied = getOccupiedColumns();
  const runs = [];
  let start = -1;

  for (let x = 0; x <= occupied.length; x++) {
    const filled = x < occupied.length && occupied[x];
    if (filled && start === -1) start = x;
    if (!filled && start !== -1) {
      runs.push({ x: start, width: x - start });
      start = -1;
    }
  }

  if (runs.length !== characters.length) {
    notice.textContent = `Sprite sheet has ${runs.length} glyphs, expected ${characters.length}.`;
    return false;
  }

  [...characters].forEach((char, index) => glyphs.set(char, runs[index]));
  return true;
}

function normalizeChar(char) {
  return char.toLowerCase();
}

function measureLine(line, spacing) {
  let width = 0;
  const chars = [...line];
  chars.forEach((char, index) => {
    if (char === ' ') {
      width += Math.max(1, Math.round(glyphHeight * 0.35));
    } else {
      const glyph = glyphs.get(normalizeChar(char));
      if (glyph) width += glyph.width;
    }
    if (index < chars.length - 1) width += spacing;
  });
  return Math.max(1, width);
}

function render() {
  if (!atlas.complete || !glyphHeight || !glyphs.size) return;
  const text = textInput.value || ' ';
  const spacing = Number(spacingInput.value);
  const lines = text.split('\n').slice(0, 6);
  const lineGap = Math.max(1, Math.round(glyphHeight * 0.18));
  const widths = lines.map(line => measureLine(line, spacing));
  canvas.width = Math.max(...widths, 1);
  canvas.height = Math.max(1, lines.length * glyphHeight + Math.max(0, lines.length - 1) * lineGap);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  lines.forEach((line, lineIndex) => {
    let x = 0;
    const y = lineIndex * (glyphHeight + lineGap);
    [...line].forEach((char, index, arr) => {
      if (char === ' ') {
        x += Math.max(1, Math.round(glyphHeight * 0.35));
      } else {
        const glyph = glyphs.get(normalizeChar(char));
        if (glyph) {
          ctx.drawImage(atlas, glyph.x, 0, glyph.width, glyphHeight, x, y, glyph.width, glyphHeight);
          x += glyph.width;
        }
      }
      if (index < arr.length - 1) x += spacing;
    });
  });

  sizeLabel.textContent = `${canvas.width} × ${canvas.height} px`;
  const unsupported = [...new Set([...text].filter(char => char !== '\n' && char !== ' ' && !glyphs.has(normalizeChar(char))))];
  notice.textContent = unsupported.length ? `Unsupported characters skipped: ${unsupported.join(' ')}` : '';
}

function loadAtlas() {
  glyphs = new Map();
  glyphHeight = 0;
  notice.textContent = 'Loading sprite sheet...';
  atlas.onload = () => {
    notice.textContent = '';
    if (buildGlyphMap()) render();
  };
  atlas.onerror = () => notice.textContent = 'Could not load sprite sheet.';
  atlas.src = atlasSelect.value;
}

function downloadImage() {
  render();
  if (!canvas.width || !canvas.height) return;
  const target = document.createElement('canvas');
  const targetCtx = target.getContext('2d');
  const custom = Number(customWidth.value);
  let width;
  let height;
  if (custom > 0) {
    width = Math.max(1, Math.round(custom));
    height = Math.max(1, Math.round(canvas.height * (width / canvas.width)));
  } else {
    width = Math.max(1, canvas.width * selectedScale);
    height = Math.max(1, canvas.height * selectedScale);
  }
  target.width = width;
  target.height = height;
  targetCtx.imageSmoothingEnabled = false;
  targetCtx.clearRect(0, 0, width, height);
  targetCtx.drawImage(canvas, 0, 0, width, height);
  const link = document.createElement('a');
  const safeName = (textInput.value.trim() || 'pixel-title').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  link.download = `${safeName || 'pixel-title'}-${width}x${height}.png`;
  link.href = target.toDataURL('image/png');
  link.click();
}

textInput.addEventListener('input', render);
atlasSelect.addEventListener('change', loadAtlas);
spacingInput.addEventListener('input', () => {
  spacingValue.value = `${spacingInput.value} px`;
  render();
});
customWidth.addEventListener('input', () => {
  if (Number(customWidth.value) > 0) scaleButtons.forEach(button => button.classList.remove('active'));
  else scaleButtons.forEach(button => button.classList.toggle('active', Number(button.dataset.scale) === selectedScale));
});
scaleButtons.forEach(button => button.addEventListener('click', () => {
  selectedScale = Number(button.dataset.scale);
  customWidth.value = '';
  scaleButtons.forEach(item => item.classList.toggle('active', item === button));
}));
downloadButton.addEventListener('click', downloadImage);

loadAtlas();
