import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

export const KICKFLIP_DIR = path.join(os.homedir(), '.kickflip');
const CONFIG_PATH = path.join(KICKFLIP_DIR, 'config.json');

const DEFAULTS = {
  installId: null,
  registered: false,
  founder: false,
  founderNumber: null,
  // swap to https://kickflip.sh before npm publish once the domain is bought
  apiBase: process.env.KICKFLIP_API || 'https://kickflip-mocha.vercel.app',
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
  if (process.env.KICKFLIP_API) config.apiBase = process.env.KICKFLIP_API;
  return config;
}

export function saveConfig(config) {
  fs.mkdirSync(KICKFLIP_DIR, { recursive: true });
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
