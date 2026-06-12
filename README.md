# deadair

Get paid to wait. Sponsored spinner lines for Codex, Gemini CLI, and every
coding agent that isn't already taken.

- `cli/` — the `deadair` npm package (`deadair codex`, `deadair gemini`)
- `web/` — deadair.online: landing page, sponsor page, and the API the CLI talks to

## How it works

- **Gemini CLI**: sponsored lines go into the sanctioned `ui.customWittyPhrases`
  setting — they show in Gemini's own spinner. `deadair uninstall` restores
  your original settings.
- **Codex**: no spinner hook exists upstream, so `deadair codex exec ...`
  renders its own ad-carrying spinner while output streams; interactive
  sessions get sponsored banners and session timing.
- Wait-time reports to the API (session seconds only — no prompts, no code,
  no paths). Revenue from flat-rate sponsors splits pro-rata by wait-time:
  75% to the first 1,000 installs forever, 50% after.

## Dev

```
cd web && pnpm install && pnpm dev   # site + API on :3000
node cli/src/index.js status         # CLI against DEADAIR_API=http://localhost:3000
```
