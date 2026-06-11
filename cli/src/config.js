import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

export const DEADAIR_DIR = path.join(os.homedir(), '.deadair');
const CONFIG_PATH = path.join(DEADAIR_DIR, 'config.json');

const DEFAULTS = {
  installId: null,
  registered: false,
  founder: false,
  founderNumber: null,
  // swap to https://deadair.tech before npm publish once the domain is bought
  apiBase: process.env.DEADAIR_API || 'https://deadair-six.vercel.app',
  creatives: { fetchedAt: 0, items: [] },
  totals: { seconds: 0, sessions: 0 }
};

export function loadConfig() {
  let config;
  try {
    config = { ...DEFAULTS, ...JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) };
  } catch {
    config = { ...DEFAULTS };
  }
  if (process.env.DEADAIR_API) config.apiBase = process.env.DEADAIR_API;
  return config;
}

export function saveConfig(config) {
  fs.mkdirSync(DEADAIR_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function ensureInstallId() {
  const config = loadConfig();
  if (!config.installId) {
    config.installId = crypto.randomUUID();
    saveConfig(config);
  }
  return config;
}
