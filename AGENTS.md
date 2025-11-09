# Repository Guidelines

## Project Structure & Module Organization
The App Router lives under `app/` with role-specific segments such as `app/admin`, `app/employee`, and shared `layout.tsx`. UI primitives are grouped in `components/ui`, while feature widgets sit in `components/{admin,employee,common}`. Convex server logic (schema, queries, mutations, and seeds) is placed in `convex/`, with generated helpers under `convex/_generated`. Shared hooks go in `hooks/`, domain helpers and types in `lib/`, Tailwind layers in `styles/globals.css`, and static assets in `public/`. Use the `old/` folder for experiments you do not want shipped.

## Build, Test, and Development Commands
`pnpm dev` — starts the Next dev server on :3000.  
`pnpm build` — type-checks and emits `.next/`; run before every PR.  
`pnpm start` — serves the production build exactly as Vercel will.  
`pnpm lint` — runs ESLint with the Next + React presets; CI should block failures. (Only fall back to `npm run …` if pnpm is unavailable.)

## Coding Style & Naming Conventions
All code is TypeScript-first with two-space indentation, double quotes, and no trailing semicolons. Components/files use PascalCase, hooks use camelCase with a `use` prefix, and route folders remain lowercase-kebab. Favor Tailwind utilities plus the tokens defined in `styles/globals.css`; avoid ad-hoc inline styles. When working with Convex, import from `@/convex/_generated/api` and `@/convex/_generated/dataModel` for typed queries and IDs rather than re-declaring shapes. Run `pnpm lint --fix` before committing to normalize imports.

## Testing Guidelines
Automated tests are still manual. Prefer Jest + React Testing Library colocated in `__tests__` mirrors, or provide a QA checklist that covers admin and employee dashboards, Convex mutations (work logs, leave requests), responsive layouts, and login flows. Target ≥80% coverage for any new module once tests land. Document which Convex seeds or fixtures you use so other agents can reproduce the same real-time state.

## Commit & Pull Request Guidelines
Move away from single-word commits (`update`) toward `scope: imperative summary` (for example, `admin-leave: wire Convex data`). Each PR should include: a problem statement, a concise change log, evidence of `pnpm build` + `pnpm lint`, screenshots or console output for UI changes, and links to issues. Call out schema changes, new Convex functions, or env vars (`NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOYMENT`) so reviewers can pull the latest state.

## Security & Configuration Tips
Never commit `.env.local`. Set `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` locally before running `pnpm dev`, and rotate keys immediately if they leak. When adding dependencies (Convex helpers, auth libs, etc.), justify them in the PR and verify they tree-shake to keep bundle sizes in check. Sanitize demo accounts before recording GIFs, and prefer utilities in `lib/utils.ts` for consistent date/time handling across dashboards.
