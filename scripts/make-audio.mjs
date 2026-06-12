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

// --- rhythm section: silent until the drop. Arp gets chorus for width. ---
parts.push(`[0:a]chorus=0.6:0.9:50|62:0.35|0.3:0.25|0.4:1.8|2.2,volume=0.52,adelay=${DROP_MS}|${DROP_MS}[arp]`); labels.push('arp');
parts.push(`[1:a]volume=0.48,adelay=${DROP_MS}|${DROP_MS}[pulse]`); labels.push('pulse');
parts.push(`[2:a]volume=0.18,adelay=${DROP_MS}|${DROP_MS}[hat]`); labels.push('hat');
// driving bass under the drop — soft-clipped for analog grit
parts.push(`[4:a]asoftclip=type=atan,volume=0.5,adelay=${DROP_MS}|${DROP_MS}[bass]`); labels.push('bass');

// --- keys motif: the intro IS this. Vibrato = the expressive/rubato
// movement; echo = room so it isn't dry; gentle lowpass tames the top.
// NO sustained elements anywhere in the intro — short notes + space only.
parts.push(
  '[3:a]vibrato=f=4.3:d=0.10,aecho=0.7:0.75:70|110:0.32|0.22,' +
  'lowpass=f=3800,volume=0.62[motif]'
); labels.push('motif');

// --- heartbeat: one soft sub thump per second. Tension from pulse and
// silence, not from a pad. Runs until the build takes over. ---
for (let s = 0; s <= 7; s++) {
  const ms = s * 1000;
  parts.push(
    `sine=frequency=52:duration=0.16,volume=0.55,afade=t=in:d=0.005,` +
    `afade=t=out:st=0.03:d=0.13,adelay=${ms}|${ms}[hb${s}]`
  );
  labels.push(`hb${s}`);
}

// --- the build: heartbeat doubles, then doubles again — an accelerating
// kick run into the drop (musical buildup, no noise/jet riser) ---
const BUILD = [8200, 8700, 9200, 9450, 9700, 9825, 9950, 10075];
BUILD.forEach((ms, i) => {
  const v = (0.5 + i * 0.05).toFixed(2);
  parts.push(
    `sine=frequency=58:duration=0.13,volume=${v},afade=t=in:d=0.004,` +
    `afade=t=out:st=0.025:d=0.1,adelay=${ms}|${ms}[bd${i}]`
  );
  labels.push(`bd${i}`);
});

// --- impact boom AT the drop: sub thump + short dark noise burst ---
parts.push(
  `sine=frequency=48:duration=0.7,volume=0.9,afade=t=out:st=0.05:d=0.65,adelay=${DROP_MS}|${DROP_MS}[boomtone]`
);
labels.push('boomtone');
parts.push(
  `anoisesrc=d=0.25:c=brown:a=0.7,lowpass=f=600,volume=0.6,afade=t=out:st=0.02:d=0.23,adelay=${DROP_MS}|${DROP_MS}[boomnoise]`
);
labels.push('boomnoise');

// --- typing clicks: run 1 = the command, run 2 = the prompt (matches
// make-video.mjs cmd2 typing at 15.7s) ---
const RUNS = [
  [TYPE_START, TYPE_DUR, CMD_LEN],
  [15.7, 1.4, 45]
];
let ci = 0;
for (const [start, dur, len] of RUNS) {
  for (let k = 0; k < len; k += 2) {
    const jitter = ((k * 7) % 3) * 8;
    const ms = Math.round((start + (k / len) * dur) * 1000) + jitter;
    const v = (0.30 + (ci % 3) * 0.06).toFixed(2);
    parts.push(
      `anoisesrc=d=0.014:c=brown:a=0.5,highpass=f=700,lowpass=f=3200,` +
      `afade=t=out:st=0.004:d=0.01,volume=${v},adelay=${ms}|${ms}[ck${ci}]`
    );
    labels.push(`ck${ci}`);
    ci += 1;
  }
}

// (CTA swell removed — it was another sustained sine; the groove carries
// the ending and the fade-out does the rest)

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
