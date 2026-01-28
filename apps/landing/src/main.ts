import createNeuralAnimation from 'neural-animation';
import './styles.css';

// Defaults (should match library defaults)
const DEFAULTS = {
  color: '#4080c0',
  speed: 1.0,
  scale: 1.0,
};

// Init shader background
const ctrl = createNeuralAnimation('#background', {
  baseColor: DEFAULTS.color,
  speed: DEFAULTS.speed,
  scale: DEFAULTS.scale,
  pointer: true,
  scrollReactive: true,
});

// Elements
const colorEl = document.getElementById('color') as HTMLInputElement | null;
const speedEl = document.getElementById('speed') as HTMLInputElement | null;
const scaleEl = document.getElementById('scale') as HTMLInputElement | null;
const speedVal = document.getElementById('speedVal');
const scaleVal = document.getElementById('scaleVal');
const codePre = document.getElementById('code') as HTMLElement | null;
const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement | null;
const copied = document.getElementById('copied');
const copyInstallBtn = document.getElementById('copyInstallBtn') as HTMLButtonElement | null;
const copiedInstall = document.getElementById('copiedInstall');
const copyHtmlBtn = document.getElementById('copyHtmlBtn') as HTMLButtonElement | null;
const copiedHtml = document.getElementById('copiedHtml');

function fmt(n: number){
  return (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, '.0');
}

function buildCode(): string {
  // Determine changed options
  const opts: string[] = [];
  const color = (colorEl?.value || DEFAULTS.color).toLowerCase();
  const speed = parseFloat(speedEl?.value || String(DEFAULTS.speed));
  const scale = parseFloat(scaleEl?.value || String(DEFAULTS.scale));

  if (color !== DEFAULTS.color.toLowerCase()) {
    opts.push(`  baseColor: '${color}',`);
  }
  if (Math.abs(speed - DEFAULTS.speed) > 1e-9) {
    opts.push(`  speed: ${fmt(speed)},`);
  }
  if (Math.abs(scale - DEFAULTS.scale) > 1e-9) {
    opts.push(`  scale: ${fmt(scale)},`);
  }

  const optionsBlock = opts.length
    ? `, {\n${opts.join('\n')}\n}`
    : '';

  return [
    "import createNeuralAnimation from 'neural-animation';",
    "",
    `const ctrl = createNeuralAnimation('#background'${optionsBlock});`
  ].join('\n');
}

function renderCode(){
  if (!codePre) return;
  const codeEl = codePre.querySelector('code');
  if (!codeEl) return;
  codeEl.textContent = buildCode();
  // @ts-ignore - hljs is loaded from CDN
  if (typeof hljs !== 'undefined') {
    // Remove old highlighting classes
    codeEl.removeAttribute('data-highlighted');
    codeEl.className = 'language-javascript';
    // @ts-ignore
    hljs.highlightElement(codeEl);
  }
}

function copyCode(){
  const text = buildCode();
  navigator.clipboard?.writeText(text).then(() => {
    if (copied){
      copied.classList.add('show');
      setTimeout(() => copied.classList.remove('show'), 1200);
    }
  });
}

function copyInstallCode(){
  const text = 'npm install neural-animation';
  navigator.clipboard?.writeText(text).then(() => {
    if (copiedInstall){
      copiedInstall.classList.add('show');
      setTimeout(() => copiedInstall.classList.remove('show'), 1200);
    }
  });
}

function copyHtmlCode(){
  const text = '<canvas id="background"></canvas>';
  navigator.clipboard?.writeText(text).then(() => {
    if (copiedHtml){
      copiedHtml.classList.add('show');
      setTimeout(() => copiedHtml.classList.remove('show'), 1200);
    }
  });
}

// Wire controls
colorEl?.addEventListener('input', () => {
  ctrl.setColor(colorEl.value);
  renderCode();
});

speedEl?.addEventListener('input', () => {
  const v = parseFloat(speedEl.value);
  speedVal && (speedVal.textContent = fmt(v));
  ctrl.setSpeed(v);
  renderCode();
});

scaleEl?.addEventListener('input', () => {
  const v = parseFloat(scaleEl.value);
  scaleVal && (scaleVal.textContent = fmt(v));
  ctrl.setScale(v);
  renderCode();
});

copyBtn?.addEventListener('click', copyCode);
copyInstallBtn?.addEventListener('click', copyInstallCode);
copyHtmlBtn?.addEventListener('click', copyHtmlCode);

// Keep canvas in sync
addEventListener('resize', () => ctrl.resize());

// Initial code render and highlight
renderCode();
// @ts-ignore - hljs is loaded from CDN
if (typeof hljs !== 'undefined') {
  // @ts-ignore
  hljs.highlightAll();
}
