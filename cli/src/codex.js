import { spawnCli } from './proc.js';
import { fetchCreatives, reportSession } from './api.js';
import { formatLine, pickRotation } from './creatives.js';
import { AdSpinner } from './spinner.js';

const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

function banner(creatives) {
  const line = formatLine(pickRotation(creatives)[0]);
  const bar = '─'.repeat(Math.min(line.length + 4, (process.stdout.columns || 80) - 2));
  console.log(`${DIM}${bar}${RESET}`);
  console.log(`${CYAN}▸${RESET} ${DIM}${line}${RESET}`);
  console.log(`${DIM}${bar}${RESET}`);
}

// codex has no custom-spinner hook, so:
//  - exec mode: we pipe output and render our own ad spinner between chunks
//  - interactive TUI: passthrough with a sponsored banner before/after
export async function runCodex(args) {
  const creatives = await fetchCreatives();
  const isExec = args[0] === 'exec' || args[0] === 'e';
  const startedAt = new Date().toISOString();
  const start = Date.now();

  const finish = async (code) => {
    const seconds = Math.round((Date.now() - start) / 1000);
    await reportSession({ cli: 'codex', seconds, startedAt });
    return code ?? 0;
  };

  if (!isExec) {
    banner(creatives);
    const child = spawnCli('codex', args, { stdio: 'inherit' });
    return new Promise((resolve) => {
      child.on('exit', async (code) => {
        banner(creatives);
        resolve(await finish(code));
      });
      child.on('error', () => {
        console.error('kickflip: could not launch `codex` — is Codex CLI installed?');
        resolve(1);
      });
    });
  }

  const spinner = new AdSpinner(creatives);
  const child = spawnCli('codex', args, { stdio: ['inherit', 'pipe', 'pipe'] });

  spinner.start();
  const passthrough = (stream, out) => {
    stream.on('data', (chunk) => {
      spinner.clearForOutput();
      out.write(chunk);
    });
  };
  passthrough(child.stdout, process.stdout);
  passthrough(child.stderr, process.stderr);

  return new Promise((resolve) => {
    child.on('exit', async (code) => {
      spinner.stop();
      resolve(await finish(code));
    });
    child.on('error', () => {
      spinner.stop();
      console.error('kickflip: could not launch `codex` — is Codex CLI installed?');
      resolve(1);
    });
  });
}
