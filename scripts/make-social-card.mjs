// GitHub social preview card: 1280x640, content inside an ~85px safe border
// (template recommends 40pt margins). Same brand system as the trailer.
import fs from 'node:fs';

const FONT = 'scripts/cascadia.ttf';
const C = {
  bg: '0x0a0e12', panel: '0x10161d', border: '0x1f2a36',
  text: '0xd7e0e9', dim: '0x71808f', cyan: '0x2dd4bf', amber: '0xfbbf24'
};

function esc(s) {
  return String(s).replace(/'/g, "'\\''").replace(/%/g, '\\\\%').replace(/:/g, '\\:');
}

let n = 0;
const chain = [];
function add(filter) {
  const inLabel = n === 0 ? 'bg' : `v${n}`;
  n += 1;
  chain.push(`[${inLabel}]${filter}[v${n}]`);
}
const CENTER = '(w-text_w)/2';
function text(s, y, size, color) {
  add(`drawtext=fontfile=${FONT}:text='${esc(s)}':fontsize=${size}:fontcolor=${color}:x='${CENTER}':y=${y}`);
}

text('deadair', 100, 96, C.text);
text('sell your dead air', 230, 40, C.amber);

// install command in a panel box
add(`drawbox=x=380:y=320:w=520:h=84:color=${C.panel}:t=fill`);
add(`drawbox=x=380:y=320:w=520:h=84:color=${C.border}:t=2`);
text('$ npm i -g deadair', 344, 36, C.cyan);

text('sponsored spinner lines for Codex, Gemini CLI & every agent', 470, 26, C.dim);
text('you keep 75% of the ad revenue', 515, 26, C.dim);

const head = `color=c=${C.bg}:s=1280x640:d=1[bg];`;
const script = head + chain.join(';') + `;[v${n}]format=rgb24[vout]`;
fs.writeFileSync('scripts/_card_filter.txt', script);
console.log(`wrote card filtergraph: ${chain.length} layers`);
