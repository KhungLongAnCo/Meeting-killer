import pg from 'pg';
const { Client } = pg;
const c = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:54322/killer?schema=public' });
await c.connect();
const res = await c.query('SELECT * FROM "Entry" LIMIT 5;');
console.log(res.rows);
await c.end();
