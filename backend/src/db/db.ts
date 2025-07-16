import { Client } from 'pg';

export const db = new Client({
  connectionString: process.env.DATABASE_URL,
});

db.connect();