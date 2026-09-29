# Database Backups and Recovery

This runbook owns the production backup and recovery procedure. [The backup workflow](../.github/workflows/backup-prod.yml) defines execution; [the root README](../README.md) covers normal development and releases.

## Backup scope

Backups run manually or monthly on day 1 at 03:00 UTC, independently of releases. Scheduled runs use the default branch and may be delayed. The `prod-db-backup` artifact contains:

| File | Contents |
| --- | --- |
| `prod_schema_<timestamp>.sql.gz` | Schema only, compressed and unencrypted |
| `prod_full_<timestamp>.sql.gz.enc` | Schema and data, compressed and encrypted |

The workflow uses PostgreSQL 17.6 `pg_dump` with `--no-owner --no-privileges`. Full dumps use AES-256-CBC, PBKDF2, and 600000 iterations. GitHub retains artifacts for 90 days; deleting a workflow run also deletes its artifacts. Preserve required recovery points in separate restricted storage before expiration. Monthly scheduling permits approximately a month's changes to be lost between backups.

A dump is logical SQL, not a full project clone. Ownership/grants, uploaded Storage file bytes, and external project configuration require separate recovery. Schema and full dumps use independent snapshots; restore the full dump alone, not schema followed by full. Supabase-managed Auth/Storage objects require reconciliation with the target project.

## Configuration

| GitHub secret | Purpose |
| --- | --- |
| `PROD_DB_URL` | Production PostgreSQL connection string, also used by releases |
| `BACKUP_ENCRYPTION_PASSPHRASE` | Full-dump encryption; at least 20 characters |

Store the passphrase separately in a password manager and retain previous versions for older artifacts. GitHub does not reveal saved secrets. Keep connection strings, downloads, and decrypted SQL out of Git and logs; full dumps contain personal and Auth data.

For database connections, use the session pooler when direct IPv6 is unavailable. Percent-encode password characters in URLs; do not add shell-escape backslashes to stored values. `sslmode=require` requires encryption; configure the Supabase CA and `verify-full` when certificate/hostname verification is required.

Local tools: authenticated GitHub CLI, OpenSSL with PBKDF2 support, gzip, and a PostgreSQL client at least as new as the dump tool. Use Bash for the commands below. Docker is needed only to reproduce the dump container or run local Supabase.

## Create and download

From the repository root, start a backup on `main` and select its run ID:

```bash
gh workflow run backup-prod.yml --ref main
gh run list --workflow backup-prod.yml --branch main --limit 10
gh run watch RUN_ID --exit-status
```

Replace `RUN_ID` with the selected numeric ID. Confirm dump creation and artifact upload both succeeded. A manual run on another branch still uses the production database secret.

Download into a private directory outside the checkout:

```bash
umask 077
RECOVERY_DIR="$(mktemp -d "${TMPDIR:-/tmp}/cdc-recovery.XXXXXX")"
gh run download RUN_ID --name prod-db-backup --dir "$RECOVERY_DIR"
ls -lh "$RECOVERY_DIR"
```

Alternatively, download the artifact from the successful workflow run in GitHub and unzip it into that private directory. Record the run, timestamp, and matching application commit in the internal recovery task/feature record.

## Decrypt

Replace the filename with the downloaded full dump. OpenSSL prompts for the matching passphrase:

```bash
openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 \
  -in "$RECOVERY_DIR/prod_full_YYYYMMDD_HHMMSS.sql.gz.enc" \
  -out "$RECOVERY_DIR/full.sql.gz"
gzip -t "$RECOVERY_DIR/full.sql.gz"
gunzip -c "$RECOVERY_DIR/full.sql.gz" > "$RECOVERY_DIR/full.sql"
```

Stop on any failure. Successful gzip verification is silent. AES-CBC is not authenticated encryption; these checks do not establish authenticity. Use an artifact from a trusted run and inspect SQL privately.

## Prepare recovery

Use a separate disposable project, never production or shared staging, for a rehearsal. Do not import the raw full dump directly into a running project.

1. Match the backup to its application/migration version and choose a compatible target PostgreSQL version. Configure required extensions first; keep the application disconnected from recovery.
2. Prepare `restore-reviewed.sql` from the full dump. Reconcile managed Auth/Storage objects and versions, application schema/data, Auth identities, and migration history. Preserve UUID relationships between Auth accounts, profiles, and application rows.
3. Restore explicit application grants, functions, RLS, and the custom Auth profile trigger from matching migrations. Arrange trigger creation after profile import, or use an explicitly reviewed sequence, so imported Auth users do not create duplicate profiles. Do not casually disable all triggers or drop managed schemas.
4. Reconcile migration history with the restored schema; never mark a migration applied just to suppress an error or apply the baseline over existing tables.
5. Review transaction compatibility: the prepared SQL must not contain its own transaction control or commands that cannot run in one transaction.

This SQL preparation is target-specific. The commands below execute the reviewed file; they do not convert a raw Supabase dump automatically.

## Restore and validate

Set connection fields for the disposable recovery project's session pooler. Replace the placeholders and verify the host/project before import. `psql -W` prompts for the password.

```bash
export PGHOST='REPLACE_WITH_RECOVERY_POOLER_HOST'
export PGPORT='5432'
export PGUSER='postgres.REPLACE_WITH_RECOVERY_PROJECT_REF'
export PGDATABASE='postgres'
export PGSSLMODE='require'
unset PGPASSWORD PGSERVICE

psql -X -W -v ON_ERROR_STOP=1 \
  -c 'SELECT current_database(), current_user, version();'

psql -X -W --single-transaction --set ON_ERROR_STOP=1 \
  --file "$RECOVERY_DIR/restore-reviewed.sql"
```

Success means exit code 0 with no SQL errors. On failure, stop and review; do not ignore errors or switch the target to production.

Validate before cutover:

- Compare table counts with the backup snapshot, not today's source database. Check Auth/profile UUID relationships and absence of orphaned records.
- Compare migration history, constraints, indexes, functions, triggers, grants, and RLS with the matching migrations. Include the custom trigger on `auth.users`.
- Point an isolated app at recovery and verify login, each role's permissions, and representative reads/writes/deletions with disposable data.
- Restore required project configuration: Auth URLs/providers/SMTP, secrets, extensions, and any used webhooks, Realtime, or Edge Functions. Restore Storage bytes separately if used. Encrypted/Vault values require their applicable key recovery.
- Preserve existing restored accounts. For an intentionally empty installation only, use the README's admin bootstrap process with the deliberately selected recovery environment.

## Cutover and cleanup

After a successful rehearsal and explicit production approval, pause writes/releases, take a fresh backup, and repeat the reviewed recovery. Switch environment-specific GitHub database URLs and Vercel runtime API URL/key to the recovered project. Rebuild through the normal GitHub release so public build-time values update.

Verify login and permissions before reopening writes. Keep the original project until recovery is accepted; rolling back after new writes requires data reconciliation. Record results internally and remove decrypted temporary files under the data-retention policy. Keep encrypted recovery points and matching passphrases for their intended retention period.

## References

- [GitHub artifact downloads](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts)
- [Supabase backup and restore](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
- [Supabase backup scope](https://supabase.com/docs/guides/platform/backups)
