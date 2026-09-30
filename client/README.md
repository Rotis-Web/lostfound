# Lost & Found — web application

Next.js 15 App Router, React 19, TypeScript and SCSS modules. It renders every
surface a visitor sees and talks to nothing but the [API](../server/README.md).

The product overview and the full setup live in the
[root README](../README.md). This document covers the routes, the context layer
and the decisions that are not obvious from the file tree.

## Running it

```bash
npm install
cp .env.example .env.local
npm run dev        # next dev --turbopack, http://localhost:3000
```

```bash
npm run typecheck  # tsc --noEmit
npm run lint       # next lint, zero warnings
npm run build      # next build
```

One variable, `NEXT_PUBLIC_API_URL`, and it must include the API's base path —
`http://localhost:8000/api/v1`. Every fetch appends a route to that string, so
omitting the path turns the whole application into 404s.

## Routes

| Route | Description |
| ----- | ----------- |
| `/` | Home: hero, promoted posts, recent posts, categories |
| `/search` and `/search/[...params]` | Results, with filters encoded in the path segments |
| `/post/[id]` | A post: gallery, map, contact details, comments, share and print |
| `/create-post` → `/create-post/success` | The posting form and its confirmation |
| `/edit-post/[id]` | Editing, including adding and removing images |
| `/profile` | The member's own posts, saved posts and settings |
| `/user/[id]` | Another member's public page |
| `/login`, `/register` → `/register/success` | Sign-in and registration |
| `/verify-email`, `/forgot-password`, `/reset-password` | Account recovery, all driven by an emailed token |

`middleware.ts` matches four of these and does one thing: it decides which page
renders first, sending a signed-out visitor away from `/profile` and
`/create-post` and a signed-in one away from `/login` and `/register`. It reads
only whether the refresh cookie is present, and it is not an authorisation
control — the cookie's contents are never checked here. Every route that returns
data enforces its own access on the server; the middleware exists so nobody is
shown a page that is about to fail.

## The context layer

`context/` holds three providers, and together they are the application's data
seam. Components read from them rather than calling the API directly.

**`AuthContext`** owns the session. The access token lives in a `useRef` —
memory only, never `localStorage`, gone on reload — and every authenticated
request reads `accessToken.current` into an `Authorization: Bearer` header. On
mount it exchanges the `HttpOnly` refresh cookie for a fresh access token, which
is why a reload restores the session without the token ever having been written
anywhere a script could read it. Every request that needs the cookie sends
`credentials: "include"`.

**`PostsContext`** holds the post collections a page renders — recent, promoted,
the member's own.

**`SearchContext`** holds the query, the filters and the results, so the search
page and the input in the header stay in step.

## Components

`app/components/` is grouped by the surface that uses a component, not by kind:

```
components/
  HomePage/      Hero, Section1, Section2, Ratings, JoinCrew, AnunturiPromovate
  PostPage/      PostGallery, PostMap, ContactInfo, comments, share and print buttons
  ProfilePage/   UserPosts, SavedPosts, UserSettings, and the confirmation modals
  Forms/         CreatePostForm, EditPostForm, LoginForm, RegisterForm
  Inputs/        MapInput, SearchInput, PhoneInput
  UI/            PostCard, ImageSlider, Categories, Counter, ProfileImage, SaveButton
  Layout/        Header, Loader
```

A component used by exactly one surface stays with that surface. `UI/` is for
what genuinely repeats across several.

Three of them are worth knowing about before editing.

**`MapInput`** is the posting form's location picker: a Leaflet map with a
draggable marker and a circle whose radius the poster sets, plus an address box
that queries `/geo/search` and a reverse lookup that fills the address when the
marker moves. It emits a GeoJSON point — `[longitude, latitude]`, in that order,
which is what the API's 2dsphere index requires and the reverse of how a map
library usually hands them to you.

**`PrintButton`** renders the whole flyer client-side with jsPDF: an A4 layout
laid out from a fixed table of section heights, the post's first image, a status
banner colour-coded by lost/found/solved, contact details, and a QR code from
`qrcode` pointing back at the post. Nothing is sent to the server, so printing a
flyer costs it nothing.

**`ContactInfo`** puts an arithmetic captcha in front of the poster's phone number
and email, with a `localStorage`-backed cooldown after repeated failures. It is a
rendering gate and nothing more: the post payload from `GET /post/:postId`
already contains those fields. It raises the cost of casual scraping and does
nothing against anyone reading the API response directly — treat the contact
details as public.

## Styling

SCSS modules, one `.module.scss` beside each component. Leaflet's own stylesheet
is the exception — it is a plain global import in `MapInput` and `PostMap`,
because it styles elements the library injects into the document rather than ones
those components render, and a module would scope it away from them.

## Images

`next.config.ts` allows remote images from `res.cloudinary.com` (post photographs
and avatars the member uploaded) and `ui-avatars.com` (the generated fallback the
API assigns when none is set). Both are allowlisted by hostname; an image from
anywhere else will not render through `next/image`.

`dangerouslyAllowSVG` is on, which the icon set needs — and which is why the
accompanying `contentSecurityPolicy` on the image config sets `script-src 'none'`
and `sandbox`. Neither should be removed without the other.

## Conventions

User-facing copy is Romanian, including what the API returns: error messages
arrive ready to render, and are shown as they come rather than mapped to strings
here. What the client maps is the `code` field, when the branch it identifies
needs different handling — `EMAIL_NOT_VERIFIED` routes somewhere else,
`TOO_MANY_REQUESTS` does not.
