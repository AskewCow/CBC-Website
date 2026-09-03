// Creates the shared database and the two roles it needs, idempotently.
// Run once before migrate.mjs. Connects as a Postgres superuser.
//
//   node --env-file=.env.local db/bootstrap.mjs
//
// Env:
//   DATABASE_ADMIN_URL  superuser connection (defaults to local docker-compose)
//   DB_NAME             database to create        (default: cbc)
//   BOT_DB_PASSWORD     password for role cbc_bot (default: cbc_bot_dev)
//   WEB_DB_PASSWORD     password for role cbc_web (default: cbc_web_dev)

import { Client } from "pg";

const ADMIN_URL = process.env.DATABASE_ADMIN_URL ?? "postgres://postgres:postgres@localhost:5432/postgres";
const DB_NAME = process.env.DB_NAME ?? "cbc";
const BOT_PW = process.env.BOT_DB_PASSWORD ?? "cbc_bot_dev";
const WEB_PW = process.env.WEB_DB_PASSWORD ?? "cbc_web_dev";

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

const roles = [
  { name: "cbc_bot", pw: BOT_PW, attrs: "LOGIN BYPASSRLS" },
  { name: "cbc_web", pw: WEB_PW, attrs: "LOGIN NOBYPASSRLS" },
];

const client = new Client({ connectionString: ADMIN_URL });
await client.connect();

try {
  for (const name of [DB_NAME, `${DB_NAME}_test`]) {
    const db = await client.query("select 1 from pg_database where datname = $1", [name]);
    if (db.rowCount === 0) {
      await client.query(`create database "${name}"`);
      console.log(`created database ${name}`);
    } else {
      console.log(`database ${name} already exists`);
    }
  }

  for (const r of roles) {
    const exists = await client.query("select 1 from pg_roles where rolname = $1", [r.name]);
    if (exists.rowCount === 0) {
      await client.query(`create role ${r.name} with ${r.attrs} password ${q(r.pw)}`);
      console.log(`created role ${r.name}`);
    } else {
      await client.query(`alter role ${r.name} with ${r.attrs} password ${q(r.pw)}`);
      console.log(`updated role ${r.name}`);
    }
  }

  // Let both roles connect to the app database (and the bot to the test one).
  await client.query(`grant connect on database "${DB_NAME}" to cbc_bot, cbc_web`);
  await client.query(`grant connect on database "${DB_NAME}_test" to cbc_bot`);
} finally {
  await client.end();
}

// In the test database the bot creates its own throwaway tables, so it needs
// CREATE on the public schema there (it does not in the real database).
{
  const testUrl = new URL(ADMIN_URL);
  testUrl.pathname = `/${DB_NAME}_test`;
  const testClient = new Client({ connectionString: testUrl.toString() });
  await testClient.connect();
  try {
    await testClient.query('grant create, usage on schema public to cbc_bot');
    await testClient.query('alter default privileges for role cbc_bot in schema public grant all on tables to cbc_bot');
    console.log(`granted schema privileges on ${DB_NAME}_test to cbc_bot`);
  } finally {
    await testClient.end();
  }
}
