import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnCli } from './proc.js';
import { KICKFLIP_DIR } from './config.js';
import { fetchCreatives, reportSession } from './api.js';
import { HOUSE_LINES, formatLine } from './creatives.js';

const GEMINI_SETTINGS = path.join(os.homedir(), '.gemini', 'settings.json');
const BACKUP_PATH = path.join(KICKFLIP_DIR, 'gemini-witty-backup.json');

// Gemini CLI's sanctioned hook: ui.customWittyPhrases replaces the spinner's
// loading phrases. We merge sponsored lines in and restore on uninstall.
export function injectPhrases(creatives) {
  let settings = {};
  try {
    settings = JSON.parse(fs.readFileSync(GEMINI_SETTINGS, 'utf8'));
  } catch {
    // no settings file yet — we'll create one
  }
  settings.ui = settings.ui || {};

  if (!fs.existsSync(BACKUP_PATH)) {
    fs.mkdirSync(KICKFLIP_DIR, { recursive: true });
    fs.writeFileSync(
      BACKUP_PATH,
      JSON.stringify({ customWittyPhrases: settings.ui.customWittyPhrases ?? null })
    );
  }

  const pool = creatives && creatives.length ? creatives : HOUSE_LINES;
  settings.ui.customWittyPhrases = pool.map(formatLine);
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
  if (backup.customWittyPhrases === null) {
    delete settings.ui.customWittyPhrases;
  } else {
    settings.ui.customWittyPhrases = backup.customWittyPhrases;
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
      await reportSession({ cli: 'gemini', seconds, startedAt });
      resolve(code ?? 0);
    });
    child.on('error', () => {
      console.error('kickflip: could not launch `gemini` — is Gemini CLI installed?');
      resolve(1);
    });
  });
}
