const {PrismaClient} = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  try {
    const total = await p.property.count();
    // Usamos ownerSnapshot: { not: null } para contar los que tienen snapshot
    const withSnap = await p.property.count({ where: { ownerSnapshot: { not: null } } });
    const without = await p.property.count({ where: { ownerSnapshot: null } });
    console.log({ total, withSnap, without });
  } finally {
    await p.$disconnect();
  }
})();
