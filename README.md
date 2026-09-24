# Sociopedia

A small MERN social network: profiles, a feed, photo posts, likes, comments, friends and user search.

## Run locally

Requires Node 18+ and MongoDB.

```bash
# API
cd server
cp .env.example .env        # set MONGO_URL and JWT_SECRET
npm install
npm run seed                # optional: demo users (password: password123)
npm run dev                 # http://localhost:3001

# Web
cd client
cp .env.example .env        # REACT_APP_API_URL=http://localhost:3001
npm install
npm start                   # http://localhost:3000
```

## Tests

With the API running:

```bash
cd server && npm test       # end-to-end tests for every endpoint
```

## API

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/health` | – | Liveness + DB status |
| POST | `/auth/register` | – | multipart; optional `picture` (JPG/PNG/WEBP/GIF, ≤5MB) |
| POST | `/auth/login` | – | `{ email, password }` → `{ token, user }` |
| GET | `/users/search?q=` | ✓ | Up to 8 matches by name, occupation or location |
| GET | `/users/:id` | ✓ | |
| GET | `/users/:id/friends` | ✓ | |
| PATCH | `/users/:id/:friendId` | ✓ | Toggle friendship; `:id` must be you |
| GET | `/posts` | ✓ | Feed, newest first |
| POST | `/posts` | ✓ | multipart `description` and/or `picture` |
| GET | `/posts/:userId/posts` | ✓ | |
| PATCH | `/posts/:id/like` | ✓ | Toggle your like |
| POST | `/posts/:id/comments` | ✓ | `{ text }` (≤500 chars) |
| DELETE | `/posts/:id` | ✓ | Owner only |

Auth is a `Bearer` JWT (7-day expiry). User identity always comes from the token, never the request body.

> Uploaded images are stored on local disk in `server/public/assets`. On hosts with ephemeral disks (e.g. Render) they are lost on every redeploy — move uploads to object storage (S3, Cloudinary) before relying on them in production.
