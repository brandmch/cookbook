# Local Development Setup

This guide gets you from zero to a running dev server on your local machine. No Neon account required.

## Prerequisites

- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin)

---

## 1. Clone and install dependencies

```bash
git clone <repo-url>
cd cookbook
npm install
```

---

## 2. Start the local database

A `docker-compose.yml` is included at the project root. Spin up a Postgres 16 container:

```bash
docker compose up -d
```

This starts a Postgres instance at `localhost:5432` with:

| Setting  | Value      |
|----------|------------|
| Host     | localhost  |
| Port     | 5432       |
| Database | cookbook   |
| User     | cookbook   |
| Password | cookbook   |

Data is persisted in a named Docker volume (`postgres_data`) so it survives container restarts. To stop the container without losing data:

```bash
docker compose stop
```

To stop **and wipe all data** (useful for a clean slate):

```bash
docker compose down -v
```

---

## 3. Configure environment variables

`.env.example` is a template committed to the repo — it documents every variable the app needs but contains no real secrets. You copy it to create your own local env file, which is gitignored and never committed.

```bash
cp .env.example .env.local
```

> **Why `.env.local` and not `.env`?** Next.js loads both, but `.env.local` is meant for per-machine overrides and is gitignored by default. Use `.env.local` for anything secret or environment-specific.

Open `.env.local` and replace the Neon connection strings with the local ones. For local Postgres, `DATABASE_URL` and `DIRECT_URL` point to the same instance — no PgBouncer pooling needed:

```env
# ── Database (local Docker) ───────────────────────────────────
DATABASE_URL="postgresql://cookbook:cookbook@localhost:5432/cookbook"
DIRECT_URL="postgresql://cookbook:cookbook@localhost:5432/cookbook"

# ── NextAuth ──────────────────────────────────────────────────
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="<your-generated-secret>"
NEXTAUTH_URL="http://localhost:3000"

# ── Resend (email) ────────────────────────────────────────────
# Leave these blank or use test values; invite emails will fail
# gracefully in local dev if the key is missing or invalid.
RESEND_API_KEY="re_xxxxxxxxxxxx"
RESEND_FROM="noreply@myfamilyrecipes.com"
```

Generate a `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

---

## 4. Run database migrations

Apply the Prisma schema to your local database:

```bash
npx prisma migrate dev
```

This creates all tables and generates the Prisma client. You only need to re-run this when the schema changes.

---

## 5. Seed test data (optional but recommended)

The seed script creates a ready-to-use cookbook with 10 recipes so you have something to look at immediately:

```bash
npm run db:seed
```

| Field | Value |
|-------|-------|
| Email | `test@test.com` |
| Password | `password` |
| Cookbook | The Test Kitchen → `/test-kitchen` |

The script is **idempotent** — safe to run multiple times. It skips anything that already exists.

---

## 6. Start the dev server

```bash
npm run dev
```

The app is now running at [http://localhost:3000](http://localhost:3000).

---

## Useful commands

| Command | What it does |
|---------|-------------|
| `docker compose up -d` | Start the local DB in the background |
| `docker compose stop` | Stop the DB (data preserved) |
| `docker compose down -v` | Stop the DB and delete all data |
| `npm run db:seed` | Seed 10 test recipes (test@test.com / password) |
| `npx prisma migrate dev --name <name>` | Create and apply a new migration |
| `npx prisma studio` | Browse and edit DB data in a browser UI |
| `npx prisma generate` | Regenerate the Prisma client after schema edits |
| `npm run lint` | Run ESLint |

---

## Switching between local and Neon

The only change needed is in `.env.local`. Swap `DATABASE_URL` and `DIRECT_URL` back to your Neon connection strings and restart the dev server. Everything else stays the same.
