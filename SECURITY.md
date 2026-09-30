# Security Policy

## Reporting a vulnerability

Please do not report security issues through public GitHub issues, pull requests
or discussions.

Report privately by opening a
[security advisory](https://github.com/Rotis-Web/lostfound/security/advisories/new)
on this repository.

Include what the issue is and how it can be exploited, steps to reproduce or a
proof of concept, the affected area (a URL, an API route, or a file and line), and
whatever you can establish about impact.

You will receive an acknowledgement, and an update once the issue is resolved or a
decision is made not to act on it. Please allow a reasonable window for a fix
before disclosing publicly.

## Scope

In scope: this repository — the Express API under `server/`, the Next.js
application under `client/`, and the Mongoose schemas and indexes that back them.

The following are of particular interest.

**Horizontal access control.** Reading or modifying another member's posts, saved
posts, comments or profile. Post edits, deletions and status changes are scoped by
author in the lookup itself; any sequence that changes a post you do not own, or
deletes a comment you did not write, is a valid report.

**Session handling.** Obtaining an access token without the password, having an
expired or foreign token accepted, retaining a working session past a password
change, or reaching the refresh endpoint from an origin other than the configured
one. Note that refresh tokens are deliberately not rotated today — see
**Known and out of scope** below.

**Rate limiting.** Bypassing any of the fifteen budgets, in particular the
registration, login and password-change buckets, or causing the Redis-backed
limiters to fail open when Redis is unavailable.

**Injection.** Input reaching a Mongoose query as an operator rather than as a
value, despite the global `express-mongo-sanitize` pass; or markup surviving into
another member's page through a post title, description, tag or comment.

**Upload handling.** Storing a file the MIME allowlist should have rejected,
exceeding the size or count limits, or causing the Cloudinary deletion path to act
on an object the caller does not own — the public id is parsed out of a stored
URL, so a crafted URL reaching that parser is worth reporting.

**The geocoding proxy.** Causing `/geo` to issue requests outside Romania's
bounding box, poisoning a cached entry so another visitor is served it, or using
the proxy as an open relay to Nominatim beyond the rate the policy permits.

**Account recovery.** Verification and reset tokens are 32 random bytes stored as
SHA-256 digests, with 24-hour and 10-minute expiries. Predicting one, using an
expired one, reusing one after it has been redeemed, or enumerating registered
addresses through the responses are all valid reports.

**Configuration exposure.** Any route, response, log line or client bundle that
discloses a secret, a connection string, or a stack trace.

Out of scope: vulnerabilities in third-party services (MongoDB Atlas, Redis
providers, Cloudinary, Nominatim, the SMTP provider), which should be reported to
their vendors; findings that require an already-compromised host or account;
missing hardening with no demonstrated impact; and automated scanner output
presented without a working case.

## Known and out of scope

The following are known. A report describing one of them adds nothing; a report
showing that one is worse than described is welcome.

**Refresh tokens are not rotated.** `/auth/refresh-token` verifies the cookie and
mints a new access token; the refresh token itself is unchanged and there is no
server-side family or revocation list. A stolen refresh token therefore stays
valid for its seven days, and `/auth/logout` clears the cookie in the caller's
browser only. Access tokens live one hour and carry no version claim, so a
password change does not invalidate one already issued.

**Contact details are protected by a client-side captcha only.** A post's payload
from `GET /post/:postId` contains the poster's name, phone number and email; the
captcha in front of them is a rendering gate in the browser. It raises the cost of
casual scraping and does nothing against anyone calling the API directly. Treating
those fields as public is the correct assumption.

**`script-src` permits `unsafe-inline`.** Next.js hydration requires it until a
per-request nonce replaces it. The directives that do not depend on script
injection — `default-src`, `img-src` — are enforced.

**Comment rate limits are per process.** The two comment buckets use the default
in-memory store rather than Redis, so they are not shared between instances and
reset on restart. Every other bucket is Redis-backed.

**There is no moderation surface.** The `role` field on `User` exists but no route
reads it, so a post can be removed only by its author. Abusive content is a
product gap, not a vulnerability.

## Testing guidelines

Test against your own local instance, as described in the
[README](README.md#-local-setup). Do not run denial-of-service or load tests
against a deployed instance, do not access or modify data belonging to other
people, and do not attempt social engineering against users or maintainers.

Registration sends real mail through the configured SMTP account. Use addresses
you control.

## Secrets

This repository contains no credentials. All configuration is supplied through
environment variables documented in
[`server/.env.example`](server/.env.example) and
[`client/.env.example`](client/.env.example); `.env` files are gitignored and must
never be committed. The values in both templates are placeholders.

CI scans every push for dependencies with known, fixed CVEs and for credentials
that reached the tree. If you believe a secret has been committed, report it
privately through the process above rather than opening an issue.
