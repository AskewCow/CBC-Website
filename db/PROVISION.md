# Provisioning the shared Postgres on the Oracle VM

The website and the Discord bot both talk to one PostgreSQL instance running on
the VM. Local development uses the `docker-compose.yml` in the repo root; this is
the production equivalent.

Everything below assumes Ubuntu on the ARM (Ampere A1) VM and that both repos are
checked out on the box (e.g. `~/CBC-Website` and `~/CBC-Discord-Bot`).

## 1. Install PostgreSQL 16

```bash
sudo apt update
sudo apt install -y postgresql-16
sudo systemctl enable --now postgresql
```

## 2. Lock it to localhost

Both apps run on the same VM, so Postgres never needs to listen on the network.
Confirm `listen_addresses` in `/etc/postgresql/16/main/postgresql.conf`:

```
listen_addresses = 'localhost'
```

`/etc/postgresql/16/main/pg_hba.conf` — keep only local + loopback, password auth:

```
local   all   all                  scram-sha-256
host    all   all   127.0.0.1/32   scram-sha-256
host    all   all   ::1/128        scram-sha-256
```

Then `sudo systemctl restart postgresql`.

## 3. Create the database and roles

Pick real passwords (a password manager entry each). Then, as the `postgres`
superuser:

```bash
sudo -u postgres psql <<'SQL'
CREATE DATABASE cbc;
CREATE ROLE cbc_bot LOGIN BYPASSRLS   PASSWORD 'REPLACE_BOT_PASSWORD';
CREATE ROLE cbc_web LOGIN NOBYPASSRLS PASSWORD 'REPLACE_WEB_PASSWORD';
GRANT CONNECT ON DATABASE cbc TO cbc_bot, cbc_web;
SQL
```

Equivalently, from the website repo with a superuser `DATABASE_ADMIN_URL` in
`.env.local`, `npm run db:bootstrap` does the same thing (it also creates
`cbc_test`, which production doesn't need — harmless).

## 4. Apply the schema

From `~/CBC-Website`, with `.env.local` pointing `DATABASE_ADMIN_URL` at the
local superuser and `DB_NAME=cbc`:

```bash
npm ci
npm run db:migrate      # applies db/migrations/*.sql, tracked in schema_migrations
```

Re-run `npm run db:migrate` after every deploy — it only applies new files.

## 5. Point the apps at it

**Website** `~/CBC-Website/.env.local` (or systemd env):

```
DATABASE_URL=postgres://cbc_web:REPLACE_WEB_PASSWORD@localhost:5432/cbc
REVALIDATE_SECRET=<long random string>
```

**Bot** `~/CBC-Discord-Bot/.env`:

```
DATABASE_URL=postgres://cbc_bot:REPLACE_BOT_PASSWORD@localhost:5432/cbc
WEBSITE_BASE_URL=https://your-domain
WEBSITE_REVALIDATE_URL=https://your-domain/api/revalidate
WEBSITE_REVALIDATE_SECRET=<same long random string as REVALIDATE_SECRET>
GITHUB_TOKEN=<optional, raises tag-derivation rate limit>
```

Note the port is **5432** here (local dev uses 5433 to dodge another project).

## 6. Nightly backup to the block volume

```bash
sudo -u postgres crontab -e
```

```
15 4 * * * pg_dump -Fc cbc > /mnt/blockvol/backups/cbc-$(date +\%F).dump && find /mnt/blockvol/backups -name 'cbc-*.dump' -mtime +30 -delete
```

Restore test: `pg_restore -d cbc_restore_check /mnt/blockvol/backups/cbc-YYYY-MM-DD.dump`

## What is NOT in Postgres

The bot keeps its internal tables in SQLite (`~/CBC-Discord-Bot/data/bot.db`):
config, tickets, onboarding, invite tracking, the per-guild post-event message.
Back that file up too — a plain file copy is fine when the bot is stopped, or
`sqlite3 bot.db ".backup '/mnt/blockvol/backups/bot-$(date +%F).db'"` while running.
