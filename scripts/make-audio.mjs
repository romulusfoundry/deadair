// Generates an ORIGINAL dark-cinematic audio bed for the deadair trailer —
// in the spirit of a Reznor/Ross arpeggio score but composed from scratch, so
// it carries zero copyright/Content-ID risk. Emits a filter_complex script
// that the accompanying ffmpeg command uses. Inputs (provided by the command):
//   [0:a] = arp.wav  (looped 1-bar arpeggio)
//   [1:a] = pulse.wav (looped soft kick)
// Everything else (drones, typing clicks, swell) is synthesized inline.
import fs from 'node:fs';

const DUR = 22.5;
// typing window must match make-video.mjs (cmd length 44, start 3.9, dur 1.3)
const CMD_LEN = 44, TYPE_START = 3.9, TYPE_DUR = 1.3;
const dt = TYPE_DUR / CMD_LEN;

const parts = [];
const labels = [];

// --- looped musical inputs (volumes set so the pre-loudnorm sum won't clip) ---
parts.push('[0:a]volume=0.33[arp]'); labels.push('arp');
parts.push('[1:a]volume=0.30[pulse]'); labels.push('pulse');

// --- low drone: A1 + A2 + E3, slow tremolo for movement ---
parts.push(`sine=frequency=55:duration=${DUR},volume=0.30[dr1]`);
parts.push(`sine=frequency=110:duration=${DUR},volume=0.18[dr2]`);
parts.push(`sine=frequency=164.81:duration=${DUR},volume=0.10[dr3]`);
parts.push('[dr1][dr2][dr3]amix=inputs=3:normalize=0,tremolo=f=0.8:d=0.4,lowpass=f=900[drone]');
labels.push('drone');

// --- typing clicks: a short filtered-noise tick per character ---
for (let k = 0; k < CMD_LEN; k++) {
  const ms = Math.round((TYPE_START + k * dt) * 1000);
  const v = (0.5 + (k % 3) * 0.12).toFixed(2); // slight variation = less "buzz"
  parts.push(
    `anoisesrc=d=0.022:c=pink:a=0.8,highpass=f=1800,lowpass=f=6000,volume=${v},adelay=${ms}|${ms}[ck${k}]`
  );
  labels.push(`ck${k}`);
}

// --- swell into the CTA (~18s): rising sine, short ---
parts.push(`sine=frequency=220:duration=2.2,volume=0.2,afade=t=in:d=1.8,adelay=16200|16200[swell]`);
labels.push('swell');

// --- final mix + master ---
const mix = `[${labels.join('][')}]amix=inputs=${labels.length}:normalize=0,` +
  `afade=t=in:st=0:d=1.6,afade=t=out:st=20.7:d=1.8,` +
  `loudnorm=I=-15:TP=-1.5:LRA=11[out]`;
parts.push(mix);

fs.writeFileSync('scripts/_audio_filter.txt', parts.join(';'));
console.log(`wrote audio filtergraph: ${labels.length} sources`);
