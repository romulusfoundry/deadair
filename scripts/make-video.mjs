// Generates the deadair launch trailer as a filter_complex script for ffmpeg.
// 1080x1080, 30fps, ~22.5s. Pure ffmpeg (drawtext/drawbox) — no external assets.
// Font is referenced by a colon-free relative path (scripts/cascadia.ttf) to
// dodge Windows drive-letter escaping in filtergraphs. Values that contain
// commas/parens (expressions, text) are single-quoted with REAL commas inside.
import fs from 'node:fs';

const W = 1080, H = 1080, FPS = 30, DUR = 22.5;
const FONT = 'scripts/cascadia.ttf';

const C = {
  bg: '0x0a0e12', panel: '0x10161d', border: '0x1f2a36',
  text: '0xd7e0e9', dim: '0x71808f', cyan: '0x2dd4bf', amber: '0xfbbf24'
};

// inside a single-quoted filtergraph value: escape single quotes; drawtext also
// treats % as an expansion sigil, so emit it as \% for a literal percent
function esc(s) {
  // filter_complex_script strips one backslash level, so emit \\% to leave
  // drawtext a literal \% (a single \% renders nothing after the percent)
  return String(s).replace(/'/g, "'\\''").replace(/%/g, '\\\\%');
}

let n = 0;
const chain = [];
function add(filter) {
  const inLabel = n === 0 ? 'bg' : `v${n}`;
  n += 1;
  chain.push(`[${inLabel}]${filter}[v${n}]`);
}

// fade in/out over [t0,t1] with f-sec ramps (real commas, single-quoted later)
function fadeAlpha(t0, t1, f = 0.4) {
  return `if(lt(t,${t0}),0,if(lt(t,${t0 + f}),(t-${t0})/${f},if(lt(t,${t1 - f}),1,if(lt(t,${t1}),(${t1}-t)/${f},0))))`;
}

function text({ s, x, y, size, color, t0, t1, font = FONT, fade = 0.4, alpha }) {
  const a = alpha || fadeAlpha(t0, t1, fade);
  add(
    `drawtext=fontfile=${font}:text='${esc(s)}':fontsize=${size}:fontcolor=${color}` +
    `:x=${x}:y=${y}:alpha='${a}':enable='between(t,${t0},${t1})'`
  );
}
function box(x, y, w, h, color, t0, t1) {
  add(`drawbox=x=${x}:y=${y}:w=${w}:h=${h}:color=${color}:t=fill:enable='between(t,${t0},${t1})'`);
}
function boxLine(x, y, w, h, color, thick, t0, t1) {
  add(`drawbox=x=${x}:y=${y}:w=${w}:h=${h}:color=${color}:t=${thick}:enable='between(t,${t0},${t1})'`);
}

const CENTER = '(w-text_w)/2';
const SPIN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
function spinner(x, y, size, color, t0, t1) {
  for (let i = 0; i < SPIN.length; i++) {
    text({
      s: SPIN[i], x, y, size, color, t0, t1,
      alpha: `if(between(t,${t0},${t1}),if(eq(mod(floor(t*12),${SPIN.length}),${i}),1,0),0)`
    });
  }
}

// ---------- Scene A: hook (0 - 3.4) ----------
text({ s: 'Your AI agent makes you', x: CENTER, y: 430, size: 52, color: C.text, t0: 0.3, t1: 3.2 });
text({ s: 'wait.', x: CENTER, y: 510, size: 110, color: C.amber, t0: 0.8, t1: 3.2 });
spinner(CENTER, 690, 52, C.cyan, 1.1, 3.2);

// ---------- Scene B: the product (3.4 - 10.6) ----------
box(150, 380, 780, 320, C.panel, 3.4, 10.6);
boxLine(150, 380, 780, 320, C.border, 2, 3.4, 10.6);
text({ s: 'deadair', x: 185, y: 405, size: 24, color: C.dim, t0: 3.6, t1: 10.6 });

const cmd = '$ deadair codex exec "fix the failing tests"';
const typeStart = 3.9, typeDur = 1.3, dt = typeDur / cmd.length;
for (let k = 1; k <= cmd.length; k++) {
  const tk = typeStart + k * dt;
  const tkEnd = k === cmd.length ? 10.6 : typeStart + (k + 1) * dt;
  text({ s: cmd.slice(0, k), x: 190, y: 470, size: 28, color: C.text, t0: tk, t1: tkEnd, alpha: '1' });
}
const cursorX = 190 + Math.round(cmd.length * 16.5);
text({
  s: '█', x: cursorX, y: 470, size: 28, color: C.cyan, t0: typeStart + typeDur, t1: 10.6,
  alpha: `if(gt(t,${(typeStart + typeDur).toFixed(2)}),mod(floor(t*2),2),0)`
});

spinner(190, 555, 28, C.cyan, 5.4, 10.4);
const ads = [
  'This wait could be sponsored. Your logo here',
  'Get paid to wait. First 1,000 keep 75% forever',
  'Works with Codex, Gemini CLI, and friends'
];
const adWin = [[5.5, 7.0], [7.0, 8.6], [8.6, 10.3]];
ads.forEach((adText, i) => text({
  s: adText, x: 225, y: 558, size: 22, color: C.dim, t0: adWin[i][0], t1: adWin[i][1], fade: 0.25
}));

// ---------- Scene C: the payoff (10.6 - 14.3) ----------
text({ s: 'Get paid to wait.', x: CENTER, y: 420, size: 92, color: C.amber, t0: 10.8, t1: 14.1 });
text({ s: 'The first 1,000 installs keep 75%.', x: CENTER, y: 560, size: 42, color: C.text, t0: 11.3, t1: 14.1 });
text({ s: 'Forever.', x: CENTER, y: 625, size: 42, color: C.dim, t0: 11.8, t1: 14.1 });

// ---------- Scene D: coverage (14.3 - 17.9) ----------
text({ s: 'Codex. Gemini CLI.', x: CENTER, y: 450, size: 68, color: C.text, t0: 14.5, t1: 17.7 });
text({ s: 'And every other agent.', x: CENTER, y: 560, size: 46, color: C.cyan, t0: 15.0, t1: 17.7 });

// ---------- Scene E: CTA (17.9 - 22.5) ----------
box(220, 460, 640, 96, C.panel, 18.1, 22.4);
boxLine(220, 460, 640, 96, C.border, 2, 18.1, 22.4);
text({ s: '$ npm i -g deadair', x: CENTER, y: 488, size: 46, color: C.cyan, t0: 18.3, t1: 22.4 });
text({ s: 'deadair.online', x: CENTER, y: 605, size: 42, color: C.amber, t0: 18.8, t1: 22.4 });
text({ s: 'open source  -  get paid to wait', x: CENTER, y: 685, size: 26, color: C.dim, t0: 19.3, t1: 22.4 });

const head = `color=c=${C.bg}:s=${W}x${H}:d=${DUR}:r=${FPS}[bg];`;
const script = head + chain.join(';') + `;[v${n}]format=yuv420p[vout]`;
fs.writeFileSync('scripts/_video_filter.txt', script);
console.log(`wrote filtergraph: ${chain.length} layers`);
