# Repository Guidelines

## Project Structure & Module Organization
Employee Attendance System runs on the Next.js App Router. Place route handlers, server components, and server actions inside `app/`. Shared UI primitives belong in `components/`, while domain helpers, API clients, and utility types sit inside `lib/`. Real-time attendance logic and database mutations are authored under `convex/`. Custom React hooks live in `hooks/`; Tailwind tokens and globals sit in `styles/`. Static assets (logos, fonts, exports) go in `public/`. Prefer the `@/` path alias from `tsconfig.json` over long relative traversals.

## Build, Test, and Development Commands
- `pnpm install` - hydrate dependencies after cloning or updating lockfiles.
- `pnpm dev` - run the Next.js dev server with hot reload at `http://localhost:3000`.
- `pnpm build` - create an optimized production bundle and check type safety.
- `pnpm start` - serve the last production build.
- `pnpm lint` - run ESLint with the repository configuration; CI should treat warnings as failures.

## Coding Style & Naming Conventions
Use modern TypeScript (`strict` mode) and functional React components. Components, hooks, and contexts use PascalCase file names; helper modules stay camelCase. Keep JSX lean, extract logic into hooks, and keep Tailwind class lists alphabetized for readability. Rely on ESLint and the TypeScript compiler for formatting enforcement; run a formatter before committing if your editor supports it.

## Testing Guidelines
Automated tests are not yet wired, so begin by adding colocated `*.test.ts(x)` files or a `tests/` tree that mirrors `app/` and `lib/`. Favor React Testing Library for UI behavior and lightweight Convex function tests that exercise `zod` schema checks. Every feature PR should include at least one happy-path test plus edge-case coverage for date handling and timezone math.

## Commit & Pull Request Guidelines
Recent history is terse (e.g., `update`), but aim for imperative, scoped summaries (`feat: add shift calendar view`). Reference issue IDs when relevant and describe backend as well as UI impact in the body. PRs must explain motivation, list test evidence (`pnpm lint`, manual flows), and attach screenshots or recordings for UI changes. Request at least one review for schema or Convex updates.

## Security & Configuration Tips
Store runtime secrets only in `.env.local`; keep `.env.example` synchronized with new keys and sanitize sample values. Never commit real credentials or Convex deployment URLs. When working with Convex functions, validate every external payload with `zod` before mutating data, and prefer server actions over client-side secret usage.
