// Generates an ORIGINAL dark-cinematic audio bed for the deadair trailer —
// Reznor/Ross-adjacent arpeggio mood, composed from scratch: zero copyright
// risk. Emits a filter_complex script used by the render command. Inputs:
//   [0:a] = _arp.wav  (looped 1.2s arpeggio)
//   [1:a] = _pulse.wav (looped soft kick)
import fs from 'node:fs';

const DUR = 25.5;
// must match make-video.mjs scene C: cmd len 44, typing 10.2 -> 11.5
const CMD_LEN = 44, TYPE_START = 10.2, TYPE_DUR = 1.3;

const parts = [];
const labels = [];

parts.push('[0:a]volume=0.33[arp]'); labels.push('arp');
parts.push('[1:a]volume=0.30[pulse]'); labels.push('pulse');

// low drone: A1 + A2 + E3, slow tremolo
parts.push(`sine=frequency=55:duration=${DUR},volume=0.30[dr1]`);
parts.push(`sine=frequency=110:duration=${DUR},volume=0.18[dr2]`);
parts.push(`sine=frequency=164.81:duration=${DUR},volume=0.10[dr3]`);
parts.push('[dr1][dr2][dr3]amix=inputs=3:normalize=0,tremolo=f=0.8:d=0.4,lowpass=f=900[drone]');
labels.push('drone');

// typing clicks — one per ~4 chars (~9/sec, human-plausible), short rounded
// ticks in a lower band so they read as key presses, not static. Tiny timing
// jitter (deterministic) so it doesn't sound machine-gunned.
const STEP = 4;
let ci = 0;
for (let k = 0; k < CMD_LEN; k += STEP) {
  const jitter = ((k * 7) % 3) * 8; // 0/8/16 ms, deterministic
  const ms = Math.round((TYPE_START + (k / CMD_LEN) * TYPE_DUR) * 1000) + jitter;
  const v = (0.30 + (ci % 3) * 0.06).toFixed(2);
  parts.push(
    `anoisesrc=d=0.014:c=brown:a=0.5,highpass=f=700,lowpass=f=3200,` +
    `afade=t=out:st=0.004:d=0.01,volume=${v},adelay=${ms}|${ms}[ck${ci}]`
  );
  labels.push(`ck${ci}`);
  ci += 1;
}

// swell into the CTA (~21s)
parts.push(`sine=frequency=220:duration=2.2,volume=0.2,afade=t=in:d=1.8,adelay=19200|19200[swell]`);
labels.push('swell');

const mix = `[${labels.join('][')}]amix=inputs=${labels.length}:normalize=0,` +
  `afade=t=in:st=0:d=1.6,afade=t=out:st=${(DUR - 1.8).toFixed(1)}:d=1.8,` +
  `loudnorm=I=-15:TP=-1.5:LRA=11[out]`;
parts.push(mix);

fs.writeFileSync('scripts/_audio_filter.txt', parts.join(';'));
console.log(`wrote audio filtergraph: ${labels.length} sources, ${ci} clicks`);
