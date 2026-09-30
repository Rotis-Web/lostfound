# Lost & Found — API

Express 5 REST API in TypeScript, backed by MongoDB, Redis and Cloudinary. It
serves the [web application](../client/README.md) under `/api/v1` and is the only
thing that application talks to — Nominatim, Cloudinary and SMTP are all reached
from here, never from the browser.

The endpoint tables and the full configuration reference live in the
[root README](../README.md#-api). This document covers how a request moves through
the process and how the data is shaped.

## Running it

```bash
npm install
cp .env.example .env
npm run dev      # nodemon over ts-node, http://localhost:8000
```

```bash
npm run typecheck   # tsc --noEmit
npm run build       # tsc, emits to dist/
npm start           # node dist/server.js
```

`src/config/app.config.ts` reads every variable through `getEnv`, which throws
when a variable has neither a value nor a default. The process therefore refuses
to start on an incomplete `.env` rather than failing at whichever request first
needs the missing value. [`.env.example`](.env.example) documents all of them.

## Request path

`src/app.ts` builds the middleware stack in the order that matters:

1. **Helmet** — Content Security Policy (Cloudinary is the only remote image
   source) and HSTS with a one-year max-age, subdomains and preload.
2. **`express-mongo-sanitize`** — strips `$`-prefixed and dotted keys from the
   request before anything can pass them to Mongoose as operators.
3. **Morgan** — request logging.
4. **CORS** — a single origin, `FRONTEND_URL`, with credentials enabled. This is
   what allows the refresh cookie to travel and what stops any other page from
   using it.
5. **Body parsers and `cookie-parser`.**
6. **The routers**, mounted under `BASE_PATH`.
7. **`handleMulterError`**, last, translating upload failures into the same
   `{ code, message }` shape as everything else.

Within a router, a write passes three more steps before the controller:

- **`authenticate`** verifies the Bearer token against `JWT_SECRET` and sets
  `req.user = { id }`. A missing header is 401, a bad or expired token is 403.
- **A rate limiter** charges the caller's budget. Each bucket has its own Redis
  key prefix — `rl_login:`, `rl_create_post:`, `rl_geo:` — so one exhausted budget
  never affects another.
- **`validate(schema)`** parses the body with a Zod schema and *replaces* it with
  the result. `validateQuery(schema)` does the same for the query string.

The consequence worth keeping: a controller never checks a token, never
re-validates a field, and never sees a shape the schema did not permit.

## Authorisation

Ownership is expressed as a query constraint, not as a comparison after the fetch:

```ts
const post = await Post.findOne({
  _id: new mongoose.Types.ObjectId(postId),
  author: new mongoose.Types.ObjectId(userId),
});
```

A post belonging to someone else is indistinguishable from one that does not
exist, and there is no branch where a forgotten check leaks it. Edit, delete and
solve all follow this shape; comment deletion compares `comment.author` against
the token subject, since the comment is loaded to be returned either way.

## Data model

Three collections, in `src/models/`.

**`User`** — name, email (unique, lowercased, indexed), bcrypt password hash,
`#XXXXX` short id, role, profile image, bio, badges, favourite posts,
verification and reset token digests with their expiries.

A single `pre("save")` hook does three things: assigns the short id by retrying
against the collection until one is free, fills a `ui-avatars.com` URL when no
profile image is set, and hashes the password whenever it has been modified.
Hashing in the hook rather than at the call site is what makes it impossible for
any code path to write a plaintext password.

Verification and reset tokens are 32 random bytes returned to the caller; only
their SHA-256 digest is stored, with a 24-hour and a 10-minute expiry
respectively. A database dump yields no usable link.

**`Post`** — author, `#XXXXX` short id, title, content, tags, images,
`status: found | lost | solved`, contact name/email/phone, category, last-seen
date, a human-readable location string, a GeoJSON point, a radius in metres, an
optional reward, a promotion window, view count and comments.

`locationCoordinates` is a `Point` whose `coordinates` array is validated to be
exactly two numbers, `[longitude, latitude]` — that order, because a 2dsphere
index requires it.

**`Comment`** — author, post, content, timestamps. Referenced from `Post.comments`
and populated with the author's name and profile image on read.

### Indexes

| Index | Serves |
| ----- | ------ |
| `{ title: text, content: text, tags: text }` | The search box |
| `{ locationCoordinates: "2dsphere" }` | `$geoWithin` / `$centerSphere` radius search |
| `{ category, status, createdAt: -1 }`, partial on `status ≠ solved` | The filtered listing, without indexing the posts nobody browses |
| `{ "promoted.isActive", "promoted.expiresAt" }` | Live promotions on the home page |
| `{ author }`, `{ category }`, `{ status }`, `{ lastSeen: -1 }`, `{ createdAt: -1 }` | Single-field filters and sorts |

Mongoose builds these on first connection, so there is no migration step. Adding
a query pattern means adding the index that serves it in the same change.

## Search

`searchController` builds one filter object from the query parameters, always
scoped to `status ≠ solved`. Text search, category, lost/found, a `$centerSphere`
radius and a cutoff in months compose freely; `lat`, `lon` and `radius` are
refused unless all three are present, since two of the three cannot describe an
area.

Two radii with the same name and different units meet here: the search
parameter is kilometres, divided by the Earth's radius for `$centerSphere`, while
`Post.circleRadius` — the circle drawn on a post's own map — is metres, capped at
10 000. Converting between them is the reader's job, and getting it wrong is a
search that silently covers a thousand times too much ground.

When the text index returns nothing the query is retried as a case-insensitive
regex over title and content. A text index tokenises, so a partial word or a
diacritic-stripped spelling misses where a regex still matches — the fallback
costs a collection scan, but only on a query that had already failed.

## Geocoding proxy

`src/routes/geo.routes.ts` is self-contained: its own Zod schemas, its own rate
limit of 60 requests per minute for the whole router, and Redis caching with an
hour's TTL on both directions.

It exists so that Nominatim is never called from the browser. That is what makes
the cache effective, the `User-Agent` its usage policy requires possible to set,
and the request rate something the application controls. Results are constrained
to Romania and narrowed to the five fields the client uses rather than passed
through. A reverse lookup that times out or is rate-limited degrades to the raw
coordinates: a pin with no street name is still a usable pin.

## Uploads

Multer holds files in memory — 5 MB each, at most 5 per post, and a MIME
allowlist of JPEG, PNG and WebP. `src/utils/cloudinary.ts` then streams the buffer
to Cloudinary into the `lost-found-posts` folder, bounded to 1200×1200 with
`quality: auto:good` and `fetch_format: auto`.

Deleting a post deletes its images. The public id is parsed back out of the stored
URL, stepping over the version segment, and deletions are issued with
`Promise.allSettled` so one failure does not strand the rest.

## Conventions

Error responses are always `{ code, message }`, with `code` a stable
`SCREAMING_SNAKE` identifier and `message` Romanian prose written to be shown to a
visitor as it arrives. Rate limits live in the router beside the route they
protect, not in a central table, so adding a route means deciding its budget.
Configuration is reached through `getEnv`, never `process.env` directly.
