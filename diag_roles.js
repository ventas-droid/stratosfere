const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const total = await prisma.user.count();
    const agencies = await prisma.user.count({ where: { role: 'AGENCIA' } });
    const particulars = await prisma.user.count({ where: { role: 'PARTICULAR' } });
    console.log({ total, agencies, particulars });

    const list = await prisma.user.findMany({
      where: { role: 'AGENCIA' },
      select: { email: true, name: true, companyName: true }
    });
    console.log("AGENCIES:", list);
  } catch (e) {
    console.error("❌", e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
