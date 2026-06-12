// House lines shown when no sponsor inventory is available (offline, or
// unsold slots). A blank slot reads as a dead network — never show nothing.
export const HOUSE_LINES = [
  { text: 'This wait could be sponsored. Your logo here', sponsor: 'deadair.online', url: 'https://deadair.online/sponsor' },
  { text: 'Get paid to wait. First 1,000 installs keep 75% forever', sponsor: 'deadair.online', url: 'https://deadair.online' },
  { text: 'Works with Codex, Gemini CLI, and friends', sponsor: 'deadair.online', url: 'https://deadair.online' }
];

// SECURITY: creative text is untrusted (advertiser-supplied) and gets written
// straight to the user's terminal. Without this an advertiser could embed ANSI
// escape sequences to hijack the terminal (clear screen, move cursor, fake
// output). Strip escapes + control chars, drop non-ASCII (emojis break spinner
// width math + line redraw), collapse whitespace, cap length. This is the LAST
// line of defense — the server sanitizes too, but the CLI never trusts input.
export function sanitizeText(input, maxLen = 60) {
  if (typeof input !== 'string') return '';
  let s = input
    // full ANSI/CSI escape sequences first (ESC + printable tail)
    .replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, '')
    .replace(/\x1b[@-_]/g, '')
    // any remaining control chars incl. stray ESC, DEL, C1
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
    // anything outside printable ASCII (emojis, exotic unicode)
    .replace(/[^\x20-\x7e]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (s.length > maxLen) s = s.slice(0, maxLen).trimEnd();
  return s;
}

export function formatLine(creative) {
  const text = sanitizeText(creative.text, 60);
  const name = sanitizeText(creative.sponsor, 24);
  // " - " separator is intentionally ASCII (em-dash is non-ASCII and would be
  // stripped); keeps the rendered line in pure-ASCII territory for width math.
  return name ? `${text} - ${name}` : text;
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
