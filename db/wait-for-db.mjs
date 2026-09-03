// Polls the Postgres admin connection until it accepts queries, or times out.
//   node --env-file=.env.local db/wait-for-db.mjs

import { Client } from "pg";

const ADMIN_URL = process.env.DATABASE_ADMIN_URL ?? "postgres://postgres:postgres@localhost:5432/postgres";
const deadline = Date.now() + 60_000;

while (Date.now() < deadline) {
  try {
    const c = new Client({ connectionString: ADMIN_URL, connectionTimeoutMillis: 2000 });
    await c.connect();
    await c.query("select 1");
    await c.end();
    console.log("postgres is ready");
    process.exit(0);
  } catch {
    await new Promise((r) => setTimeout(r, 1500));
  }
}

console.error("timed out waiting for postgres");
process.exit(1);
