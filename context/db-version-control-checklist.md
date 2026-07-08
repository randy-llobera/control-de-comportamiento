1.  Project wiring
    • Add standard layout:

        supabase/
        migrations/
        seed/
        config.toml

    • Commit a baseline migration that reflects current prod schema (so “schema is code”).

2.  Local dev DB (safe sandbox)
    • Start local stack: supabase start.
    • Prove migrations: supabase db reset (rebuild from zero).
    • Add idempotent seed file(s) and run: supabase db seed --file supabase/seed/seed.sql.

3.  Migrations workflow (forward-only)
    • For each change, create a new timestamped migration SQL file.
    • Prefer multiple small migrations over 1 big one.
    • For risky changes, split into: add column → backfill → add constraints.

4.  Constraints that make seeds safe
    • Add/verify uniques used by upserts:
    • groups(name) unique
    • categories(name) unique
    • students(name, group_id) unique
    • Keep seeds separate from migrations; seeds are re-runnable.

5.  CI gate (free)
    • Add a GitHub Actions job that runs on PRs:
    • supabase db reset
    • supabase db seed --file supabase/seed/seed.sql
    • (Optional) run quick app DB smoke tests.
    • Block merges if migrations/seed fail.

6.  Staging (optional but nice, still free)
    • Create a second free Supabase project as staging.
    • supabase link to staging; push migrations & seed; smoke test app.

7.  Backup before prod
    • Take a manual pg_dump right before prod deploy (schema-only or full).
    • Store backups privately with date stamps.

8.  Prod deploy (manual, deliberate)
    • supabase link to prod; supabase db push.
    • Run seeds (service role / SQL editor) if needed.
    • Verify critical queries, RLS policies, and app endpoints.

9.  Rollback & recovery
    • Prefer roll-forward fixes via new migrations.
    • Keep optional paired \_down.sql for reversible ops.
    • As last resort, restore from last pg_dump.

10. Guardrails & hygiene (always)
    • Never edit old migrations; always add new ones.
    • Wrap data migrations in transactions; validate locally first.
    • Avoid immediate drops; deprecate via views, then remove later.
    • Use service role for seeds (bypass RLS safely), never anon.
