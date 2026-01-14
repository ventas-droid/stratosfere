// scripts/backfillOwnerSnapshot.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  console.log("Backfill: comenzando...");
  const all = await prisma.property.findMany({ include: { user: true } });
  let count = 0;
  for (const p of all) {
    if (!p.ownerSnapshot && p.user) {
      const newSnapshot = {
        id: p.user.id,
        name: p.user.name || null,
        companyName: p.user.companyName || null,
        companyLogo: p.user.companyLogo || null,
        avatar: p.user.avatar || null,
        phone: p.user.phone || null,
        mobile: p.user.mobile || null,
        coverImage: p.user.coverImage || null,
        tagline: p.user.tagline || null,
        zone: p.user.zone || null,
        role: p.user.role || null
      };
      await prisma.property.update({
        where: { id: p.id },
        data: { ownerSnapshot: newSnapshot }
      });
      count++;
    }
  }
  console.log(`Backfill complete - propiedades actualizadas: ${count}`);
  await prisma.$disconnect();
  process.exit(0);
})();
