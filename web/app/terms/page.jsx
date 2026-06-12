export const metadata = { title: 'deadair — terms of service' };

export default function Terms() {
  return (
    <main>
      <h1>terms of service</h1>
      <p className="tagline">Last updated: June 12, 2026 · deadair is operated by Wendell Labs.</p>

      <h2>the service</h2>
      <p className="tagline">
        deadair is a CLI tool and ad network: it displays sponsored text lines
        in terminal wait states and shares advertising revenue with the people
        who installed it. Using the CLI, the site, or the sponsor program means
        you accept these terms.
      </p>

      <h2>earnings program</h2>
      <ol className="how">
        <li>Your share accrues pro-rata by verified wait-time, computed on net ad revenue (gross sponsor payments minus payment and payout processing costs). Founder installs (first 1,000) accrue at 75%, all others at 50%.</li>
        <li>Accrued balances are promotional rewards, not wages, deposits, or interest-bearing accounts. Earnings are not guaranteed; if there is no sponsor revenue, balances are $0.</li>
        <li>Cashing out requires linking a verified email to your install. Minimum payout is $25, fulfilled via gift card or prepaid card through a third-party payout provider.</li>
        <li>Linked balances over $250 or idle for 12 months may be paid out automatically. Balances on installs that were never linked and have been inactive for 12 months are returned to the community revenue pool.</li>
        <li>Fraud — including automated, scripted, or idle-farmed wait-time — voids accrued balances. We bill sponsors only for verified rendered time and protect that guarantee aggressively.</li>
      </ol>

      <h2>sponsors</h2>
      <ol className="how">
        <li>All creatives are human-reviewed before activation and must pass sanitization (plain ASCII, length caps, no terminal escape sequences, no impersonation of system or tool output).</li>
        <li>We may reject or remove any creative at our discretion, with a pro-rated refund of unserved time.</li>
        <li>Impression reporting distinguishes verified rendered time from estimated coverage, and sponsor billing uses verified figures.</li>
      </ol>

      <h2>the boring-but-important part</h2>
      <ol className="how">
        <li>The software is MIT-licensed and provided as-is, without warranty. We are not affiliated with OpenAI, Google, Anthropic, or kickbacks.ai.</li>
        <li>We may modify these terms; material changes will be noted on this page with a new date. Continued use after changes is acceptance.</li>
        <li>We can suspend accounts or installs that abuse the service. Questions: info@wendellhq.com.</li>
      </ol>

      <p className="footer"><a href="/">← back</a></p>
    </main>
  );
}
