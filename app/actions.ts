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


// C. GUARDAR PROPIEDAD (ESCRITURA BLINDADA Y CORREGIDA)
export async function savePropertyAction(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Debes iniciar sesión." };

    // Limpieza de Precio
    const cleanPrice = parseFloat(String(data.price).replace(/\D/g, '') || '0');
    
    // 🔥 LIMPIEZA DE M2 "AGRESIVA"
    const rawM2 = data.mBuilt || data.m2 || data.surface || '0';
    const cleanM2 = parseFloat(String(rawM2).replace(/\D/g, '') || '0');
    
        // Servicios
    let finalServices = Array.isArray(data.selectedServices) ? [...data.selectedServices] : [];
    if (!finalServices.some((s: string) => s && String(s).startsWith('pack_'))) finalServices.push('pack_basic');

    // Imágenes
    const imagesList = Array.isArray(data.images) ? data.images : [];
    if (data.mainImage && !imagesList.includes(data.mainImage)) imagesList.unshift(data.mainImage);
    const mainImage = imagesList.length > 0 ? imagesList[0] : null;

    // --- OWNER SNAPSHOT (branding del creador, consistente cross-device) ---
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

    // Construcción del objeto para la BD
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
        pool: Boolean(data.pool) || finalServices.includes('pool'),
        garage: Boolean(data.garage) || finalServices.includes('garage'),
        selectedServices: finalServices,
        
        mainImage: mainImage,
        status: 'PUBLICADO',

        // ---- OWNER SNAPSHOT ----
        ownerSnapshot,

        // MAPEO EXACTO AL ESQUEMA
        communityFees: Number(data.communityFees || 0), 
        energyConsumption: data.energyConsumption || null, 
        energyEmissions: data.energyEmissions || null,     
        energyPending: Boolean(data.energyPending),        
    };

    const imageCreateLogic = { create: imagesList.map((url: string) => ({ url })) };

    
   // ✅ includeOptions (manual, pero completo)
const includeOptions = { 
  images: true,
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

      phone: true,
      mobile: true,
      website: true,
      tagline: true,
      zone: true,

      cif: true,
      licenseNumber: true,
      licenseType: true,
    }
  }
};

let result;


if (data.id && data.id.length > 20) {
  // ✅ EDICIÓN
  const existing = await prisma.property.findUnique({ where: { id: data.id } });

  // ✅ IMPORTANTÍSIMO: en UPDATE NO debemos tocar ownerSnapshot
  const { ownerSnapshot: _dontTouch, ...payloadNoSnap } = payload as any;

  if (existing && existing.userId === user.id) {
    await prisma.image.deleteMany({ where: { propertyId: data.id } });

    result = await prisma.property.update({
      where: { id: data.id },
      data: {
        ...payloadNoSnap,     // ✅ aquí SIN ownerSnapshot
        images: imageCreateLogic,
      },
      include: includeOptions,
    });
  } else {
    // ✅ Si el ID es raro o no es tuyo -> lo tratamos como CREACIÓN (con anti-duplicado)
    const recent = await prisma.property.findFirst({
      where: {
        userId: user.id,
        address: payload.address,
        createdAt: { gte: new Date(Date.now() - 10_000) }, // 10s
      },
      orderBy: { createdAt: "desc" },
      include: includeOptions,
    });

    if (recent) {
      return { success: true, property: recent, deduped: true };
    }

    result = await prisma.property.create({
      data: {
        ...payload,
        ownerSnapshot, // ✅ SOLO en create
        images: imageCreateLogic,
      },
      include: includeOptions,
    });
  }
} else {
  // ✅ CREACIÓN (con anti-duplicado)
  const recent = await prisma.property.findFirst({
    where: {
      userId: user.id,
      address: payload.address,
      createdAt: { gte: new Date(Date.now() - 10_000) }, // 10s
    },
    orderBy: { createdAt: "desc" },
    include: includeOptions,
  });

  if (recent) {
    return { success: true, property: recent, deduped: true };
  }

  result = await prisma.$transaction(async (tx: any) => {
    // 1) CREATE normal (con includes)
    const created = await tx.property.create({
      data: {
        ...(payload as any),
        ownerSnapshot, // ✅ SOLO en create
        images: imageCreateLogic,
      } as any,
      include: includeOptions as any,
    });

    // 2) Si ya tiene refCode, no tocamos nada
    if (created?.refCode) return created;

    // 3) Generamos refCode
    const refCode = buildRefCode();

    // 4) UPDATE solo para refCode
    const updated = await tx.property.update({
      where: { id: created.id },
      data: { refCode } as any,
      include: includeOptions as any,
    });

    return updated;
  });

} // ✅ CIERRA EL else { ... }

revalidatePath("/");
return { success: true, property: result };

} catch (error) {
  console.error("savePropertyAction error:", error);
  return { success: false, error: String(error) };
}
} // ✅ CIERRA savePropertyAction COMPLETA


// D. BORRAR PROPIEDAD (SAFE CLEANUP)
export async function deletePropertyAction(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "No autorizado" };

    const pid = String(id || "").trim();
    if (!pid) return { success: false, error: "MISSING_ID" };

    // ✅ SOLO si la propiedad es tuya (si no, NO borramos imágenes/favoritos de otros)
    const owned = await prisma.property.findFirst({
      where: { id: pid, userId: user.id },
      select: { id: true },
    });

    if (!owned) {
      return { success: false, error: "No tienes permisos sobre esta propiedad." };
    }

    // ✅ limpieza segura (solo tras verificar propiedad)
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
            licenseType: true, // El Pack (Starter, Pro...)
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

    // Buscamos las propiedades donde el userId coincida con el usuario actual
    const properties = await prisma.property.findMany({
      where: { userId: user.id }, 
      orderBy: { createdAt: 'desc' },
      include: { images: true } 
    });

    const mappedProps = properties.map((p: any) => {
        // Gestión de imagen principal
        const realImg = (p.images && p.images.length > 0) ? p.images[0].url : p.mainImage;
        let allImages = (p.images || []).map((img: any) => img.url);
        if (allImages.length === 0 && realImg) allImages = [realImg];

        return {
            ...p,
            id: p.id,
            coordinates: [p.longitude || -3.7038, p.latitude || 40.4168],
            images: allImages,
            img: realImg || null,
            price: new Intl.NumberFormat('es-ES').format(p.price || 0),
            rawPrice: p.price,
            
            // Datos normalizados
            m2: Number(p.mBuilt || 0),
            mBuilt: Number(p.mBuilt || 0),
            communityFees: p.communityFees || 0,
            
            // Booleanos seguros
            pool: !!p.pool,
            garage: !!p.garage,
            elevator: !!p.elevator
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

    // Si no tienes modelo Block, lo guardamos en user.blockedUserIds (JSON) como fallback.
    // ✅ OJO: esto requiere que exista el campo user.blockedUserIds (Json/String). Si no existe, dime y lo adaptamos.
    const user = await prisma.user.findUnique({ where: { id: me.id }, select: { id: true, blockedUserIds: true } as any });
    const current = Array.isArray((user as any)?.blockedUserIds) ? (user as any).blockedUserIds : [];

    const next = Array.from(new Set([...current.map(String), String(oid)]));

    await prisma.user.update({
      where: { id: me.id },
      data: { blockedUserIds: next } as any,
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
