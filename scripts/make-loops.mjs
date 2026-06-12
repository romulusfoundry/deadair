// Generates filtergraphs for the trailer's musical loops. Original material —
// Kid A-ADJACENT character with our own notes. Notes are FAT UNISON STACKS
// (fundamental + 3-cent detune + octave + twelfth) with humanized timing, so
// nothing sounds like a naked sine. Expression (vibrato/chorus/echo) is
// applied at the bed level in make-audio.mjs.
import fs from 'node:fs';

// warm 4-partial "keys" note with slight timing humanization
function note(freq, slotMs, durS, vol, idx, parts, mixLabels) {
  const d = durS.toFixed(3);
  const jitter = ((idx * 11) % 5) * 4 - 8; // -8..+8ms deterministic push/pull
  const ms = Math.max(0, slotMs + jitter);
  const partials = [
    [freq, vol],                 // fundamental
    [freq * 1.003, vol * 0.55],  // detuned unison — width/beating warmth
    [freq * 2, vol * 0.30],      // octave
    [freq * 3, vol * 0.10]       // twelfth — presence without shrill
  ];
  partials.forEach(([f, v], p) => {
    parts.push(
      `sine=frequency=${f.toFixed(2)}:duration=${d},volume=${v.toFixed(3)},afade=t=in:d=0.015,` +
      `afade=t=out:st=${(durS * 0.25).toFixed(3)}:d=${(durS * 0.75).toFixed(3)},adelay=${ms}|${ms}[n${idx}p${p}]`
    );
    mixLabels.push(`n${idx}p${p}`);
  });
}

// --- intro motif: 2.0s loop, 8 circling eighth-notes, melancholic + modal ---
// E4 G4 D4 F4 C4 E4 B3 D4 — circling thirds, original phrase
const MOTIF = [329.63, 392.0, 293.66, 349.23, 261.63, 329.63, 246.94, 293.66];
{
  const parts = [], labels = [];
  MOTIF.forEach((f, i) => note(f, i * 250, 0.42, 0.5, i, parts, labels));
  parts.push(`[${labels.join('][')}]amix=inputs=${labels.length}:normalize=0,apad=whole_dur=2.0[out]`);
  fs.writeFileSync('scripts/_motif_filter.txt', parts.join(';'));
}

// --- drop arp: 2.0s loop, 16 sixteenth-notes, Am bar -> F bar (i -> VI) ---
const ARP = [
  110.0, 164.81, 220.0, 261.63, 329.63, 261.63, 220.0, 164.81,   // A minor up-down
  87.31, 130.81, 174.61, 220.0, 261.63, 220.0, 174.61, 130.81    // F major up-down
];
{
  const parts = [], labels = [];
  ARP.forEach((f, i) => note(f, i * 125, 0.18, 0.55, i, parts, labels));
  parts.push(`[${labels.join('][')}]amix=inputs=${labels.length}:normalize=0,apad=whole_dur=2.0[out]`);
  fs.writeFileSync('scripts/_arp_filter.txt', parts.join(';'));
}

// --- bell accents: same warm stack, higher register, LONG decay (one-shots) ---
// A5 and E5, 2.2s ring-out
const BELLS = [[880, '_bell1_filter.txt'], [659.25, '_bell2_filter.txt']];
BELLS.forEach(([f, file]) => {
  const parts = [], labels = [];
  note(f, 0, 2.2, 0.5, 0, parts, labels);
  parts.push(`[${labels.join('][')}]amix=inputs=${labels.length}:normalize=0,apad=whole_dur=2.4[out]`);
  fs.writeFileSync(`scripts/${file}`, parts.join(';'));
});

// saw-ish bass note: harmonics 1..5 at 1/n amplitude (additive sawtooth),
// punchy envelope. Grit (softclip) is applied at the bed level.
function bassNote(freq, slotMs, durS, vol, idx, parts, mixLabels) {
  const d = durS.toFixed(3);
  for (let h = 1; h <= 5; h++) {
    const v = (vol / h).toFixed(3);
    parts.push(
      `sine=frequency=${(freq * h).toFixed(2)}:duration=${d},volume=${v},afade=t=in:d=0.006,` +
      `afade=t=out:st=${(durS * 0.35).toFixed(3)}:d=${(durS * 0.65).toFixed(3)},adelay=${slotMs}|${slotMs}[b${idx}h${h}]`
    );
    mixLabels.push(`b${idx}h${h}`);
  }
}

// --- v1 dark bass: straight driving 8ths on the roots, Am bar -> F bar ---
{
  const parts = [], labels = [];
  const ROOTS = [55, 55, 55, 55, 43.65, 43.65, 43.65, 43.65]; // A1 x4, F1 x4
  ROOTS.forEach((f, i) => bassNote(f, i * 250, 0.17, 0.5, i, parts, labels));
  parts.push(`[${labels.join('][')}]amix=inputs=${labels.length}:normalize=0,apad=whole_dur=2.0[out]`);
  fs.writeFileSync('scripts/_bass_filter.txt', parts.join(';'));
}

// --- v2 EDM bass: syncopated 16th riff (Justice-adjacent feel, our notes) ---
{
  const parts = [], labels = [];
  // 16 slots of 125ms; 0 = rest. A1 / C2 / D2 / E2 / F2 movement
  const RIFF = [55, 0, 55, 65.41, 0, 55, 55, 73.42, 55, 0, 55, 65.41, 87.31, 0, 82.41, 0];
  let n = 0;
  RIFF.forEach((f, i) => {
    if (f > 0) { bassNote(f, i * 125, 0.13, 0.55, n, parts, labels); n += 1; }
  });
  parts.push(`[${labels.join('][')}]amix=inputs=${labels.length}:normalize=0,apad=whole_dur=2.0[out]`);
  fs.writeFileSync('scripts/_bassedm_filter.txt', parts.join(';'));
}

// --- clap: bright noise burst, lands on the backbeat (1.0s loop, clap @0.5s) ---
{
  const parts = [
    `anoisesrc=d=0.045:c=white:a=0.6,highpass=f=1200,lowpass=f=4500,` +
    `afade=t=out:st=0.008:d=0.037,volume=0.8,adelay=500|500,apad=whole_dur=1.0[out]`
  ];
  fs.writeFileSync('scripts/_clap_filter.txt', parts.join(';'));
}

console.log('wrote motif + arp + bells + v1 bass + EDM bass + clap filtergraphs');
