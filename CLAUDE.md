# Fam Cookbook — famcookbook.com

A multi-tenant family cookbook web app. Warm, nostalgic, cozy — like a handwritten recipe book.

## Tech stack

- **Next.js 14** — App Router, React Server Components
- **TypeScript** — strict mode
- **Tailwind CSS** — custom design tokens (see `tailwind.config.ts`)
- **shadcn/ui** — Radix UI primitives, manually scaffolded in `src/components/ui/`
- **Prisma** — ORM, schema in `prisma/schema.prisma`
- **Neon** — PostgreSQL (pooled via PgBouncer)
- **NextAuth v4** — JWT sessions, CredentialsProvider (email/password)
- **Resend** — transactional email (invites)

## Commands

```bash
npm run dev          # start dev server on :3000
npm run build        # production build
npm run lint         # ESLint
npx prisma generate  # regenerate Prisma client after schema changes
npx prisma migrate dev --name <name>  # create and apply a migration
npx prisma studio    # browse database in browser
```

## Environment variables

Copy `.env.example` → `.env.local` and fill in all values before running.
- `DATABASE_URL` — Neon pooled connection string (use for runtime queries)
- `DIRECT_URL` — Neon direct connection string (use for migrations only)
- `NEXTAUTH_SECRET` — random 32-byte base64 string
- `NEXTAUTH_URL` — full URL of the app (http://localhost:3000 for dev)
- `RESEND_API_KEY` — from resend.com dashboard
- `RESEND_FROM` — verified sender address

## Project structure

```
src/
  app/
    (auth)/login/         # Login page (Phase 2)
    (auth)/signup/        # Signup page (Phase 2)
    onboarding/           # 3-step onboarding (Phase 3)
    [slug]/               # Cookbook wall (Phase 4)
    [slug]/[recipeId]/    # Recipe detail (Phase 5)
    [slug]/new/           # Add recipe form (Phase 5)
    api/auth/[...nextauth]/  # NextAuth handler
    api/cookbooks/        # CRUD for cookbooks
    api/recipes/          # CRUD for recipes
    api/invites/          # Invite email flow (Phase 6)
  components/
    ui/                   # shadcn/ui primitives (Button, Input, Dialog, etc.)
    cookbook/             # domain-specific components (RecipeCard, TopBar, etc.)
  lib/
    auth.ts               # NextAuthOptions
    db.ts                 # Prisma client singleton
    utils.ts              # cn() helper
  types/
    next-auth.d.ts        # Session type extension (adds user.id)
prisma/
  schema.prisma           # Full data model
```

## Design system

All design tokens live in `tailwind.config.ts`. Key conventions:

| Token | Value | Use |
|-------|-------|-----|
| `cream-0` | `#faf4e6` | Card surfaces |
| `cream-1` | `#f3ead6` | Page background |
| `ink` | `#3a2c20` | Primary text |
| `accent` | `#bf6243` | CTAs, active states |
| `secondary` | `#7c8a5b` | Secondary actions |
| `font-slab` | Zilla Slab | Headings, buttons, labels |
| `font-hand` | Caveat | Display titles, recipe names |
| `font-sans` | Nunito Sans | Body text |
| `font-mono` | ui-monospace | Tags, stamps, captions |

Box shadows: `shadow-card`, `shadow-card-hover`, `shadow-btn-primary`, `shadow-modal`

Custom classes: `.paper` (texture overlay), `.ruled` (index card lines), `.photo-slot` (image placeholder), `.cat-stamp` (category badge), `.eyebrow` (small caps label), `.tape` (decorative strip)

Category stamp colors via: `.stamp-mains`, `.stamp-sides`, `.stamp-desserts`, `.stamp-breakfast`, `.stamp-holiday`, `.stamp-drinks`, `.stamp-baking`

## Data model overview

- **User** — auth identity + profile
- **Cookbook** — named collection with slug, palette, and owner
- **CookbookMember** — join table (role: OWNER | MEMBER)
- **Recipe** — belongs to a cookbook and a contributor
- **Ingredient** — ordered list on a recipe
- **Step** — ordered steps on a recipe
- **Invite** — pending email invitations (token-based, expires 7 days)

## Phase plan

| Phase | Scope |
|-------|-------|
| 1 ✅ | Scaffold — Next.js, Tailwind, shadcn, Prisma, Neon |
| 2 | Auth — NextAuth, sign up, log in, sessions |
| 3 | Onboarding — create cookbook, generate slug |
| 4 | Cookbook wall — recipe grid, search, filters |
| 5 | Add + view recipe — form and detail page |
| 6 | Invites — email flow via Resend |
| 7 | Settings — members, cookbook details |

## Conventions

- Server Components by default; add `"use client"` only when needed (event handlers, hooks, browser APIs)
- All DB queries go through `src/lib/db.ts` (Prisma singleton)
- Route handlers in `src/app/api/` validate session with `getServerSession(authOptions)` before any mutation
- Slug generation: lowercase, hyphens only, max 50 chars, unique check against DB
- No `console.log` in production paths — use `console.error` for caught errors only
