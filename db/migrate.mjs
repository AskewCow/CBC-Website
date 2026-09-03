// Applies db/migrations/*.sql in filename order, once each, tracked in a
// schema_migrations table. Connects as a superuser to the app database.
//
//   node --env-file=.env.local db/migrate.mjs
//
// Env:
//   DATABASE_ADMIN_URL  superuser connection (the database name in it is
//                       replaced with DB_NAME)
//   DB_NAME             default: cbc

import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const HERE = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(HERE, "migrations");

const base = process.env.DATABASE_ADMIN_URL ?? "postgres://postgres:postgres@localhost:5432/postgres";
const url = new URL(base);
url.pathname = "/" + (process.env.DB_NAME ?? "cbc");

const client = new Client({ connectionString: url.toString() });
await client.connect();

try {
  await client.query(`
    create table if not exists schema_migrations (
      version    text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const applied = new Set(
    (await client.query("select version from schema_migrations")).rows.map((r) => r.version),
  );

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(join(MIGRATIONS_DIR, file), "utf8");
    process.stdout.write(`applying ${file} ... `);
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into schema_migrations (version) values ($1)", [file]);
      await client.query("commit");
      console.log("ok");
      ran++;
    } catch (err) {
      await client.query("rollback");
      console.log("failed");
      throw err;
    }
  }

  console.log(ran === 0 ? "nothing to apply — schema up to date" : `applied ${ran} migration(s)`);
} finally {
  await client.end();
}
