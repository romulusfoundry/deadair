// Mirror of the CLI sanitizer (cli/src/creatives.js). Creative text is
// advertiser-supplied and ends up written to users' terminals, so it must be
// stripped of ANSI escapes + control chars (terminal-hijack vector), reduced
// to printable ASCII (emojis break spinner width math), and length-capped.
// Applied on serve so nothing unsafe ever leaves the API, regardless of how it
// entered the table.
export function sanitizeText(input, maxLen = 60) {
  if (typeof input !== 'string') return '';
  let s = input
    .replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, '')
    .replace(/\x1b[@-_]/g, '')
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
    .replace(/[^\x20-\x7e]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (s.length > maxLen) s = s.slice(0, maxLen).trimEnd();
  return s;
}

// Obvious-junk denylist for automated rejection at intake. Human approval is
// still the real gate at founding-sponsor scale; this just stops the worst.
const DENY = [
  /\b(fuck|shit|cunt|nigger|faggot|retard)\b/i,
  // ads that impersonate tool/system output are the fastest path to uninstall
  /\b(error|fatal|panic|build failed|exception)\b/i,
  /\b(viagra|crypto giveaway|free money|click here now)\b/i
];

export function creativeRejectionReason(text) {
  const s = sanitizeText(text, 80);
  if (s.length < 3) return 'too short after sanitizing';
  for (const rx of DENY) {
    if (rx.test(s)) return `disallowed content: ${rx.source}`;
  }
  return null;
}

export function sanitizeCreative(c) {
  return {
    ...c,
    text: sanitizeText(c.text, 60),
    sponsor: sanitizeText(c.sponsor, 24)
  };
}
