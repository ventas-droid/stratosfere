const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    // Usamos su email real
    const email = process.env.ME_EMAIL || 'isidroberllorca@gmail.com';

    console.log("🔍 BUSCANDO USUARIO:", email);

    const u = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyName: true,
      }
    });

    if (!u) {
      console.log("❌ NO ENCONTRADO. ¿Está bien el email?");
    } else {
      console.log("✅ ENCONTRADO EN BASE DE DATOS:");
      console.log("--------------------------------");
      console.dir(u, { depth: 5 });
      console.log("--------------------------------");
      console.log("Si aquí dice 'Isidro' pero en la web ve 'Juan', el problema es el código (Paso 3).");
      console.log("Si aquí dice 'Juan', el problema es la Base de Datos (Paso 2).");
    }
  } catch (e) {
    console.error("❌ ERROR TÉCNICO:", e);
  } finally {
    await prisma.$disconnect();
  }
})();
