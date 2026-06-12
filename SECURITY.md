# Security

deadair renders third-party (advertiser) text inside developers' terminals, so
we treat creative handling as a security surface, not a content policy:

- All creative text is sanitized **twice** — server-side on serve
  (`web/lib/sanitize.js`) and client-side on render (`cli/src/creatives.js`):
  ANSI/control sequences stripped, printable ASCII only, length-capped.
- Every creative is human-reviewed before activation. Paid checkouts stage
  creatives inactive.
- The CLI reports session seconds and serve events only — never prompts, code,
  paths, or output. The database is service-role-only behind the API.

## Reporting a vulnerability

Email **info@wendellhq.com** with details. We'll acknowledge within 48 hours.
Please don't open public issues for exploitable bugs — especially anything
that could put unsanitized bytes into a terminal.
