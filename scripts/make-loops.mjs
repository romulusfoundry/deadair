// Generates filtergraphs for the trailer's musical loops. Original material —
// Kid A-ADJACENT character (warm circling keys motif, dark moving arpeggio)
// with our own notes, so nothing is licensable by anyone else.
import fs from 'node:fs';

// warm two-partial "keys" note: fundamental + octave harmonic, pluck envelope
function note(freq, slotMs, durS, vol, idx, parts, mixLabels) {
  const d = durS.toFixed(3);
  parts.push(
    `sine=frequency=${freq}:duration=${d},volume=${vol},afade=t=in:d=0.012,` +
    `afade=t=out:st=${(durS * 0.3).toFixed(3)}:d=${(durS * 0.7).toFixed(3)},adelay=${slotMs}|${slotMs}[f${idx}]`
  );
  parts.push(
    `sine=frequency=${(freq * 2).toFixed(2)}:duration=${d},volume=${(vol * 0.30).toFixed(2)},afade=t=in:d=0.012,` +
    `afade=t=out:st=${(durS * 0.25).toFixed(3)}:d=${(durS * 0.75).toFixed(3)},adelay=${slotMs}|${slotMs}[h${idx}]`
  );
  mixLabels.push(`f${idx}`, `h${idx}`);
}

// --- intro motif: 2.0s loop, 8 circling eighth-notes, melancholic + modal ---
// E4 G4 D4 F4 C4 E4 B3 D4 — circling thirds, original phrase
const MOTIF = [329.63, 392.0, 293.66, 349.23, 261.63, 329.63, 246.94, 293.66];
{
  const parts = [], labels = [];
  MOTIF.forEach((f, i) => note(f, i * 250, 0.32, 0.5, i, parts, labels));
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
  ARP.forEach((f, i) => note(f, i * 125, 0.16, 0.55, i, parts, labels));
  parts.push(`[${labels.join('][')}]amix=inputs=${labels.length}:normalize=0,apad=whole_dur=2.0[out]`);
  fs.writeFileSync('scripts/_arp_filter.txt', parts.join(';'));
}

console.log('wrote motif (8-note circling phrase) + arp (Am->F, 16 notes) filtergraphs');
