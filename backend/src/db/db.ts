import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

export const db = new Client({
  connectionString: process.env.DATABASE_URL,
});

db.connect();