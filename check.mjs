import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;
const c = new Client({connectionString: process.env.DATABASE_URL});
await c.connect();
const res = await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
console.log(res.rows);
await c.end();
