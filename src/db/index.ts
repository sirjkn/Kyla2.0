import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.ts';

declare global {
  var _postgresPool: InstanceType<typeof Pool> | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const host = process.env.SQL_HOST;
    const isUnixSocket = host && host.startsWith('/');

    global._postgresPool = new Pool({
      host: host,
      port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : 5432,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: isUnixSocket ? 10 : 5,
      idleTimeoutMillis: 2000, // Quickly prune idle socket clients to prevent dead socket reuse
      connectionTimeoutMillis: 10000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 2000,
      ssl: process.env.SQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });

    global._postgresPool.on('error', (err) => {
      console.warn('Idle SQL pool client error, invalidating pool instance:', err?.message || err);
      const oldPool = global._postgresPool;
      global._postgresPool = undefined;
      if (oldPool) {
        oldPool.end().catch(() => {});
      }
    });
  }
  return global._postgresPool;
};

export const getDb = () => {
  const pool = createPool();
  return drizzle(pool, { schema });
};

export const db = drizzle(createPool(), { schema });

function isConnectionError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || '') + ' ' + (err.cause?.message || '') + ' ' + (err.stack || '');
  const code = err.code || err.cause?.code;

  if (
    msg.includes('Connection terminated') ||
    msg.includes('connection closed') ||
    msg.includes('socket hang up') ||
    msg.includes('Client has encountered a connection error') ||
    msg.includes('read ECONNRESET') ||
    msg.includes('connect ECONNREFUSED') ||
    msg.includes('EPIPE')
  ) {
    return true;
  }

  if (['ECONNRESET', 'ECONNREFUSED', 'EPIPE', '57P01', '57P02', '57P03', '08000', '08003', '08006'].includes(code)) {
    return true;
  }

  return false;
}

/**
 * Helper to run DB queries with automatic retry if a pooled connection was terminated unexpectedly
 */
export async function withDbRetry<T>(
  operation: (dbInstance: ReturnType<typeof getDb>) => Promise<T>,
  retries = 3
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      const activeDb = getDb();
      return await operation(activeDb);
    } catch (err: any) {
      attempt++;
      if (isConnectionError(err) && attempt <= retries) {
        console.warn(`[Cloud SQL Retry] Connection error on attempt ${attempt}, recreating pool: ${err.message || err}`);
        const oldPool = global._postgresPool;
        global._postgresPool = undefined; // Nullify immediately so next getDb() spawns a fresh pool
        if (oldPool) {
          oldPool.end().catch(() => {});
        }
        await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
        continue;
      }
      throw err;
    }
  }
}


