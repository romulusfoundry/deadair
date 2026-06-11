'use client';

import { useEffect, useState } from 'react';

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const DEMO_LINES = [
  'This wait could be sponsored. Your logo here — kickflip.sh',
  'Get paid to wait. First 1,000 installs keep 75% forever — kickflip.sh',
  'Works with Codex, Gemini CLI, and friends — kickflip.sh'
];

function LiveSpinner() {
  const [frame, setFrame] = useState(0);
  const [line, setLine] = useState(0);
  useEffect(() => {
    const f = setInterval(() => setFrame((n) => (n + 1) % FRAMES.length), 90);
    const l = setInterval(() => setLine((n) => (n + 1) % DEMO_LINES.length), 4000);
    return () => { clearInterval(f); clearInterval(l); };
  }, []);
  return (
    <div className="terminal">
      <span className="prompt">$</span> kickflip codex exec "fix the failing tests"{'\n'}
      <span className="spin">{FRAMES[frame]}</span> <span className="ad">{DEMO_LINES[line]}</span>
    </div>
  );
}

function InstallCmd({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="cmd">
      <span><span className="prompt">$</span> {text}</span>
      <button onClick={copy}>{copied ? 'copied' : 'copy'}</button>
    </div>
  );
}

export default function Home() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch('/api/stats').then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <main>
      <h1>kickflip</h1>
      <p className="tagline">
        Get paid to wait. Sponsored spinner lines for Codex, Gemini CLI, and
        every coding agent. Advertisers buy the line; <strong>you keep 75%</strong> if
        you're one of the first 1,000 installs. 50% after that, forever.
      </p>

      <LiveSpinner />

      <div className="stats">
        <div className="stat"><b>{stats ? stats.installs.toLocaleString() : '—'}</b>installs</div>
        <div className="stat"><b>{stats ? stats.founder_slots_left.toLocaleString() : '—'}</b>founder slots left (75% for life)</div>
      </div>

      <h2>install</h2>
      <InstallCmd text="npm i -g kickflip-cli" />
      <p className="tagline">then just prefix your agent:</p>
      <InstallCmd text="kickflip codex" />
      <InstallCmd text="kickflip gemini" />

      <h2>how it works</h2>
      <ol className="how">
        <li>While your agent thinks, the spinner shows a sponsored line instead of a witty one.</li>
        <li>We track verified wait-time. Sponsors pay flat monthly rates for the inventory.</li>
        <li>Revenue splits to installs pro-rata by wait-time. Cash out at $25 via gift card.</li>
        <li><code>kickflip uninstall</code> restores everything. No daemon, no telemetry beyond session seconds.</li>
      </ol>

      <div className="founder-banner">
        ★ Founder rate: the first 1,000 installs keep 75% of their share of ad
        revenue forever. Check yours with <code>kickflip status</code>.
      </div>

      <h2>for sponsors</h2>
      <p className="tagline">
        Your one-liner in front of developers during the most-watched dead air
        in software. <a href="/sponsor">Five founding slots, flat rate →</a>
      </p>

      <p className="footer">
        open source · works with Codex + Gemini CLI today, more agents next ·
        not affiliated with OpenAI, Google, or kickbacks.ai —
        we're the one for everything else
      </p>
    </main>
  );
}
