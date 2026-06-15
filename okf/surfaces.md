---
type: Concept
title: Ad surfaces
description: The three surface types where deadair renders sponsored content, and how each is measured.
resource: https://deadair.online/sponsor
tags: [surfaces, measurement, codex, gemini, banner]
timestamp: 2026-06-15T00:00:00Z
---

# Ad surfaces

deadair renders on three surface types. They differ in how much of the wait
they cover and how delivery is measured.

## Codex (native spinner)
Codex exposes no spinner hook, so `deadair codex exec ...` renders its **own**
ad-carrying spinner while Codex output streams through it. deadair draws the
spinner, so it owns 100% of the rendered wait time. Measured in verified
rendered seconds (5-second impression units).

## Gemini CLI (native spinner)
Sponsored lines run inside Gemini's own spinner via its sanctioned
`ui.customWittyPhrases` setting. On non-thinking models (e.g. flash-lite)
coverage is full; on thinking models Gemini's thought summaries occupy the
same line and deadair phrases render only in the gaps. Reported as estimated
impressions, never billed as verified.

## Banner (every other agent)
`deadair <agent>` (hermes, openclaw, aider, copilot, ...) wraps any CLI with a
sponsored banner at session entry and exit, plus session timing. deadair does
not inject into the agent's own interface. Measured per banner impression and
per click — not by wall-clock time.

## Clicks
On modern terminals every rendered line is an OSC-8 hyperlink through a
logging redirect (`/c/:id`), so clicks are counted per creative, per surface,
per country, and reported as CTR alongside impressions.
