# 🔍 Lost & Found

**Lost & Found** is a Romanian platform for lost and found items and pets. Someone
who has lost a wallet, a phone or a dog publishes a post with photographs, a
description, contact details and the place it was last seen; the place is a point
on a map with a radius around it rather than a line of text, so anyone searching
the area finds it. Whoever finds the item searches by location, category and
period, comments on the post, calls the owner, and the post is marked solved.

The repository holds both halves of the product: a **Next.js 15** web application
under `client/` and an **Express 5** REST API under `server/`, backed by MongoDB,
Redis and Cloudinary. Both are TypeScript end to end.

User-facing copy is Romanian — the audience is Romanian, and the API's error
messages are written to be shown to a visitor as they arrive. Code, comments and
identifiers are English.

<p align="center">
  <img
    src="docs/images/banner.webp"
    alt="Lost &amp; Found — reuniting people with lost items and pets. Built with Next.js, Express, MongoDB and Redis."
    width="100%"
  />
</p>

---

## ✨ Features

**Posts anchored to a place, not an address.** A post carries a title,
description, up to five photographs, a category, tags, contact details, an
optional reward and an optional last-seen date. Its location is a GeoJSON point
with a radius, chosen on a Leaflet map or typed as an address and geocoded. The
radius is what makes a vague memory usable: "somewhere around the park" becomes a
circle a searcher can match against.

**Search by area, category and period.** `GET /search` combines a MongoDB text
search over title, content and tags with a `$geoWithin` / `$centerSphere` filter,
a category filter, a lost/found filter and a cutoff in months. When the text index
returns nothing the query falls back to a case-insensitive regex over title and
content — a text index tokenises, so a partial word or a diacritic-stripped
spelling misses it where a regex still finds the post.

**Geocoding proxied and cached.** Address lookup and reverse lookup go through
`/geo`, not from the browser to Nominatim. The proxy constrains results to Romania
(`countrycodes=ro`), rejects coordinates outside the country's bounding box, sends
the `User-Agent` Nominatim's usage policy requires, times out after five seconds,
and caches both directions in Redis for an hour. When the upstream fails, a
reverse lookup degrades to the raw coordinates rather than erroring — a map pin
with no street name is still a usable pin.

**Printable flyer with a QR code.** Any post renders to an A4 PDF in the browser —
photograph, status, title, location, contact details, and a QR code pointing back
at the post. Generation is entirely client-side with jsPDF and `qrcode`, so
printing a flyer costs the server nothing.

**Accounts with verified email.** Registration sends a verification link; the
account cannot sign in until it is confirmed. Password reset works the same way on
a ten-minute token. Both tokens are stored as SHA-256 hashes, so the database never
holds a usable one. Passwords are bcrypt-hashed in a Mongoose pre-save hook.

**Saved posts, profiles and public pages.** A member bookmarks posts, keeps a
profile with a bio and an avatar, reviews their own posts from a dashboard, marks
one solved, and has a public page others can reach from any post they wrote.
Avatars fall back to a generated `ui-avatars.com` image, so no account is faceless.

**Comments.** Signed-in members comment on a post to ask a question or add a
sighting. A comment can be deleted only by its author, enforced by comparing the
stored author against the token's subject.

**Human-readable identifiers.** Users and posts each get a `#XXXXX` short ID on
first save, unique by retry against the collection. It is what a flyer prints and
what someone reads out over the phone; the ObjectId stays internal.

<p align="center">
  <br />
  <img
    src="docs/images/ui.webp"
    alt="Lost &amp; Found on a phone and a laptop: a post for a lost French bulldog in Oradea with its contact buttons, reward and map, and the posting form with its status toggle, category picker, tags and radius selector."
    width="100%"
  />
</p>

---

## 🧭 Scope

Three things are modelled in the schema and honoured at read time, but have no
write path yet. They are listed here so the gap is explicit rather than
discovered.

| Area | Modelled as | Implemented today |
| ---- | ----------- | ----------------- |
| **Promoted posts** | `promoted.isActive`, `promoted.expiresAt` on `Post` | Ranking respects them: `/post/latest` returns live promotions first and search sorts on them. No endpoint activates a promotion and no payment is integrated, so the field is only ever set by hand. The "Promovează postarea" button shown after publishing is a placeholder. |
| **Roles** | `role: "user" \| "admin"` on `User` | No route reads it. There is no moderation surface; a post is removable only by its author. |
| **Badges** | `badges: string[]` on `User` | Stored and returned, never awarded. |

`RESEND_API_KEY` is read at startup and the `resend` package is installed, but all
mail is sent over SMTP through Nodemailer. The variable is required by the config
loader and otherwise unused; see [`server/.env.example`](server/.env.example).

---

## 🧱 Architecture

```
client/                   Next.js 15 App Router, React 19, TypeScript, SCSS modules
  app/                    routes, in Romanian: /search, /post/[id], /create-post, /profile
    components/           grouped by surface: HomePage/, PostPage/, ProfilePage/, Forms/, UI/
  context/                AuthContext, PostsContext, SearchContext — the client-side data seam
  types/                  the Post and User shapes shared across components
  middleware.ts           first-render routing only: signed-out off /profile, signed-in off /login

server/                   Express 5 REST API, TypeScript, packaged by layer
  src/routes/             one router per resource, each owning its own rate limits
  src/controllers/        request handling and persistence
  src/models/             Mongoose schemas and indexes: User, Post, Comment
  src/middleware/         authenticate, validate (body), validateQuery, multer error handling
  src/utils/validators/   Zod schemas — the single definition of what a valid request is
  src/utils/              Cloudinary upload and deletion, JWT issuance, env access
  src/services/           transactional email
  src/config/             the env-backed config object, MongoDB and Redis connections
```

The browser talks only to the API. Nominatim, Cloudinary and SMTP are reached from
the server, never from the page — which is what allows the geocoding cache, the
upload allowlist and the rate limits to be enforced at all.

| Dependency | Purpose |
| ---------- | ------- |
| **MongoDB** | System of record. A 2dsphere index serves radius queries, a text index serves search, and compound indexes cover the category/status/recency listing. |
| **Redis** | Rate-limit counters, keyed by prefix per bucket, and the geocoding cache. |
| **Cloudinary** | Image storage and transformation. Uploads are bounded to 1200×1200 with automatic format and quality. |
| **Nominatim** | Forward and reverse geocoding, proxied and cached by the API. |
| **SMTP** | Verification and password-reset mail, over Nodemailer. |

### Request path

Every write passes the same three steps before a controller sees it:
`authenticate` resolves the Bearer token to a user id, a Redis-backed rate limiter
charges the caller's budget, and `validate(schema)` replaces `req.body` with the
parsed result of a Zod schema. A controller therefore never checks a token, never
re-validates a field, and never sees a shape the schema did not permit.

Ownership is enforced by scoping the query rather than by comparing after the
fact: editing, deleting and solving a post all look it up as
`{ _id: postId, author: userId }`, so a post belonging to someone else is
indistinguishable from one that does not exist.

---

## 🛠️ Tech stack

![Next.js](https://img.shields.io/badge/Next%20js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)

![Express](https://img.shields.io/badge/Express%205-404D59?style=for-the-badge&logo=express&logoColor=white)
![Node.js](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-000000?style=for-the-badge&logo=zod&logoColor=3068B7)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=Cloudinary&logoColor=white)

Also in use: Helmet for response headers, `express-mongo-sanitize` against
operator injection, `express-rate-limit` over `rate-limit-redis` for distributed
budgets, Multer with memory storage for uploads, bcrypt for password hashing,
Nodemailer for transactional mail, and Morgan for request logging. On the client:
react-leaflet over OpenStreetMap tiles, Swiper for galleries, jsPDF and `qrcode`
for the flyer, date-fns for relative dates, and react-toastify for feedback.

---

## 🚀 Local setup

Requires Node.js 20 or newer, a MongoDB database and a Redis instance. A
Cloudinary account and an SMTP mailbox are needed for uploads and mail; both are
free at the tier this uses.

### 1. Clone and install

```bash
git clone https://github.com/Rotis-Web/lostfound.git
cd lostfound
npm --prefix server install
npm --prefix client install
```

### 2. Configure the API

```bash
cp server/.env.example server/.env
```

Every value in the template is a placeholder. The two JWT secrets must differ from
each other and must carry real entropy:

```bash
openssl rand -base64 48
```

`REDIS_URL` is expected to be a TLS endpoint — the client is constructed with TLS
enabled unconditionally, which suits a managed instance (Upstash, Redis Cloud) and
not a plain local container. See [Troubleshooting](#-troubleshooting) to run Redis
locally.

### 3. Configure the web application

```bash
cp client/.env.example client/.env.local
```

`NEXT_PUBLIC_API_URL` must include the API's base path —
`http://localhost:8000/api/v1` against a local server.

### 4. Run both halves

```bash
npm --prefix server run dev    # http://localhost:8000, nodemon over ts-node
npm --prefix client run dev    # http://localhost:3000, next dev --turbopack
```

Mongoose creates the indexes on first connection, so there is no migration step
and no seed data: the first account you register is the first row.

### Production build

```bash
npm --prefix server run build && npm --prefix server start
npm --prefix client run build && npm --prefix client start
```

---

## ⚙️ Configuration

The API reads its configuration through `getEnv`, which throws at startup when a
variable has no value and no default — a missing secret fails the process rather
than the first request that needs it. The template is
[`server/.env.example`](server/.env.example).

| Variable | Required | Purpose |
| -------- | -------- | ------- |
| `MONGO_URI` | yes | System of record |
| `REDIS_URL` | yes | Rate-limit counters and the geocoding cache; TLS endpoint |
| `JWT_SECRET` | yes | HMAC key for access tokens |
| `JWT_REFRESH_SECRET` | yes | HMAC key for refresh tokens; must differ from the above |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | yes | Image storage |
| `SMTP_HOST` / `_PORT` / `_USER` / `_PASS` | yes | Outbound mail |
| `FROM_EMAIL` / `FROM_NAME` | yes | Sender identity on verification and reset mail |
| `RESEND_API_KEY` | yes | Read at startup, unused by the code — see [Scope](#-scope) |
| `NODE_ENV` | no | `development`. `production` adds `Secure` to the refresh cookie |
| `PORT` | no | `8000` |
| `BASE_PATH` | no | `/api/v1` |
| `FRONTEND_URL` | no | `http://localhost:3000`. The sole permitted CORS origin, and the base for links in mail |
| `APP_ORIGIN` | no | `localhost` |

The web application reads one variable, from `client/.env.local`
([template](client/.env.example)):

| Variable | Purpose |
| -------- | ------- |
| `NEXT_PUBLIC_API_URL` | API origin **including** the base path, e.g. `http://localhost:8000/api/v1` |

---

## 📡 API

Served under `BASE_PATH`, `/api/v1` by default. Every limit below is per IP. The
buckets are held in Redis and so are shared across processes, except the two
comment buckets, which use the in-memory store and reset on restart.

### Authentication — `/auth`

| Method | Endpoint | Rate limit | Description |
| ------ | -------- | ---------- | ----------- |
| `POST` | `/register` | 5 / 10 min | Create an account and send the verification mail |
| `POST` | `/login` | 10 / 5 min | Returns an access token in the body, sets the refresh cookie |
| `POST` | `/logout` | — | Clears the refresh cookie |
| `POST` | `/refresh-token` | — | Exchanges the refresh cookie for a new access token |
| `POST` | `/verify-email` | — | Confirms an address from the emailed token |
| `POST` | `/forgot-password` | 10 / min | Sends a reset link |
| `POST` | `/reset-password` | 10 / min | Sets a new password from the emailed token |

Sign-in is refused with `EMAIL_NOT_VERIFIED` until the address is confirmed.

### Posts — `/post`

| Method | Endpoint | Auth | Rate limit | Description |
| ------ | -------- | ---- | ---------- | ----------- |
| `POST` | `/create` | ✓ | 93 / 10 min | Create a post with up to 5 images |
| `PUT` | `/edit/:postId` | ✓ | 20 / 5 min | Update fields, add or remove images |
| `PATCH` | `/solve/:postId` | ✓ | 30 / min | Mark solved, optionally crediting a member by `#ID` |
| `DELETE` | `/delete/:postId` | ✓ | 10 / 5 min | Delete a post and its Cloudinary images |
| `GET` | `/user-posts` | ✓ | 30 / min | The caller's own posts |
| `GET` | `/latest` | — | 30 / min | Recent posts, live promotions first |
| `GET` | `/:postId` | — | 30 / min | One post with its author and comments; increments `views` |

Uploads additionally draw on a shared image budget of 115 / 5 min.

### Search — `/search`

| Method | Endpoint | Rate limit | Description |
| ------ | -------- | ---------- | ----------- |
| `GET` | `/` | 60 / min | Filtered search over unsolved posts |
| `GET` | `/categories` | 60 / min | Distinct categories currently in use |

| Parameter | Type | Notes |
| --------- | ---- | ----- |
| `query` | string | ≤ 100 characters; text index, with a regex fallback |
| `category` | string | Exact match |
| `status` | `lost` \| `found` | Comma-separated input, but exactly one value survives validation |
| `lat`, `lon`, `radius` | number | All three or none; radius in kilometres |
| `period` | integer | Months back from today |
| `skip`, `limit` | integer | `limit` defaults to 12, capped at 50 |

The response carries `posts`, `count`, `totalCount`, `hasMore` and `promotedCount`.

### Users — `/user`

| Method | Endpoint | Auth | Rate limit | Description |
| ------ | -------- | ---- | ---------- | ----------- |
| `GET` | `/profile` | ✓ | 30 / min | The caller's profile |
| `GET` | `/public-profile/:id` | — | 30 / min | Another member's public page |
| `PUT` | `/change-password` | ✓ | 2 / min | Requires the current password |
| `PUT` | `/change-profile-image` | ✓ | 2 / min | One image |
| `DELETE` | `/delete-account` | ✓ | 2 / min | Requires the password and the typed phrase `STERGE CONTUL` |
| `GET` | `/saved-posts` | ✓ | — | Bookmarked posts |
| `POST` | `/save-post` | ✓ | 30 / min | Bookmark a post |
| `POST` | `/remove-post` | ✓ | 30 / min | Remove a bookmark |

### Comments — `/comment`

| Method | Endpoint | Auth | Rate limit | Description |
| ------ | -------- | ---- | ---------- | ----------- |
| `POST` | `/create` | ✓ | 5 / min | 3–1000 characters |
| `DELETE` | `/delete/:commentId` | ✓ | 5 / min | Author only |

### Geocoding — `/geo`

The whole router is limited to 60 requests per minute, which is what keeps the
application inside Nominatim's usage policy.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET` | `/search?q=&limit=` | Address → coordinates, Romania only, `limit` capped at 20 |
| `GET` | `/reverse?lat=&lon=` | Coordinates → address; rejects points outside Romania's bounding box |
| `GET` | `/health` | Liveness |

Both lookups are cached in Redis for an hour and return only the fields the client
needs, rather than passing Nominatim's response through.

---

## 🔒 Security

- **Access tokens never touch storage.** The client keeps the access token in a
  React ref — memory only, gone on reload, out of reach of any script that reads
  `localStorage`. It is re-obtained from the refresh cookie on mount.
- **The refresh cookie is `HttpOnly` and `SameSite=Strict`,** and `Secure` when
  `NODE_ENV=production`. Combined with a CORS policy naming a single origin, no
  third-party page can drive the API as a signed-in member.
- **Ownership is a query constraint, not a comparison.** Post edits, deletions and
  status changes are scoped by `author` in the lookup itself, so there is no branch
  in which a missing check leaks another member's post.
- **Every write is validated by a Zod schema** before the controller runs, and the
  parsed result replaces the request body. Query strings go through the same
  mechanism in `validateQuery`.
- **Operator injection is stripped globally** by `express-mongo-sanitize`, so a
  body such as `{ "email": { "$gt": "" } }` cannot reach a Mongoose query as an
  operator.
- **Rate limits are per route and mostly distributed.** Fifteen buckets sized to
  the cost of the operation — 2 per minute for a password change, 5 per ten
  minutes for registration, 60 per minute for the geocoding proxy. Thirteen of
  them carry their own Redis key prefix and so hold across processes; the two on
  comments use the in-memory store.
- **Uploads are constrained before they leave the process.** Memory storage, 5 MB
  per file, at most 5 files, and a MIME allowlist of JPEG, PNG and WebP. Cloudinary
  then re-encodes within a 1200×1200 bound with automatic format.
- **Emailed tokens are stored hashed.** Verification and reset tokens are 32 random
  bytes; only their SHA-256 digest is persisted, with a 24-hour and a 10-minute
  expiry respectively. A database dump yields no usable link.
- **Passwords are bcrypt-hashed in a pre-save hook,** so no code path can write a
  plaintext password, and the field is stripped from every response.
- **Response headers** come from Helmet: a Content Security Policy naming
  Cloudinary as the only remote image source, and HSTS with a one-year max-age,
  subdomains and preload.

Two gaps, stated rather than implied. Refresh tokens are not rotated and there is
no server-side revocation list, so a stolen refresh token stays valid for its seven
days. And the captcha guarding contact details on a post is client-side only — the
post payload already contains them, so it deters casual scraping and nothing more.
Vulnerability reports are handled through [SECURITY.md](SECURITY.md).

---

## 🩺 Troubleshooting

| ⚠️ Problem | 🛠️ Resolution |
| ---------- | ------------- |
| 🔌 `[Redis error]` on startup against a local Redis | The client in `server/src/config/redis.ts` sets `tls: {}` unconditionally, and a plain local container speaks no TLS. Use a managed `rediss://` endpoint, or drop that option while developing locally. |
| 🗝️ `Missing environment variable: X` at startup | `getEnv` throws for any variable with no value and no default. Fill it in `server/.env`; the full list is in `server/.env.example`. |
| 🚪 Every API call answers 403 `FORBIDDEN` | The access token is expired or signed with a different key. `JWT_SECRET` must match the one the token was issued with, and must differ from `JWT_REFRESH_SECRET`. |
| 🌐 The browser reports a CORS failure | `FRONTEND_URL` is the only origin the API accepts, and credentials are required. It must match the web application's origin exactly, scheme and port included. |
| 🧭 The web app loads but every request 404s | `NEXT_PUBLIC_API_URL` must include the base path: `http://localhost:8000/api/v1`, not `http://localhost:8000`. |
| 📭 Registration succeeds but no mail arrives | SMTP failures are logged and swallowed so registration still returns 201. Check the server log, and that `SMTP_*` and `FROM_EMAIL` are set. |
| 🖼️ Uploads fail with "Doar fișierele imagine sunt permise" | The allowlist is JPEG, PNG and WebP, 5 MB each, 5 per post. Anything else is rejected by Multer before the controller runs. |
| 📍 A search with coordinates returns nothing | `lat`, `lon` and `radius` must be sent together — validation rejects a partial triple — and the radius is kilometres, not metres. |
| 🗺️ Geocoding returns raw coordinates instead of a street | Nominatim timed out or rate-limited; reverse lookup degrades to coordinates by design. It is also Romania-only, and rejects points outside the country's bounding box. |
| 🔁 Port already in use: 3000 or 8000 | Stop the process holding it, or set `PORT` for the API and pass `-p` to `next dev`. |

---

## 📚 Documentation

- [`client/README.md`](client/README.md) — the web application, its routes and the context layer
- [`server/README.md`](server/README.md) — the API, its request path, schema and indexes
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — setup, the checks CI runs, pull-request guidelines
- [`SECURITY.md`](SECURITY.md) — vulnerability reporting and scope

---

## 📐 Conventions

User-facing copy is Romanian; code, comments and identifiers are English. The Zod
schemas in `server/src/utils/validators/` are the single definition of a valid
request — a controller never re-checks a field. Rate limits live beside the routes
they protect, not in a central table, so adding a route means deciding its budget.
Coordinates are GeoJSON `[longitude, latitude]` everywhere, in that order, because
that is what a 2dsphere index requires.

---

## 🤝 Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for setup, the
checks CI runs, and pull-request guidelines. For security issues, please follow
[SECURITY.md](SECURITY.md) rather than opening a public issue.

---

## 📄 License

Released under the [MIT License](LICENSE).
