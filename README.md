# Senja Proof of Work - Testimonial Intake

A tiny fullstack project that mirrors Senja's core loop: collect testimonials, review them, and publish a public wall.

## Stack

- Svelte + TypeScript (frontend)
- Hono + TypeScript (backend)
- Drizzle ORM + Postgres (Neon)

## Features

- Public form to submit testimonials
- Admin dashboard to review and approve
- Public wall to display approved testimonials

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Backend env

Copy the example file and set values.

```bash
cp apps/api/.env.example apps/api/.env
```

3. Frontend env

```bash
cp apps/web/.env.example apps/web/.env
```

4. Run dev servers

```bash
npm run dev
```

5. Apply database schema (once)

```bash
npm --workspace apps/api run db:push
```

6. Seed demo data

```bash
npm --workspace apps/api run db:seed
```

Backend runs on `http://localhost:8787` and frontend on `http://localhost:5173`.

## Docker Quick Start

1. Start services

```bash
docker compose up --build
```

2. Apply schema + seed (run once)

```bash
docker compose run --rm api npm --workspace apps/api run db:push
docker compose run --rm api npm --workspace apps/api run db:seed
```

Frontend is available on `http://localhost:5173`.

## API Overview

- `POST /forms` (admin) create a form
- `GET /forms/:slug` get form details
- `POST /forms/:slug/submissions` create a testimonial
- `GET /admin/submissions?slug=...` (admin) list submissions
- `POST /admin/submissions/:id/approve` (admin) approve submission
- `GET /wall/:slug` list approved testimonials

Admin requests require header `x-admin-token`.

## Demo Flow

1. Create a form

```bash
curl -X POST http://localhost:8787/forms \
  -H "content-type: application/json" \
  -H "x-admin-token: dev-admin-token" \
  -d '{"creatorName":"Ava","title":"Ava's Creator Studio","slug":"ava"}'
```

2. Submit a testimonial

```bash
curl -X POST http://localhost:8787/forms/ava/submissions \
  -H "content-type: application/json" \
  -d '{"name":"Taylor","role":"Founder","company":"Acme","quote":"Senja helped us convert more leads."}'
```

3. Approve it

```bash
curl -X POST http://localhost:8787/admin/submissions/1/approve \
  -H "x-admin-token: dev-admin-token"
```

4. Open the wall

Visit `http://localhost:5173/#/wall/ava`.

## Notes

