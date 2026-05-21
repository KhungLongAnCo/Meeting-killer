import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { scryptSync, randomBytes } from 'crypto';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const username = process.env.DEFAULT_USERNAME || 'admin';
  const rawPassword = process.env.DEFAULT_PASSWORD || 'admin123';

  // Hash password: salt:hash
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(rawPassword, salt, 64).toString('hex');
  const password = `${salt}:${hash}`;

  const user = await prisma.user.upsert({
    where: { username },
    update: { password },
    create: { username, password },
  });

  console.log(`✅ Seeded admin user: ${user.username} (id: ${user.id})`);
  console.log(`   Login with: username=admin, password=admin123`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
