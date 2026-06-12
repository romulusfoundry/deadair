// Generates the deadair launch trailer as a filter_complex script for ffmpeg.
// 1080x1080, 30fps, ~25.5s. Pure ffmpeg (drawtext/drawbox) — no external assets.
// Font referenced by a colon-free relative path to dodge Windows escaping.
import fs from 'node:fs';

const W = 1080, H = 1080, FPS = 30, DUR = 29.0;
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

// ---------- Scene A: hook (0 - 3.0) ----------
// Visible from FRAME ZERO — the poster frame when the video doesn't autoplay
// must already be the hook, not a black square. Fade out only.
const outOnly = (t1, f = 0.4) => `if(lt(t,${t1 - f}),1,if(lt(t,${t1}),(${t1}-t)/${f},0))`;
text({ s: 'Your AI agent makes you', x: CENTER, y: 420, size: 52, color: C.text, t0: 0, t1: 2.8, alpha: outOnly(2.8) });
// glitch double-image on "wait." — cyan/red ghosts flickering off-register
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

// ---------- Scene B: explainer / before-after (3.0 - 9.8) ----------
text({ s: 'Every wait is dead air.', x: CENTER, y: 200, size: 56, color: C.text, t0: 3.3, t1: 9.6 });
// left card: a normal witty spinner phrase
text({ s: 'YOUR SPINNER', x: 95, y: 340, size: 22, color: C.dim, t0: 3.9, t1: 9.6 });
box(80, 380, 410, 120, C.panel, 3.9, 9.6);
boxLine(80, 380, 410, 120, C.border, 2, 3.9, 9.6);
text({ s: '⠹ Reticulating splines...', x: 105, y: 428, size: 23, color: C.dim, t0: 4.1, t1: 9.6 });
// arrow
text({ s: '→', x: 512, y: 410, size: 60, color: C.cyan, t0: 4.4, t1: 9.6 });
// right card: the same spinner, now an ad
text({ s: 'WITH DEADAIR', x: 605, y: 340, size: 22, color: C.cyan, t0: 4.6, t1: 9.6 });
box(590, 380, 410, 120, C.panel, 4.6, 9.6);
boxLine(590, 380, 410, 120, C.cyan, 2, 4.6, 9.6);
text({ s: '⠹ your product here', x: 615, y: 428, size: 23, color: C.cyan, t0: 4.8, t1: 9.6 });
// tagline reveal
text({ s: 'Your dead air is ad space.', x: CENTER, y: 620, size: 60, color: C.amber, t0: 6.4, t1: 9.6 });

// ---------- Scene C: real usage (9.8 - 14.3) ----------
// FLASH when the command is ENTERED (11.1s — typing completes at 11.0):
// the moment the signal "locks in". Synced to the music drop; the edge
// static dies at this exact frame too.
box(0, 0, W, H, '0x2dd4bf@0.30', 11.1, 11.17);
box(0, 0, W, H, '0x2dd4bf@0.16', 11.17, 11.24);
box(0, 0, W, H, '0x2dd4bf@0.07', 11.24, 11.31);

// Terminal sits in the upper half and STAYS while the payoff text lands
// beneath it. STRICTLY SEQUENTIAL beats so the eye tracks one thing at a
// time: type -> cycle agents -> spinner+ad appears -> money text reveals.
const TERM_END = 23.4;
box(150, 170, 780, 300, C.panel, 9.8, TERM_END);
boxLine(150, 170, 780, 300, C.border, 2, 9.8, TERM_END);
text({ s: 'deadair', x: 185, y: 195, size: 24, color: C.dim, t0: 9.9, t1: TERM_END });
// Type "$ deadair codex", then the agent word cycles — slides up & fades out,
// next agent slides up into the slot: codex -> gemini -> copilot -> aider.
// Shows multi-agent coverage inside the demo itself.
const cmd = '$ deadair codex';
const typeStart = 10.2, typeDur = 0.8, dt = typeDur / cmd.length;
const T = typeStart + typeDur; // typing done
for (let k = 1; k <= cmd.length; k++) {
  const tk = typeStart + k * dt;
  const tkEnd = k === cmd.length ? T : typeStart + (k + 1) * dt;
  text({ s: cmd.slice(0, k), x: 190, y: 260, size: 28, color: C.text, t0: tk, t1: tkEnd, alpha: '1' });
}
// static prefix stays; agent word becomes its own animated layer
text({ s: '$ deadair', x: 190, y: 260, size: 28, color: C.text, t0: T, t1: TERM_END, alpha: '1' });
const AGENT_X = 190 + Math.round(10 * 16.5);
// cycle ends back on codex (holds) so the typed prompt below addresses it
const AGENTS = ['codex', 'gemini', 'copilot', 'aider', 'hermes', 'openclaw', 'codex'];
const CYCLE_END = 15.5; // cycling finishes BEFORE the prompt types
const SWAP = (CYCLE_END - T) / AGENTS.length; // ~0.64s each
const RAMP = 0.25, RISE = 26;
AGENTS.forEach((agent, i) => {
  const a = T + i * SWAP;
  const last = i === AGENTS.length - 1;
  const b = last ? TERM_END : T + (i + 1) * SWAP;
  const enter = i === 0 ? 0.01 : RAMP; // first word was just typed — no entry
  // enter: rise from below + fade in; exit: keep rising out + fade away.
  // Last agent LANDS and holds — the cycle resolves before the next beat.
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
// Beat 2: a REAL prompt gets typed below the command (second typing run,
// matching click track in the audio scripts: PROMPT_START/DUR/LEN)
const cmd2 = '> Hey codex, fix whatever I broke in checkout';
const typeStart2 = 15.7, typeDur2 = 1.4, dt2 = typeDur2 / cmd2.length;
for (let k = 1; k <= cmd2.length; k++) {
  const tk = typeStart2 + k * dt2;
  const tkEnd = k === cmd2.length ? TERM_END : typeStart2 + (k + 1) * dt2;
  text({ s: cmd2.slice(0, k), x: 190, y: 320, size: 24, color: C.text, t0: tk, t1: tkEnd, alpha: '1' });
}

// Beat 3: the thinking spinner + ad appear UNDER the prompt — the product,
// demonstrated end to end (17.4+)
spinner(190, 385, 26, C.cyan, 17.4, TERM_END - 0.2);
const ads = [
  'This wait could be sponsored. Your logo here',
  'Works with Codex, Gemini CLI, and friends'
];
const adWin = [[17.5, 20.4], [20.4, TERM_END - 0.2]];
ads.forEach((adText, i) => text({
  s: adText, x: 222, y: 387, size: 22, color: C.dim, t0: adWin[i][0], t1: adWin[i][1], fade: 0.25
}));

// Beat 3: the money reveals below, after the ad has registered (19.6+)
// — alpha pulses gently on the beat (2Hz) so the frame never sits static
text({
  s: 'And you keep 75%', x: CENTER, y: 560, size: 84, color: C.amber, t0: 19.6, t1: TERM_END,
  alpha: `(0.88+0.12*sin(2*PI*2*t))*(${fadeAlpha(19.6, TERM_END, 0.3)})`
});
text({ s: 'of net ad revenue. The first 1,000 installs. Forever.', x: CENTER, y: 690, size: 34, color: C.text, t0: 20.2, t1: TERM_END });
text({ s: '50/50 after that.', x: CENTER, y: 750, size: 34, color: C.dim, t0: 20.7, t1: TERM_END });

// ---------- Scene E: coverage (23.6 - 26.0) ----------
text({ s: 'Codex. Gemini. Copilot. Aider.', x: CENTER, y: 430, size: 52, color: C.text, t0: 23.7, t1: 25.9 });
text({ s: 'Hermes. OpenClaw. Droid. Opencode.', x: CENTER, y: 505, size: 52, color: C.text, t0: 23.9, t1: 25.9 });
text({ s: 'And every other agent.', x: CENTER, y: 610, size: 44, color: C.cyan, t0: 24.3, t1: 25.9 });

// ---------- Scene F: CTA (26.1 - 29.0) ----------
text({ s: 'install once:', x: CENTER, y: 415, size: 26, color: C.dim, t0: 26.3, t1: 28.8 });
box(220, 455, 640, 96, C.panel, 26.2, 28.8);
boxLine(220, 455, 640, 96, C.border, 2, 26.2, 28.8);
text({ s: '$ npm i -g deadair', x: CENTER, y: 483, size: 46, color: C.cyan, t0: 26.4, t1: 28.8 });
text({ s: 'then: deadair codex · deadair gemini · deadair run anything', x: CENTER, y: 580, size: 24, color: C.dim, t0: 26.8, t1: 28.8 });
text({ s: 'deadair.online', x: CENTER, y: 645, size: 42, color: C.amber, t0: 27.0, t1: 28.8 });
text({ s: 'sell your dead air', x: CENTER, y: 720, size: 32, color: C.dim, t0: 27.3, t1: 28.8 });

const head = `color=c=${C.bg}:s=${W}x${H}:d=${DUR}:r=${FPS}[bg];`;
// TV-static "tune-in": dead air IS static. Snow at ~50% opacity over the
// hook (text stays readable on a paused scroll), clearing as the signal
// tunes in over the first ~3s.
// Three-phase static: (1) full snow over the hook, fading down as the copy
// rolls; (2) snow receding to the EDGES (vignette) through the explainer and
// terminal scenes; (3) killed dead by the cyan flash at 11.1s when the
// command is entered — the signal locks in.
const staticBranch =
  `color=c=0x707070:s=${W}x${H}:d=3.4:r=${FPS}[ns0];` +
  `[ns0]noise=alls=100:allf=t+u,hue=s=0,format=yuva420p,colorchannelmixer=aa=0.45,` +
  `fade=t=out:st=0.6:d=2.6:alpha=1[staticFull];` +
  `color=c=0x707070:s=${W}x${H}:d=11.3:r=${FPS}[ne0];` +
  `[ne0]noise=alls=100:allf=t+u,hue=s=0,format=yuva420p,` +
  `geq=lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':a='115*clip((hypot(X-${W / 2},Y-${H / 2})-400)/170,0,1)',` +
  `fade=t=out:st=10.95:d=0.15:alpha=1[staticEdge]`;
const script = head + chain.join(';') + ';' + staticBranch +
  `;[v${n}][staticFull]overlay=enable='lt(t,3.3)'[vS1]` +
  `;[vS1][staticEdge]overlay=enable='between(t,3.0,11.1)'[vS2];[vS2]format=yuv420p[vout]`;
fs.writeFileSync('scripts/_video_filter.txt', script);
console.log(`wrote filtergraph: ${chain.length} layers + static tune-in, ${DUR}s`);
