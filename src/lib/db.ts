import { Pool, type QueryResultRow } from "pg";

// Single pooled connection as the narrow read-only `cbc_web` role. A global
// guard keeps Next's dev-mode module reloads from opening a pool per reload.
const globalForPg = globalThis as unknown as { __cbcPool?: Pool };

export const pool =
  globalForPg.__cbcPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30_000,
    // Fail fast to the page's empty-state fallback if Postgres is unreachable or
    // a query runs away, rather than hanging the request on a TCP timeout.
    connectionTimeoutMillis: 5_000,
    statement_timeout: 10_000,
    query_timeout: 10_000,
  });

globalForPg.__cbcPool = pool;

export async function query<T extends QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const res = await pool.query<T>(text, params);
  return res.rows;
}
