import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const rooms = await prisma.room.findMany({ include: { sessions: { include: { entries: true } } } });
  console.log(JSON.stringify(rooms, null, 2));
}
main();
