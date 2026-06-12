#!/usr/bin/env node
import fs from 'node:fs';
import { ensureInstallId, loadConfig, DEADAIR_DIR } from './config.js';
import { register, fetchStats } from './api.js';
import { runGemini } from './gemini.js';
import { runCodex } from './codex.js';
import { runGeneric } from './generic.js';
import { restorePhrases } from './gemini.js';

const HELP = `
deadair — sell your dead air

usage:
  deadair gemini [args...]   launch Gemini CLI with sponsored spinner phrases
  deadair codex [args...]    launch Codex CLI (exec mode gets the ad spinner)
  deadair run <cmd> [args]   wrap ANY agent (aider, copilot, droid, ...)
  deadair status             your install id, founder status, time accrued
  deadair uninstall          restore Gemini settings and remove local data

first 1,000 installs keep 75% of ad revenue, forever. everyone else: 50%.
https://deadair.online
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
  fs.rmSync(DEADAIR_DIR, { recursive: true, force: true });
  console.log('removed ~/.deadair — goodbye');
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  ensureInstallId();

  switch (command) {
    case 'gemini': {
      await register();
      // exitCode (not process.exit) lets libuv handles drain — exit() here
      // trips a UV_HANDLE_CLOSING assert on Windows
      process.exitCode = await runGemini(args);
      break;
    }
    case 'codex': {
      await register();
      process.exitCode = await runCodex(args);
      break;
    }
    case 'run': {
      await register();
      process.exitCode = await runGeneric(args);
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
