export const metadata = { title: 'deadair — privacy policy' };

export default function Privacy() {
  return (
    <main>
      <h1>privacy policy</h1>
      <p className="tagline">Last updated: June 12, 2026 · the short version: we collect almost nothing, on purpose.</p>

      <h2>what the CLI sends us</h2>
      <ol className="how">
        <li>A random install ID (a UUID we generate — not derived from your machine, name, or anything identifying).</li>
        <li>Session telemetry: which agent ran (e.g. codex, gemini), session duration in seconds, which ad was in rotation and for how long, your OS platform, and a two-letter country code derived from your IP at request time. <strong>The IP itself is not stored.</strong></li>
        <li>If you click a sponsored line (they're terminal hyperlinks), the redirect logs which ad was clicked, the surface, your country code, and your install ID before forwarding you to the sponsor. Don't click, nothing is logged.</li>
        <li>That is the entire list. The CLI never reads or transmits your prompts, your code, your file paths, your command arguments, or your agent's output.</li>
      </ol>

      <h2>what the site collects</h2>
      <ol className="how">
        <li>The sponsor form stores what you type in it (email, company, message, bid).</li>
        <li>No analytics scripts, no tracking pixels, no cookies, no fingerprinting. Ads are plain text and cannot track you.</li>
      </ol>

      <h2>if you link an email</h2>
      <ol className="how">
        <li>Linking an email (for payouts) associates that address with your install ID. It is used to verify ownership and deliver payouts — nothing else.</li>
        <li>Payouts are fulfilled by a third-party rewards provider, which will process your email under its own policy at that point.</li>
      </ol>

      <h2>where data lives, and your rights</h2>
      <ol className="how">
        <li>Data is stored in Supabase (US region) and served via Vercel. Payments are processed by Stripe; we never see card numbers.</li>
        <li>We don't sell data. Aggregated, non-identifying stats (e.g. "X hours of wait-time in country Y") are shared with sponsors.</li>
        <li><code>deadair uninstall</code> removes everything local. To delete your server-side install data, email info@wendellhq.com with your install ID (shown in <code>deadair status</code>).</li>
      </ol>

      <p className="footer"><a href="/">← back</a></p>
    </main>
  );
}
