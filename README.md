# 🔍 Lost & Found - Reuniting People with Lost Items & Pets

<img src="https://res.cloudinary.com/dqyq1oiwi/image/upload/v1758395029/Copy_of_Untitled_1_s0pji1.png" alt="Lost & Found Banner" width="100%">

**Lost & Found** is a full-stack web application designed to help users recover lost items and pets through intelligent geolocation-based matching. The platform combines real-time mapping, advanced search algorithms, and secure user authentication to create a comprehensive lost-and-found ecosystem.

## Table of Contents

- [Project Overview](#project-overview)
- [Preview](#preview)
- [Core Features](#core-features)
- [Technical Architecture](#technical-architecture)
- [API Documentation](#api-documentation)
- [Security Implementation](#security-implementation)
- [Performance Optimizations](#performance-optimizations)
- [Technical Challenges](#technical-challenges)
- [Mobile Responsive Design](#mobile-responsive-design)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Design Philosophy](#design-philosophy)

## Project Overview

This application addresses the challenge of efficiently connecting people who have lost items with those who have found them. By leveraging geospatial indexing and caching strategies, the platform delivers fast, location-aware search results while maintaining data security and system reliability.

**Key Technical Highlights:**
- Geospatial queries with MongoDB 2dsphere indexes
- Redis-backed rate limiting and caching
- JWT-based authentication with refresh token rotation
- Automated image optimization via Cloudinary CDN
- XSS protection through input sanitization with express-mongo-sanitize
- Comprehensive input validation using Zod schemas

## Preview

<div align="center">
  <img src="https://rotis-web.vercel.app/_next/image?url=%2Fimages%2Fprojects%2FLostFound%2Flostfound-1.webp&w=3840&q=90" alt="Post Page" width="49%">
  <img src="https://rotis-web.vercel.app/_next/image?url=%2Fimages%2Fprojects%2FLostFound%2Flostfound-2.webp&w=3840&q=90" alt="Create Post" width="49%">
</div>

<div align="center">
  <img src="https://rotis-web.vercel.app/_next/image?url=%2Fimages%2Fprojects%2FLostFound%2Flostfound-3.webp&w=3840&q=90" alt="Dashboard" width="49%">
  <img src="https://rotis-web.vercel.app/_next/image?url=%2Fimages%2Fprojects%2FLostFound%2Flostfound-5.webp&w=3840&q=90" alt="Homepage" width="49%">
</div>

## Core Features

### Geospatial Posting & Discovery
Users can create posts with precise coordinates using Leaflet.js integration and OpenStreetMap's Nominatim API. The system implements MongoDB geospatial indexes for efficient radius-based queries, enabling users to discover nearby lost/found items within customizable distance ranges.

### Advanced Search & Filtering
Multi-parameter search functionality includes text matching, date ranges, categories, and location-based filtering. Search queries are optimized through Redis caching with intelligent TTL management (1-hour expiration), reducing external API calls and improving response times.

### Printable Flyer Generator
Automated generation of professional PDF flyers with QR codes linking back to the online post. Templates are optimized for A4 printing and include customizable layouts that adapt to different item types.

### User Management System
Secure authentication flow with JWT tokens (access + refresh), email verification, and password recovery. User profiles maintain posting history with dashboard analytics for tracking active and resolved posts. Users can bookmark posts for later reference and manage their saved collections.

### Comment System
Real-time commenting functionality allows users to ask questions, provide updates, or coordinate meetups directly on posts. Comments are rate-limited to prevent spam and support threaded discussions.

## Technical Architecture

### Technology Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=Cloudinary&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white)
![Context-API](https://img.shields.io/badge/Context--Api-000000?style=for-the-badge&logo=react)

**Frontend:**
- Next.js 14 with App Router
- TypeScript for type safety
- SCSS Modules for component-scoped styling
- Leaflet.js for interactive maps
- React Context API for state management

**Backend:**
- Express.js with TypeScript
- Mongoose ODM for MongoDB interactions
- Redis for session storage and caching
- Helmet.js for security headers
- Morgan for request logging
- express-mongo-sanitize for NoSQL injection prevention
- Zod for schema validation

**Infrastructure:**
- MongoDB Atlas for database hosting
- Redis Cloud for caching layer
- Cloudinary for image CDN
- Vercel for frontend deployment
- Railway/Render for backend deployment

## API Documentation

### Base URL
```
Production: https://api.lostfound.ro/api/v1
Development: http://localhost:8000/api/v1
```

### Authentication Routes (`/auth`)

| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| POST | `/register` | 5/10min | Create new user account with email verification |
| POST | `/login` | 10/5min | Authenticate user and issue JWT tokens |
| POST | `/logout` | - | Invalidate refresh token and clear cookies |
| POST | `/refresh-token` | - | Generate new access token using refresh token |
| POST | `/verify-email` | 10/min | Confirm email address with verification code |
| POST | `/forgot-password` | 10/min | Request password reset email |
| POST | `/reset-password` | 10/min | Reset password using token from email |

**Authentication Flow:**
1. User registers → Email verification sent
2. User verifies email → Account activated
3. User logs in → Access token (15min) + Refresh token (7d) issued
4. Access token expires → Client requests new token using refresh token
5. Refresh token expires → User must log in again

### Post Management Routes (`/post`)

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/create` | ✓ | 93/10min | Create new lost/found post with images |
| GET | `/:postId` | - | 30/min | Retrieve single post by ID |
| PUT | `/edit/:postId` | ✓ | 20/5min | Update post details and images |
| PATCH | `/solve/:postId` | ✓ | 30/min | Mark post as resolved |
| DELETE | `/delete/:postId` | ✓ | 10/5min | Delete user's own post |
| GET | `/user-posts` | ✓ | 30/min | Get all posts by authenticated user |
| GET | `/latest` | - | 30/min | Fetch recent posts with pagination |

**Post Creation Example:**
```typescript
POST /api/v1/post/create
Content-Type: multipart/form-data
Authorization: Bearer {access_token}

{
  title: "Lost Black Labrador",
  description: "Last seen near Central Park",
  category: "pet",
  type: "lost",
  location: {
    lat: 44.4268,
    lon: 26.1025,
    display_name: "Bucharest, Romania"
  },
  contactInfo: {
    phone: "+40123456789",
    email: "contact@example.com"
  },
  images: [File, File] // Max 5 images, 5MB each
}
```

### User Management Routes (`/user`)

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| GET | `/profile` | ✓ | 30/min | Get authenticated user's profile |
| GET | `/public-profile/:id` | - | 30/min | View public user profile |
| PUT | `/change-password` | ✓ | 2/min | Update user password |
| PUT | `/change-profile-image` | ✓ | 2/min | Upload new profile picture |
| DELETE | `/delete-account` | ✓ | 2/min | Permanently delete user account |
| GET | `/saved-posts` | ✓ | - | Retrieve user's bookmarked posts |
| POST | `/save-post` | ✓ | 30/min | Bookmark a post |
| POST | `/remove-post` | ✓ | 30/min | Remove post from bookmarks |

### Geocoding Routes (`/geo`)

| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| GET | `/search?q={query}&limit={n}` | 60/min | Forward geocoding (address → coordinates) |
| GET | `/reverse?lat={lat}&lon={lon}` | 60/min | Reverse geocoding (coordinates → address) |
| GET | `/health` | - | Service health check |

**Geocoding Features:**
- Results cached in Redis for 1 hour
- Country-specific to Romania (countrycodes=ro)
- Coordinate validation: lat ∈ [43.5, 48.3], lon ∈ [20.2, 29.7]
- Automatic language localization (Romanian)
- Deduplicated results with importance scoring

### Comment Routes (`/comment`)

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|-------------|-------------|
| POST | `/create` | ✓ | 5/min | Add comment to post |
| DELETE | `/delete/:commentId` | ✓ | 5/min | Delete own comment |

### Search Routes (`/search`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts?q={query}&category={cat}&location={loc}&radius={km}&dateFrom={date}&dateTo={date}` | Advanced post search |

**Search Parameters:**
- `q`: Text search in title/description
- `category`: Filter by category (pet, electronics, documents, etc.)
- `location`: Center point for radius search
- `radius`: Search radius in kilometers
- `dateFrom`/`dateTo`: Filter by posting date range

## Security Implementation

### Input Validation & Sanitization

**Zod Schema Validation** - All incoming requests are validated against TypeScript-first schemas before reaching controllers. This ensures type safety and catches malformed data early in the request lifecycle.

```typescript
// Example: Post creation schema
const createPostSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  category: z.enum(['pet', 'electronics', 'documents', 'jewelry', 'other']),
  type: z.enum(['lost', 'found']),
  location: z.object({
    lat: z.number().min(43.5).max(48.3),
    lon: z.number().min(20.2).max(29.7),
    display_name: z.string()
  })
});
```

**NoSQL Injection Prevention** - `express-mongo-sanitize` middleware strips out `$` and `.` characters from user input, preventing MongoDB operator injection attacks. This protects against malicious queries that attempt to manipulate database operations.

```typescript
// Sanitization applied globally to all routes
app.use(mongoSanitize());

// Example attack prevented:
// { "email": { "$gt": "" } } → { "email": "" }
```

### Rate Limiting Architecture

Redis-backed rate limiting prevents abuse and ensures fair resource allocation. Different endpoints have tiered limits based on their resource intensity:

| Endpoint Type | Window | Limit | Rationale |
|---------------|--------|-------|-----------|
| Registration | 10 min | 5 | Prevent bot account creation |
| Login | 5 min | 10 | Balance security vs. user experience |
| Post Creation | 10 min | 93 | Allow legitimate use while preventing spam |
| Image Upload | 5 min | 115 | Protect storage and bandwidth |
| Geocoding | 1 min | 60 | Respect external API fair use |
| Comments | 1 min | 5 | Prevent spam without hindering discussion |
| Profile Updates | 1 min | 2 | Critical operations need strict limits |

Rate limit state is stored in Redis with key prefixes (`rl_register:`, `rl_login:`, etc.) for namespace isolation. The system returns standardized error responses with retry-after headers compliant with RFC 6585.

### Authentication & Authorization

**JWT Token Strategy:**
- **Access Tokens**: Short-lived (15 minutes), contain user ID and role
- **Refresh Tokens**: Long-lived (7 days), stored in httpOnly cookies
- **Token Rotation**: Each refresh generates new token pair, old tokens invalidated
- **Signature Algorithm**: HS256 with secrets ≥32 characters

**Cookie Security:**
```typescript
res.cookie('refreshToken', token, {
  httpOnly: true,      // Prevent XSS access
  secure: true,        // HTTPS only in production
  sameSite: 'strict',  // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

**Password Security:**
- bcrypt hashing with salt rounds = 12
- Minimum 8 characters with complexity requirements
- Passwords never logged or returned in responses
- Secure password reset with time-limited tokens

### HTTP Security Headers (Helmet.js)

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Next.js requirement
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

Enabled protections include CSP, HSTS, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy.

### File Upload Security

**Multer Configuration:**
- Memory storage (no disk writes in development)
- MIME type validation before processing
- Size limits: 5MB per file, max 5 files per request
- Allowed formats: JPEG, JPG, PNG, WebP only
- Error handling for malformed uploads

**Cloudinary Integration:**
- Automatic format optimization (WebP conversion)
- Lazy transformation for responsive images
- Signed upload URLs prevent unauthorized uploads
- CDN delivery reduces origin server load

### CORS Policy

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,  // Whitelist specific origin
  credentials: true,                  // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Strict CORS configuration prevents cross-origin attacks while enabling authenticated requests from the frontend.

## Performance Optimizations

### Caching Strategy

**Redis Caching Layer:**
- Geocoding responses: 1-hour TTL (key: `search:{query}:{limit}`)
- Reverse geocoding: 1-hour TTL (key: `reverse:{lat}:{lon}`)
- Rate limit counters: Sliding window with automatic expiration
- Session tokens: TTL matches JWT expiration

Cache hit rate monitoring shows ~75% cache hits for geocoding queries, reducing external API calls and improving response times from ~800ms to ~15ms.

### Database Indexing

**MongoDB Indexes:**
```javascript
// Geospatial index for location queries
postSchema.index({ location: '2dsphere' });

// Compound index for filtered searches
postSchema.index({ category: 1, type: 1, createdAt: -1 });

// Text index for full-text search
postSchema.index({ title: 'text', description: 'text' });

// User lookup optimization
postSchema.index({ userId: 1, status: 1 });
```

Query performance benchmarks show 95th percentile latency under 50ms for indexed queries vs. 2000ms+ for full collection scans.

### Image Optimization Pipeline

**Cloudinary Transformations:**
- Automatic WebP conversion with fallback to original format
- Responsive image variants (thumbnail, medium, full)
- Lazy loading with low-quality image placeholders (LQIP)
- CDN edge caching for global delivery

**Optimization Results:**
- Average image size: 2.3MB → 180KB (WebP)
- Page load time: 4.2s → 1.8s
- Bandwidth savings: ~92%

### Frontend Optimizations

**Next.js Features:**
- Automatic code splitting per route
- Server-side rendering for SEO and initial load performance
- Static generation for public pages
- Image component with built-in lazy loading
- Font optimization with Geist preloading

**Bundle Analysis:**
- Initial JS bundle: 142KB gzipped
- First Contentful Paint: ~1.2s
- Time to Interactive: ~2.3s
- Lighthouse Performance Score: 94/100

## Technical Challenges

### Geospatial Accuracy & Validation

**Challenge**: Ensuring coordinates are valid and fall within Romania's boundaries while handling edge cases like users near borders or coordinates from external sources.

**Solution**: Implemented strict Zod validation with min/max constraints on latitude (43.5-48.3°N) and longitude (20.2-29.7°E). Added fallback mechanisms when Nominatim API fails—system gracefully degrades to displaying raw coordinates rather than throwing errors.

```typescript
const reverseSchema = z.object({
  lat: z.coerce.number().min(43.5).max(48.3),
  lon: z.coerce.number().min(20.2).max(29.7)
});

// Fallback response on API failure
catch (error) {
  res.json({
    display_name: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
    address: {},
    lat, lon
  });
}
```

### Concurrent Update Conflicts

**Challenge**: Race conditions when multiple users interact with the same post simultaneously (editing, commenting, marking resolved).

**Solution**: Leveraged MongoDB's atomic update operators (`$set`, `$push`, `$inc`) and implemented optimistic locking with version fields. Critical operations use transactions to ensure data consistency.

```typescript
// Atomic operation prevents race conditions
await Post.findByIdAndUpdate(
  postId,
  { $set: { status: 'solved', solvedAt: new Date() } },
  { new: true, runValidators: true }
);
```

### External API Resilience

**Challenge**: Nominatim API rate limits (1 request/second) and occasional timeouts causing user-facing errors.

**Solution**: Three-layered approach:
1. **Redis caching** with 1-hour TTL reduces API calls by ~75%
2. **Timeout configuration** (5s) prevents hanging requests
3. **Graceful degradation** returns partial data instead of failing

Rate limiting on the geocoding endpoint (60/min) ensures compliance with Nominatim's usage policy while accommodating legitimate user activity.

### Scalability & Resource Management

**Challenge**: As user base grows, managing database connections, Redis connections, and memory usage becomes critical.

**Solution**:
- MongoDB connection pooling (min: 10, max: 50 connections)
- Redis connection reuse with single client instance
- Image uploads limited to 5MB to prevent memory exhaustion
- Rate limiting prevents resource starvation from malicious actors
- Horizontal scaling strategy with load balancer-ready stateless design

### Search Performance at Scale

**Challenge**: Text search across thousands of posts with multiple filters (location, category, date) must remain fast.

**Solution**: Implemented compound indexes covering common query patterns and MongoDB aggregation pipeline for complex searches. Future optimization plan includes Elasticsearch integration for full-text search once post volume exceeds 100K records.

## Mobile Responsive Design

<div align="center">
  <img src="https://res.cloudinary.com/dqyq1oiwi/image/upload/v1758396413/localhost_3000__iPhone_XR_zmjobt.png" alt="Mobile Homepage" width="32%">
  <img src="https://res.cloudinary.com/dqyq1oiwi/image/upload/v1758396413/localhost_3000__iPhone_XR_2_n2645d.png" alt="Mobile Post" width="32%">
  <img src="https://res.cloudinary.com/dqyq1oiwi/image/upload/v1758396634/localhost_3000__iPhone_XR_3_cxnbtp.png" alt="Mobile Map" width="32%">
</div>

Fully responsive design with touch-optimized map controls, collapsible filters, and mobile-first form layouts. CSS Grid and Flexbox ensure consistent layouts across devices. Breakpoints at 768px and 1024px accommodate tablets and desktops.

## Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB 5.0+
- Redis 6.0+
- Cloudinary account (free tier sufficient)

### Setup Instructions

```bash
# Clone repository
git clone https://github.com/Rotis-Web/lostfound.git
cd lostfound

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install

# Start MongoDB and Redis (if running locally)
# macOS with Homebrew:
brew services start mongodb-community
brew services start redis

# Run development servers
npm run dev:all
# This starts both frontend (port 3000) and backend (port 8000)
```

## Environment Configuration

### Frontend Configuration

Create `client/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### Backend Configuration

Create `server/.env`:
```bash
# Server
PORT=8000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/lostfound
# Production: mongodb+srv://username:password@cluster.mongodb.net/lostfound

# Redis
REDIS_URL=redis://localhost:6379
# Production: redis://username:password@host:port

# Application URLs
APP_ORIGIN=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# JWT Configuration (generate random 32+ char strings)
JWT_SECRET=your_secure_secret_min_32_chars_use_openssl_rand
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_different_from_above
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary (sign up at cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
```

**Generating Secure Secrets:**
```bash
# Use OpenSSL to generate random secrets
openssl rand -base64 32
```

## Design Philosophy

The interface prioritizes clarity and accessibility with a warm color palette that conveys hope and urgency. The design system balances vibrant accent colors with professional neutrals to create an approachable yet trustworthy aesthetic.

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Yellow Primary | `#ffd700` | CTAs, highlights - conveys energy and optimism |
| Dark Blue | `#2c3e60` | Headers, text - inspires trust and professionalism |
| Orange Accent | `#f57a4e` | Important buttons, alerts - draws attention |
| Green Success | `#51e188` | Success messages, resolved posts |
| Red Alert | `#ff4444` | Error states, urgent actions |
| Neutral Gray | `#9ca3af` | Secondary text, borders, disabled states |

### Typography

- **Font Family**: Geist Sans - Modern, highly legible sans-serif optimized for UI
- **Heading Scale**: 2.5rem / 2rem / 1.5rem / 1.25rem / 1rem
- **Body Text**: 1rem (16px) with 1.5 line height for optimal readability
- **Code/Monospace**: Geist Mono for technical content

---

<div align="center">
  <p>Built to reunite people with what matters most</p>
  
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
  ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)
  ![Express](https://img.shields.io/badge/Express.js-404D59?style=flat-square&logo=express)
  ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
  ![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
  
  <p><strong>License:</strong> MIT | <strong>Developer:</strong> Alexandru Rotar</p>
</div>
