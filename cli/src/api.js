import crypto from 'node:crypto';
import { loadConfig, saveConfig } from './config.js';

// Every call is fail-silent: the wrapper must never break the user's CLI
// because our API is down or they're offline.
async function post(config, route, body, timeoutMs = 3000) {
  const res = await fetch(`${config.apiBase}${route}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!res.ok) throw new Error(`${route} -> ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export async function register() {
  const config = loadConfig();
  if (config.registered) return config;
  try {
    const data = await post(config, '/api/install', {
      install_id: config.installId,
      platform: process.platform,
      client_version: '0.1.0'
    });
    config.registered = true;
    config.founder = !!data.founder;
    config.founderNumber = data.founder_number ?? null;
    saveConfig(config);
  } catch {
    // stay unregistered; retried on next run
  }
  return config;
}

const CREATIVE_TTL_MS = 15 * 60 * 1000;

export async function fetchCreatives() {
  const config = loadConfig();
  const fresh = Date.now() - config.creatives.fetchedAt < CREATIVE_TTL_MS;
  if (fresh && config.creatives.items.length) return config.creatives.items;
  try {
    const res = await fetch(
      `${config.apiBase}/api/creatives?install_id=${config.installId}`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.creatives) && data.creatives.length) {
        config.creatives = { fetchedAt: Date.now(), items: data.creatives };
        saveConfig(config);
        return data.creatives;
      }
    }
  } catch {
    // fall through to cache/house lines
  }
  return config.creatives.items;
}

export async function reportSession({ cli, seconds, startedAt }) {
  const config = loadConfig();
  config.totals.seconds += seconds;
  config.totals.sessions += 1;
  saveConfig(config);
  try {
    await post(config, '/api/sessions', {
      session_id: crypto.randomUUID(),
      install_id: config.installId,
      cli,
      seconds,
      started_at: startedAt
    });
  } catch {
    // lost telemetry is acceptable; never bother the user
  }
}

export async function fetchStats() {
  const config = loadConfig();
  const res = await fetch(`${config.apiBase}/api/me?install_id=${config.installId}`, {
    signal: AbortSignal.timeout(3000)
  });
  if (!res.ok) throw new Error(`me -> ${res.status}`);
  return res.json();
}
