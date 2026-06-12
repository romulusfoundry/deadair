'use client';

import { useState } from 'react';

const STRIPE_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

export default function Sponsor() {
  const [state, setState] = useState('idle');
  const [form, setForm] = useState({ email: '', company: '', message: '', bid: '' });

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
            rows={3} placeholder="the line you want devs to read (optional)"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
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
