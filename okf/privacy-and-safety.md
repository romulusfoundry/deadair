---
type: Concept
title: Privacy & safety
description: What deadair collects (session seconds only) and how advertiser creatives are sanitized before reaching a terminal.
resource: https://deadair.online/privacy
tags: [privacy, security, sanitization]
timestamp: 2026-06-15T00:00:00Z
---

# Privacy & safety

## What is collected
The CLI reports **session seconds only**: which agent ran, how long, and
country (for sponsor reporting). It never sees or sends your prompts, your
code, your file paths, or your output. There is no daemon and no telemetry
beyond session seconds.

## Creative sanitization
Advertiser text is untrusted and gets written straight to a terminal, so it is
sanitized twice — once server-side on serve, once client-side on render:
- ANSI escape sequences and control characters stripped (no terminal hijacking)
- Printable ASCII only (emojis break spinner width math)
- Length-capped (60 chars text, 24 chars sponsor name)
- No fake-error or system-message impersonation; human-reviewed before going live

## Uninstall
`deadair uninstall` restores any modified agent settings (e.g. Gemini's
phrases) byte-for-byte and removes local data.
