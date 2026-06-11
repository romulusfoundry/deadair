#!/usr/bin/env node
import fs from 'node:fs';
import { ensureInstallId, loadConfig, KICKFLIP_DIR } from './config.js';
import { register, fetchStats } from './api.js';
import { runGemini } from './gemini.js';
import { runCodex } from './codex.js';
import { restorePhrases } from './gemini.js';

const HELP = `
kickflip — get paid to wait

usage:
  kickflip gemini [args...]   launch Gemini CLI with sponsored spinner phrases
  kickflip codex [args...]    launch Codex CLI (exec mode gets the ad spinner)
  kickflip status             your install id, founder status, time accrued
  kickflip uninstall          restore Gemini settings and remove local data

first 1,000 installs keep 75% of ad revenue, forever. everyone else: 50%.
https://kickflip.sh
`;

async function status() {
  const config = loadConfig();
  console.log(`install id:      ${config.installId}`);
  console.log(`founder:         ${config.founder ? `yes — #${config.founderNumber} (75% share)` : 'not yet registered'}`);
  console.log(`local sessions:  ${config.totals.sessions} (${Math.round(config.totals.seconds / 60)} min)`);
  try {
    const me = await fetchStats();
    console.log(`network seconds: ${me.seconds}`);
    console.log(`accrued:         $${(me.accrued_cents / 100).toFixed(2)}`);
  } catch {
    console.log('network stats:   unavailable (offline or not registered)');
  }
}

async function uninstall() {
  const restored = restorePhrases();
  console.log(restored ? 'restored Gemini witty phrases' : 'no Gemini backup to restore');
  fs.rmSync(KICKFLIP_DIR, { recursive: true, force: true });
  console.log('removed ~/.kickflip — goodbye');
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  ensureInstallId();

  switch (command) {
    case 'gemini': {
      await register();
      process.exit(await runGemini(args));
      break;
    }
    case 'codex': {
      await register();
      process.exit(await runCodex(args));
      break;
    }
    case 'status':
      await register();
      await status();
      break;
    case 'uninstall':
      await uninstall();
      break;
    default:
      console.log(HELP.trim());
  }
}

main();
