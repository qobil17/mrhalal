# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Mr. Halal — backend for a halal grocery e-commerce store (Korea-based), built with NestJS + GraphQL (code-first, Apollo) + Prisma 7 + PostgreSQL. The frontend (Next.js Pages Router) lives in the sibling folder `Desktop/mrhalal-next`, not in this repo — it talks to this API over GraphQL.

- API app runs on **port 3000** (`PORT` env var), GraphQL endpoint at `/graphql`.
- Frontend dev server runs on **port 3002** — `CORS_ORIGIN` defaults to `http://localhost:3002`.
- This is an Nx-less **NestJS monorepo** (`nest-cli.json` `"monorepo": true`) with two apps and three shared libs (see Architecture).

## Commands

Package manager: **yarn** (yarn.lock is the lockfile — don't use npm, it'll regenerate a conflicting package-lock.json).

```bash
yarn start:dev        # nest start --watch (main app: mrhalal-api, per nest-cli.json sourceRoot)
yarn build             # nest build
yarn start:prod        # node dist/apps/mrhalal-api/apps/mrhalal-api/src/main (nest build's monorepo output nests root+sourceRoot)
yarn lint              # eslint --fix over apps/libs/test
yarn format            # prettier --write over apps/libs
```

To run the `mrhalal-batch` app specifically (currently unimplemented boilerplate — see Architecture), pass `--config` or the project name to `nest start`/`nest build`, e.g. `nest start mrhalal-batch`.

Tests (Jest is configured; there is close to no real test coverage — only the default NestJS boilerplate specs for `mrhalal-batch` and one boilerplate e2e spec for `mrhalal-api`):

```bash
yarn test                          # jest, all *.spec.ts under apps/ and libs/
yarn test path/to/file.spec.ts     # single file
yarn test:e2e                      # jest --config ./apps/mrhalal-api/test/jest-e2e.json
yarn test:cov
```

Prisma:

```bash
npx prisma migrate dev --name <name>   # create + apply a migration (uses prisma.config.ts / prisma/schema.prisma)
npx prisma generate                     # regenerate client into generated/prisma (do this after any schema.prisma change)
npx prisma studio
```

No seed script is configured in `package.json`. `prisma/*.ts` (`reset-admin.ts`, `delete-joseph-admin.ts`, `delete-non-admin-members.ts`, `hard-delete-customers.ts`) are one-off maintenance scripts, run manually with `ts-node`/`npx tsx`, not part of the normal dev loop.

## Architecture

**Monorepo layout** (`nest-cli.json`):
- `apps/mrhalal-api` — the actual GraphQL API (this is what `yarn start*` runs by default).
- `apps/mrhalal-batch` — a second Nest app scaffolded for background/cron jobs, still default `@nestjs/cli` boilerplate (`getHello()`), not wired to Prisma or the domain yet.
- `libs/prisma` (`@libs/prisma`) — `PrismaService` (extends generated `PrismaClient`, uses `@prisma/adapter-pg`) + `PrismaModule`.
- `libs/common` (`@libs/common`) — cross-cutting auth pieces: `JwtAuthGuard`, `RolesGuard`, `@Roles()`, `@CurrentUser()`.
- `libs/types` (`@libs/types`) — Prisma-adjacent enums re-exported for GraphQL (`MemberRole`, `Language`, `OrderStatus`, `PaymentMethod`, `Unit`, `ProductLabel`) plus the `Member` `@ObjectType`.
- Path aliases `@libs/prisma`, `@libs/common`, `@libs/types` are wired in root `tsconfig.json` and in `package.json`'s `jest.moduleNameMapper` — both need updating if a new lib is added.
- Prisma client is generated to `generated/prisma` (not `node_modules/.prisma`) — `libs/prisma/src/prisma.service.ts` imports it via a relative path (`../../../generated/prisma/client`), not `@prisma/client`.

**`apps/mrhalal-api/src` structure**:
- `app.module.ts` wires `ConfigModule` (global, `.env`), `GraphQLModule` (Apollo driver, `autoSchemaFile` → `apps/mrhalal-api/src/schema.gql`, `sortSchema: true`), `PrismaModule`, `CloudinaryModule`, `UploadModule`, `ComponentsModule`.
- `components/` — one folder per domain module (`auth`, `member`, `category`, `product`, `cart`, `address`, `order`, `review`, `wishlist`, `banner`), each with `*.module.ts` / `*.resolver.ts` / `*.service.ts` / `dto/*.input.ts` (input types) / `dto/*.type.ts` (object types). `components.module.ts` aggregates and re-exports all of them.
- `cloudinary/` — `CloudinaryService`, config pulled from `CLOUDINARY_*` env vars via `ConfigService.getOrThrow`.
- `upload/` — plain REST controller (`POST /upload/image`, not GraphQL) behind `AuthGuard('jwt')`, streams a multipart file straight to Cloudinary. JPEG/PNG/WebP only, 5 MB max.

**Prisma schema** (`prisma/schema.prisma`) — core models and relations:
- `Member` (customer or admin, via `role: MemberRole`) → `Address[]`, one `Cart?`, `Order[]`, `Review[]`, `Wishlist[]`.
- `Category` → `Product[]` (categories and products carry 4 parallel language fields: `nameUz/nameKo/nameAr/nameEn`, products also `descriptionUz/Ko/Ar/En`).
- `Product` → `ProductImage[]` (gallery), belongs to one `Category`, referenced by `CartItem`, `OrderItem`, `Review`, `Wishlist`. Has `label: ProductLabel?` (`RECOMMENDED`/`DISCOUNT`, used for featured/discount queries) and `expiryDate` (used by the admin "expiring products" query).
- `Cart` (one per `Member`, unique `memberId`) → `CartItem[]`.
- `Order` → `OrderItem[]`. Order stores a **snapshot** of the delivery address (`recipientName/phone/postalCode/city/addressLine1/addressLine2`) and of each item's `productName`/`price`/`subtotal` at order time, independent of the live `Address`/`Product` rows.
- `Review` — unique per `(memberId, productId)`, has `isApproved` moderation flag.
- `Banner` — standalone, no relations (homepage promo banners).
- `Wishlist` — unique per `(memberId, productId)`.
- Almost every model has soft-delete (`deletedAt DateTime?`) instead of hard delete — see conventions below.

## GraphQL API

Code-first: the schema is generated from `@ObjectType`/`@InputType`/`@Field` decorators into `apps/mrhalal-api/src/schema.gql` on boot (`autoSchemaFile` + `sortSchema: true`). **Never hand-edit `schema.gql`** — it's build output; change the decorated TS classes instead and let Nest regenerate it.

Per-module layout inside `components/<name>/dto/`:
- `*.input.ts` — `@InputType()` classes with `class-validator` decorators (`@IsString`, `@IsInt`, `@IsEnum`, `@ValidateNested({ each: true })` + `@Type()` from `class-transformer` for nested arrays, etc.).
- `*.type.ts` — `@ObjectType()` response classes, including paginated `*Response` types (`{ list, total, page, limit }`).

Validation: a global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` is set in `main.ts` — any input field not declared with `@Field`/class-validator decorators is stripped or rejected, so DTOs must declare every field the client can send.

Auth guards (JWT via Passport, `libs/common`):
- `JwtAuthGuard` (extends `AuthGuard('jwt')`, overrides `getRequest` to pull the request off `GqlExecutionContext` since this is GraphQL, not REST) — validates the bearer token and populates `req.user` with the DB member row (password stripped) via `JwtStrategy.validate`.
- `RolesGuard` reads `req.user.role` and compares against `@Roles(...)` metadata. **`RolesGuard` alone does nothing** — it depends on `req.user` already being set, so it must always be paired and ordered after `JwtAuthGuard`: `@UseGuards(JwtAuthGuard, RolesGuard)`.
- `@CurrentUser()` param decorator reads `req.user` — pull the member off this rather than re-querying by ID at the top of a resolver.
- Convention seen throughout resolvers: public queries first (no guard), then an `// ADMIN` section guarded with `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(MemberRole.ADMIN)`.

`AuthService` issues JWTs itself (`jwtService.sign({ sub, phone, role })`, `JWT_EXPIRES_IN` from env) on register/login; `bcrypt` (10 salt rounds) hashes passwords. Members are looked up by `phone` for login (not email — `email` is optional and nullable in the schema).

## Conventions and gotchas

- **Soft delete everywhere**: `deleteX` mutations set `deletedAt: new Date()` (and usually `isActive: false`), they don't `prisma.x.delete()`. Every read query in a service must filter `deletedAt: null` explicitly — Prisma does not do this automatically, and forgetting it will resurface "deleted" rows.
- **Slug archiving on delete**: `Product.slug`/`Category.slug` are unique, so soft-deleting a product renames its slug to `\`${slug}_deleted_${Date.now()}\`` first (see `ProductService.deleteProduct`) to free the original slug for reuse. Follow this pattern for any other slugged model.
- **Order/Cart items are price/name snapshots, not live joins** — `OrderItem.productName`/`price`/`subtotal` are copied at order-creation time and must never be recomputed from the current `Product` row later (prices/names can change after the order ships).
- **4-language fields are parallel, not relational** — `nameUz/nameKo/nameAr/nameEn` (and `descriptionUz/Ko/Ar/En` on `Product`) are plain columns on the same row, not a separate translations table. Any create/update DTO touching `Category`/`Product` must carry all four language variants of a field together.
- Decimal money fields (`price`, `comparePrice`, `subtotal`, `total`, etc.) come back from Prisma as `Decimal` objects — services convert them with `Number(...)` before returning (see `ProductService.transformProduct`); GraphQL `Float` fields expect a plain JS number, not a `Decimal`.
- `RolesGuard` requires `JwtAuthGuard` to run first in the same `@UseGuards(...)` call — using it alone silently allows everyone through (`requiredRoles.some(...)` on an `undefined` user just returns `false`, but there's no 401either — the guard order is what actually protects the field).
- ESLint has `@typescript-eslint/no-explicit-any` turned off — `any` shows up a lot in service return types (e.g. `as any` casts around Prisma's generated types vs. GraphQL `@ObjectType`s); this is accepted style here, not a lint gap to "fix" opportunistically.
- Prisma client generator output is `generated/prisma`, not the default `node_modules/@prisma/client` — after editing `schema.prisma`, run `npx prisma generate`, and import the client via `@libs/prisma` (the `PrismaService`), not a direct `@prisma/client` import.

## Env variables

From `.env.example` (values are placeholders — real `.env` is git-ignored):

- `DATABASE_URL` — Postgres connection string used by Prisma (`prisma.config.ts` and `PrismaService`).
- `JWT_SECRET` — signing secret for access tokens (`AuthService`, `JwtStrategy`).
- `JWT_EXPIRES_IN` — access token lifetime (e.g. `7d`).
- `PORT` — HTTP port the Nest app listens on.
- `NODE_ENV` — gates GraphQL Playground/introspection (disabled when `production`) and Prisma query logging verbosity.
- `CORS_ORIGIN` — comma-separated list of allowed frontend origins.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — used by `CloudinaryService` via `ConfigService.getOrThrow`; the app throws on boot without them.
