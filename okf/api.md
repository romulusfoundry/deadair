---
type: API
title: deadair API
description: The HTTP endpoints the deadair CLI talks to. Service-role only; the public surface is read-mostly.
resource: https://deadair.online
tags: [api, endpoints]
timestamp: 2026-06-15T00:00:00Z
---

# deadair API

Base: `https://deadair.online`. The CLI registers an install id (a client
UUID) on first run and reports usage. No account, no auth token for the
developer — the install id is the identifier.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/install` | POST | Register an install, claim a founder number |
| `/api/creatives` | GET | Fetch active sponsored lines to rotate |
| `/api/sessions` | POST | Report a session (agent, seconds, country) + impressions |
| `/api/me` | GET | Read an install's capped countable seconds + share |
| `/api/stats` | GET | Public counters (installs, founder slots left) |
| `/c/:id` | GET | Click redirect — logs the click, 302s to the sponsor URL |
| `/api/sponsor` | POST | Sponsor lead form |

Notes:
- Sessions report seconds only — never prompts, code, or output.
- `/api/me` returns the 8h/day-capped figure, the same number used for accrual.
- All writes go through a service-role server; the public/anon database role has no access.
