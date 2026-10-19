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

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?.,:-+()/';
const atlas = new Image();
let selectedScale = 2;
let glyphs = new Map();
let glyphHeight = 0;

function getAlphaBounds(image) {
  const temp = document.createElement('canvas');
  temp.width = image.width;
  temp.height = image.height;
  const tempCtx = temp.getContext('2d', { willReadFrequently: true });
  tempCtx.drawImage(image, 0, 0);
  const data = tempCtx.getImageData(0, 0, image.width, image.height).data;
  const columns = [];
  for (let x = 0; x < image.width; x++) {
    let occupied = false;
    for (let y = 0; y < image.height; y++) {
      if (data[(y * image.width + x) * 4 + 3] > 0) {
        occupied = true;
        break;
      }
    }
    columns.push(occupied);
  }
  return columns;
}

function buildGlyphMap() {
  glyphs = new Map();
  const columns = getAlphaBounds(atlas);
  const runs = [];
  let start = null;
  for (let x = 0; x <= columns.length; x++) {
    const occupied = x < columns.length ? columns[x] : false;
    if (occupied && start === null) start = x;
    if (!occupied && start !== null) {
      runs.push([start, x - 1]);
      start = null;
    }
  }

  let sourceRuns = runs;
  if (runs.length < characters.length) {
    const cellWidth = Math.floor(atlas.width / characters.length);
    sourceRuns = characters.split('').map((_, index) => {
      const x = index * cellWidth;
      const width = index === characters.length - 1 ? atlas.width - x : cellWidth;
      return [x, x + width - 1];
    });
  }

  characters.split('').forEach((char, index) => {
    const run = sourceRuns[index];
    if (!run) return;
    glyphs.set(char, {
      x: run[0],
      width: Math.max(1, run[1] - run[0] + 1)
    });
  });
  glyphHeight = atlas.height;
}

function measureLine(line, spacing) {
  let width = 0;
  const chars = [...line];
  chars.forEach((char, index) => {
    if (char === ' ') {
      width += Math.max(4, Math.round(glyphHeight * 0.35));
    } else {
      const glyph = glyphs.get(char.toUpperCase());
      width += glyph ? glyph.width : Math.max(4, Math.round(glyphHeight * 0.4));
    }
    if (index < chars.length - 1) width += spacing;
  });
  return Math.max(1, width);
}

function render() {
  if (!atlas.complete || !glyphHeight) return;
  const text = textInput.value || ' ';
  const spacing = Number(spacingInput.value);
  const lines = text.split('\n').slice(0, 6);
  const lineGap = Math.max(2, Math.round(glyphHeight * 0.18));
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
        x += Math.max(4, Math.round(glyphHeight * 0.35));
      } else {
        const glyph = glyphs.get(char.toUpperCase());
        if (glyph) {
          ctx.drawImage(atlas, glyph.x, 0, glyph.width, glyphHeight, x, y, glyph.width, glyphHeight);
          x += glyph.width;
        } else {
          x += Math.max(4, Math.round(glyphHeight * 0.4));
        }
      }
      if (index < arr.length - 1) x += spacing;
    });
  });

  sizeLabel.textContent = `${canvas.width} × ${canvas.height} px`;
  const unsupported = [...new Set([...text.toUpperCase()].filter(char => char !== '\n' && char !== ' ' && !glyphs.has(char)))];
  notice.textContent = unsupported.length ? `Unsupported characters skipped: ${unsupported.join(' ')}` : '';
}

function loadAtlas() {
  glyphs = new Map();
  glyphHeight = 0;
  atlas.onload = () => {
    buildGlyphMap();
    render();
  };
  atlas.src = `${atlasSelect.value}?v=${Date.now()}`;
}

function downloadImage() {
  render();
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
  if (Number(customWidth.value) > 0) {
    scaleButtons.forEach(button => button.classList.remove('active'));
  } else {
    scaleButtons.forEach(button => button.classList.toggle('active', Number(button.dataset.scale) === selectedScale));
  }
});
scaleButtons.forEach(button => {
  button.addEventListener('click', () => {
    selectedScale = Number(button.dataset.scale);
    customWidth.value = '';
    scaleButtons.forEach(item => item.classList.toggle('active', item === button));
  });
});
downloadButton.addEventListener('click', downloadImage);

loadAtlas();
