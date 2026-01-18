// prisma/scripts/backfillRefCode.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  try {
    console.log("Backfill refCode: comenzando...");

    const props = await prisma.property.findMany({
      where: { refCode: null },
      select: { id: true },
    });

    let count = 0;

    for (const p of props) {
      await prisma.property.update({
        where: { id: p.id },
        data: { refCode: `SF-${p.id}` },
      });
      count++;
    }

    console.log(`OK backfill refCode: ${count} actualizadas`);
  } catch (e) {
    console.error("ERROR backfill refCode:", e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
