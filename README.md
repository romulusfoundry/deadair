# deadair

**Get paid to wait.** Your AI coding agent makes you stare at a spinner for
hours a day — `deadair` puts a sponsored line in that dead air and pays you a
share of the ad revenue for it. Works with **Codex** and **Gemini CLI** today.

```sh
npm i -g deadair
deadair codex     # or: deadair gemini
```

The first 1,000 installs keep **75%** of their share of ad revenue, forever.
50% after that. `deadair status` shows yours.

> Not affiliated with OpenAI, Google, or kickbacks.ai (which does this for
> Claude Code). deadair is the open one, for every other agent.

## How it works

- **Gemini CLI** — sponsored lines run in Gemini's own spinner via its
  sanctioned `ui.customWittyPhrases` setting. `deadair uninstall` restores your
  settings exactly as they were.
- **Codex** — Codex exposes no spinner hook, so `deadair codex exec ...`
  renders its own ad-carrying spinner while Codex's output streams through it;
  interactive sessions get a sponsored banner plus session timing.
- Verified wait-time reports to the API and ad revenue from flat-rate sponsors
  splits pro-rata: 75% to the first 1,000 installs forever, 50% after.

## Privacy & safety

- Reports **session seconds only**: which agent, how long, and country (for
  sponsor reporting). Never your prompts, code, paths, or output.
- Advertiser creative is **sanitized before it reaches your terminal** — ANSI
  escape sequences and control characters stripped (no terminal hijacking),
  printable-ASCII only, length-capped. Sanitized both server-side on serve and
  client-side on render.
- `deadair uninstall` restores any modified settings and removes local data.
- It's MIT and open source — read exactly what it sends.

## Repo layout

- [`cli/`](cli/) — the `deadair` npm package (zero runtime dependencies)
- [`web/`](web/) — [deadair.online](https://deadair.online): landing page,
  sponsor checkout, and the API the CLI talks to (Next.js)

## Sponsors

Your one line in front of developers during the most-watched dead air in
software. Five founding slots, flat rate — [deadair.online/sponsor](https://deadair.online/sponsor).

## Dev

```sh
cd web && pnpm install && pnpm dev        # site + API on :3000
DEADAIR_API=http://localhost:3000 node cli/src/index.js status
```

MIT © Wendell Labs
