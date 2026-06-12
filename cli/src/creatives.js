// House lines shown when no sponsor inventory is available (offline, or
// unsold slots). A blank slot reads as a dead network — never show nothing.
export const HOUSE_LINES = [
  { text: 'This wait could be sponsored. Your logo here', sponsor: 'deadair.online', url: 'https://deadair.online/sponsor' },
  { text: 'Get paid to wait. First 1,000 installs keep 75% forever', sponsor: 'deadair.online', url: 'https://deadair.online' },
  { text: 'Works with Codex, Gemini CLI, and friends', sponsor: 'deadair.online', url: 'https://deadair.online' }
];

export function formatLine(creative) {
  const sponsor = creative.sponsor ? ` — ${creative.sponsor}` : '';
  return `${creative.text}${sponsor}`;
}

export function pickRotation(creatives) {
  const pool = creatives && creatives.length ? creatives : HOUSE_LINES;
  // Weighted shuffle-lite: repeat by weight, then sample without replacement.
  const expanded = pool.flatMap((c) => Array(Math.max(1, c.weight || 1)).fill(c));
  const seen = new Set();
  const rotation = [];
  while (seen.size < pool.length) {
    const c = expanded[Math.floor(Math.random() * expanded.length)];
    const key = c.text;
    if (!seen.has(key)) {
      seen.add(key);
      rotation.push(c);
    }
  }
  return rotation;
}
