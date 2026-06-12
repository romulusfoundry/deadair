'use client';

import { useState } from 'react';

const STRIPE_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

export default function Sponsor() {
  const [state, setState] = useState('idle');
  const [form, setForm] = useState({ email: '', company: '', message: '', url: '', bid: '' });

  const submit = async (e) => {
    e.preventDefault();
    setState('sending');
    const res = await fetch('/api/sponsor', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(form)
    }).catch(() => null);
    setState(res?.ok ? 'done' : 'error');
  };

  return (
    <main>
      <h1>sponsor the wait</h1>
      <p className="tagline">
        Developers stare at agent spinners for hours a day. Your line runs in
        that dead air — across every Codex and Gemini CLI session on the
        network. Plain text, clearly marked, no tracking pixels, no cookies.
      </p>
      <p className="tagline">
        Every creative is human-reviewed before it goes live: max 60 characters,
        plain ASCII, no fake errors or system-message impersonation, nothing
        that would make a developer distrust their own terminal. We bill
        verified rendered wait-time, never raw session time.
      </p>

      <div className="slot">
        <div className="price">$250/mo — founding rate</div>
        <p className="tagline">
          5 founding slots. Rate locked for 6 months. Your one-liner + name in
          rotation across all network inventory, plus founding-sponsor credit
          on this page. Cancel monthly.
        </p>
        {STRIPE_LINK ? (
          <a href={STRIPE_LINK}>claim a founding slot →</a>
        ) : (
          <p className="tagline">checkout opening shortly — drop your email below and we'll hold a slot</p>
        )}
      </div>

      <h2>what your line looks like</h2>
      <p className="tagline">
        One sponsored line, clearly attributed, exactly where a developer is
        already looking. Real renders from the three surface types:
      </p>
      <div className="terminal">
        <span className="prompt">$</span> deadair codex exec "fix the failing tests"{'\n'}
        <span className="spin">⠹</span> <span className="ad">Your one-liner goes here - yourco.com</span>
      </div>
      <p className="tagline">Codex — our ad spinner draws the line while Codex works. Billed on verified rendered seconds.</p>
      <div className="terminal">
        <span className="prompt">$</span> deadair gemini{'\n'}
        <span className="spin">✦</span> <span className="ad">Your one-liner goes here - yourco.com</span> <span className="prompt">(esc to cancel · 8s)</span>
      </div>
      <p className="tagline">Gemini CLI — your line runs as a native loading phrase inside Gemini&apos;s own spinner. Reported as estimated impressions.</p>
      <div className="terminal">
        <span className="prompt">$</span> deadair hermes{'\n'}
        ────────────────────────────────────────{'\n'}
        <span className="spin">▸</span> <span className="ad">Your one-liner goes here - yourco.com</span>{'\n'}
        ────────────────────────────────────────
      </div>
      <p className="tagline">
        Every other agent — entry and exit banner around the session
        (deadair hermes, openclaw, aider, copilot, anything). On modern
        terminals every rendered line is a clickable hyperlink to your
        site, through our click-logging redirect.
      </p>

      <h2>measurement &amp; anti-fraud</h2>
      <p className="tagline">
        Every line we render is a terminal hyperlink through a logged
        redirect — we count clicks per creative, per surface, per country,
        and report CTR alongside impressions. Impressions are counted in
        5-second units of verified rendered wait-time on surfaces we draw
        ourselves; surfaces we don&apos;t draw (Gemini&apos;s native spinner)
        are reported separately as estimated. We never blend the two.
      </p>
      <p className="tagline">
        Countable wait-time is capped at 8 hours per day per install,
        session and click velocity are monitored for bot signatures, and
        every payout is human-reviewed before money moves. Founding slots
        are flat-rate, so inflated numbers wouldn&apos;t earn us a cent —
        and forfeited fraudulent balances return to the community revenue
        pool, not to us. You get a monthly report per creative: impressions,
        clicks, CTR, and country split.
      </p>

      <h2>reserve a slot</h2>
      {state === 'done' ? (
        <p className="ok">Got it. We'll reply within a day with available slots and creative specs.</p>
      ) : (
        <form className="lead" onSubmit={submit}>
          <input
            type="email" required placeholder="work email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
          <textarea
            rows={2} maxLength={60}
            placeholder="the line you want devs to read — max 60 chars (optional)"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <input
            type="url" placeholder="landing URL for clicks — https only (optional)"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
          <input
            type="number" min="1" step="1"
            placeholder="your monthly bid in USD — name any number, founding rate is $250"
            value={form.bid}
            onChange={(e) => setForm({ ...form, bid: e.target.value })}
          />
          <button disabled={state === 'sending'}>
            {state === 'sending' ? 'sending…' : state === 'error' ? 'try again' : 'reserve'}
          </button>
        </form>
      )}

      <p className="footer"><a href="/">← back</a></p>
    </main>
  );
}
