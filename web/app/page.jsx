'use client';

import { useEffect, useState } from 'react';

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const DEMO_LINES = [
  'Statistically real, narratively absurd market signals — standardpoorly.com',
  'This wait could be sponsored. Your name here — deadair.online',
  'Sell your dead air. First 1,000 installs keep 75% forever — deadair.online',
  'Works with Codex, Gemini CLI, and friends — deadair.online'
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
      <span className="prompt">$</span> deadair codex exec "fix the failing tests"{'\n'}
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
      <nav className="topnav">
        <span className="brand">deadair</span>
        <a href="/sponsor">sponsor the dead air →</a>
      </nav>
      <h1>deadair</h1>
      <p className="tagline">
        Your dead air is ad space. Sponsored spinner lines for Codex, Gemini CLI, and
        every coding agent. Advertisers buy the line; <strong>you keep 75%</strong> if
        you're one of the first 1,000 installs. 50% after that, forever.
      </p>

      <LiveSpinner />

      <div className="stats">
        <div className="stat"><b>{stats ? stats.installs.toLocaleString() : '—'}</b>installs</div>
        <div className="stat"><b>{stats ? stats.founder_slots_left.toLocaleString() : '—'}</b>founder slots left (75% for life)</div>
      </div>

      <h2>install</h2>
      <InstallCmd text="npm i -g deadair" />
      <p className="tagline">then just prefix your agent:</p>
      <InstallCmd text="deadair codex" />
      <InstallCmd text="deadair gemini" />

      <h2>how it works</h2>
      <ol className="how">
        <li>While your agent thinks, the spinner shows a sponsored line instead of a witty one.</li>
        <li>Every ad is human-reviewed before it ships: plain text only, sanitized, no fake-error bait, no tracking.</li>
        <li>We track verified ad delivery. Sponsors pay flat monthly rates for the inventory.</li>
        <li>Revenue splits to installs pro-rata by what actually displayed: spinner surfaces (Codex, Gemini) earn by rendered wait-time in 5-second units; banner agents (<code>deadair &lt;anything&gt;</code>) earn per banner impression + click.</li>
        <li><code>deadair uninstall</code> restores everything. No daemon, no telemetry beyond session seconds.</li>
      </ol>

      <h2>getting paid</h2>
      <ol className="how">
        <li>Your share accrues automatically per ad actually delivered — rendered wait-seconds on spinner surfaces, impressions + clicks on banner surfaces. Check it anytime with <code>deadair status</code>.</li>
        <li>Link an email to your install to claim payouts (one command, magic-link verify). From <strong>$25</strong> you can cash out anytime: gift cards or prepaid card. Or let it ride — linked balances over $250 or idle 12 months are paid out automatically.</li>
        <li>Never linked an email and gone quiet for 12 months? Your balance returns to the community pool for active users — we don't keep it.</li>
        <li>Shares are computed on net ad revenue (after payment + payout processing). No revenue pool yet means balances start at $0 — founding sponsors fund the first pool.</li>
      </ol>

      <div className="founder-banner">
        ★ Founder rate: the first 1,000 installs keep 75% of their share of net
        ad revenue forever; 50% after. Check yours with <code>deadair status</code>.
      </div>

      <h2>for sponsors</h2>
      <p className="tagline">
        Your one-liner in front of developers during the most-watched dead air
        in software. <a href="/sponsor">Five founding slots, flat rate →</a>
      </p>

      <p className="footer">
        open source · Codex + Gemini CLI native, any agent via <code>deadair run</code> ·
        not affiliated with OpenAI, Google, or kickbacks.ai —
        they monetize your editor, we monetize your terminal
      </p>
      <p className="footer">
        <a href="https://github.com/romulusfoundry/deadair">github</a> (MIT licensed)
        · <a href="/terms">terms</a> · <a href="/privacy">privacy</a>
        · every ad human-reviewed · no tracking, ever
      </p>
    </main>
  );
}
