// V2 "EDM" score — Justice-adjacent French-electro feel, original material:
// same heartbeat/motif intro and kick build (matches the video), but the drop
// is a four-on-the-floor groove led by a syncopated distorted bass riff with
// a sidechain-style pump, offbeat-heavy hats, and backbeat claps. Inputs:
//   [0]=_arp [1]=_pulse(kick) [2]=_hat [3]=_motif [4]=_bassedm [5]=_clap
import fs from 'node:fs';

const DUR = 29.0;
const CMD_LEN = 15, TYPE_START = 10.2, TYPE_DUR = 0.8;
const DROP_MS = 10200;

const parts = [];
const labels = [];

// --- the groove (all silent until the drop) ---
// bass leads: DRIVEN into the clipper (volume up pre-clip = distortion buzz
// audible on laptop speakers), 2Hz tremolo = sidechain pump feel
parts.push(`[4:a]volume=1.8,asoftclip=type=atan,tremolo=f=2:d=0.45,volume=0.55,adelay=${DROP_MS}|${DROP_MS}[bass]`);
labels.push('bass');
// four-on-the-floor kick (0.5s loop = 120bpm quarters)
parts.push(`[1:a]volume=0.65,adelay=${DROP_MS}|${DROP_MS}[kick]`); labels.push('kick');
// constant 16th hats, brighter than v1
parts.push(`[2:a]volume=0.26,adelay=${DROP_MS}|${DROP_MS}[hat]`); labels.push('hat');
// claps on the backbeat (1.0s loop, hit at 0.5s)
parts.push(`[5:a]volume=0.5,adelay=${DROP_MS}|${DROP_MS}[clap]`); labels.push('clap');
// arp rides on top, quieter — the bass is the lead voice here
parts.push(`[0:a]chorus=0.6:0.9:50|62:0.35|0.3:0.25|0.4:1.8|2.2,volume=0.34,adelay=${DROP_MS}|${DROP_MS}[arp]`);
labels.push('arp');

// --- intro: identical to v1 (heartbeat + motif), keeps the video sync ---
parts.push(
  '[3:a]vibrato=f=4.3:d=0.10,aecho=0.7:0.75:70|110:0.32|0.22,' +
  'lowpass=f=3800,volume=0.62[motif]'
); labels.push('motif');

for (let s = 0; s <= 7; s++) {
  const ms = s * 1000;
  parts.push(
    `sine=frequency=52:duration=0.16,volume=0.55,afade=t=in:d=0.005,` +
    `afade=t=out:st=0.03:d=0.13,adelay=${ms}|${ms}[hb${s}]`
  );
  labels.push(`hb${s}`);
}

const BUILD = [8200, 8700, 9200, 9450, 9700, 9825, 9950, 10075];
BUILD.forEach((ms, i) => {
  const v = (0.5 + i * 0.05).toFixed(2);
  parts.push(
    `sine=frequency=58:duration=0.13,volume=${v},afade=t=in:d=0.004,` +
    `afade=t=out:st=0.025:d=0.1,adelay=${ms}|${ms}[bd${i}]`
  );
  labels.push(`bd${i}`);
});

// --- impact boom at the drop ---
parts.push(`sine=frequency=48:duration=0.7,volume=0.9,afade=t=out:st=0.05:d=0.65,adelay=${DROP_MS}|${DROP_MS}[boomtone]`);
labels.push('boomtone');
parts.push(`anoisesrc=d=0.25:c=brown:a=0.7,lowpass=f=600,volume=0.6,afade=t=out:st=0.02:d=0.23,adelay=${DROP_MS}|${DROP_MS}[boomnoise]`);
labels.push('boomnoise');

// --- typing clicks: run 1 = command, run 2 = prompt (video cmd2 @15.7s) ---
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

const GAIN_DB = process.env.DEADAIR_GAIN_DB || '0';
const mix = `[${labels.join('][')}]amix=inputs=${labels.length}:normalize=0,` +
  `afade=t=in:st=0:d=1.2,afade=t=out:st=${(DUR - 1.8).toFixed(1)}:d=1.8,` +
  `volume=${GAIN_DB}dB,alimiter=limit=0.89[out]`;
parts.push(mix);

fs.writeFileSync('scripts/_audio_edm_filter.txt', parts.join(';'));
console.log(`wrote EDM filtergraph: ${labels.length} sources, drop at ${DROP_MS}ms`);
