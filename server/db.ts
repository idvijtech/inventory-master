import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "./shared/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
});
console.log("connected!")

export default pool;

export const db = drizzle({ client: pool, schema });