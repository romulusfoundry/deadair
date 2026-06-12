import { spawnCli } from './proc.js';
import { fetchCreatives, reportSession } from './api.js';
import { formatLine, pickRotation, sanitizeText } from './creatives.js';

const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

function banner(creative) {
  const line = formatLine(creative);
  const bar = '─'.repeat(Math.min(line.length + 4, (process.stdout.columns || 80) - 2));
  console.log(`${DIM}${bar}${RESET}`);
  console.log(`${CYAN}▸${RESET} ${DIM}${line}${RESET}`);
  console.log(`${DIM}${bar}${RESET}`);
}

// `deadair run <any-agent> [args...]` — the long-tail integration: sponsored
// banner on entry/exit + verified session timing for ANY interactive CLI
// (aider, copilot, droid, opencode, ...). Inventory tier matches codex
// interactive: banner impressions, not duration. Named deep integrations
// (gemini, codex exec) stay in their own modules.
export async function runGeneric(args) {
  const [command, ...rest] = args;
  if (!command) {
    console.error('usage: deadair run <command> [args...]   e.g. deadair run aider');
    return 1;
  }

  const creatives = await fetchCreatives();
  const bannerCreative = pickRotation(creatives)[0];
  const events = bannerCreative.id
    ? [{ creative_id: bannerCreative.id, surface: 'generic-banner', ms: 0 }]
    : [];

  // session label: "run:<tool>" — basename only, sanitized, fits cli column
  const tool = sanitizeText(command.split(/[\\/]/).pop().replace(/\.(exe|cmd|bat|ps1)$/i, ''), 12)
    .toLowerCase().replace(/[^a-z0-9-]/g, '') || 'unknown';

  const startedAt = new Date().toISOString();
  const start = Date.now();
  banner(bannerCreative);
  const child = spawnCli(command, rest, { stdio: 'inherit' });

  return new Promise((resolve) => {
    child.on('exit', async (code) => {
      banner(bannerCreative);
      const seconds = Math.round((Date.now() - start) / 1000);
      await reportSession({ cli: `run:${tool}`, seconds, startedAt, events });
      resolve(code ?? 0);
    });
    child.on('error', () => {
      console.error(`deadair: could not launch \`${command}\` — is it installed?`);
      resolve(1);
    });
  });
}
