import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.ts';

declare global {
  var _postgresPool: InstanceType<typeof Pool> | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      idleTimeoutMillis: 10000, // Prune idle clients after 10 seconds to avoid stale dead sockets
      connectionTimeoutMillis: 10000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 5000,
    });

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
      global._postgresPool = undefined;
    });
  }
  return global._postgresPool;
};

export const getDb = () => {
  const pool = createPool();
  return drizzle(pool, { schema });
};

export const db = drizzle(createPool(), { schema });

/**
 * Helper to run DB queries with automatic retry if a pooled connection was terminated unexpectedly
 */
export async function withDbRetry<T>(
  operation: (dbInstance: ReturnType<typeof getDb>) => Promise<T>,
  retries = 2
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      const activeDb = getDb();
      return await operation(activeDb);
    } catch (err: any) {
      attempt++;
      const isConnError =
        err?.message?.includes('Connection terminated') ||
        err?.cause?.message?.includes('Connection terminated') ||
        err?.code === 'ECONNRESET' ||
        err?.code === '57P01' ||
        err?.code === '57P02' ||
        err?.code === '57P03';

      if (isConnError && attempt <= retries) {
        console.warn(`[Cloud SQL Retry] Connection error on attempt ${attempt}, recreating pool:`, err.message);
        if (global._postgresPool) {
          try {
            await global._postgresPool.end();
          } catch {}
          global._postgresPool = undefined;
        }
        await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
        continue;
      }
      throw err;
    }
  }
}

