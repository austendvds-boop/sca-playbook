import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const globalForDb = globalThis as unknown as {
  __scaSqlClient?: ReturnType<typeof postgres>;
  __scaDrizzle?: ReturnType<typeof drizzle>;
};

const client =
  globalForDb.__scaSqlClient ??
  postgres(process.env.DATABASE_URL, {
    ssl: 'require'
  });

const db = globalForDb.__scaDrizzle ?? drizzle(client, { schema });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__scaSqlClient = client;
  globalForDb.__scaDrizzle = db;
}

export { db };

export function getDb() {
  return db;
}
