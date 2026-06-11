import { spawn } from 'node:child_process';

// On Windows, gemini/codex resolve to .cmd shims which need a shell, but
// shell:true with an args array triggers DEP0190. Build one quoted string.
export function spawnCli(command, args, options) {
  if (process.platform !== 'win32') {
    return spawn(command, args, options);
  }
  const quoted = args.map((a) => (/\s/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a));
  return spawn([command, ...quoted].join(' '), { ...options, shell: true });
}
