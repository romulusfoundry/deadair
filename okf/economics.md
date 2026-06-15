---
type: Concept
title: Economics
description: How sponsors pay deadair and how developers earn a share, including the founder rate and anti-farming cap.
resource: https://deadair.online/terms
tags: [economics, revenue, payouts, founder, anti-fraud]
timestamp: 2026-06-15T00:00:00Z
---

# Economics

## How sponsors pay
Founding sponsors pay a flat monthly rate ($250/mo, rate locked 6 months) for
a sponsored line in rotation across network inventory. Flat pricing means a
sponsor commits a known amount rather than betting on impression volume the
network cannot yet forecast.

## How developers earn
Net ad revenue (gross sponsor payments minus payment and payout processing)
splits pro-rata by **verified ad delivery**:
- Spinner surfaces (Codex, Gemini) accrue by rendered wait-time.
- Banner surfaces accrue per impression and per click only.
- Time during which no ad is displayed accrues nothing.

The first 1,000 installs keep **75%** of their share forever; everyone after
keeps 50%. Balances are promotional rewards, not wages — if there is no
sponsor revenue, balances are $0.

## Payouts
Cash out at $25 via PayPal, gift card, or prepaid card through a licensed
payout provider. The program is structured as promotional rewards paid from
deadair's own revenue (not a pass-through of advertiser funds), which is what
keeps it out of money-transmitter classification — independent of payout
method. Never-linked, long-idle balances return to the community pool.

## Anti-farming
Countable time is capped at 8 hours per day per install (enforced in SQL, not
just policy). Payouts are human-reviewed for bot signatures before money moves.
Because the sponsor pool is fixed, bots dilute other farmers, never drain the
platform — so there is no incentive to inflate, and forfeited balances return
to the pool.
