# Contributing to Lost & Found

Bug reports, fixes and feature proposals are all welcome. This document covers the
setup, the checks that must pass, and the conventions the codebase holds to.

## Environment

Node.js 20 or newer, a MongoDB database and a Redis instance. Follow the
[local setup in the README](README.md#-local-setup); in short:

```bash
npm --prefix server install && cp server/.env.example server/.env
npm --prefix client install && cp client/.env.example client/.env.local
npm --prefix server run dev
npm --prefix client run dev
```

The two halves are separate npm projects with separate lockfiles. There is no
workspace root, so every command names the one it applies to — `--prefix server`
or `--prefix client`.

Both `.env` files are gitignored and every value in the templates is a
placeholder. The JWT secrets need real entropy (`openssl rand -base64 48`) and
must differ from each other; a secret reused across the two makes a refresh token
accepted as an access token.

Work on a page or a component usually needs neither MongoDB nor Redis running —
the API simply fails its requests and the surface still renders. Work on anything
that reads or writes needs both, and Redis needs a TLS endpoint: see the
[troubleshooting table](README.md#-troubleshooting).

## Required checks

Run what CI runs before opening a pull request.

```bash
npm --prefix server run typecheck
```

```bash
npm --prefix client run typecheck
npm --prefix client run lint
npm --prefix client run build
```

The lint budget is zero warnings: fix the warning, or silence it at its line with
a stated reason.

The client build is not redundant with its typecheck. `next build` generates a
type file per route into `.next/types` and checks your page's props against it,
which is the only thing that catches a dynamic route whose `params` is typed as a
plain object rather than a `Promise` — `tsc --noEmit` passes on it, and the
deployment does not. It also catches a server/client boundary crossed, a bad
route export, and components that only fail when they are actually rendered.

There is no test suite yet. Adding one is welcome; Vitest on the server and
Playwright against the two running halves would both fit the shape of the code.

## Pull requests

- Branch from `main`; keep each pull request to a single change.
- State what changed and why. Reference an issue where one exists.
- Update the README, `server/.env.example` or `client/.env.example` whenever you
  add configuration or change a setup step. A variable that `getEnv` reads without
  a default belongs in the template the same day it is added, or the next clean
  checkout fails to boot.
- A new route decides its own rate limit, in the router beside it.
- A new request field is validated in the matching Zod schema, not in the
  controller.
- A schema change that adds a query pattern adds the index that serves it.
- CI must be green before merge.

Commit messages follow Conventional Commits — `feat:`, `fix:`, `chore:`,
`refactor:`, `docs:` — with a subject describing the change in terms of its
effect, and a body explaining the reasoning where it is not self-evident.

## Code style

TypeScript and ESLint are authoritative. Run the checks and address what they
report rather than working from a separate style guide. Beyond that, follow the
conventions of the file you are editing: naming, structure and comment density.

Three conventions the tooling cannot enforce:

- **User-facing copy is Romanian; code, comments and identifiers are English.**
  Any string a visitor can read is Romanian, and that includes the API's error
  messages — they are written to be rendered as they arrive, not translated by the
  client.
- **Coordinates are GeoJSON `[longitude, latitude]`,** in that order, everywhere.
  A 2dsphere index requires it, and the reversed pair is a bug that only shows up
  as results in the wrong country.
- **Comments are reserved for what the code cannot state** — an upstream quirk, a
  policy constraint, or a decision whose alternative looks preferable until
  explained.

## Code organisation

```
server/src/
  routes/               one router per resource; rate limits and multer config live here
  controllers/          request handling and persistence
  models/               Mongoose schemas and indexes
  middleware/           authenticate, validate, validateQuery, multer errors
  utils/validators/     Zod schemas
  config/               env-backed config, MongoDB and Redis connections
client/
  app/                  routes; components/ grouped by the surface that uses them
  context/              AuthContext, PostsContext, SearchContext
  types/                shared Post and User shapes
```

Three constraints matter more than the rest.

**Validation happens once, in middleware.** `validate(schema)` and
`validateQuery(schema)` replace the request body or query with the schema's parsed
output before the controller runs. A controller that re-checks a field has either
duplicated the schema or contradicted it; both are worse than the schema alone.

**Ownership is expressed in the query.** Post edits, deletions and status changes
look the document up as `{ _id: postId, author: userId }` and treat "not found"
and "not yours" identically. Fetch-then-compare is the shape that eventually ships
without the comparison; keep the constraint in the lookup.

**Configuration goes through `getEnv`.** Reading `process.env` directly in a
module skips the startup check, so a missing value surfaces as a runtime failure
in whatever request happens to need it first, rather than as a process that
refuses to start.

## Reporting bugs

Open an issue with steps to reproduce, the expected result and the actual one.
Include your operating system, which half you were running, and any relevant
console or server output. The `code` field from a failed response — `UNAUTHORIZED`,
`INVALID_POST_ID`, `TOO_MANY_REQUESTS` — is worth including; it identifies the
branch that rejected the request.

For anything security-related, do not open a public issue. See
[SECURITY.md](SECURITY.md).
