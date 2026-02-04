"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from './lib/prisma'; 
import { cookies } from "next/headers";

// ... imports ...

// 🔥 PEGAR ESTO AL PRINCIPIO DEL ARCHIVO (DESPUÉS DE LOS IMPORTS)
const USER_IDENTITY_SELECT = {
    id: true,
    role: true,            // Vital: PARTICULAR vs AGENCIA
    name: true,
    surname: true,
    email: true,
    avatar: true,          // Foto Personal
    companyName: true,     // Nombre Agencia
    companyLogo: true,     // Logo Agencia
    coverImage: true,      // Fondo Perfil
    phone: true,
    mobile: true,
    website: true,
    tagline: true,         // Slogan
    zone: true,            // Zona
    cif: true,
    licenseNumber: true,
    licenseType: true      // <--- ESTE FALTABA EN EL MAPA (CRÍTICO)
};

const buildIdentity = (freshUser: any, snap: any) => {
  const base = {
    ...(snap && typeof snap === "object" ? snap : {}),
    ...(freshUser && typeof freshUser === "object" ? freshUser : {}),
  };

  const isAgency = base.role === "AGENCIA";

  return {
    id: base.id || null,
    role: base.role || "PARTICULAR",
    email: base.email || null,

    name: isAgency
      ? (base.companyName || base.name || "Agencia")
      : (base.name || "Usuario"),

    companyName: base.companyName || null,
    companyLogo: base.companyLogo || null,

    avatar: isAgency ? (base.companyLogo || null) : (base.avatar || null),

    coverImage: base.coverImage || null,
    phone: base.mobile || base.phone || null,
    mobile: base.mobile || null,
    website: base.website || null,
    tagline: base.tagline || null,
    zone: base.zone || null,

    licenseType: base.licenseType || null,
    licenseNumber: base.licenseNumber || null,
    cif: base.cif || null,
  };
};
// ✅ REF CODE corto y legible (sin 0/O/I/1)
const buildRefCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `SF-${out}`; // ejemplo: SF-8K3Q7M
};

// =========================================================
// 🔐 1. IDENTIFICACIÓN Y SESIÓN
// =========================================================

async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionEmail = cookieStore.get('stratos_session_email')?.value;

  if (!sessionEmail) return null;

  try {
    const user = await prisma.user.findUnique({ where: { email: sessionEmail } });
    return user;
  } catch (e) {
    return null;
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.getAll().forEach((cookie) => cookieStore.delete(cookie.name));
  return { success: true };
}

// Helper de login (necesario para compatibilidad si usa login.ts)
export async function loginUser(formData: FormData) { 
    return { success: true };
}

// =========================================================
// 🌍 2. PROPIEDADES (GLOBALES Y PRIVADAS)
// =========================================================

// EN: actions.ts -> Sustituya getGlobalPropertiesAction completa

export async function getGlobalPropertiesAction() {
  try {
    const user = await getCurrentUser();
    const currentUserId = user?.id || null;

    const properties = await prisma.property.findMany({
      where: { status: "PUBLICADO" },
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
        favoritedBy: { select: { userId: true } },

        // ✅ Usuario “vivo” (perfil actual) para reflejar ediciones en Details
        user: {
          select: USER_IDENTITY_SELECT,
        },
      },
    });

    const mappedProps = (properties || []).map((p: any) => {
      // 1) Imágenes coherentes
      const allImages = (p.images || [])
        .map((img: any) => img?.url)
        .filter(Boolean);

      const realImg =
        allImages?.[0] || p.mainImage || null;

      const imagesFinal =
        allImages.length > 0 ? allImages : (realImg ? [realImg] : []);

      // 2) Favoritos (estado server truth)
      const isFavoritedByMe = currentUserId
        ? (p.favoritedBy || []).some((fav: any) => fav?.userId === currentUserId)
        : false;

      // 3) Identidad unificada:
      //    - live user (DB) para ver ediciones
      //    - snapshot como fallback si falta user o si es legacy
      const identity = buildIdentity(p.user, p.ownerSnapshot);

      // 4) Coordenadas seguras
      const lng = p.longitude ?? -3.7038;
      const lat = p.latitude ?? 40.4168;

      // 5) Precio: mantenemos numérico + string formateado
      const rawPrice = Number(p.price || 0);
      const priceFormatted = new Intl.NumberFormat("es-ES").format(rawPrice);

      return {
        ...p,
        id: p.id,

        // ✅ IMPORTANTÍSIMO: que el snapshot viaje top-level también
        ownerSnapshot: p.ownerSnapshot ?? null,

        // ✅ IMPORTANTÍSIMO: el frontend debe leer SIEMPRE `user` normalizado
        user: identity,

        // Mapa / cards
        coordinates: [lng, lat],
        longitude: lng,
        latitude: lat,

        // Imágenes
        images: imagesFinal,
        img: realImg,

        // Precio
        price: priceFormatted,   // string para UI
        rawPrice,                // number
        priceValue: rawPrice,    // number

        // Favorito
        isFavorited: isFavoritedByMe,

        // Datos numéricos (no los pierdas)
        m2: Number(p.mBuilt || 0),
        mBuilt: Number(p.mBuilt || 0),
        communityFees: Number(p.communityFees || 0),

        // Energía (para no perder datos en Details)
        energyConsumption: p.energyConsumption ?? null,
        energyEmissions: p.energyEmissions ?? null,
        energyPending: !!p.energyPending,
      };
    });

    return { success: true, data: mappedProps };
  } catch (error) {
    console.error("Error crítico en mapa global:", error);
    return { success: false, data: [] };
  }
}

// ✅ Obtener UNA propiedad completa (para abrir Details desde Threads sin stub)
export async function getPropertyByIdAction(propertyId: string) {
  try {
    const id = String(propertyId || "").trim();
    if (!id) return { success: false, error: "MISSING_PROPERTY_ID" };

    const p: any = await prisma.property.findUnique({
      where: { id },
      include: {
        images: true,
        user: { select: USER_IDENTITY_SELECT },
      },
    });

    if (!p) return { success: false, error: "NOT_FOUND" };

    // 1) Imágenes coherentes (igual que global)
    const allImages = (p.images || [])
      .map((img: any) => img?.url)
      .filter(Boolean);

    const realImg = allImages?.[0] || p.mainImage || null;
    const imagesFinal = allImages.length > 0 ? allImages : (realImg ? [realImg] : []);

    // 2) Identidad unificada (igual que global)
    const identity = buildIdentity(p.user, p.ownerSnapshot);

    // 3) Coordenadas seguras
    const lng = p.longitude ?? -3.7038;
    const lat = p.latitude ?? 40.4168;

    // 4) Precio
    const rawPrice = Number(p.price || 0);
    const priceFormatted = new Intl.NumberFormat("es-ES").format(rawPrice);

    // ✅ devolvemos en el MISMO formato que Details/Map ya saben manejar
    const mapped = {
      ...p,
      id: p.id,
      ownerSnapshot: p.ownerSnapshot ?? null,
      user: identity,

      coordinates: [lng, lat],
      longitude: lng,
      latitude: lat,

      images: imagesFinal,
      img: realImg,

      price: priceFormatted,
      rawPrice,
      priceValue: rawPrice,

      m2: Number(p.mBuilt || 0),
      mBuilt: Number(p.mBuilt || 0),
      communityFees: Number(p.communityFees || 0),

      energyConsumption: p.energyConsumption ?? null,
      energyEmissions: p.energyEmissions ?? null,
      energyPending: !!p.energyPending,
    };

    return { success: true, data: mapped };
  } catch (e: any) {
    console.error("getPropertyByIdAction error:", e);
    return { success: false, error: String(e?.message || e) };
  }
}

// C. GUARDAR PROPIEDAD (VERSIÓN DEFINITIVA BLINDADA Y EXTENDIDA)
export async function savePropertyAction(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Debes iniciar sesión." };

    // 1. LIMPIEZA DE DATOS NUMÉRICOS (LÓGICA ORIGINAL)
    const cleanPrice = parseFloat(String(data.price).replace(/\D/g, '') || '0');
    const rawM2 = data.mBuilt || data.m2 || data.surface || '0';
    const cleanM2 = parseFloat(String(rawM2).replace(/\D/g, '') || '0');

    // 2. SINCRONIZACIÓN DE SERVICIOS (MODIFICADO PARA NO PERDER EXTRAS)
    // Juntamos lo que viene en la lista + los botones sueltos
    let servicesSet = new Set<string>(Array.isArray(data.selectedServices) ? data.selectedServices : []);

    // Si el usuario marcó el botón en el HUD, lo aseguramos en la lista
    if (data.pool) servicesSet.add('pool');
    if (data.garage) servicesSet.add('garage');
    if (data.terrace) servicesSet.add('terrace');
    if (data.ac) servicesSet.add('ac');
    if (data.garden) servicesSet.add('garden');
    if (data.storage) servicesSet.add('storage');
    if (data.heating) servicesSet.add('heating');
    if (data.furnished) servicesSet.add('furnished');
    if (data.security) servicesSet.add('security');
    if (data.balcony) servicesSet.add('balcony');

    // Convertimos a array y aseguramos el pack básico
    let finalServices = Array.from(servicesSet);
    if (!finalServices.some((s: string) => s && String(s).startsWith('pack_'))) finalServices.push('pack_basic');

    // 3. GESTIÓN DE IMÁGENES (LÓGICA ORIGINAL)
    const imagesList = Array.isArray(data.images) ? data.images : [];
    if (data.mainImage && !imagesList.includes(data.mainImage)) imagesList.unshift(data.mainImage);
    const mainImage = imagesList.length > 0 ? imagesList[0] : null;

    // 4. OWNER SNAPSHOT (LÓGICA ORIGINAL)
    const ownerSnapshot = {
      id: user.id,
      name: user.name || null,
      companyName: user.companyName || null,
      companyLogo: user.companyLogo || null,
      avatar: user.avatar || null,
      phone: user.phone || null,
      mobile: user.mobile || null,
      coverImage: user.coverImage || null,
      tagline: user.tagline || null,
      zone: user.zone || null,
      role: user.role || null
    };

    // 5. CONSTRUCCIÓN DEL OBJETO (AQUÍ ESTÁ LA ACTUALIZACIÓN CLAVE)
    const payload = {
        userId: user.id,
        type: data.type || 'Piso',
        title: data.title || `Propiedad en ${data.city}`,
        description: data.description || "",
        price: cleanPrice,
        mBuilt: cleanM2,
        address: data.address || "Dirección desconocida",
        city: data.city || "Madrid",
        latitude: data.coordinates ? data.coordinates[1] : 40.4168,
        longitude: data.coordinates ? data.coordinates[0] : -3.7038,
        
        rooms: Number(data.rooms || 0),
        baths: Number(data.baths || 0),
        floor: data.floor ? String(data.floor) : null,
        door: data.door ? String(data.door) : null,
        elevator: Boolean(data.elevator),

        // 🔥 MAPEO DE BOOLEANOS (NUEVOS CAMPOS)
        // Si está en el Set -> True en la base de datos
        pool: servicesSet.has('pool'),
        garage: servicesSet.has('garage'),
        garden: servicesSet.has('garden'),
        terrace: servicesSet.has('terrace'),
        balcony: servicesSet.has('balcony'),
        storage: servicesSet.has('storage'),
        ac: servicesSet.has('ac'),
        heating: servicesSet.has('heating'),
        furnished: servicesSet.has('furnished'),
        security: servicesSet.has('security'),

        // 🔥 NUEVOS DETALLES
        state: data.state || null,         // "Obra Nueva", etc.
        orientation: data.orientation || null, // "Norte", etc.
        exterior: data.exterior !== undefined ? Boolean(data.exterior) : true,

        selectedServices: finalServices,
        
        mainImage: mainImage,
        status: (user.role === 'AGENCIA' || (data.id && data.id.length > 10)) ? 'PUBLICADO' : 'PENDIENTE_PAGO',
        
        ownerSnapshot, // Mantenemos snapshot

        // MAPEO EXACTO AL ESQUEMA
        communityFees: Number(data.communityFees || 0), 
        energyConsumption: data.energyConsumption || null, 
        energyEmissions: data.energyEmissions || null,     
        energyPending: Boolean(data.energyPending),        
    };

    const imageCreateLogic = { create: imagesList.map((url: string) => ({ url })) };

    // Include Options (LÓGICA ORIGINAL)
    const includeOptions = { 
      images: true,
      user: { 
        select: {
          id: true, role: true, name: true, surname: true, email: true,
          avatar: true, companyName: true, companyLogo: true, coverImage: true,
          phone: true, mobile: true, website: true, tagline: true, zone: true,
          cif: true, licenseNumber: true, licenseType: true,
        }
      }
    };

    let result;

    // --- BLOQUE DE GUARDADO (SU LÓGICA DE TRANSACCIÓN ORIGINAL INTACTA) ---
    if (data.id && data.id.length > 20) {
      // ✅ EDICIÓN
      const existing = await prisma.property.findUnique({ where: { id: data.id } });
      const { ownerSnapshot: _dontTouch, ...payloadNoSnap } = payload as any;

      if (existing && existing.userId === user.id) {
        await prisma.image.deleteMany({ where: { propertyId: data.id } });

        result = await prisma.property.update({
          where: { id: data.id },
          data: {
            ...payloadNoSnap, 
            images: imageCreateLogic,
          },
          include: includeOptions,
        });
      } else {
        // Fallback: Crear si no existe o ID raro
        const recent = await prisma.property.findFirst({
          where: {
            userId: user.id,
            address: payload.address,
            createdAt: { gte: new Date(Date.now() - 10_000) },
          },
          orderBy: { createdAt: "desc" },
          include: includeOptions,
        });

        if (recent) return { success: true, property: recent, deduped: true };

        result = await prisma.property.create({
          data: { ...payload, ownerSnapshot, images: imageCreateLogic },
          include: includeOptions,
        });
      }
    } else {
      // ✅ CREACIÓN (CON TRANSACCIÓN Y REFCODE ORIGINAL)
      const recent = await prisma.property.findFirst({
        where: {
          userId: user.id,
          address: payload.address,
          createdAt: { gte: new Date(Date.now() - 10_000) },
        },
        orderBy: { createdAt: "desc" },
        include: includeOptions,
      });

      if (recent) return { success: true, property: recent, deduped: true };

      result = await prisma.$transaction(async (tx: any) => {
        // 1) Crear
        const created = await tx.property.create({
          data: { ...(payload as any), ownerSnapshot, images: imageCreateLogic } as any,
          include: includeOptions as any,
        });

        // 2) Generar RefCode si falta
        if (created?.refCode) return created;

        const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let out = "";
        for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
        const refCode = `SF-${out}`;

        // 3) Actualizar con RefCode
        return await tx.property.update({
          where: { id: created.id },
          data: { refCode } as any,
          include: includeOptions as any,
        });
      });
    }

    revalidatePath("/");
    return { success: true, property: result };

  } catch (error) {
    console.error("savePropertyAction error:", error);
    return { success: false, error: String(error) };
  }
} // ✅ CIERRE DE SAVE

// D. BORRAR PROPIEDAD (LÓGICA ORIGINAL)
export async function deletePropertyAction(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "No autorizado" };

    const pid = String(id || "").trim();
    if (!pid) return { success: false, error: "MISSING_ID" };

    const owned = await prisma.property.findFirst({
      where: { id: pid, userId: user.id },
      select: { id: true },
    });

    if (!owned) return { success: false, error: "No tienes permisos sobre esta propiedad." };

    await prisma.image.deleteMany({ where: { propertyId: pid } });
    await prisma.favorite.deleteMany({ where: { propertyId: pid } });
    await prisma.property.delete({ where: { id: pid } });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("deletePropertyAction error:", error);
    return { success: false, error: String(error) };
  }
}

// =========================================================
// ❤️ 3. USUARIO Y FAVORITOS (FUNCIONES QUE FALTABAN)
// =========================================================

// E. OBTENER PERFIL (Necesaria para ProfilePanel)
export async function getUserMeAction() {
  const user = await getCurrentUser();
  if (!user) return { success: false };
  return { success: true, data: user };
}

// F. ACTUALIZAR PERFIL (VERSIÓN FINAL - TODOS LOS CAMPOS)
// EN: actions.ts

// ... (código anterior)

// B. PERFIL DE USUARIO (Actualización Blindada)
export async function updateUserAction(data: any) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  try {
    const updateData: any = {};

    // ✅ Comunes (Particular + Agencia)
    if (data.name !== undefined) updateData.name = data.name;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.mobile !== undefined) updateData.mobile = data.mobile;
    if (data.website !== undefined) updateData.website = data.website;

    // ✅ Campos Agencia (si los envías)
    if (data.companyName !== undefined) updateData.companyName = data.companyName;
    if (data.companyLogo !== undefined) updateData.companyLogo = data.companyLogo;
    if (data.tagline !== undefined) updateData.tagline = data.tagline;
    if (data.zone !== undefined) updateData.zone = data.zone;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        role: true,
        email: true,
        name: true,
        avatar: true,
        companyName: true,
        companyLogo: true,
        coverImage: true,
        phone: true,
        mobile: true,
        website: true,
        tagline: true,
        zone: true,
        licenseType: true,
        licenseNumber: true,
        cif: true,
      },
    });

    revalidatePath("/");
    return { success: true, data: updated };
  } catch (e) {
    console.error("Error update user:", e);
    return { success: false, error: String(e) };
  }
}


// actions.ts
export async function toggleFavoriteAction(propertyId: string, desired?: boolean) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return { success: false, error: "NOT_AUTHENTICATED" };
  }

  const safePropertyId = String(propertyId || "").trim();
  if (!safePropertyId) {
    return { success: false, error: "MISSING_PROPERTY_ID" };
  }

  try {
    const where = {
      userId_propertyId: { userId: user.id, propertyId: safePropertyId },
    };

    const existing = await prisma.favorite.findUnique({ where });
    const exists = !!existing;

    // ✅ IDEMPOTENCIA:
    // - Si desired viene (true/false), obedecemos
    // - Si no viene, hacemos toggle clásico
    const shouldAdd = typeof desired === "boolean" ? desired : !exists;

    // Si me piden un estado que ya es el actual -> no hago nada
    if (shouldAdd === exists) {
      return { success: true, isFavorite: exists, action: "noop" };
    }

    if (shouldAdd) {
      await prisma.favorite.create({
        data: { userId: user.id, propertyId: safePropertyId },
      });
      revalidatePath("/"); // ✅ IMPORTANTE
      return { success: true, isFavorite: true, action: "added" };
    } else {
      await prisma.favorite.delete({ where });
      revalidatePath("/"); // ✅ IMPORTANTE
      return { success: true, isFavorite: false, action: "removed" };
    }
  } catch (e) {
    console.error("toggleFavoriteAction error:", e);
    return { success: false, error: "SERVER_ERROR" };
  }
}

// H. LEER FAVORITOS (BÓVEDA) ✅ UNIFICADO CON GLOBAL/PERFIL
export async function getFavoritesAction() {
  const user = await getCurrentUser();
  if (!user) return { success: false, data: [] };

  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      property: {
        include: {
          images: true,
          user: {
            select: {
              id: true,
              role: true,
              name: true,
              surname: true,
              avatar: true,
              companyName: true,
              companyLogo: true,
              coverImage: true,
              phone: true,
              mobile: true,
              website: true,
              tagline: true,
              zone: true,
              cif: true,
              licenseNumber: true,
            },
          },
        },
      },
    },
  });

  const cleanFavs = favs
    .map((f) => {
      const p: any = f.property;
      if (!p) return null;

      // Imágenes consistentes
      let allImages = (p.images || []).map((img: any) => img.url);
      if (allImages.length === 0 && p.mainImage) allImages = [p.mainImage];
      const realImg = allImages[0] || null;

      const lng = p.longitude ?? -3.7038;
      const lat = p.latitude ?? 40.4168;

      return {
        ...p,
        id: p.id,

        // ✅ CLAVE: identidad del creador para que el "portero" funcione
        user: p.user,

        // ✅ COORDENADAS PARA “VOLAR”
        coordinates: [lng, lat],
        lng,
        lat,

        // ✅ Imágenes coherentes con el mapa/global
        images: allImages,
        img: realImg,

        // ✅ Favorito
        isFavorited: true,

        // ✅ Precio numérico estable
        price: new Intl.NumberFormat("es-ES").format(p.price || 0),
        rawPrice: p.price,
        priceValue: p.price,

        // ✅ Datos críticos
        m2: Number(p.mBuilt || 0),
        mBuilt: Number(p.mBuilt || 0),
        communityFees: p.communityFees || 0,
        energyConsumption: p.energyConsumption,
        energyEmissions: p.energyEmissions,
        energyPending: p.energyPending,
      };
    })
    .filter(Boolean);

  return { success: true, data: cleanFavs };
}

// =========================================================
// 🏢 4. GESTIÓN DE AGENCIA (STOCK BLINDADO)
// =========================================================

// B. OBTENER PORTAFOLIO COMPLETO (PROPIAS + FAVORITOS)
export async function getAgencyPortfolioAction() {
  try {
    const user = await getUserMeAction();
    if (!user.success || !user.data) return { success: false, data: [] };

    // 🔥 DEFINICIÓN DE LA IDENTIDAD (EL "DNI" DE LA AGENCIA)
    const identitySelect = {
        select: {
            id: true,
            role: true,        // Vital para saber si es Agencia o Particular
            name: true,
            companyName: true,
            companyLogo: true, // Logo
            coverImage: true,  // Fondo Corporativo
            tagline: true,     // Slogan
            zone: true,
            licenseType: true, // El Pack ( Pro...)
            phone: true,
            mobile: true,
            email: true,
            cif: true,
            licenseNumber: true
        }
    };

    // 1. Mis Propiedades (Soy dueño) -> INCLUIMOS EL DNI
    const myProperties = await prisma.property.findMany({
      where: { userId: user.data.id },
      include: { 
          images: true,
          user: identitySelect // <--- AQUÍ SE CARGA LA IDENTIDAD
      }
    });

    // 2. Mis Favoritos -> INCLUIMOS EL DNI DE SUS DUEÑOS
    const myFavorites = await prisma.favorite.findMany({
      where: { userId: user.data.id },
      include: { 
          property: { 
              include: { 
                  images: true,
                  user: identitySelect // <--- AQUÍ TAMBIÉN
              } 
          } 
      }
    });

   // 3. Unificar listas (✅ favorito REAL incluso si es propiedad mía)
const favIdSet = new Set(
  (myFavorites || [])
    .map((f: any) => String(f?.propertyId || f?.property?.id || ""))
    .filter(Boolean)
);

const owned = (myProperties || []).map((p: any) => {
  const isFav = favIdSet.has(String(p?.id));
  return {
    ...p,
    isOwner: true,
    isFavorited: isFav,
    isFavorite: isFav,
    isFav: isFav,
  };
});

const favs = (myFavorites || []).map((f: any) => ({
  ...(f?.property || {}),
  isOwner: false,
  isFavorited: true,
  isFavorite: true,
  isFav: true,
}));

    // 4. Eliminar duplicados
    const combined = [...owned];
    const ownedIds = new Set(owned.map((p:any) => p.id));
    
    favs.forEach((f:any) => {
        if (!ownedIds.has(f.id)) combined.push(f);
    });

  // 5. Formatear para el Mapa (NORMALIZADO: ownerSnapshot manda)
const cleanList = combined
  .map((p: any) => {
    if (!p) return null;

    // 1) Preferimos snapshot (es lo que Details/AgencyDetails esperan)
    const snap =
      p.ownerSnapshot && typeof p.ownerSnapshot === "object" ? p.ownerSnapshot : null;

    // 2) Si no hay snapshot, caemos al user incluido por Prisma
const creator = p.user || snap || {};

    return {
      ...p,
      id: p.id,

      // ✅ Mantén ambos por compatibilidad:
      // - ownerSnapshot: para toda la lógica nueva consistente
      // - user: para componentes legacy que aún tiran de `user`
      ownerSnapshot: snap || (Object.keys(creator).length ? creator : null),
      user: Object.keys(creator).length ? creator : null,

      // Gestión de imágenes
      images: (p.images || []).map((img: any) => img.url),
      img: p.images?.[0]?.url || p.mainImage || null,

      // Datos numéricos y coordenadas
      price: new Intl.NumberFormat("es-ES").format(p.price || 0),
      rawPrice: p.price,
      coordinates: [p.longitude || -3.7038, p.latitude || 40.4168],
      m2: Number(p.mBuilt || 0),
      communityFees: p.communityFees || 0,
    };
  })
  .filter(Boolean);


    return { success: true, data: cleanList };
  } catch (error) {
    return { success: false, error: "Error de conexión" };
  }
}

// B. BORRAR DEL STOCK (✅ idempotente + borra favorito por clave compuesta)
export async function deleteFromStockAction(propertyId: string) {
  try {
    const meRes = await getUserMeAction();
    const me = meRes?.data;
    if (!me?.id) return { success: false, error: "UNAUTH" };

    const pid = String(propertyId || "").trim();
    if (!pid) return { success: false, error: "MISSING_PROPERTY_ID" };

    // 1) ¿SOY EL DUEÑO? -> BORRADO TOTAL
    const ownedProp = await prisma.property.findFirst({
      where: { id: pid, userId: me.id },
      select: { id: true },
    });

    if (ownedProp) {
      // ✅ limpieza segura (sin depender de cascade)
      await prisma.image.deleteMany({ where: { propertyId: pid } });
      await prisma.favorite.deleteMany({ where: { propertyId: pid } });
      await prisma.property.delete({ where: { id: pid } });

      revalidatePath("/");
      return { success: true, type: "property_deleted" };
    }

    // 2) NO SOY DUEÑO -> BORRAR SOLO MI FAVORITO (✅ por clave compuesta)
    const where = {
      userId_propertyId: { userId: me.id, propertyId: pid },
    };

    const existing = await prisma.favorite.findUnique({ where });
    if (!existing) {
      // ✅ idempotente: si ya no existe, no “falla”
      return { success: true, type: "favorite_noop" };
    }

    await prisma.favorite.delete({ where });

    revalidatePath("/");
    return { success: true, type: "favorite_removed" };
  } catch (e: any) {
    console.error("deleteFromStockAction error:", e);
    return { success: false, error: String(e?.message || e) };
  }
}

// --- AÑADIR AL FINAL DE actions.ts ---

// B. MIS PROPIEDADES (PERFIL) - Recuperada
export async function getPropertiesAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, data: [] };

    const properties = await prisma.property.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
        // ✅ CLAVE: identidad “viva” del owner (tú) para avatar/cover cross-device
        user: { select: USER_IDENTITY_SELECT },
      },
    });

    const mappedProps = properties.map((p: any) => {
      // Gestión de imagen principal
      const realImg =
        (p.images && p.images.length > 0) ? p.images[0].url : p.mainImage;

      let allImages = (p.images || []).map((img: any) => img.url);
      if (allImages.length === 0 && realImg) allImages = [realImg];

      // ✅ Identidad unificada (igual que global)
      const identity = buildIdentity(p.user, p.ownerSnapshot);

      // ✅ ownerSnapshot siempre disponible (para legacy sin snapshot)
      const safeOwnerSnapshot =
        (p.ownerSnapshot && typeof p.ownerSnapshot === "object") ? p.ownerSnapshot : identity;

      return {
        ...p,
        id: p.id,

        // ✅ CLAVE: ahora DetailsPanel SIEMPRE tendrá avatar/cover
        ownerSnapshot: safeOwnerSnapshot,
        user: identity,

        coordinates: [p.longitude || -3.7038, p.latitude || 40.4168],
        images: allImages,
        img: realImg || null,
        price: new Intl.NumberFormat("es-ES").format(p.price || 0),
        rawPrice: p.price,

        // Datos normalizados
        m2: Number(p.mBuilt || 0),
        mBuilt: Number(p.mBuilt || 0),
        communityFees: p.communityFees || 0,

        // Booleanos seguros
        pool: !!p.pool,
        garage: !!p.garage,
        elevator: !!p.elevator,
      };
    });

    return { success: true, data: mappedProps };
  } catch (error) {
    console.error("Error getPropertiesAction:", error);
    return { success: false, data: [] };
  }
}


// ✅ CHAT GENERAL — ACTIONS (server)

// helper: saca “el otro usuario” de participants
const pickOtherUser = (participants: any[], meId: string) => {
  const list = Array.isArray(participants) ? participants : [];
  const other = list
    .map((p: any) => p?.user)
    .find((u: any) => u?.id && String(u.id) !== String(meId));
  return other || null;
};

// helper: normaliza conversación -> thread listo para tu UI
const normalizeThread = (conv: any, meId: string) => {
  const last = Array.isArray(conv?.messages) && conv.messages.length ? conv.messages[0] : null;
  const otherUser = pickOtherUser(conv?.participants, meId);
  const prop = conv?.property || null;

  const lastMessageAt = last?.createdAt ? new Date(last.createdAt).getTime() : 0;

  const myPart = Array.isArray(conv?.participants)
    ? conv.participants.find((p: any) => String(p?.userId) === String(meId))
    : null;

  const myLastReadAt = myPart?.lastReadAt ? new Date(myPart.lastReadAt).getTime() : 0;

  // ✅ unread REAL: último msg > mi lastReadAt (y que no sea mi propio msg)
  const unread = lastMessageAt > myLastReadAt && String(last?.senderId || "") !== String(meId);

  const refCode = prop?.refCode || null;
  const propertyTitle = prop?.title || null;

  const otherName =
    otherUser?.companyName ||
    [otherUser?.name, otherUser?.surname].filter(Boolean).join(" ") ||
    otherUser?.email ||
    null;

  const titleParts: string[] = [];
  if (refCode) titleParts.push(refCode);
  else if (propertyTitle) titleParts.push(propertyTitle);
  if (otherName) titleParts.push(otherName);

  const title = titleParts.join(" — ") || "Conversación";

  return {
    ...conv,
    lastMessage: last,
    otherUser,
    otherUserId: otherUser?.id || null,
    refCode,
    propertyTitle,
    title,

    // ✅ server truth para badges
    myLastReadAt,
    lastMessageAt,
    unread,
  };
};


export async function getOrCreateConversationAction(a: any, b?: any) {
  try {
    const meRes = await getUserMeAction();
    const me = meRes?.data;
    if (!me?.id) return { success: false, error: "UNAUTH" };

    // ✅ acepta varias firmas:
    // 1) ({ otherUserId, propertyId? })
    // 2) ({ toUserId, propertyId? })
    // 3) (propertyId, otherUserId)
    let otherUserId = "";
    let propertyId: string | null = null;

    if (a && typeof a === "object") {
      otherUserId = String(a.otherUserId || a.toUserId || a.userId || "");
      propertyId = a.propertyId ? String(a.propertyId) : null;
    } else {
      propertyId = a ? String(a) : null;
      otherUserId = b ? String(b) : "";
    }

    if (!otherUserId) return { success: false, error: "MISSING_OTHER_USER" };

    const includeBase = {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              role: true,
              name: true,
              surname: true,
              email: true,
              avatar: true,
              companyName: true,
              companyLogo: true,
              coverImage: true,
            },
          },
        },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    } as const;

    const existing = await prisma.conversation.findFirst({
      where: {
        ...(propertyId ? { propertyId } : {}),
        AND: [
          { participants: { some: { userId: me.id } } },
          { participants: { some: { userId: otherUserId } } },
          { participants: { every: { userId: { in: [me.id, otherUserId] } } } },
        ],
      },
      include: includeBase,
    });

    if (existing) {
      const pid = existing?.propertyId ? String(existing.propertyId) : null;
      const prop = pid
        ? await prisma.property.findUnique({
            where: { id: pid },
            select: { id: true, title: true, refCode: true },
          })
        : null;

      return {
        success: true,
        data: normalizeThread({ ...(existing as any), property: prop } as any, me.id),
      };
    }

    const created = await prisma.$transaction(async (tx: any) => {
      const conv = await tx.conversation.create({
        data: { ...(propertyId ? { propertyId } : {}) },
      });

      await tx.conversationParticipant.createMany({
        data: [
          { conversationId: conv.id, userId: me.id },
          { conversationId: conv.id, userId: otherUserId },
        ],
        skipDuplicates: true,
      });

      return tx.conversation.findUnique({
        where: { id: conv.id },
        include: includeBase as any,
      });
    });

    const pid = (created as any)?.propertyId ? String((created as any).propertyId) : null;
    const prop = pid
      ? await prisma.property.findUnique({
          where: { id: pid },
          select: { id: true, title: true, refCode: true },
        })
      : null;

    return {
      success: true,
      data: normalizeThread({ ...(created as any), property: prop } as any, me.id),
    };
  } catch (e: any) {
    return { success: false, error: String(e?.message || e) };
  }
}

export async function getMyConversationsAction() {
  try {
    const meRes = await getUserMeAction();
    const me = meRes?.data;
    if (!me?.id) return { success: false, error: "UNAUTH" };

    const items = await prisma.conversation.findMany({
      where: { participants: { some: { userId: me.id } } },
      orderBy: { updatedAt: "desc" },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                role: true,
                name: true,
                surname: true,
                email: true,
                avatar: true,
                companyName: true,
                companyLogo: true,
                coverImage: true,
              },
            },
          },
        },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    const propIds = Array.from(
      new Set(
        (items || [])
          .map((c: any) => c?.propertyId)
          .filter(Boolean)
          .map(String)
      )
    );

    const props = propIds.length
      ? await prisma.property.findMany({
          where: { id: { in: propIds } },
          select: { id: true, title: true, refCode: true },
        })
      : [];

    const propMap = new Map(props.map((p: any) => [String(p.id), p]));

    const normalized = (items || []).map((c: any) => {
      const pid = c?.propertyId ? String(c.propertyId) : null;
      const prop = pid ? propMap.get(pid) : null;

      // ✅ compat: algunos frontends miran t.lastMessage directamente
      const lastMessage =
        Array.isArray(c?.messages) && c.messages.length > 0 ? c.messages[0] : null;

      return normalizeThread(
        { ...(c as any), property: prop, lastMessage } as any,
        me.id
      );
    });

    normalized.sort((a: any, b: any) => {
      const ta = a?.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const tb = b?.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return tb - ta;
    });

    return { success: true, data: normalized };
  } catch (e: any) {
    return { success: false, error: String(e?.message || e) };
  }
}

export async function getConversationMessagesAction(conversationId: string) {
  try {
    const meRes = await getUserMeAction();
    const me = meRes?.data;
    if (!me?.id) return { success: false, error: "UNAUTH" };

    const cid = String(conversationId || "");
    if (!cid) return { success: false, error: "MISSING_CONVERSATION_ID" };

    const allowed = await prisma.conversationParticipant.findFirst({
      where: { conversationId: cid, userId: me.id },
      select: { id: true },
    });
    if (!allowed) return { success: false, error: "FORBIDDEN" };

    const msgs = await prisma.message.findMany({
      where: { conversationId: cid },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            role: true,
            name: true,
            surname: true,
            avatar: true,
            companyName: true,
            companyLogo: true,
          },
        },
      },
    });

    // ✅ compat: añadimos `content` SIN leer msg.content (no existe en Prisma)
    const normalized = (msgs || []).map((m: any) => ({
      ...m,
      content: m?.text ?? "",
      text: m?.text ?? "",
    }));

    return { success: true, data: normalized };
  } catch (e: any) {
    return { success: false, error: String(e?.message || e) };
  }
}
// ✅ CHAT: marcar conversación como leída (persistente multi-dispositivo)
export async function markConversationReadAction(conversationId: string) {
  try {
    const meRes = await getUserMeAction();
    const me = meRes?.data;
    if (!me?.id) return { success: false, error: "UNAUTH" };

    const cid = String(conversationId || "").trim();
    if (!cid) return { success: false, error: "MISSING_CONVERSATION_ID" };

    // ✅ solo si soy participante
    await prisma.conversationParticipant.updateMany({
      where: { conversationId: cid, userId: me.id },
      data: { lastReadAt: new Date() },
    });

    return { success: true };
  } catch (e: any) {
    console.error("markConversationReadAction error:", e);
    return { success: false, error: String(e?.message || e) };
  }
}


export async function sendMessageAction(a: any, b?: any) {
  try {
    const meRes = await getUserMeAction();
    const me = meRes?.data;
    if (!me?.id) return { success: false, error: "UNAUTH" };

    // ✅ acepta:
    // 1) ({ conversationId, text })
    // 2) ({ conversationId, content })
    // 3) (conversationId, text)
    let conversationId = "";
    let text = "";

    if (typeof a === "string") {
      conversationId = String(a || "");
      text = String(b || "").trim();
    } else {
      // ✅ compat extra: si te pasan { id } en vez de { conversationId }
      conversationId = String(a?.conversationId || a?.id || "");
      text = String(a?.text ?? a?.content ?? "").trim();
    }

    if (!conversationId) return { success: false, error: "MISSING_CONVERSATION_ID" };
    if (!text) return { success: false, error: "EMPTY_TEXT" };

    const allowed = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: me.id },
      select: { id: true },
    });
    if (!allowed) return { success: false, error: "FORBIDDEN" };

    const msg: any = await prisma.message.create({
      data: {
        conversationId,
        senderId: me.id,
        text,
      },
      include: {
        sender: {
          select: {
            id: true,
            role: true,
            name: true,
            surname: true,
            avatar: true,
            companyName: true,
            companyLogo: true,
          },
        },
      },
    });

    // ✅ opcional pero MUY útil: fuerza “updatedAt” para ordenar hilos
    try {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() } as any,
      });
    } catch {}

    return {
      success: true,
      data: {
        ...msg,
        content: msg?.text ?? text,
        text: msg?.text ?? text,
      },
    };
  } catch (e: any) {
    return { success: false, error: String(e?.message || e) };
  }
}
// =========================================================
// 🚫 CHAT MODERATION (bloquear + borrar conversación)
// =========================================================

// ✅ BLOQUEAR usuario (persistente)
export async function blockUserAction(otherUserId: string) {
  try {
    const meRes = await getUserMeAction();
    const me = meRes?.data;
    if (!me?.id) return { success: false, error: "UNAUTH" };

    const oid = String(otherUserId || "").trim();
    if (!oid) return { success: false, error: "MISSING_OTHER_USER" };
    if (String(oid) === String(me.id)) return { success: false, error: "CANNOT_BLOCK_SELF" };

    await prisma.userBlock.upsert({
      where: { blockerId_blockedId: { blockerId: me.id, blockedId: oid } },
      update: {},
      create: { blockerId: me.id, blockedId: oid },
    });

    revalidatePath("/");
    return { success: true, blocked: true, otherUserId: oid };
  } catch (e: any) {
    console.error("blockUserAction error:", e);
    return { success: false, error: String(e?.message || e) };
  }
}


// ✅ BORRAR conversación (solo si eres participante)
export async function deleteConversationAction(conversationId: string) {
  try {
    const meRes = await getUserMeAction();
    const me = meRes?.data;
    if (!me?.id) return { success: false, error: "UNAUTH" };

    const cid = String(conversationId || "").trim();
    if (!cid) return { success: false, error: "MISSING_CONVERSATION_ID" };

    const allowed = await prisma.conversationParticipant.findFirst({
      where: { conversationId: cid, userId: me.id },
      select: { id: true },
    });
    if (!allowed) return { success: false, error: "FORBIDDEN" };

    // ✅ borramos mensajes + participantes + conversación
    await prisma.message.deleteMany({ where: { conversationId: cid } });
    await prisma.conversationParticipant.deleteMany({ where: { conversationId: cid } });
    await prisma.conversation.delete({ where: { id: cid } });

    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    console.error("deleteConversationAction error:", e);
    return { success: false, error: String(e?.message || e) };
  }
}
// =========================================================
// 📡 RADAR/COMMS SaaS — Campaigns + límites de Plan (sin localStorage)
// =========================================================

// ✅ TRIAL: activar 15 días sin Paddle (server truth)
export async function startTrialAction(plan: "PRO" | "AGENCY") {
  try {
    const me = await getCurrentUser();
    if (!me?.id) return { success: false, error: "UNAUTH" };

    // Seguridad mínima: Agency trial solo para cuentas AGENCIA
    if (plan === "AGENCY" && me.role !== "AGENCIA") {
      return { success: false, error: "ONLY_AGENCY_CAN_START_AGENCY_TRIAL" };
    }

    const now = new Date();
    const end = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 días

    const sub = await prisma.subscription.upsert({
      where: { userId: me.id },
      update: {
        plan: plan as any,
        status: "TRIAL",
        currentPeriodStart: now,
        currentPeriodEnd: end,
        provider: null,
        providerSubId: null,
      },
      create: {
        userId: me.id,
        plan: plan as any,
        status: "TRIAL",
        currentPeriodStart: now,
        currentPeriodEnd: end,
        provider: null,
        providerSubId: null,
      },
    });

    revalidatePath("/");
    return { success: true, data: sub };
  } catch (e: any) {
    console.error("startTrialAction error:", e);
    return { success: false, error: String(e?.message || e) };
  }
}

const getPeriodKey = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mm}`; // "2026-01"
};

const getMyPlanInternal = async (userId: string) => {
  // 1) Si existe Subscription, manda ella (incluye TRIAL)
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true, currentPeriodEnd: true },
  });

  if (sub?.plan) {
   if (String(sub.status || "").toUpperCase() === "TRIAL" && sub.currentPeriodEnd) {
  const end = new Date(sub.currentPeriodEnd).getTime();

  // TRIAL activo
  if (Date.now() <= end) {
    return { plan: sub.plan as any, status: "TRIAL" };
  }

  // TRIAL expirado → el plan SE MANTIENE
  return { plan: sub.plan as any, status: "EXPIRED" };
}


    // ✅ Activo / otros estados: devolvemos tal cual
    return { plan: sub.plan as any, status: sub.status || "ACTIVE" };
  }

 // 2) Fallback legacy (NO decide SaaS AGENCIA)
const u = await prisma.user.findUnique({
  where: { id: userId },
  select: { licenseType: true },
});

const lt = String(u?.licenseType || "").toUpperCase().trim();

// ✅ Solo mantenemos PRO como compatibilidad legacy
// ❌ NO AGENCY aquí (la agencia se decide por role + subscription)
const plan = lt === "PRO" ? "PRO" : "STARTER";

return { plan: plan as any, status: "ACTIVE" };

};

// ✅ PASO 1.5 — Gate SaaS definitivo (sin Mollie aún)
export async function getBillingGateAction() {
  try {
    const me = await getCurrentUser();
    if (!me?.id) return { success: false, error: "UNAUTH" };

    const isAgency = me.role === "AGENCIA";

    // 🔹 leemos subscription una sola vez
    let sub = await prisma.subscription.findUnique({
      where: { userId: me.id },
    });

    const now = Date.now();

    // 🔹 AUTO-TRIAL si es AGENCIA y no existe subscription
    if (isAgency && !sub) {
      const start = new Date();
      const end = new Date(start.getTime() + 15 * 24 * 60 * 60 * 1000);

      sub = await prisma.subscription.create({
        data: {
          userId: me.id,
          plan: "AGENCY",
          status: "TRIAL",
          currentPeriodStart: start,
          currentPeriodEnd: end,
        },
      });
    }

    // 🔹 si no es agencia y no hay sub → nunca hay paywall
    if (!isAgency) {
      return {
        success: true,
        data: {
          plan: "STARTER",
          status: "ACTIVE",
          showPaywall: false,
          trialEndsAt: null,
        },
      };
    }
// 🔹 cálculo de estados (server truth)
const endMs = sub?.currentPeriodEnd
  ? new Date(sub.currentPeriodEnd).getTime()
  : null;

const baseStatus = String(sub?.status || "ACTIVE").toUpperCase();
let status = baseStatus;
let showPaywall = false;

// Si está ACTIVE, nunca hay paywall
if (baseStatus === "ACTIVE") {
  status = "ACTIVE";
  showPaywall = false;
} else {
  // Si no tenemos endMs, por seguridad bloqueamos
  if (!endMs) {
    status = "BLOCKED";
    showPaywall = true;
  } else if (now <= endMs) {
    status = "TRIAL";
    showPaywall = false;
  } else if (now <= endMs + 24 * 60 * 60 * 1000) {
    status = "GRACE";
    showPaywall = false;
  } else {
    status = "BLOCKED";
    showPaywall = true;
  }
}


    return {
      success: true,
      data: {
        plan: sub?.plan || "AGENCY",
        status,
        showPaywall,
        trialEndsAt: sub?.currentPeriodEnd
          ? new Date(sub.currentPeriodEnd).toISOString()
          : null,
      },
    };
  } catch (e: any) {
    return { success: false, error: String(e?.message || e) };
  }
}


const getUsageInternal = async (userId: string, period: string) => {
  const usage = await prisma.planUsage.findUnique({
    where: { userId_period: { userId, period } },
    select: { campaignsSent: true },
  });
  return { campaignsSent: usage?.campaignsSent ?? 0 };
};

// ✅ Para pintar “procesado” en la lista (server truth)
export async function getMyAgencyCampaignPropertyIdsAction() {
  try {
    const me = await getCurrentUser();
    if (!me?.id) return { success: false, data: [] as string[] };

    const items = await prisma.campaign.findMany({
      where: { agencyId: me.id },
      select: { propertyId: true },
    });

    const ids = Array.from(
      new Set((items || []).map((c: any) => String(c.propertyId)))
    );

    return { success: true, data: ids };
  } catch (e: any) {
    return { success: false, data: [], error: String(e?.message || e) };
  }
}

// ✅ Obtener mi campaña (si existe) para una propiedad
export async function getCampaignByPropertyAction(propertyId: string) {
  try {
    const me = await getCurrentUser();
    if (!me?.id) return { success: false, data: null as any, error: "UNAUTH" };

    const pid = String(propertyId || "").trim();
    if (!pid) return { success: false, data: null, error: "MISSING_PROPERTY_ID" };

    const campaign = await prisma.campaign.findUnique({
      where: { propertyId_agencyId: { propertyId: pid, agencyId: me.id } },
    });

    return { success: true, data: campaign };
  } catch (e: any) {
    return { success: false, data: null, error: String(e?.message || e) };
  }
}

// ✅ ENVIAR PROPUESTA (crea/actualiza Campaign + conversa + usage)
// Nota: en tu UI lo llamabas “aceptarEncargo”, pero esto es “enviar propuesta”.
export async function sendCampaignAction(input: {
  propertyId: string;
  message?: string;
  serviceIds?: string[];
  status?: string; // "SENT" | "ACCEPTED" | "DRAFT" etc

  // ✅ Términos de propuesta (persisten en BD)
  priceAtProposal?: number;
  commissionPct?: number;
  commissionIvaPct?: number;

  commissionSharePct?: number;
  commissionShareVisibility?: "PRIVATE" | "AGENCIES" | "PUBLIC";

  exclusiveMandate?: boolean;
  exclusiveMonths?: number;
}) {
  try {
    const me = await getCurrentUser();
    if (!me?.id) return { success: false, error: "UNAUTH" };

    const pid = String(input?.propertyId || "").trim();
    if (!pid) return { success: false, error: "MISSING_PROPERTY_ID" };

    const message = String(input?.message || "").trim();
    const serviceIds = Array.isArray(input?.serviceIds)
      ? input!.serviceIds!.map((s) => String(s).trim()).filter(Boolean)
      : [];

    // 1) Plan + límites
const period = getPeriodKey();
const { plan, status } = await getMyPlanInternal(me.id);

// ✅ seguridad: solo AGENCIA puede enviar campañas
if (String(me.role || "").toUpperCase() !== "AGENCIA") {
  return {
    success: false,
    error: "ONLY_AGENCY",
    debug: { plan, status, userId: me.id },
  };
}

// ✅ trial expirado (o cualquier estado que quieras tratar como bloqueo)
if (String(status || "").toUpperCase() === "EXPIRED") {
  return {
    success: false,
    error: "TRIAL_EXPIRED",
    debug: { plan, status, userId: me.id },
  };
}

// ✅ STARTER no puede enviar campañas
if (String(plan || "").toUpperCase() === "STARTER") {
  return {
    success: false,
    error: "PLAN_NOT_ALLOWED",
    debug: { plan, status, userId: me.id },
  };
}


    // ✅ Traemos existing con términos para poder hacer fallback si input no los manda
    const existing = await prisma.campaign.findUnique({
      where: { propertyId_agencyId: { propertyId: pid, agencyId: me.id } },
      select: {
        id: true,
        status: true,
        conversationId: true,

        // términos existentes (fallback)
        priceAtProposal: true,
        commissionPct: true,
        commissionIvaPct: true,
        commissionSharePct: true,
        commissionShareVisibility: true,
        exclusiveMandate: true,
        exclusiveMonths: true,
      },
    });

    const isFirstSend = !existing || String(existing.status || "") === "DRAFT";

    if (plan === "PRO" && isFirstSend) {
      const usage = await getUsageInternal(me.id, period);
      const limit = 5;
      if ((usage.campaignsSent || 0) >= limit) {
        return { success: false, error: "PLAN_LIMIT_REACHED" };
      }
    }

    // 2) Propiedad -> dueño para abrir conversación
    const prop = await prisma.property.findUnique({
      where: { id: pid },
      select: { id: true, userId: true, refCode: true, title: true, price: true },
    });

    let conversationId: string | null = existing?.conversationId || null;

    if (prop?.userId) {
      const convRes: any = await getOrCreateConversationAction({
        toUserId: prop.userId,
        propertyId: pid,
      });

      if (convRes?.success && convRes?.data?.id) {
        conversationId = convRes.data.id;

        // Guardamos propertyRef si quieres (campo existe en Conversation)
        try {
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { propertyRef: prop.refCode || null } as any,
          });
        } catch {}
      }
    }

    // 2.2 Status controlado
    const rawStatus = String(input?.status || "SENT").toUpperCase().trim();
    const desiredStatus = (["SENT", "ACCEPTED", "DRAFT"].includes(rawStatus)
      ? rawStatus
      : "SENT") as any;

    // ✅ Helpers
    const safeNum = (v: any, def = 0) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : def;
    };
    const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
    const clampInt = (v: any, def: number, min: number, max: number) => {
      const n = Math.round(safeNum(v, def));
      return clamp(n, min, max);
    };

    // ✅ Server truth: términos (input -> existing -> fallback)
    const priceAtProposal = clamp(
      input?.priceAtProposal !== undefined
        ? safeNum(input.priceAtProposal, 0)
        : (existing?.priceAtProposal ?? safeNum(prop?.price, 0)),
      0,
      1e12
    );

    const commissionPct = clamp(
      input?.commissionPct !== undefined ? safeNum(input.commissionPct, 0) : (existing?.commissionPct ?? 0),
      0,
      100
    );

    const commissionIvaPct = clamp(
      input?.commissionIvaPct !== undefined ? safeNum(input.commissionIvaPct, 0) : (existing?.commissionIvaPct ?? 0),
      0,
      100
    );

    const commissionSharePct = clamp(
      input?.commissionSharePct !== undefined
        ? safeNum(input.commissionSharePct, 0)
        : (existing?.commissionSharePct ?? 0),
      0,
      100
    );

    const visRaw = String(
      input?.commissionShareVisibility ??
        existing?.commissionShareVisibility ??
        "AGENCIES"
    ).toUpperCase().trim();

    const commissionShareVisibility = (["PRIVATE", "AGENCIES", "PUBLIC"].includes(visRaw)
      ? visRaw
      : "AGENCIES") as any;

    const exclusiveMandate =
      typeof input?.exclusiveMandate === "boolean"
        ? input.exclusiveMandate
        : (existing?.exclusiveMandate ?? true);

    const exclusiveMonths =
      input?.exclusiveMonths !== undefined
        ? clampInt(input.exclusiveMonths, 6, 0, 60)
        : (existing?.exclusiveMonths ?? 6);

    // ✅ Importes snapshot (server truth)
    const commissionBaseEur = priceAtProposal * (commissionPct / 100);
    const commissionIvaEur = commissionBaseEur * (commissionIvaPct / 100);
    const commissionTotalEur = commissionBaseEur + commissionIvaEur;

    // Share sobre TOTAL (base+iva). Si prefieres share sobre base, cambia aquí.
    const commissionShareEur = commissionTotalEur * (commissionSharePct / 100);

    // 3) Upsert Campaign (SENT/ACCEPTED/DRAFT) + términos + snapshot €
    const campaign = await prisma.campaign.upsert({
      where: { propertyId_agencyId: { propertyId: pid, agencyId: me.id } },
      update: {
        status: desiredStatus,
        message: message || null,
        serviceIds,
        conversationId,

        // ✅ términos + snapshot €
        priceAtProposal,
        commissionPct,
        commissionIvaPct,
        commissionSharePct,
        commissionShareVisibility,
        exclusiveMandate,
        exclusiveMonths,
        commissionBaseEur,
        commissionIvaEur,
        commissionTotalEur,
        commissionShareEur,
      },
      create: {
        propertyId: pid,
        agencyId: me.id,
        status: desiredStatus,
        message: message || null,
        serviceIds,
        conversationId,

        // ✅ términos + snapshot €
        priceAtProposal,
        commissionPct,
        commissionIvaPct,
        commissionSharePct,
        commissionShareVisibility,
        exclusiveMandate,
        exclusiveMonths,
        commissionBaseEur,
        commissionIvaEur,
        commissionTotalEur,
        commissionShareEur,
      },
    });

    // 4) Increment usage SOLO si era primer envío (tu lógica actual)
    if (isFirstSend && plan === "PRO") {
      await prisma.planUsage.upsert({
        where: { userId_period: { userId: me.id, period } },
        update: { campaignsSent: { increment: 1 } },
        create: { userId: me.id, period, campaignsSent: 1 },
      });
    }

    // 5) Mensaje automático: solo si es primer envío o si el usuario escribió message
    if (conversationId && (isFirstSend || !!message)) {
      const txt =
        message ||
        `Propuesta enviada para ${prop?.refCode || "la propiedad"} (${serviceIds.length} servicios).`;

      await prisma.message.create({
        data: { conversationId, senderId: me.id, text: txt },
      });

      try {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() } as any,
        });
      } catch {}
    }

    return {
      success: true,
      data: { campaign, conversationId, property: prop || null },
    };
  } catch (e: any) {
    return { success: false, error: String(e?.message || e) };
  }
}

// ✅ (Para cuando implementes el lado propietario)
// Aceptar campaña = asignación + tasks + status ACCEPTED
export async function acceptCampaignByOwnerAction(campaignId: string) {
  try {
    const me = await getCurrentUser();
    if (!me?.id) return { success: false, error: "UNAUTH" };

    const cid = String(campaignId || "").trim();
    if (!cid) return { success: false, error: "MISSING_CAMPAIGN_ID" };

    const campaign = await prisma.campaign.findUnique({
      where: { id: cid },
      include: { property: { select: { id: true, userId: true } } },
    });

    if (!campaign) return { success: false, error: "NOT_FOUND" };
    if (String(campaign.property?.userId || "") !== String(me.id)) {
      return { success: false, error: "FORBIDDEN" };
    }

    const updated = await prisma.campaign.update({
      where: { id: cid },
      data: { status: "ACCEPTED" as any },
    });

    // Assignment (1 por property)
    await prisma.propertyAssignment.upsert({
      where: { propertyId: campaign.propertyId },
      update: {
        agencyId: campaign.agencyId,
        campaignId: campaign.id,
        status: "ACTIVE",
      },
      create: {
        propertyId: campaign.propertyId,
        agencyId: campaign.agencyId,
        campaignId: campaign.id,
        status: "ACTIVE",
      },
    });

    // Tasks desde serviceIds (type = serviceId)
    const sids = Array.isArray(campaign.serviceIds) ? campaign.serviceIds : [];
    if (sids.length) {
      // limpiamos tareas previas del campaign por seguridad
      await prisma.task.deleteMany({ where: { campaignId: campaign.id } });

      await prisma.task.createMany({
        data: sids.map((sid: string) => ({
          propertyId: campaign.propertyId,
          agencyId: campaign.agencyId,
          campaignId: campaign.id,
          type: sid,
          status: "TODO",
        })),
      });
    }

    return { success: true, data: updated };
  } catch (e: any) {
    return { success: false, error: String(e?.message || e) };
  }
}
export async function getOwnerProposalsAction() {
  "use server";
  try {
    // ✅ usamos tu action existente para identidad (ya la tienes en actions.ts)
    const meRes: any = await (getUserMeAction as any)();
    const me = meRes?.data;
    if (!me?.id) return { success: false, error: "NOT_AUTH" };

const prismaAny: any = prisma;

    // 1) IDs de mis propiedades (propietario)
    const myProps = await prismaAny.property.findMany({
where: { userId: String(me.id) },
      select: { id: true },
    });
    const myPropIds = (Array.isArray(myProps) ? myProps : []).map((p: any) => String(p.id));

    if (!myPropIds.length) return { success: true, data: [] };

    // 2) Campaigns para mis propiedades
    const campaigns = await prismaAny.campaign.findMany({
      where: { propertyId: { in: myPropIds } },
      orderBy: { createdAt: "desc" },
    });

    // 3) Enriquecemos: property + agency user (marca)
    const agencyIds = Array.from(
      new Set(
        (Array.isArray(campaigns) ? campaigns : [])
          .map((c: any) => c?.agencyId || c?.agencyUserId)
          .filter(Boolean)
          .map((x: any) => String(x))
      )
    );

   const props = await prismaAny.property.findMany({
  where: { id: { in: myPropIds } },
  select: {
    id: true,
    title: true,
    refCode: true,
    mainImage: true,
    address: true,
    city: true,
    region: true,
    postcode: true,
    price: true,
    latitude: true,
    longitude: true,
  },
});


    const agencies = agencyIds.length
      ? await prismaAny.user.findMany({
          where: { id: { in: agencyIds } },
          select: {
            id: true,
            name: true,
            avatar: true,
            companyName: true,
            companyLogo: true,
            licenseNumber: true,
            phone: true,
            mobile: true,
            email: true,
            coverImage: true,
            website: true,
          },
        })
      : [];

   const propById = new Map<string, any>((props || []).map((p: any) => [String(p.id), p]));
const agencyById = new Map<string, any>((agencies || []).map((a: any) => [String(a.id), a]));

const data = (Array.isArray(campaigns) ? campaigns : []).map((c: any) => {
  const rawProperty = propById.get(String(c.propertyId)) ?? null;

  // ✅ SOLO permitimos objetos (evita spread sobre unknown / null / string)
  const property: any =
    rawProperty && typeof rawProperty === "object" ? rawProperty : null;

  // ✅ price normalizado (sin rawPrice inventado)
  const priceValue = Number(property?.price ?? 0);
  const priceFormatted = new Intl.NumberFormat("es-ES").format(priceValue);

  const agencyId = String(c?.agencyId || c?.agencyUserId || "");
  const agency = agencyById.get(agencyId) ?? null;

  return {
    id: String(c.id),
    status: c.status || "SENT",
    createdAt: c.createdAt || null,

    message: String(c.message || ""),
    serviceIds: Array.isArray(c.serviceIds) ? c.serviceIds : [],

    commissionPct: Number(c.commissionPct ?? 0),
    commissionIvaPct: Number(c.commissionIvaPct ?? 0),
    commissionSharePct: Number(c.commissionSharePct ?? 0),
    commissionShareVisibility: String(c.commissionShareVisibility || "AGENCIES"),

    exclusiveMandate: Boolean(c.exclusiveMandate ?? true),
    exclusiveMonths: Number(c.exclusiveMonths ?? 6),

    priceAtProposal: Number(c.priceAtProposal ?? priceValue ?? 0),
    commissionBaseEur: Number(c.commissionBaseEur ?? 0),
    commissionIvaEur: Number(c.commissionIvaEur ?? 0),
    commissionTotalEur: Number(c.commissionTotalEur ?? 0),
    commissionShareEur: Number(c.commissionShareEur ?? 0),

    propertyId: String(c.propertyId || ""),
    conversationId: c.conversationId ? String(c.conversationId) : "",

    // ✅ ahora el spread solo ocurre si property es objeto real
    property: property
      ? {
          ...(property as any),
          priceValue,
          priceFormatted,
        }
      : null,

    agency,
    agencyUserId: (agency as any)?.id || agencyId || "",
  };
});



    return { success: true, data };
  } catch (e: any) {
    console.error("getOwnerProposalsAction failed:", e);
    return { success: false, error: e?.message || "FAILED" };
  }
}

export async function respondOwnerProposalAction(input: {
  campaignId: string;
  decision: "ACCEPT" | "REJECT";
  note?: string;
}) {
  "use server";
  try {
    const meRes: any = await (getUserMeAction as any)();
    const me = meRes?.data;
    if (!me?.id) return { success: false, error: "NOT_AUTH" };

    // ✅ usa el prisma importado arriba (ya lo tienes)
    const prismaAny: any = prisma;

    // ✅ tipado fuerte para evitar "unknown"
    const campaign: any = await prismaAny.campaign.findUnique({
      where: { id: String(input.campaignId) },
    });

    if (!campaign?.id) return { success: false, error: "NOT_FOUND" };

    // ✅ seguridad: la campaña debe ser de UNA propiedad cuya userId sea el owner (tú)
    const prop: any = await prismaAny.property.findUnique({
      where: { id: String(campaign.propertyId) },
      select: { userId: true }, // ✅ ANTES tenías ownerId
    });

    if (!prop?.userId || String(prop.userId) !== String(me.id)) {
      return { success: false, error: "FORBIDDEN" };
    }

    const nextStatus = input.decision === "ACCEPT" ? "ACCEPTED" : "REJECTED";

    const updated: any = await prismaAny.campaign.update({
      where: { id: String(input.campaignId) },
      data: {
        status: nextStatus,
        ownerDecisionAt: new Date(),
        ownerNote: input.note || null,
      },
    });

    // ✅ si aceptas, intentamos activar assignment (si existe)
    if (input.decision === "ACCEPT") {
      try {
        await prismaAny.propertyAssignment.upsert({
          where: { propertyId: String(campaign.propertyId) },
          update: {
            status: "ACTIVE",
            agencyId: String(campaign.agencyId || campaign.agencyUserId),
            campaignId: String(campaign.id),
          },
          create: {
            propertyId: String(campaign.propertyId),
            agencyId: String(campaign.agencyId || campaign.agencyUserId),
            campaignId: String(campaign.id),
            status: "ACTIVE",
          },
        });
      } catch (e) {
        console.warn("propertyAssignment upsert skipped:", e);
      }
    }

    // ✅ Mensaje automático al chat (si hay conversación)
    const convId = String(campaign.conversationId || campaign.chatConversationId || "");
    if (convId) {
      try {
        const msg =
          input.decision === "ACCEPT"
            ? "✅ El propietario ha ACEPTADO la propuesta. Podéis coordinar próximos pasos aquí."
            : "❌ El propietario ha RECHAZADO la propuesta. Gracias por la propuesta.";

        const sendFn = sendMessageAction as any;
        if (typeof sendFn === "function") {
          await sendFn({ conversationId: convId, text: msg });
        }
      } catch (e) {
        console.warn("auto chat message skipped:", e);
      }
    }

    return { success: true, data: updated };
  } catch (e: any) {
    console.error("respondOwnerProposalAction failed:", e);
    return { success: false, error: e?.message || "FAILED" };
  }
}
