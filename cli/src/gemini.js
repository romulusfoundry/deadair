import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnCli } from './proc.js';
import { DEADAIR_DIR } from './config.js';
import { fetchCreatives, reportSession } from './api.js';
import { HOUSE_LINES, formatLine } from './creatives.js';

const GEMINI_SETTINGS = path.join(os.homedir(), '.gemini', 'settings.json');
const BACKUP_PATH = path.join(DEADAIR_DIR, 'gemini-witty-backup.json');

// Gemini CLI's sanctioned hooks: ui.customWittyPhrases supplies the spinner's
// loading phrases, and ui.loadingPhrases gates whether they display at all —
// it defaults to "off" since ~v0.46, so we must set it to "witty" or the
// sponsored lines never render. Both are backed up and restored on uninstall.
export function injectPhrases(creatives) {
  let settings = {};
  try {
    settings = JSON.parse(fs.readFileSync(GEMINI_SETTINGS, 'utf8'));
  } catch {
    // no settings file yet — we'll create one
  }
  settings.ui = settings.ui || {};

  if (!fs.existsSync(BACKUP_PATH)) {
    fs.mkdirSync(DEADAIR_DIR, { recursive: true });
    fs.writeFileSync(
      BACKUP_PATH,
      JSON.stringify({
        customWittyPhrases: settings.ui.customWittyPhrases ?? null,
        loadingPhrases: settings.ui.loadingPhrases ?? null
      })
    );
  }

  const pool = creatives && creatives.length ? creatives : HOUSE_LINES;
  settings.ui.customWittyPhrases = pool.map(formatLine);
  // never downgrade "all" (tips + witty) to "witty"
  if (settings.ui.loadingPhrases !== 'all') {
    settings.ui.loadingPhrases = 'witty';
  }
  fs.mkdirSync(path.dirname(GEMINI_SETTINGS), { recursive: true });
  fs.writeFileSync(GEMINI_SETTINGS, JSON.stringify(settings, null, 2));
}

export function restorePhrases() {
  if (!fs.existsSync(BACKUP_PATH)) return false;
  let settings = {};
  try {
    settings = JSON.parse(fs.readFileSync(GEMINI_SETTINGS, 'utf8'));
  } catch {
    return false;
  }
  const backup = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8'));
  settings.ui = settings.ui || {};
  for (const key of ['customWittyPhrases', 'loadingPhrases']) {
    if (backup[key] === null || backup[key] === undefined) {
      delete settings.ui[key];
    } else {
      settings.ui[key] = backup[key];
    }
  }
  fs.writeFileSync(GEMINI_SETTINGS, JSON.stringify(settings, null, 2));
  fs.unlinkSync(BACKUP_PATH);
  return true;
}

export async function runGemini(args) {
  const creatives = await fetchCreatives();
  injectPhrases(creatives);

  const startedAt = new Date().toISOString();
  const start = Date.now();
  const child = spawnCli('gemini', args, { stdio: 'inherit' });

  return new Promise((resolve) => {
    child.on('exit', async (code) => {
      const seconds = Math.round((Date.now() - start) / 1000);
      // ESTIMATED tier: Gemini's TUI renders the phrases where we can't
      // observe, so each pool creative gets an equal share of session time.
      // Sponsor reporting must label gemini-pool as estimated, never verified.
      const pool = (creatives || []).filter((c) => c.id);
      const events = pool.map((c) => ({
        creative_id: c.id,
        surface: 'gemini-pool',
        ms: Math.round((seconds * 1000) / pool.length)
      }));
      await reportSession({ cli: 'gemini', seconds, startedAt, events });
      resolve(code ?? 0);
    });
    child.on('error', () => {
      console.error('deadair: could not launch `gemini` — is Gemini CLI installed?');
      resolve(1);
    });
  });
}
