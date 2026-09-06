# Database backups and recovery

## Scope and current status

This runbook describes [Backup Prod DB](../.github/workflows/backup-prod.yml), not Supabase's managed backup service. Backup creation succeeded from `main` on September 5, 2026. A complete decrypt-and-restore rehearsal has **not** been completed. A successful workflow proves that dump generation and upload finished, not that a new Supabase project is ready to use after restoration.

Production: `rhphepyuvixuqnpryrlv`. Staging: `bzsgcngezrhzbljhccnc`. Recovery rehearsals must target a separate disposable project, not either of these projects.

## What runs automatically

- Monthly on day 1 at 03:00 UTC, from the default branch. GitHub scheduling can be delayed.
- Also available manually through `workflow_dispatch`. Backups do not run on every deployment.
- Uses PostgreSQL `pg_dump` from `postgres:17.6-alpine` with `--no-owner --no-privileges`.
- Creates `prod_schema_<UTC timestamp>.sql.gz`: schema only, compressed but **not encrypted**.
- Creates `prod_full_<UTC timestamp>.sql.gz.enc`: schema and table data, gzip compressed and encrypted with AES-256-CBC, PBKDF2, and 600000 iterations.
- Uploads both files as the `prod-db-backup` GitHub Actions artifact, retained for 90 days. It does not commit them or store them in Vercel or Supabase Storage.

The full dump is a logical SQL backup, not a physical snapshot or a clone of all Supabase project settings. Each dump uses its own database snapshot; the schema and full files are not a single shared snapshot. Restore the full file on its own, not the schema file followed by the full file.

Monthly backups can lose approximately a month's changes. Take an additional backup before risky work. Once real school data is in use, review whether that loss window is acceptable.

## Secrets and prerequisites

GitHub repository secrets:

| Secret | Purpose |
| --- | --- |
| `PROD_DB_URL` | Production PostgreSQL connection string, not the Supabase HTTPS API URL |
| `BACKUP_ENCRYPTION_PASSPHRASE` | At least 20 characters; encrypts the full dump |

Use the session pooler on port 5432 when direct IPv6 connectivity is unavailable. Its username includes the project reference: `postgres.<project-ref>`. Percent-encode special password characters and include `?sslmode=require`. Do not add shell escape backslashes inside a saved URL. For certificate/hostname verification, configure the Supabase CA and `sslmode=verify-full`; `require` alone is not hostname verification.

Keep the passphrase separately in a password manager. GitHub cannot reveal a saved secret. Retain old passphrases for old backups if you rotate it. Never commit credentials, decrypted SQL, or downloaded artifacts. Full dumps can contain student information and Auth password hashes/tokens. Even schema-only files can disclose application details.

Local tools: authenticated GitHub CLI (`gh`), OpenSSL with PBKDF2 support, gzip, and a compatible PostgreSQL `psql` client. Use a client at least as new as the dump tool. The workflow currently uses PostgreSQL 17; revisit compatibility when the server upgrades. Docker is only needed to reproduce the dump container locally or use CLI features that require it.

## Create, find, and download a backup

Browser: [Backup Prod DB workflow](https://github.com/randy-llobera/control-de-comportamiento/actions/workflows/backup-prod.yml) -> Run workflow -> select `main`. Open the successful run and download `prod-db-backup` under Artifacts.

CLI alternative, from the repository directory:

```bash
gh workflow run backup-prod.yml --ref main
gh run list --workflow backup-prod.yml --branch main --limit 10
```

Select the run you just started, not an unrelated earlier run. In the following commands replace `RUN_ID` with its numeric ID:

```bash
gh run watch RUN_ID --exit-status
gh run view RUN_ID
```

Success means both dump creation and artifact upload passed. A manual run from another branch still uses `PROD_DB_URL`; it is not a staging backup.

For a repository-wide inventory without opening each run:

```bash
gh api --paginate repos/randy-llobera/control-de-comportamiento/actions/artifacts \
  --jq '.artifacts[] | select(.name == "prod-db-backup") | {id, created_at, expires_at, expired, run_id: .workflow_run.id}'
```

Download outside the checkout in a private working directory:

```bash
umask 077
RECOVERY_DIR="$(mktemp -d "${TMPDIR:-/tmp}/cdc-recovery.XXXXXX")"
gh run download RUN_ID --name prod-db-backup --dir "$RECOVERY_DIR"
ls -lh "$RECOVERY_DIR"
```

`gh run download` extracts the artifact. Browser downloads must be unzipped first. Temporary directories are not permanent backup storage: copy the encrypted artifact to an access-controlled backup location before its GitHub expiration. Deleting the workflow run also removes its artifacts.

## Decrypt and verify

Replace the example timestamp with the exact downloaded filename. Use the passphrase from that backup's creation date; OpenSSL prompts for it, so it need not appear in shell history.

```bash
openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 \
  -in "$RECOVERY_DIR/prod_full_YYYYMMDD_HHMMSS.sql.gz.enc" \
  -out "$RECOVERY_DIR/full.sql.gz"
gzip -t "$RECOVERY_DIR/full.sql.gz"
gunzip -c "$RECOVERY_DIR/full.sql.gz" > "$RECOVERY_DIR/full.sql"
```

Stop if any command fails. Successful gzip verification is silent. Inspect the SQL locally without publishing its data. AES-CBC is not authenticated encryption; decryption/gzip checks do not prove the file has not been maliciously modified. Only restore artifacts from a trusted run. Keep decrypted files private and remove the exact temporary files after recovery under your data-retention policy.

## Restore an existing artifact: mandatory review before execution

**Do not import the current raw full dump directly into live production.** Even a newly created Supabase project already has managed Auth/Storage schemas and roles. The dump may attempt to recreate those objects, encounter ownership restrictions, or import incompatible managed-schema versions. It also omits grants and ownership. Do not work around failures by dropping managed schemas or ignoring SQL errors.

1. Choose a backup and the matching application/migration version. Record its run ID, timestamp, and commit. Older backups can have older migration histories.
2. Create a disposable Supabase recovery project with a compatible PostgreSQL version. Record its reference independently of its connection string. Configure required extensions before import. Do not point Vercel at it yet.
3. Review `full.sql` against the target. Prepare a separate `restore-reviewed.sql` with target-compatible application schema/data, needed Auth records and identities, and migration history. Reconcile managed objects individually. Preserve UUID relationships between `auth.users`, `public.users`, and application records. This is a manual recovery step, not a supplied conversion script.
4. Ensure Auth imports do not fire `on_auth_user_created` while importing backed-up profiles, or duplicate profiles can result. A reviewed restore should create this custom trigger after data loading, or use an explicitly reviewed trigger-disabling sequence. Do not disable all triggers casually: foreign-key checks can also be bypassed.
5. Include the application's explicit grants from the matching migrations in the reviewed SQL. Target default privileges are not a safe substitute. Include functions, RLS policies, and the custom trigger on `auth.users`; public-schema-only exports can omit that trigger.
6. Reconcile migration history with the schema actually restored. Never mark a migration applied solely to silence a CLI error. Do not run the baseline on top of restored tables.

The exact SQL adjustment depends on the selected dump and target. **There is no verified universal conversion or one-command restore for the current artifact.** Stop for review if these preparation steps are not complete.

### Execute the reviewed restore on the disposable target

The following commands use Bash. Set connection fields to the new recovery project's session pooler details, not production. `psql -W` prompts for the database password. No password is placed in a command or saved URL.

```bash
export PGHOST='REPLACE_WITH_RECOVERY_POOLER_HOST'
export PGPORT='5432'
export PGUSER='postgres.REPLACE_WITH_RECOVERY_PROJECT_REF'
export PGDATABASE='postgres'
export PGSSLMODE='require'
unset PGPASSWORD PGSERVICE

# Inspect the target connection before any import.
psql -X -W -v ON_ERROR_STOP=1 \
  -c 'SELECT current_database(), current_user, version();'

# WRITES to the target. Run only after verifying the host/project above.
psql -X -W --single-transaction --set ON_ERROR_STOP=1 \
  --file "$RECOVERY_DIR/restore-reviewed.sql"
```

The prepared SQL must not contain its own transaction-control statements or operations incompatible with a transaction. The command should exit 0 with no SQL errors. On failure, stop and review; do not retry without `ON_ERROR_STOP` or switch the target to production.

### Validate before cutover

Use `psql -X -W -v ON_ERROR_STOP=1` with this read-only SQL:

```sql
BEGIN READ ONLY;
SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version;
SELECT 'users' AS table_name, count(*) FROM public.users
UNION ALL SELECT 'roles', count(*) FROM public.roles
UNION ALL SELECT 'groups', count(*) FROM public.groups
UNION ALL SELECT 'categories', count(*) FROM public.categories
UNION ALL SELECT 'students', count(*) FROM public.students
UNION ALL SELECT 'incidents', count(*) FROM public.incidents;
SELECT count(*) AS profiles_without_auth_accounts
FROM public.users u LEFT JOIN auth.users a ON a.id = u.id WHERE a.id IS NULL;
SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public';
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated', 'service_role');
ROLLBACK;
```

Compare counts with the backup, not today's source database. The orphan count must be zero. Check table definitions, constraints, indexes, RLS, function definitions, grants, and trigger behavior against the matching migrations. Verify admin, coordinator, and teacher permissions using an isolated app pointed to recovery. Test login and disposable CRUD records; an admin-only read test is insufficient.

If restored Auth accounts and profiles are present, do not bootstrap replacements. Creating new UUIDs does not restore links to backed-up data. For an intentionally empty installation only, configure its environment file and run:

```bash
ENV_FILE=.env.recovery npm run db:bootstrap-admin
```

That script needs the target HTTPS URL, service-role key, and all `ADMIN_*` values; it does not repair existing Auth accounts with missing profiles or reset existing passwords. Shell exports override dotenv file values.

For a new project, manually restore Auth URLs/providers/SMTP settings, relevant secrets, extensions, webhooks, Realtime publications, and deployed Edge Functions if used. Restore actual Storage files separately if used. Vault/column-encrypted values require the relevant key-migration procedure; the dump alone is not sufficient.

Only after a successful rehearsal and explicit approval: pause application writes/releases, take a fresh backup, repeat the reviewed recovery, and switch environment-specific GitHub DB URLs and Vercel Supabase API URL/key to the recovered project. Update local operational credentials too. Rebuild through GitHub so `NEXT_PUBLIC_*` values change in the deployed bundle. Verify production login and permissions before reopening writes. Keep the original project available until recovery is accepted; rollback after new writes requires data reconciliation.

## Improvements worth prioritizing

1. **Restore-friendly database exports and a rehearsal:** highest priority. Consider Supabase CLI's separate roles/schema/data export workflow, preserve migration history and custom Auth-schema changes, and encrypt the complete bundle. This requires a workflow change and target restore test; it is not implemented here. See the [official backup/restore procedure](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore).
2. **Explicit privilege recovery:** retain the application's versioned grants and validate them after restore. Avoid copying Supabase-managed ownership blindly. SQL role definitions are different from records in `public.roles`.
3. **An independent encrypted copy:** a manually maintained restricted backup folder is sufficient initially. Automating a private external bucket can wait until that manual step becomes unreliable. Avoid making the backup's only copy dependent on the project it protects.
4. **Storage files:** back them up before relying on uploads. If no uploaded files are used, document that fact during the rehearsal and defer object-copy automation. SQL backups contain metadata, not file bytes.
5. **Project configuration:** maintain a short manual recovery checklist and store secret values in a password manager. A database backup cannot make a new project's URL, keys, integrations, and Vercel configuration identical automatically.

Do not build a generalized project-cloning system for this feature. A tested database restore, explicit permissions, preserved accounts/history, and a small manual configuration checklist offer more value for the time available.

## References

- [GitHub artifact downloads](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts)
- [Repository artifact inventory API](https://docs.github.com/en/rest/actions/artifacts)
- [Supabase backup and restore](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
- [Supabase database backup scope](https://supabase.com/docs/guides/platform/backups)
