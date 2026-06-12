# deadair

**Sell your dead air.** Your AI coding agent makes you stare at a spinner for
hours a day. `deadair` puts a sponsored line in that dead air — and pays you a
share of the ad revenue for it.

Works with **Codex** and **Gemini CLI** today. More agents coming.

```sh
npm i -g deadair
```

Then just prefix your agent:

```sh
deadair codex          # or: deadair codex exec "fix the tests"
deadair gemini
deadair aider          # wrap ANY agent — hermes, openclaw, copilot, droid...
```

## What it does

- **Gemini CLI** — sponsored lines run in Gemini's own spinner via its
  sanctioned `ui.customWittyPhrases` setting. `deadair uninstall` restores your
  settings exactly.
- **Codex** — Codex has no spinner hook, so `deadair codex exec` renders its
  own ad-carrying spinner while output streams through; interactive sessions
  get a sponsored banner and time tracking.

## You keep the money

Net ad revenue (after payment + payout processing) splits pro-rata by verified
ad delivery: **the first 1,000 installs keep 75% forever**, 50% after that.
Spinner surfaces (codex, gemini) earn by rendered wait-time; banner agents
earn per impression + click — no ad on screen, no accrual. Cash out at $25
via gift card or prepaid card. Check yours:

```sh
deadair status
```

## Privacy

deadair reports **session seconds only** — which agent (codex/gemini), how long
it ran, and your country (for sponsor reporting). It never sees your prompts,
your code, your file paths, or your output. Advertiser text is sanitized before
it ever touches your terminal (escape sequences stripped, ASCII-only). It's all
in the source — read it.

```sh
deadair uninstall      # restores everything, removes local data
```

MIT licensed · [deadair.online](https://deadair.online) · open source:
[github.com/romulusfoundry/deadair](https://github.com/romulusfoundry/deadair)

Not affiliated with OpenAI, Google, or kickbacks.ai. We're the one for
everything else.
