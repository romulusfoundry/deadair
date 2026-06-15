---
type: Knowledge Bundle
title: deadair
description: Open-source terminal ad network — sponsored lines in your AI coding agent's spinner, revenue shared back to the developer.
resource: https://deadair.online
tags: [deadair, ad-network, cli, developer-tools, ai-agents]
timestamp: 2026-06-15T00:00:00Z
---

# deadair — knowledge bundle

deadair puts a sponsored line in the "dead air" while your AI coding agent
thinks, and pays you a share of the ad revenue for it. This bundle describes
how the network works so an agent (or a person) can understand or integrate
with it without reading the whole codebase.

Published in [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf):
plain markdown + YAML frontmatter, no SDK required.

## Concepts
- [Ad surfaces](surfaces.md) — where ads render and how each is measured
- [Economics](economics.md) — how sponsors pay and how developers earn
- [Privacy & safety](privacy-and-safety.md) — what is collected and how creatives are sanitized
- [API](api.md) — the endpoints the CLI talks to

## Quick facts
- Install: `npm i -g deadair`, then `deadair codex` / `deadair gemini` / `deadair <any-agent>`
- Source (MIT): https://github.com/romulusfoundry/deadair
- Not affiliated with kickbacks.ai, OpenAI, or Google. deadair covers every coding agent that isn't Claude Code.
