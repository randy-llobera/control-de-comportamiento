# Control de Comportamiento

A Spanish-language school incident tracking app. Teachers record student incidents, coordinators manage groups and categories, and admins also manage student records and user roles. See the [product overview](context/project-overview.md) for workflows and the permission matrix.

Built with Next.js App Router, React, strict TypeScript, Supabase Postgres/Auth, Tailwind CSS v4, shadcn/ui, and Zod. [Coding standards](context/coding-standards.md) define application boundaries. [Development workflow](context/ai-interaction.md) explains how to contribute and which documents to update.

## Local setup

Use Node 24.x and npm 12.0.0, with Docker running for local Supabase. Run commands from the repository root. `npm ci` installs the lockfile-resolved toolchain, including the Supabase CLI.

```bash
npm ci
cp .env.example .env
npm run db:start:local
npm run db:reset:local
npm exec -- supabase status
```

The reset destroys local database data, applies committed migrations without optional seeds, and regenerates database types. Use disposable local data only. Fill `.env` from the local stack's output:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Local Supabase API endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Local public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Local admin bootstrap and integration fixtures |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Initial local admin credentials |
| `ADMIN_DISPLAY_NAME`, `ADMIN_SCHOOL_ROLE` | Initial local admin profile |

Keep values untracked. Never expose service-role keys or admin credentials through `NEXT_PUBLIC_*`. Ensure shell exports and other environment files do not override the intended local settings.

```bash
ENV_FILE=.env npm run db:bootstrap-admin
npm run dev
```

Bootstrap creates the configured Auth account if absent and assigns its profile the admin role. It does not reset existing passwords or repair missing profiles. Shell exports override `ENV_FILE`, which defaults to `.env`. Optionally run `npm run db:seed:local` after bootstrap to add disposable fixtures. Open [the local app](http://localhost:3000).

## Commands

[package.json](package.json) owns exact command definitions; the lockfile owns resolved dependency versions.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm run start` | Build / serve the built app |
| `npm test` / `npm run test:watch` | Unit tests / watch mode |
| `npm run test:integration` | Local Supabase permission and constraint tests |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript checks |
| `npm run format` | Format files; writes changes |
| `npm run db:start:local` | Start local Supabase |
| `npm run db:reset:local` | Reset local database and regenerate types |
| `npm run types:local` | Regenerate `src/types/supabase.ts` |
| `npm run db:bootstrap-admin` | Bootstrap the admin in the selected environment |
| `npm run db:seed:local` | Add optional local fixtures |
| `npm run db:migrate:production` | Apply pending migrations to the linked project; exceptional operator use |

## Checks

```bash
npm run lint
npm run typecheck
npm run build
git diff --check
```

Success means exit code 0, no lint/type errors, a completed build, and no whitespace errors. Run `npm test` for affected unit behavior and follow the [testing contract](context/coding-standards.md#testing) for integration and browser checks.

For local integration tests, configure `.env` with the local API URL, anon key, and service-role key:

```bash
npm run db:start:local
npm run db:reset:local
npm run test:integration
```

[Integration configuration](vitest.integration.config.ts) loads test-mode environment files, with shell variables taking precedence. It requires both keys and refuses any URL whose hostname is not `localhost` or `127.0.0.1` before fixtures run. Never bypass the guard by forwarding a hosted database through a local endpoint.

[The suite](supabase/rls.integration.test.ts) creates/cleans isolated fixtures with a service-role client and checks permissions through signed-in teacher-owner, other-teacher, coordinator, and admin clients. It covers student permissions, incident ownership and cross-role/profile reads, group/category/role management, and foreign-key deletion constraints. Optional seeds and a preexisting admin are not required.

## Database development

Create a migration with `npm exec -- supabase migration new change_name`, edit its SQL, then reset and test locally using the commands above. Commit migrations and generated types together. Do not rewrite applied migrations or author untracked hosted schema changes.

[Migrations](supabase/migrations/) own schema, grants, RLS, reference roles, and the signup profile trigger. They do not create an admin Auth account. In a clean verification checkout, regenerate types and run `git diff --exit-code -- src/types/supabase.ts`; success is exit code 0. Review and commit intentional generated changes alongside their migration first.

Hosted migrations normally run through the release pipeline. `db:migrate:production` executes `supabase migration up --linked`; the script name does not select production. Use it only as an exceptional operator action after verifying the linked target. Hosted bootstrap also requires deliberately selected environment values and authorization.

## Releases

The [developer workflow](context/ai-interaction.md#change-lifecycle) keeps feature/fix branches local and merges completed work into `working` before one push. Release behavior is defined by [CI](.github/workflows/db-ci.yml) and [Vercel configuration](vercel.json):

| Trigger | Checks | Hosted result after checks pass |
| --- | --- | --- |
| Push `working` | Application and local database | Pending staging migrations, then Vercel Preview |
| PR from `working` to `main` | Application and local database | No hosted migration or deployment |
| Push `main` after PR merge | Application and local database | Pending production migrations, then Vercel Production |
| Manual CI dispatch | Application and local database | Checks only |

Application checks run unit tests, typecheck, lint, and build. Database checks start ephemeral local Supabase, reset migrations, compare generated types, and run integration tests. Both jobs must pass before hosted migrations, which must succeed before deployment. With no pending migrations, that step is a no-op.

Validate Preview behavior before opening the production PR. Protected `main` requires a PR, resolved review threads, linear history, and up-to-date `Application checks` and `Local database checks`. Use an approved squash or rebase merge, never a direct push; the merge emits the production push event.

Vercel Git deployments are disabled for both release branches. GitHub Actions owns deployment ordering; Vercel does not apply Supabase migrations. Failed checks/migrations stop deployment. Migrations have no automatic rollback, even if a later deployment fails: keep them compatible with the running app and use a forward-fix migration when reversal is needed.

## Environment configuration

| App environment | Database |
| --- | --- |
| Local development | Local Supabase |
| `working` / Vercel Preview | Staging Supabase |
| `main` / Vercel Production | Production Supabase |

GitHub release secrets are `STAGING_DB_URL` and `PROD_DB_URL` (PostgreSQL connection strings), plus `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` for deployment. Backup-specific configuration belongs in the [recovery guide](supabase/README.md#configuration).

Configure the unsuffixed `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` separately in Vercel Preview and Production. These are the application's HTTPS API endpoint/public key, not GitHub's database connection strings. Rebuild through the push-triggered release when public build-time values change.

## Backups

Production backups run independently of releases. Consult [Database backups and recovery](supabase/README.md) for schedule, retention, configuration, download, decryption, restore preparation, and validation. Preserve the encryption passphrase separately from GitHub and perform recovery rehearsals only on a disposable target.

## Repository guide

Application source is under `src/`; its folder responsibilities are defined in [coding standards](context/coding-standards.md#application-boundaries). Database migrations, fixtures, and recovery instructions live under `supabase/`; admin bootstrap lives in `scripts/bootstrap-admin.mjs`; automation lives in `.github/workflows/`.

Use the [documentation map](context/ai-interaction.md#document-ownership) to find product, engineering, workflow, and internal feature records.
