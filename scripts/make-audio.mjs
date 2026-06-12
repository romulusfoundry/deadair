// ORIGINAL score for the deadair trailer — Kid A-shaped structure, composed
// from scratch (zero copyright/Content-ID risk): sparse eerie intro (drone +
// lonely bells, NO beat) -> noise riser -> full DROP (boom + kick + arp + hats)
// landing exactly when the terminal appears. Inputs from the render command:
//   [0:a] = _arp.wav   [1:a] = _pulse.wav   [2:a] = _hat.wav
import fs from 'node:fs';

const DUR = 29.0;
// must match make-video.mjs scene C: cmd len 15, typing 10.2 -> 11.0
const CMD_LEN = 15, TYPE_START = 10.2, TYPE_DUR = 0.8;
const DROP_MS = 10200; // the drop = the moment the product appears

const parts = [];
const labels = [];

// --- rhythm section: silent until the drop ---
parts.push(`[0:a]volume=0.52,adelay=${DROP_MS}|${DROP_MS}[arp]`); labels.push('arp');
parts.push(`[1:a]volume=0.48,adelay=${DROP_MS}|${DROP_MS}[pulse]`); labels.push('pulse');
parts.push(`[2:a]volume=0.18,adelay=${DROP_MS}|${DROP_MS}[hat]`); labels.push('hat');

// --- drone: present throughout but LOW — the intro must sit quiet so the
// drop actually drops (intro RMS well under post-drop RMS) ---
parts.push(`sine=frequency=55:duration=${DUR},volume=0.14[dr1]`);
parts.push(`sine=frequency=110:duration=${DUR},volume=0.09[dr2]`);
parts.push(`sine=frequency=164.81:duration=${DUR},volume=0.05[dr3]`);
parts.push('[dr1][dr2][dr3]amix=inputs=3:normalize=0,tremolo=f=0.8:d=0.4,lowpass=f=900[drone]');
labels.push('drone');

// --- intro bells: lonely high tones over the drone (eerie, sparse) ---
// A-minor colors: E5, C5, A5, D5 — long decays, quiet, irregular spacing
const BELLS = [[1000, 659.25], [3400, 523.25], [5600, 880], [7600, 587.33]];
BELLS.forEach(([ms, hz], i) => {
  parts.push(
    `sine=frequency=${hz}:duration=1.8,volume=0.16,afade=t=in:d=0.02,` +
    `afade=t=out:st=0.1:d=1.7,adelay=${ms}|${ms}[bell${i}]`
  );
  labels.push(`bell${i}`);
});

// --- riser: filtered noise swelling from 8.2s into the drop ---
parts.push(
  `anoisesrc=d=2.0:c=pink:a=0.6,lowpass=f=2400,highpass=f=300,` +
  `afade=t=in:st=0:d=1.9,volume=0.5,adelay=8200|8200[riser]`
);
labels.push('riser');

// --- impact boom AT the drop: sub thump + short dark noise burst ---
parts.push(
  `sine=frequency=48:duration=0.7,volume=0.9,afade=t=out:st=0.05:d=0.65,adelay=${DROP_MS}|${DROP_MS}[boomtone]`
);
labels.push('boomtone');
parts.push(
  `anoisesrc=d=0.25:c=brown:a=0.7,lowpass=f=600,volume=0.6,afade=t=out:st=0.02:d=0.23,adelay=${DROP_MS}|${DROP_MS}[boomnoise]`
);
labels.push('boomnoise');

// --- typing clicks (during the drop's first bar) ---
const STEP = 2; // 15-char command -> ~8 clicks
let ci = 0;
for (let k = 0; k < CMD_LEN; k += STEP) {
  const jitter = ((k * 7) % 3) * 8;
  const ms = Math.round((TYPE_START + (k / CMD_LEN) * TYPE_DUR) * 1000) + jitter;
  const v = (0.30 + (ci % 3) * 0.06).toFixed(2);
  parts.push(
    `anoisesrc=d=0.014:c=brown:a=0.5,highpass=f=700,lowpass=f=3200,` +
    `afade=t=out:st=0.004:d=0.01,volume=${v},adelay=${ms}|${ms}[ck${ci}]`
  );
  labels.push(`ck${ci}`);
  ci += 1;
}

// --- swell into the CTA (~26.2s) ---
parts.push(`sine=frequency=220:duration=2.2,volume=0.22,afade=t=in:d=1.8,adelay=24400|24400[swell]`);
labels.push('swell');

// STATIC gain only — loudnorm is a dynamic normalizer and it flattens the
// intro-vs-drop contrast that makes the structure work. GAIN_DB is set by
// the render script after a measurement pass (peak to ~-1.5 dB).
const GAIN_DB = process.env.DEADAIR_GAIN_DB || '0';
const mix = `[${labels.join('][')}]amix=inputs=${labels.length}:normalize=0,` +
  `afade=t=in:st=0:d=1.2,afade=t=out:st=${(DUR - 1.8).toFixed(1)}:d=1.8,` +
  `volume=${GAIN_DB}dB,alimiter=limit=0.89[out]`;
parts.push(mix);

fs.writeFileSync('scripts/_audio_filter.txt', parts.join(';'));
console.log(`wrote audio filtergraph: ${labels.length} sources, drop at ${DROP_MS}ms`);
