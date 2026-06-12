// VARIANT of make-video.mjs: the flash/drop lands at exactly 12.15s (for a
// soundtrack whose drop hits there) instead of 11.1s. Scene A unchanged,
// scene B holds OFF seconds longer, everything from scene C on shifts by OFF.
// Writes its own filtergraph + is rendered to deadair-trailer-1215-*.mp4 —
// does NOT touch the standard outputs.
import fs from 'node:fs';

const OFF = 1.21; // flash at 12.31 absolute — tuned against the song's drop in CapCut (+0.06 from 1.15)
const W = 1080, H = 1080, FPS = 30, DUR = 29.0 + OFF;
const FONT = 'scripts/cascadia.ttf';

const C = {
  bg: '0x0a0e12', panel: '0x10161d', border: '0x1f2a36',
  text: '0xd7e0e9', dim: '0x71808f', cyan: '0x2dd4bf', amber: '0xfbbf24'
};

function esc(s) {
  // drawtext re-parses its text value, so ':' needs escaping even inside the
  // single-quoted filtergraph value; % needs double-escaping (script strips one)
  return String(s).replace(/'/g, "'\\''").replace(/%/g, '\\\\%').replace(/:/g, '\\:');
}

let n = 0;
const chain = [];
function add(filter) {
  const inLabel = n === 0 ? 'bg' : `v${n}`;
  n += 1;
  chain.push(`[${inLabel}]${filter}[v${n}]`);
}
function fadeAlpha(t0, t1, f = 0.4) {
  return `if(lt(t,${t0}),0,if(lt(t,${t0 + f}),(t-${t0})/${f},if(lt(t,${t1 - f}),1,if(lt(t,${t1}),(${t1}-t)/${f},0))))`;
}
function text({ s, x, y, size, color, t0, t1, fade = 0.4, alpha }) {
  const a = alpha || fadeAlpha(t0, t1, fade);
  add(
    `drawtext=fontfile=${FONT}:text='${esc(s)}':fontsize=${size}:fontcolor=${color}` +
    `:x='${x}':y='${y}':alpha='${a}':enable='between(t,${t0},${t1})'`
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

// ---------- Scene A: hook (0 - 3.0) — UNSHIFTED ----------
const outOnly = (t1, f = 0.4) => `if(lt(t,${t1 - f}),1,if(lt(t,${t1}),(${t1}-t)/${f},0))`;
text({ s: 'Your AI agent makes you', x: CENTER, y: 420, size: 52, color: C.text, t0: 0, t1: 2.8, alpha: outOnly(2.8) });
text({
  s: 'wait.', x: '(w-text_w)/2-4', y: 501, size: 110, color: C.cyan, t0: 0.6, t1: 2.8,
  alpha: `if(eq(mod(floor(t*13),4),1),0.5,0)*${outOnly(2.8)}`
});
text({
  s: 'wait.', x: '(w-text_w)/2+4', y: 509, size: 110, color: '0xe05252', t0: 0.6, t1: 2.8,
  alpha: `if(eq(mod(floor(t*17),5),2),0.45,0)*${outOnly(2.8)}`
});
text({ s: 'wait.', x: CENTER, y: 505, size: 110, color: C.amber, t0: 0, t1: 2.8, alpha: outOnly(2.8) });
spinner(CENTER, 690, 52, C.cyan, 0, 2.8);

// ---------- Scene B: explainer (3.0 - 9.8+OFF) — holds OFF longer ----------
const B_END = 9.6 + OFF;
text({ s: 'Every wait is dead air.', x: CENTER, y: 200, size: 56, color: C.text, t0: 3.3, t1: B_END });
text({ s: 'YOUR SPINNER', x: 95, y: 340, size: 22, color: C.dim, t0: 3.9, t1: B_END });
box(80, 380, 410, 120, C.panel, 3.9, B_END);
boxLine(80, 380, 410, 120, C.border, 2, 3.9, B_END);
text({ s: '⠹ Reticulating splines...', x: 105, y: 428, size: 23, color: C.dim, t0: 4.1, t1: B_END });
text({ s: '→', x: 512, y: 410, size: 60, color: C.cyan, t0: 4.4, t1: B_END });
text({ s: 'WITH DEADAIR', x: 605, y: 340, size: 22, color: C.cyan, t0: 4.6, t1: B_END });
box(590, 380, 410, 120, C.panel, 4.6, B_END);
boxLine(590, 380, 410, 120, C.cyan, 2, 4.6, B_END);
text({ s: '⠹ This can be monetized - by you', x: 606, y: 430, size: 20, color: C.cyan, t0: 4.8, t1: B_END });
text({ s: 'Your dead air is ad space.', x: CENTER, y: 620, size: 60, color: C.amber, t0: 6.4, t1: B_END });

// ---------- Scene C: real usage — all times +OFF, flash at 12.15 ----------
const FLASH = 11.1 + OFF; // = 12.15 exactly
box(0, 0, W, H, '0x2dd4bf@0.30', FLASH, FLASH + 0.07);
box(0, 0, W, H, '0x2dd4bf@0.16', FLASH + 0.07, FLASH + 0.14);
box(0, 0, W, H, '0x2dd4bf@0.07', FLASH + 0.14, FLASH + 0.21);

const TERM_END = 23.4 + OFF;
box(150, 170, 780, 300, C.panel, 9.8 + OFF, TERM_END);
boxLine(150, 170, 780, 300, C.border, 2, 9.8 + OFF, TERM_END);
text({ s: 'deadair', x: 185, y: 195, size: 24, color: C.dim, t0: 9.9 + OFF, t1: TERM_END });
const cmd = '$ deadair codex';
const typeStart = 10.2 + OFF, typeDur = 0.8, dt = typeDur / cmd.length;
const T = typeStart + typeDur; // typing done at 12.05 — flash 0.1s later
for (let k = 1; k <= cmd.length; k++) {
  const tk = typeStart + k * dt;
  const tkEnd = k === cmd.length ? T : typeStart + (k + 1) * dt;
  text({ s: cmd.slice(0, k), x: 190, y: 260, size: 28, color: C.text, t0: tk, t1: tkEnd, alpha: '1' });
}
text({ s: '$ deadair', x: 190, y: 260, size: 28, color: C.text, t0: T, t1: TERM_END, alpha: '1' });
const AGENT_X = 190 + Math.round(10 * 16.5);
const AGENTS = ['codex', 'gemini', 'copilot', 'aider', 'hermes', 'openclaw', 'codex'];
const CYCLE_END = 15.5 + OFF;
const SWAP = (CYCLE_END - T) / AGENTS.length;
const RAMP = 0.25, RISE = 26;
AGENTS.forEach((agent, i) => {
  const a = T + i * SWAP;
  const last = i === AGENTS.length - 1;
  const b = last ? TERM_END : T + (i + 1) * SWAP;
  const enter = i === 0 ? 0.01 : RAMP;
  const yEnter = `260+${RISE}*(1-(t-${a.toFixed(2)})/${enter})`;
  const yExpr = last
    ? `if(lt(t,${(a + enter).toFixed(2)}),${yEnter},260)`
    : `if(lt(t,${(a + enter).toFixed(2)}),${yEnter},` +
      `if(lt(t,${(b - RAMP).toFixed(2)}),260,260-${RISE}*(t-${(b - RAMP).toFixed(2)})/${RAMP}))`;
  const aExpr = last
    ? `if(lt(t,${(a + enter).toFixed(2)}),(t-${a.toFixed(2)})/${enter},1)`
    : `if(lt(t,${(a + enter).toFixed(2)}),(t-${a.toFixed(2)})/${enter},` +
      `if(lt(t,${(b - RAMP).toFixed(2)}),1,(${b.toFixed(2)}-t)/${RAMP}))`;
  text({ s: agent, x: AGENT_X, y: yExpr, size: 28, color: C.cyan, t0: a, t1: b, alpha: aExpr });
});
const cmd2 = '> Hey codex, fix whatever I broke in checkout';
const typeStart2 = 15.7 + OFF, typeDur2 = 1.4, dt2 = typeDur2 / cmd2.length;
for (let k = 1; k <= cmd2.length; k++) {
  const tk = typeStart2 + k * dt2;
  const tkEnd = k === cmd2.length ? TERM_END : typeStart2 + (k + 1) * dt2;
  text({ s: cmd2.slice(0, k), x: 190, y: 320, size: 24, color: C.text, t0: tk, t1: tkEnd, alpha: '1' });
}

spinner(190, 385, 26, C.cyan, 17.4 + OFF, TERM_END - 0.2);
const adText = 'What is predicting the market - standardpoorly.com';
text({ s: adText, x: 222, y: 387, size: 22, color: C.dim, t0: 17.5 + OFF, t1: TERM_END - 0.2, fade: 0.25 });

const pulse = (t0) => `(0.88+0.12*sin(2*PI*2*t))*(${fadeAlpha(t0, TERM_END, 0.3)})`;
text({ s: 'This ad just paid', x: CENTER, y: 545, size: 80, color: C.amber, t0: 19.6 + OFF, t1: TERM_END, alpha: pulse(19.6 + OFF) });
text({ s: 'the dev reading it', x: CENTER, y: 648, size: 80, color: C.amber, t0: 19.7 + OFF, t1: TERM_END, alpha: pulse(19.7 + OFF) });
text({ s: 'First 1,000 installs keep 75% of net ad revenue', x: CENTER, y: 775, size: 34, color: C.text, t0: 20.4 + OFF, t1: TERM_END });
text({ s: 'Forever. 50/50 after that.', x: CENTER, y: 835, size: 34, color: C.dim, t0: 20.9 + OFF, t1: TERM_END });

// ---------- Scene E: CTA + coverage merged — all times +OFF ----------
const E_END = 28.8 + OFF;
text({ s: 'install once:', x: CENTER, y: 300, size: 26, color: C.dim, t0: 23.9 + OFF, t1: E_END });
box(220, 340, 640, 96, C.panel, 23.8 + OFF, E_END);
boxLine(220, 340, 640, 96, C.border, 2, 23.8 + OFF, E_END);
text({ s: '$ npm i -g deadair', x: CENTER, y: 368, size: 46, color: C.cyan, t0: 24.0 + OFF, t1: E_END });
text({ s: 'then run yours:', x: CENTER, y: 495, size: 24, color: C.dim, t0: 24.4 + OFF, t1: E_END });
text({ s: 'Codex · Gemini · Copilot · Aider · Hermes', x: CENTER, y: 548, size: 34, color: C.text, t0: 24.6 + OFF, t1: E_END });
text({ s: 'OpenClaw · Droid · Opencode · Cursor · Goose', x: CENTER, y: 603, size: 34, color: C.text, t0: 24.8 + OFF, t1: E_END });
text({ s: 'and every other agent: deadair anything', x: CENTER, y: 678, size: 36, color: C.cyan, t0: 25.3 + OFF, t1: E_END });
text({ s: 'deadair.online', x: CENTER, y: 755, size: 44, color: C.amber, t0: 25.8 + OFF, t1: E_END });
text({ s: 'sell your dead air', x: CENTER, y: 825, size: 30, color: C.dim, t0: 26.1 + OFF, t1: E_END });

const head = `color=c=${C.bg}:s=${W}x${H}:d=${DUR}:r=${FPS}[bg];`;
// Static tune-in identical to the main cut, but the edge static dies at the
// shifted flash moment (12.15) instead of 11.1.
const staticBranch =
  `color=c=0x707070:s=${W}x${H}:d=3.4:r=${FPS}[ns0];` +
  `[ns0]noise=alls=100:allf=t+u,hue=s=0,format=yuva420p,colorchannelmixer=aa=0.45,` +
  `fade=t=out:st=0.6:d=2.6:alpha=1[staticFull];` +
  `color=c=0x707070:s=${W}x${H}:d=${(11.3 + OFF).toFixed(2)}:r=${FPS}[ne0];` +
  `[ne0]noise=alls=100:allf=t+u,hue=s=0,format=yuva420p,` +
  `geq=lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':a='115*max(clip((97-Y)/97,0,1),clip((Y-${H - 97})/97,0,1))',` +
  `fade=t=out:st=${(FLASH - 0.15).toFixed(2)}:d=0.15:alpha=1[staticEdge]`;
// DEADAIR_NO_STATIC=1 → clean render with no TV-static layers (for adding
// static as an editor effect, e.g. CapCut); flash + all timing unchanged.
const NO_STATIC = process.env.DEADAIR_NO_STATIC === '1';
const script = NO_STATIC
  ? head + chain.join(';') + `;[v${n}]format=yuv420p[vout]`
  : head + chain.join(';') + ';' + staticBranch +
    `;[v${n}][staticFull]overlay=enable='lt(t,3.3)'[vS1]` +
    `;[vS1][staticEdge]overlay=enable='between(t,3.0,${FLASH})'[vS2];[vS2]format=yuv420p[vout]`;
fs.writeFileSync('scripts/_video_filter_1215.txt', script);
console.log(`wrote filtergraph: ${chain.length} layers${NO_STATIC ? ' (NO static)' : ' + static tune-in'}, flash at ${FLASH}s, ${DUR}s total`);
