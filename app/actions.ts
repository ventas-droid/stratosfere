"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from './lib/prisma'; 
import { cookies } from "next/headers";
import { Resend } from 'resend';
import { buildStratosfereEmailHtml } from "@/app/utils/email-template"; // Ajuste la ruta si es necesario
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
// 🔐 1. IDENTIFICACIÓN Y SESIÓN (CON RADAR ACTIVADO)
// =========================================================

async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionEmail = cookieStore.get('stratos_session_email')?.value;

  if (!sessionEmail) return null;

  try {
    // 📡 RADAR: Detectamos movimiento y actualizamos la hora
    // Esto hace que el punto verde del Admin funcione
    await prisma.user.update({
        where: { email: sessionEmail },
        data: { 
            lastLoginAt: new Date(),
            loginCount: { increment: 1 } 
        }
    });

    // Buscamos al usuario para devolverlo
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
// 🌍 2. PROPIEDADES (GLOBALES) - CON TRANSMUTACIÓN DE IDENTIDAD
// =========================================================
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

        // 1. Dueño Original (Particular)
        user: { select: USER_IDENTITY_SELECT },

        // 🔥 2. TRANSMUTACIÓN: Buscamos si hay un contrato activo con Agencia
        assignment: {
            where: { status: "ACTIVE" },
            include: {
                agency: { select: USER_IDENTITY_SELECT } // Datos de la Agencia
            }
        },

        // 3. Eventos
        openHouses: {
            where: { status: "SCHEDULED" },
            orderBy: { startTime: 'asc' },
            take: 1
        }
      },
    });

   const mappedProps = (properties || []).map((p: any) => {
      // --- LÓGICA DE IMÁGENES ---
      const allImages = (p.images || []).map((img: any) => img?.url).filter(Boolean);
      const realImg = allImages?.[0] || p.mainImage || null;
      const imagesFinal = allImages.length > 0 ? allImages : (realImg ? [realImg] : []);

      // --- FAVORITOS ---
      const isFavoritedByMe = currentUserId
        ? (p.favoritedBy || []).some((fav: any) => fav?.userId === currentUserId)
        : false;

      // 🔥🔥🔥 OPERACIÓN TRANSMUTACIÓN 🔥🔥🔥
      // Por defecto, la identidad es la del dueño registral (User)
      let finalIdentity = buildIdentity(p.user, p.ownerSnapshot);
      let realTier = p.promotedTier || "FREE";
      
      // PERO, si hay un 'assignment' activo, la Agencia suplanta la identidad visual
      if (p.assignment?.agency) {
          // Construimos identidad con los datos de la Agencia
          finalIdentity = buildIdentity(p.assignment.agency, null);
          // Forzamos el rol para que los botones digan "Contactar Agente"
          finalIdentity.role = 'AGENCIA'; 
          // Si la agencia es PRO, la casa parece PREMIUM (opcional, táctica de venta)
          if (p.assignment.agency.licenseType === 'PRO') realTier = 'PREMIUM';
      }
      // -------------------------------------

      // --- COORDENADAS ---
      const lng = p.longitude ?? -3.7038;
      const lat = p.latitude ?? 40.4168;

      // --- PRECIO ---
      const rawPrice = Number(p.price || 0);
      const priceFormatted = new Intl.NumberFormat("es-ES").format(rawPrice);

      // --- ESTADO PREMIUM (CENTINELA DE TIEMPO) ---
      const now = new Date();
      const expiryDate = p.promotedUntil ? new Date(p.promotedUntil) : null;
      const isExpired = expiryDate && expiryDate < now;
      if (isExpired) realTier = "FREE";
      const realIsPromoted = realTier === 'PREMIUM';

      // --- OPEN HOUSE ---
      let openHouseObj = null;
      if (p.openHouses && p.openHouses.length > 0) {
         openHouseObj = { ...p.openHouses[0], enabled: true };
      }

      return {
        ...p,
        id: p.id,
        // DATOS TÁCTICOS
        views: p.views || 0,
        photoViews: p.photoViews || 0,
        shareCount: p.shareCount || 0,
        
        // DATOS PREMIUM
        promotedTier: realTier,
        isPromoted: realIsPromoted,
        promotedUntil: p.promotedUntil,

        // IDENTIDAD FINAL (Aquí va la Agencia si transmutó)
        // El frontend recibirá esto y pintará Agencia sin dudar.
        user: finalIdentity, 
        ownerSnapshot: p.ownerSnapshot ?? null,
        
        coordinates: [lng, lat],
        longitude: lng,
        latitude: lat,
        images: imagesFinal,
        img: realImg,
        price: priceFormatted,    
        rawPrice,                 
        priceValue: rawPrice,     
        isFavorited: isFavoritedByMe,
        
        // Físicos
        m2: Number(p.mBuilt || 0),
        mBuilt: Number(p.mBuilt || 0),
        communityFees: Number(p.communityFees || 0),
        
        // Energía
        energyConsumption: p.energyConsumption ?? null,
        energyEmissions: p.energyEmissions ?? null,
        energyPending: !!p.energyPending,
        
        // Evento
        openHouse: openHouseObj,        
        open_house_data: openHouseObj   
      };
    });

    return { success: true, data: mappedProps };
  } catch (error) {
    console.error("Error crítico en mapa global:", error);
    return { success: false, data: [] };
  }
}

// ✅ Obtener UNA propiedad completa (VERSION BLINDADA CON TRANSMUTACIÓN)
export async function getPropertyByIdAction(propertyId: string) {
  try {
    const id = String(propertyId || "").trim();
    if (!id) return { success: false, error: "MISSING_PROPERTY_ID" };

    const p: any = await prisma.property.findUnique({
      where: { id },
      include: {
        images: true,
        user: { select: USER_IDENTITY_SELECT }, // Dueño Real
        favoritedBy: { select: { userId: true } },

        // 🔥 TRANSMUTACIÓN: Chequeo de Agencia Gestora
        assignment: {
            where: { status: "ACTIVE" },
            include: {
                agency: { select: USER_IDENTITY_SELECT }
            }
        },

        openHouses: {
            where: { status: "SCHEDULED" },
            orderBy: { startTime: 'asc' },
            take: 1
        }
      },
    });
    if (!p) return { success: false, error: "NOT_FOUND" };

    // --- IMÁGENES ---
    const allImages = (p.images || []).map((img: any) => img?.url).filter(Boolean);
    const realImg = allImages?.[0] || p.mainImage || null;
    const imagesFinal = allImages.length > 0 ? allImages : (realImg ? [realImg] : []);

    // 🔥🔥🔥 OPERACIÓN TRANSMUTACIÓN 🔥🔥🔥
    let finalIdentity = buildIdentity(p.user, p.ownerSnapshot);
    
    // Si hay contrato activo -> La Agencia toma el control visual
    if (p.assignment?.agency) {
        finalIdentity = buildIdentity(p.assignment.agency, null);
        finalIdentity.role = 'AGENCIA';
    }
    // -------------------------------------

    const lng = p.longitude ?? -3.7038;
    const lat = p.latitude ?? 40.4168;
    const rawPrice = Number(p.price || 0);
    const priceFormatted = new Intl.NumberFormat("es-ES").format(rawPrice);

    let openHouseObj = null;
    if (p.openHouses && p.openHouses.length > 0) {
        openHouseObj = { ...p.openHouses[0], enabled: true };
    }

    const mapped = {
      ...p,
      id: p.id,
      ownerSnapshot: p.ownerSnapshot ?? null,
      
      // ✅ Aquí enviamos la identidad ya transmutada (Agencia si aplica)
      user: finalIdentity,

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
      openHouse: openHouseObj, 
      open_house_data: openHouseObj 
    };

    return { success: true, data: mapped };
  } catch (e: any) {
    console.error("getPropertyByIdAction error:", e);
    return { success: false, error: String(e?.message || e) };
  }
}
// C. GUARDAR PROPIEDAD (BLINDADO FINAL: PROTEGE PAGOS Y RANGO AL EDITAR)
export async function savePropertyAction(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Debes iniciar sesión." };

    // 1. LIMPIEZA DE DATOS NUMÉRICOS
    const cleanPrice = parseFloat(String(data.price).replace(/\D/g, '') || '0');
    const rawM2 = data.mBuilt || data.m2 || data.surface || '0';
    const cleanM2 = parseFloat(String(rawM2).replace(/\D/g, '') || '0');

    // 2. SINCRONIZACIÓN DE SERVICIOS
    let servicesSet = new Set<string>(Array.isArray(data.selectedServices) ? data.selectedServices : []);

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

    let finalServices = Array.from(servicesSet);
    if (!finalServices.some((s: string) => s && String(s).startsWith('pack_'))) finalServices.push('pack_basic');

    // 3. GESTIÓN DE IMÁGENES
    const imagesList = Array.isArray(data.images) ? data.images : [];
    if (data.mainImage && !imagesList.includes(data.mainImage)) imagesList.unshift(data.mainImage);
    const mainImage = imagesList.length > 0 ? imagesList[0] : null;

    // 4. OWNER SNAPSHOT
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

    // 5. PAYLOAD LIMPIO (SIN STATUS NI PROMOTEDTIER)
    // ⚠️ ATENCIÓN: He quitado 'status' y 'promotedTier' de aquí.
    // Esto asegura que NUNCA se sobreescriban al editar.
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

        state: data.state || null,         
        orientation: data.orientation || null, 
        exterior: data.exterior !== undefined ? Boolean(data.exterior) : true,

        // MULTIMEDIA & B2B
        videoUrl: data.videoUrl || null,
        tourUrl: data.tourUrl || null,
        simpleNoteUrl: data.simpleNoteUrl || null,
        energyCertUrl: data.energyCertUrl || null,

        mandateType: data.mandateType || "ABIERTO",
        commissionPct: data.commissionPct ? Number(data.commissionPct) : 0,
        sharePct: data.sharePct ? Number(data.sharePct) : 0,
        shareVisibility: data.shareVisibility || "PRIVATE",
        
        selectedServices: finalServices,
        mainImage: mainImage,
        
        // ❌ AQUÍ NO PONEMOS STATUS NI PROMOTEDTIER
        
        ownerSnapshot: ownerSnapshot,
        communityFees: Number(data.communityFees || 0), 
        energyConsumption: data.energyConsumption || null, 
        energyEmissions: data.energyEmissions || null,     
        energyPending: Boolean(data.energyPending),        
    };

    const imageCreateLogic = { create: imagesList.map((url: string) => ({ url })) };

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

    // --- LÓGICA DE GUARDADO ---
    if (data.id && data.id.length > 20) {
      // ✅ EDICIÓN: PROHIBIDO TOCAR STATUS O PREMIUM
      const existing = await prisma.property.findUnique({ where: { id: data.id } });
      const { ownerSnapshot: _dontTouch, ...payloadNoSnap } = payload as any;

      if (existing && existing.userId === user.id) {
        await prisma.image.deleteMany({ where: { propertyId: data.id } });

        // UPDATE: Solo actualizamos datos físicos. 
        // STATUS y PREMIUM se quedan como estén en la base de datos.
        result = await prisma.property.update({
          where: { id: data.id },
          data: {
            ...payloadNoSnap, 
            images: imageCreateLogic,
          },
          include: includeOptions,
        });
      } else {
        // Fallback: Crear si no existe (raro)
        // Solo en este caso extremo definimos status por defecto
        result = await prisma.property.create({
          data: { 
              ...payload, 
              ownerSnapshot, 
              images: imageCreateLogic,
              status: user.role === 'AGENCIA' ? 'PUBLICADO' : 'PENDIENTE_PAGO',
              promotedTier: 'FREE' 
          },
          include: includeOptions,
        });
      }
    } else {
      // ✅ CREACIÓN NUEVA: AQUÍ SÍ DEFINIMOS EL ESTADO INICIAL
      const initialStatus = user.role === 'AGENCIA' ? 'PUBLICADO' : 'PENDIENTE_PAGO';

      result = await prisma.$transaction(async (tx: any) => {
        // 1) Crear
        const created = await tx.property.create({
          data: { 
              ...(payload as any), 
              ownerSnapshot, 
              images: imageCreateLogic,
              // 🔥 ESTADO DE NACIMIENTO
              status: initialStatus, 
              promotedTier: "FREE" 
          } as any,
          include: includeOptions as any,
        });

        // 2) Generar RefCode
        const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let out = "";
        for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
        const refCode = `SF-${out}`;

        // 3) Actualizar
        return await tx.property.update({
          where: { id: created.id },
          data: { refCode } as any,
          include: includeOptions as any,
        });
      });
    }

    // --- GUARDADO OPEN HOUSE (INTACTO) ---
    if (result && result.id && data.openHouse) {
        let ohData = data.openHouse;
        if (typeof ohData === 'string') { try { ohData = JSON.parse(ohData); } catch (e) {} }
        if (ohData && (ohData.enabled === true || String(ohData.enabled) === "true")) {
            await saveOpenHouseAction({
                propertyId: result.id,
                title: ohData.title,
                startTime: ohData.startTime,
                endTime: ohData.endTime,
                capacity: ohData.capacity,
                amenities: ohData.amenities
            });
        }
    }

    revalidatePath("/");
    return { success: true, property: result };

  } catch (error) {
    console.error("savePropertyAction error:", error);
    return { success: false, error: String(error) };
  }
}

// D. BORRAR PROPIEDAD (LÓGICA ORIGINAL MANTENIDA)
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

// H. LEER FAVORITOS (BÓVEDA) - CON TRANSMUTACIÓN
export async function getFavoritesAction() {
  const user = await getCurrentUser();
  if (!user) return { success: false, data: [] };

  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      property: {
        include: {
          images: true,
          user: { select: USER_IDENTITY_SELECT }, // Dueño Original
          
          // 🔥 TRANSMUTACIÓN
          assignment: {
             where: { status: "ACTIVE" },
             include: { agency: { select: USER_IDENTITY_SELECT } }
          }
        },
      },
    },
  });

  const cleanFavs = favs
    .map((f) => {
      const p: any = f.property;
      if (!p) return null;

      let allImages = (p.images || []).map((img: any) => img.url);
      if (allImages.length === 0 && p.mainImage) allImages = [p.mainImage];
      const realImg = allImages[0] || null;

      // 🔥 LÓGICA DE IDENTIDAD DINÁMICA
      let finalIdentity = p.user;
      if (p.assignment?.agency) {
          finalIdentity = { ...p.assignment.agency, role: 'AGENCIA' };
      }

      const lng = p.longitude ?? -3.7038;
      const lat = p.latitude ?? 40.4168;

      return {
        ...p,
        id: p.id,
        // ✅ Identidad correcta
        user: finalIdentity,

        coordinates: [lng, lat],
        lng, lat,
        images: allImages,
        img: realImg,
        isFavorited: true,
        price: new Intl.NumberFormat("es-ES").format(p.price || 0),
        rawPrice: p.price,
        priceValue: p.price,
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
// 🏢 4. GESTIÓN DE AGENCIA (STOCK BLINDADO & CÁLCULO FINANCIERO)
// =========================================================

export async function getAgencyPortfolioAction() {
  try {
    const userRes = await getUserMeAction();
    if (!userRes.success || !userRes.data) return { success: false, data: [] };
    const user = userRes.data;

    // Solo traemos propiedades donde:
    // 1. SOY EL DUEÑO ORIGINAL (userId = yo)
    // 2. O TENGO UN CONTRATO FIRMADO (campaign = ACCEPTED)
    const myProperties = await prisma.property.findMany({
      where: { 
          OR: [
              { userId: user.id }, 
              { campaigns: { some: { agencyId: user.id, status: "ACCEPTED" } } } 
          ]
      },
      include: { 
          images: true,
          // 🔥 AQUÍ ESTABA EL ERROR: Ahora pedimos la identidad COMPLETA
          user: {
            select: {
                id: true, role: true, name: true, surname: true, email: true, 
                phone: true, mobile: true,
                avatar: true, 
                companyName: true, 
                companyLogo: true, // <--- VITAL PARA QUE SALGA EL LOGO EN EL PANEL
                coverImage: true,  // <--- VITAL PARA EL FONDO
                licenseType: true,
                licenseNumber: true,
                website: true,
                tagline: true,
                zone: true
            }
          }, 
          // Solo traemos MI campaña aceptada (EL CONTRATO)
          campaigns: { where: { agencyId: user.id, status: "ACCEPTED" } },
          openHouses: { where: { status: "SCHEDULED" }, orderBy: { startTime: 'asc' }, take: 1 }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // 4. FORMATEO SAAS CON CÁLCULO FINANCIERO
    const cleanList = myProperties.map((p: any) => {
        if (!p) return null;

        const originalOwner = p.user || {};
        const openHouseObj = (p.openHouses && p.openHouses.length > 0) ? { ...p.openHouses[0], enabled: true } : null;

        // 🔥 LOGICA DE CONTRATO (CAMPAÑA) 🔥
        const winningCampaign = p.campaigns && p.campaigns.length > 0 ? p.campaigns[0] : null;
        
        // IDENTIDAD POR DEFECTO: El dueño original (que ahora sí trae logo/cover si es agencia)
        let displayUser = originalOwner;
        let isManaged = false;

        // Si hay campaña ganadora (Gestión externa), procesamos
        if (winningCampaign) {
            isManaged = true;
            
            // A) NORMALIZACIÓN DE DATOS
            winningCampaign.commissionPct = Number(winningCampaign.commissionPct || 0);
            winningCampaign.commissionSharePct = Number(winningCampaign.commissionSharePct || 0);
            winningCampaign.mandateType = winningCampaign.mandateType || "SIMPLE";
            
            // B) CÁLCULO DE IMPORTES (EUROS)
            const price = p.price || 0;
            const comm = winningCampaign.commissionPct; 
            
            const base = (price * comm) / 100;
            const iva = base * 0.21; 
            const total = base + iva;
            
            winningCampaign.financials = {
                base: base,
                ivaAmount: iva,
                total: total
            };

            // 🔥 C) SUPLANTACIÓN DE IDENTIDAD VISUAL (Si gestiono yo)
            // Si es gestión externa, muestro mis datos de agencia (UserMe)
            displayUser = {
                ...user, 
                role: 'AGENCIA', 
                licenseType: 'PRO',
                avatar: user.companyLogo || user.avatar,
                companyLogo: user.companyLogo,
                companyName: user.companyName || user.name,
                coverImage: user.coverImage
            };
        } else {
            // SI ES MI PROPIEDAD CREADA DESDE CERO (SIN CAMPAÑA):
            // Me aseguro de que el Avatar sea el Logo si soy Agencia
            if (originalOwner.role === 'AGENCIA') {
                displayUser.avatar = originalOwner.companyLogo || originalOwner.avatar;
            }
        }

        return {
            ...p,
            id: p.id,
            refCode: p.refCode, 
            
            // AQUÍ VIAJA LA IDENTIDAD CORRECTA CON FOTO
            user: displayUser, 
            ownerSnapshot: displayUser, 
            clientData: originalOwner, // Guardamos el dueño real por si acaso

            activeCampaign: winningCampaign, 
            radarType: winningCampaign ? (winningCampaign.mandateType || "SIMPLE") : null,
            
            // Datos B2B listos para consumir por el Botón Dorado
            b2b: winningCampaign ? {
                sharePct: Number(winningCampaign.commissionSharePct || 0),
                visibility: winningCampaign.commissionShareVisibility || 'PRIVATE'
            } : null,

            isOwner: p.userId === user.id, 
            isCaptured: isManaged, 
            
            images: (p.images || []).map((img: any) => img.url),
            img: p.images?.[0]?.url || p.mainImage || null,
            
            price: new Intl.NumberFormat("es-ES").format(p.price || 0),
            openHouse: openHouseObj
        };
    }).filter(Boolean);

    return { success: true, data: cleanList };
  } catch (error) {
    console.error("Error getting agency portfolio:", error);
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
      // ✅ Limpieza segura de datos relacionados
      await prisma.image.deleteMany({ where: { propertyId: pid } });
      await prisma.favorite.deleteMany({ where: { propertyId: pid } });
      await prisma.property.delete({ where: { id: pid } });

      revalidatePath("/");
      return { success: true, type: "property_deleted" };
    }

    // 2) NO SOY DUEÑO -> BORRAR SOLO MI FAVORITO
    const where = {
      userId_propertyId: { userId: me.id, propertyId: pid },
    };

    const existing = await prisma.favorite.findUnique({ where });
    if (!existing) {
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

// B. MIS PROPIEDADES (PERFIL) - Recuperada + FIX PLURAL
export async function getPropertiesAction() {
  try {
    const user = await getCurrentUser(); // O la función que use para el usuario actual
    if (!user) return { success: false, data: [] };

    const properties = await prisma.property.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
        user: { select: USER_IDENTITY_SELECT }, // Asegúrese que USER_IDENTITY_SELECT está definido arriba
        
        // 🔥 CORRECCIÓN FINAL: USAMOS EL PLURAL 'openHouses'
        openHouses: {
           include: {
             attendees: true 
           },
           // Opcional: Ordenamos para coger el más reciente si hubiera varios
           orderBy: { createdAt: 'desc' }
        }
      },
    });

    const mappedProps = properties.map((p: any) => {
      // 1. GESTIÓN DE IMAGEN PRINCIPAL
      const realImg =
        (p.images && p.images.length > 0) ? p.images[0].url : p.mainImage;

      let allImages = (p.images || []).map((img: any) => img.url);
      if (allImages.length === 0 && realImg) allImages = [realImg];

      // 2. IDENTIDAD
      const identity = buildIdentity(p.user, p.ownerSnapshot);
      const safeOwnerSnapshot =
        (p.ownerSnapshot && typeof p.ownerSnapshot === "object") ? p.ownerSnapshot : identity;

      // 🔥 3. NORMALIZACIÓN DEL OPEN HOUSE (PLURAL -> SINGULAR)
      // Como la DB devuelve un array 'openHouses', cogemos el primero (el más reciente)
      // y lo llamamos 'openHouse' para que el frontend funcione sin tocar nada más.
      const activeOH = (p.openHouses && p.openHouses.length > 0) ? p.openHouses[0] : null;

     return {
        ...p,
        id: p.id,
        
        // 🔥 ESTADÍSTICAS TÁCTICAS (AÑADIR ESTO)
        views: p.views || 0,
        photoViews: p.photoViews || 0,
        shareCount: p.shareCount || 0,
        favoritedCount: p.favoritedBy?.length || 0, // Si quiere saber cuántos la guardaron
        // ----------------------------------------

        // 🔥 DATOS PREMIUM
        promotedTier: p.promotedTier || "FREE",
        isPromoted: !!p.isPromoted,
        promotedUntil: p.promotedUntil,

        // RESTO DE DATOS (YA LOS TIENE)
        openHouse: activeOH,
        openHouseAttendeesCount: activeOH?.attendees?.length || 0,
        ownerSnapshot: safeOwnerSnapshot,
        user: identity,
        coordinates: [p.longitude || -3.7038, p.latitude || 40.4168],
        images: allImages,
        img: realImg || null,
        price: new Intl.NumberFormat("es-ES").format(p.price || 0),
        rawPrice: p.price,
        m2: Number(p.mBuilt || 0),
        mBuilt: Number(p.mBuilt || 0),
        communityFees: p.communityFees || 0,
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
// =========================================================
// 🎉 GESTIÓN DE EVENTOS (OPEN HOUSE) - VERSIÓN FINAL SILENCIOSA
// =========================================================

// A. CREAR O EDITAR UN EVENTO (Solo Agencias)
export async function saveOpenHouseAction(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "UNAUTH" };

    const pid = String(data.propertyId || "").trim();
    if (!pid) return { success: false, error: "MISSING_PROPERTY_ID" };

    // Verificar propiedad
    const prop = await prisma.property.findUnique({ where: { id: pid } });
    if (!prop || prop.userId !== user.id) return { success: false, error: "FORBIDDEN" };

    const payload = {
      propertyId: pid,
      startTime: new Date(data.startTime), // Debe venir en ISO string
      endTime: new Date(data.endTime),
      title: data.title || "Open House",
      description: data.description || "",
      amenities: Array.isArray(data.amenities) ? data.amenities : [], // ["DJ", "Catering"]
      capacity: Number(data.capacity || 50),
      status: "SCHEDULED"
    };

    // Si mandas ID, actualiza. Si no, crea.
    if (data.id) {
       await prisma.openHouse.update({ where: { id: data.id }, data: payload });
    } else {
       await prisma.openHouse.create({ data: payload });
    }

    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: String(e.message || e) };
  }
}

// B. OBTENER EVENTOS DE UNA PROPIEDAD
export async function getOpenHouseAction(propertyId: string) {
  try {
    const events = await prisma.openHouse.findMany({
      where: { propertyId: propertyId, status: "SCHEDULED" },
      orderBy: { startTime: 'asc' },
      include: {
         _count: { select: { attendees: true } } // Para saber cuántos van
      }
    });
    return { success: true, data: events };
  } catch (e) {
    return { success: false, data: [] };
  }
}

// =====================================================
// 🎟️ 3. APUNTARSE A UN OPEN HOUSE (BLINDADO)
// =====================================================
export async function joinOpenHouseAction(eventId: string, guestData?: any) {
  try {
    // 1. VALIDACIÓN USUARIO
    const user = await getCurrentUser();
    // Si no es usuario logueado y no me pasan datos de invitado, error.
    if (!user && !guestData?.email) return { success: false, error: "NEED_EMAIL" };

    // 2. RECUPERAR DATOS + SEGURIDAD
    const event = await prisma.openHouse.findUnique({ 
        where: { id: eventId },
        include: { 
            attendees: { where: { status: "CONFIRMED" } }, // Solo contamos los confirmados
            property: { 
                include: { user: true } // 🔥 IMPORTANTE: Traer al dueño para enviarle el mail
            }
        }
    });
    
    if (!event) return { success: false, error: "NOT_FOUND" };

    // --- 🛑 EL MURO: CONTROL DE AFORO ---
    const currentAttendees = event.attendees.length;
    if (event.capacity && currentAttendees >= event.capacity) {
        // Si yo ya estaba dentro, me deja pasar. Si soy nuevo, me bloquea.
        const isAlreadyIn = user?.id && event.attendees.find(a => a.userId === user.id);
        if (!isAlreadyIn) {
             return { success: false, error: "SOLD_OUT" };
        }
    }

    // 3. PREPARAR DATOS DEL ASISTENTE
    const attendeeEmail = user?.email || guestData?.email;
    const attendeeName = user?.name || guestData?.name || "Invitado";
    const attendeePhone = user?.phone || guestData?.phone || "Sin teléfono";

    // 4. GUARDAR EN BASE DE DATOS
    let newAttendee;
    if (user?.id) {
        // Usuario registrado: Upsert (por si ya existía cancelado, lo reactiva)
        newAttendee = await prisma.openHouseAttendee.upsert({
            where: { openHouseId_userId: { openHouseId: eventId, userId: user.id } },
            update: { status: "CONFIRMED" }, 
            create: {
                openHouseId: eventId, userId: user.id, email: attendeeEmail,
                name: attendeeName, phone: attendeePhone, status: "CONFIRMED"
            }
        });
    } else {
        // Invitado anónimo: Create
        newAttendee = await prisma.openHouseAttendee.create({
            data: {
                openHouseId: eventId, email: attendeeEmail,
                name: attendeeName, phone: attendeePhone, status: "CONFIRMED"
            }
        });
    }

    // =====================================================
    // 📨 5. ENVÍO DE CORREOS (CORREGIDO)
    // =====================================================
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
        try {
            // Importación dinámica segura
            const { Resend } = require('resend'); 
            const resend = new Resend(resendApiKey);
            
            // Datos Evento
            const eventTitle = event.title || "Open House";
            const d = new Date(event.startTime);
            const eventDate = d.toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' });
            const eventTime = d.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' });
            
            const address = event.property.address || "Ubicación Privada";
            const propertyRef = event.property.refCode || "Sin Ref";
            const ticketCode = newAttendee.id.slice(-6).toUpperCase();

            // Datos Agencia
            const agencyUser = event.property.user;
            const agencyName = agencyUser?.companyName || agencyUser?.name || "Agencia Organizadora";
            const agencyPhone = agencyUser?.mobile || agencyUser?.phone || "";
            const agencyEmail = agencyUser?.email;

            const platformLink = "https://stratosfere.com"; 
            const senderEmail = 'Stratosfere <info@stratosfere.com>'; 

            // ---------------------------------------------------------
            // A) CORREO AL CLIENTE
            // ---------------------------------------------------------
            // Verificar si tenemos la función helper, si no, usar texto plano
            const emailHtmlClient = typeof buildStratosfereEmailHtml === 'function' ? buildStratosfereEmailHtml({
                title: `Confirmación de Entrada`,
                headline: `¡Estás dentro, ${attendeeName}!`,
                bodyHtml: `
                    <p>Tu plaza para <strong>${eventTitle}</strong> está confirmada.</p>
                    <div style="background:#F5F5F7; border-radius:12px; padding:20px; margin:20px 0;">
                        <p style="margin:0 0 5px 0;">📍 <strong>${address}</strong></p>
                        <p style="margin:0;">🗓️ ${eventDate} • ${eventTime}H</p>
                    </div>
                    <div style="border:1px solid #eee; border-radius:12px; padding:15px; margin-bottom:20px;">
                        <p style="font-size:10px; text-transform:uppercase; color:#888; margin:0 0 5px 0;">ORGANIZADO POR</p>
                        <p style="font-weight:bold; margin:0;">${agencyName}</p>
                        <p style="margin:0;">📞 ${agencyPhone}</p>
                        ${agencyEmail ? `<p style="margin:0;">✉️ ${agencyEmail}</p>` : ''}
                    </div>
                    <div style="text-align:center;">
                        <p style="font-size:10px; color:#888; margin-bottom:5px;">TU CÓDIGO DE ACCESO</p>
                        <div style="font-family:monospace; font-size:24px; font-weight:900; background:#000; color:#fff; display:inline-block; padding:10px 20px; border-radius:8px;">${ticketCode}</div>
                    </div>
                `,
                ctaText: "Ver Mi Entrada",
                ctaUrl: platformLink
            }) : `<p>Estás apuntado a ${eventTitle}. Código: ${ticketCode}</p>`;

            if (attendeeEmail) {
                await resend.emails.send({
                    from: senderEmail, 
                    to: attendeeEmail,
                    // 🔥 FIX: Si agencyEmail es null, usamos info@... para evitar crash
                    reply_to: agencyEmail || 'info@stratosfere.com', 
                    subject: `🎟️ Tu entrada para ${eventTitle}`,
                    html: emailHtmlClient,
                    headers: { 'X-Entity-Ref-ID': ticketCode }
                });
            }

            // ---------------------------------------------------------
            // B) CORREO A LA AGENCIA
            // ---------------------------------------------------------
            if (agencyEmail) {
                const emailHtmlAgency = typeof buildStratosfereEmailHtml === 'function' ? buildStratosfereEmailHtml({
                    title: "Nuevo Lead Confirmado",
                    headline: "Nuevo Asistente Registrado",
                    bodyHtml: `
                        <p>Se ha registrado un nuevo asistente para el evento: <strong>${eventTitle}</strong></p>
                        
                        <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:12px; padding:15px; margin-bottom:15px;">
                            <p style="font-size:10px; font-weight:bold; color:#166534; text-transform:uppercase; margin:0 0 10px 0;">DATOS DEL INTERESADO</p>
                            <ul style="list-style:none; padding:0; margin:0; color:#14532d;">
                                <li style="margin-bottom:5px;">👤 <strong>${attendeeName}</strong></li>
                                <li style="margin-bottom:5px;">📧 <a href="mailto:${attendeeEmail}">${attendeeEmail}</a></li>
                                <li>📱 ${attendeePhone}</li>
                            </ul>
                        </div>

                        <div style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:12px; padding:15px;">
                            <p style="font-size:10px; font-weight:bold; color:#6B7280; text-transform:uppercase; margin:0 0 10px 0;">CONTEXTO DEL EVENTO</p>
                            <p style="margin:0 0 5px 0; color:#111;">📍 <strong>${address}</strong></p>
                            <p style="margin:0 0 5px 0; font-size:14px;">🗓️ ${eventDate} • ${eventTime}H</p>
                            <p style="margin:5px 0 0 0; font-family:monospace; background:#e5e7eb; display:inline-block; padding:2px 6px; border-radius:4px; font-size:12px;">REF: ${propertyRef}</p>
                        </div>
                    `,
                    ctaText: "Ver en Panel",
                    ctaUrl: platformLink
                }) : `<p>Nuevo lead: ${attendeeName}</p>`;

                await resend.emails.send({
                    from: senderEmail, 
                    to: agencyEmail,
                    // 🔥 FIX: Si attendeeEmail es null, pasamos undefined para que Resend no falle
                    reply_to: attendeeEmail || undefined, 
                    subject: `🔔 Nuevo Lead (Ref: ${propertyRef}): ${attendeeName}`,
                    html: emailHtmlAgency
                });
            }
        } catch (emailError) {
            console.error("❌ Error enviando emails (pero el registro se guardó):", emailError);
            // No hacemos throw para no cancelar el registro si falla el mail
        }
    }

    revalidatePath("/");
    return { success: true };

  } catch (e: any) {
    if (e.code === 'P2002') return { success: true, message: "ALREADY_JOINED" };
    console.error("Error joinOpenHouseAction:", e);
    return { success: false, error: String(e.message || e) };
  }
}
// E. VER LISTA DE INVITADOS (SOLO AGENCIA/DUEÑO)
export async function getOpenHouseAttendeesAction(openHouseId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "UNAUTH" };

    const event = await prisma.openHouse.findUnique({
        where: { id: openHouseId },
        include: { 
            property: { select: { userId: true } },
            attendees: { orderBy: { createdAt: 'desc' } }
        }
    });

    if (!event) return { success: false, error: "NOT_FOUND" };
    
    // Seguridad: Solo el dueño de la propiedad puede ver la lista
    if (event.property.userId !== user.id) return { success: false, error: "FORBIDDEN" };

    return { success: true, data: event.attendees };
  } catch (e) {
    return { success: false, data: [] };
  }
}
// F. VERIFICAR SI YA ESTOY APUNTADO (MEMORIA DEL SISTEMA)
// Úsela en el useEffect de OpenHouseOverlay.tsx
export async function checkOpenHouseStatusAction(eventId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { isJoined: false };

        // Buscamos si existe ticket
        const ticket = await prisma.openHouseAttendee.findUnique({
            where: {
                openHouseId_userId: {
                    openHouseId: eventId,
                    userId: user.id
                }
            }
        });
        return { isJoined: !!ticket };
    } catch (e) {
        return { isJoined: false };
    }
}

// G. OBTENER MIS TICKETS (AHORA SÍ TRAE LAS FOTOS)
export async function getUserTicketsAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const tickets = await prisma.openHouseAttendee.findMany({
      where: { userId: user.id },
      include: {
        openHouse: {
          include: {
            _count: { select: { attendees: true } },
            property: {
              include: {
                // 🔥 AQUÍ FALTABAN LOS CAMPOS DE IMAGEN
                user: {
                  select: {
                    id: true,
                    role: true,
                    name: true,
                    surname: true,
                    email: true,
                    
                    // DATOS DE AGENCIA
                    companyName: true,
                    companyLogo: true, // <--- FALTABA ESTE (Avatar Agencia)
                    coverImage: true,  // <--- FALTABA ESTE (Fondo)
                    
                    // CONTACTO
                    phone: true,
                    mobile: true,
                    website: true,
                    licenseNumber: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: tickets };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
// H. CANCELAR TICKET (RETIRADA TÁCTICA - POR ID DE TICKET)
export async function cancelTicketAction(ticketId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Verificamos que el ticket sea suyo antes de borrar
    const ticket = await prisma.openHouseAttendee.findUnique({
      where: { id: ticketId }
    });

    if (!ticket || ticket.userId !== user.id) {
        return { success: false, error: "Forbidden" };
    }

    // Borramos el registro
    await prisma.openHouseAttendee.delete({
      where: { id: ticketId }
    });

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// I. CANCELAR ASISTENCIA (RETIRADA TÁCTICA - CON AVISO A AGENCIA)
export async function leaveOpenHouseAction(openHouseId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "UNAUTH" };

    // 1. BUSCAMOS EL TICKET + DATOS DE LA AGENCIA (CRÍTICO PARA AVISAR)
    const ticket = await prisma.openHouseAttendee.findUnique({
      where: {
        openHouseId_userId: {
          openHouseId: openHouseId,
          userId: user.id
        }
      },
      include: {
        openHouse: {
            include: {
                property: {
                    include: { user: true } // <--- Necesitamos esto para tener el email de la agencia
                }
            }
        }
      }
    });

    if (!ticket) return { success: false, error: "NO_TICKET" };

    // 2. EJECUTAMOS LA BAJA (LIBERAMOS LA PLAZA)
    await prisma.openHouseAttendee.delete({
      where: { id: ticket.id }
    });

    // 3. NOTIFICACIÓN TÁCTICA (EMAIL A LA AGENCIA)
    // Esto ocurre después de borrar, para no bloquear al usuario si falla el email
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
        try {
            const { Resend } = require('resend'); 
            const resend = new Resend(resendApiKey);

            // Datos para el informe
            const eventTitle = ticket.openHouse.title || "Open House";
            const userName = user.name || "Un usuario";
            const userEmail = user.email;
            const propertyRef = ticket.openHouse.property.refCode || "Sin Ref";

            // Datos Agencia
            const agencyUser = ticket.openHouse.property.user;
            const agencyEmail = agencyUser?.email; // Ahora sí lo tenemos
            const senderEmail = 'Stratosfere <info@stratosfere.com>';

            // A) AVISO A LA AGENCIA (¡PLAZA LIBRE!)
            if (agencyEmail) {
                console.log(`📧 AVISANDO BAJA A AGENCIA: ${agencyEmail}`);
                await resend.emails.send({
                    from: senderEmail,
                    to: agencyEmail,
                    reply_to: userEmail || undefined, // Para que puedan responder al usuario si quieren
                    subject: `📉 Plaza Liberada (Ref: ${propertyRef}): ${userName} canceló`,
                    html: `
                        <div style="font-family:sans-serif; border:1px solid #ddd; padding:20px; border-radius:10px;">
                            <h2 style="color:#d97706;">Un asistente ha cancelado</h2>
                            <p>El usuario <strong>${userName}</strong> se ha dado de baja del evento <strong>${eventTitle}</strong>.</p>
                            
                            <div style="background:#FFFBEB; border:1px solid #FCD34D; padding:15px; border-radius:8px; margin:15px 0; color:#92400E;">
                                <strong>✅ Una plaza ha quedado libre.</strong>
                                <br/>El aforo se ha actualizado automáticamente.
                            </div>

                            <ul style="font-size:12px; color:#666;">
                                <li>Usuario: ${userName}</li>
                                <li>Email: ${userEmail}</li>
                                <li>Ref Propiedad: ${propertyRef}</li>
                            </ul>
                        </div>
                    `
                });
            }

            // B) CONFIRMACIÓN AL USUARIO (OPCIONAL PERO RECOMENDADO)
            if (userEmail) {
                await resend.emails.send({
                    from: senderEmail,
                    to: userEmail,
                    subject: `🗑️ Asistencia cancelada: ${eventTitle}`,
                    html: `
                        <p>Hola ${userName},</p>
                        <p>Confirmamos que hemos anulado tu entrada para <strong>${eventTitle}</strong>.</p>
                        <p>Tu plaza ha sido liberada.</p>
                    `
                });
            }

        } catch (emailError) {
            console.error("❌ Error enviando emails de baja (pero la baja se realizó):", emailError);
        }
    }

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Error leaveOpenHouseAction:", e);
    return { success: false, error: String(e) };
  }
}
// J. VER ASISTENTES (RADAR DE AGENCIA)
export async function getEventAttendeesAction(eventId: string) {
  try {
    const attendees = await prisma.openHouseAttendee.findMany({
      where: {
        openHouseId: eventId,
        status: 'CONFIRMED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true, // ✅ CORRECTO (Antes era 'image')
            phone: true,
            mobile: true  // ✅ Añadido extra por si el tlf está aquí
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { success: true, attendees };
  } catch (error) {
    console.error("Error obteniendo asistentes:", error);
    return { success: false, error: "No se pudo cargar la lista de invitados" };
  }
}

// =====================================================
// 🗑️ 5. CANCELAR EVENTO (NOTIFICANDO A TODOS) - BLINDADO
// =====================================================
export async function cancelOpenHouseAction(openHouseId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "No autorizado" };

    // 1. RECUPERAMOS EL EVENTO Y SUS INVITADOS (ANTES DE BORRAR)
    const event = await prisma.openHouse.findUnique({
      where: { id: openHouseId },
      include: {
        property: {
            include: { user: true } // Necesitamos datos de la agencia
        },
        attendees: true // Necesitamos emails de los inscritos
      }
    });

    if (!event) return { success: false, error: "Evento no encontrado" };
    
    // Seguridad: Solo el dueño puede cancelar
    if (event.property.userId !== user.id) return { success: false, error: "No eres el organizador" };

    // 2. PREPARACIÓN DE CORREOS (CON PROTECCIÓN DE ERRORES)
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (resendApiKey) {
        try {
            // 🔥 IMPORTACIÓN SEGURA: Evita que rompa si falta el import arriba
            const { Resend } = require('resend'); 
            const resend = new Resend(resendApiKey);

            // Datos Formateados
            const eventTitle = event.title || "Open House";
            const d = new Date(event.startTime);
            const eventDate = d.toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' });
            const eventTime = d.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' });
            const address = event.property.address || "Ubicación Privada";
            
            // Datos Agencia
            const agencyName = event.property.user?.companyName || event.property.user?.name || "Agencia";
            const senderEmail = 'Stratosfere <info@stratosfere.com>'; // Su remitente oficial

            // Array de promesas para envío masivo
            const emailPromises = [];

            // A) CORREOS A LOS CLIENTES (UNO POR UNO)
            for (const ticket of event.attendees) {
                if (ticket.email) {
                    // Verificamos si existe el helper de HTML, si no, texto plano
                    const emailHtmlClient = typeof buildStratosfereEmailHtml === 'function' 
                        ? buildStratosfereEmailHtml({
                            title: "Evento Cancelado",
                            headline: "Cancelación de Open House",
                            bodyHtml: `
                                <p>Hola <strong>${ticket.name || 'Invitado'}</strong>,</p>
                                <p>Te informamos que el evento <strong>${eventTitle}</strong> ha sido cancelado por el organizador.</p>
                                
                                <div style="background:#FEF2F2; border:1px solid #FECACA; border-radius:12px; padding:20px; margin:20px 0; color:#991B1B;">
                                    <p style="margin:0 0 5px 0;">🚫 <strong>EVENTO CANCELADO</strong></p>
                                    <p style="margin:0 0 5px 0;">📍 ${address}</p>
                                    <p style="margin:0;">🗓️ Previsto: ${eventDate} • ${eventTime}H</p>
                                </div>

                                <p>Disculpa las molestias ocasionadas.</p>
                                <p style="font-size:12px; color:#666;">Atentamente,<br/>${agencyName}</p>
                            `,
                            ctaText: "Ver Propiedades Similares",
                            ctaUrl: "https://stratosfere.com"
                        }) 
                        : `<p>El evento ${eventTitle} ha sido cancelado.</p>`;

                    emailPromises.push(
                        resend.emails.send({
                            from: senderEmail,
                            to: ticket.email,
                            subject: `🚫 CANCELADO: ${eventTitle}`,
                            html: emailHtmlClient
                        })
                    );
                }
            }

            // B) CORREO DE CONFIRMACIÓN A LA AGENCIA (USTED)
            if (user.email) {
                 const emailHtmlAgency = typeof buildStratosfereEmailHtml === 'function'
                    ? buildStratosfereEmailHtml({
                        title: "Evento Eliminado",
                        headline: "Cancelación Exitosa",
                        bodyHtml: `
                            <p>Has cancelado el evento: <strong>${eventTitle}</strong></p>
                            <div style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:12px; padding:15px; margin:15px 0;">
                                <p>✅ Se ha eliminado el evento de la plataforma.</p>
                                <p>📬 Se han enviado notificaciones a <strong>${event.attendees.length} asistentes</strong>.</p>
                            </div>
                        `,
                        ctaText: "Volver al Panel",
                        ctaUrl: "https://stratosfere.com/dashboard"
                    })
                    : `<p>Evento cancelado y asistentes notificados.</p>`;

                emailPromises.push(
                    resend.emails.send({
                        from: senderEmail,
                        to: user.email,
                        subject: `🗑️ Confirmación: ${eventTitle} eliminado`,
                        html: emailHtmlAgency
                    })
                );
            }

            // Disparamos todos los correos sin bloquear si uno falla
            await Promise.allSettled(emailPromises);

        } catch (emailError) {
            console.error("❌ Error enviando emails (pero procedemos a borrar):", emailError);
        }
    }

    // 3. DEMOLICIÓN FINAL (BORRAR DE LA DB)
    await prisma.openHouse.delete({
      where: { id: openHouseId }
    });

    // 4. ACTUALIZAR UI
    revalidatePath("/");
    return { success: true };

  } catch (error: any) {
    console.error("Error cancelOpenHouseAction:", error);
    return { success: false, error: String(error.message || "Error al cancelar") };
  }
}

// =====================================================
// 🤝 7. RESPONDER CAMPAÑA (PROPIETARIO ACEPTA/RECHAZA) - FINAL
// =====================================================
export async function respondToCampaignAction(campaignId: string, decision: "ACCEPT" | "REJECT") {
  console.log(`🚀 [SERVER] Iniciando respondToCampaignAction. ID: ${campaignId}, Decisión: ${decision}`);

  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Sesión caducada" };

    // 1. OBTENER CAMPAÑA
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        property: { include: { user: true } }, 
        agency: true 
      }
    });

    if (!campaign) return { success: false, error: "Campaña no encontrada" };
    
    // Seguridad
    if (campaign.property.userId !== user.id) {
        return { success: false, error: "No eres el dueño de esta propiedad" };
    }

    // 2. ACTUALIZAR ESTADO EN DB
    const newStatus = decision === "ACCEPT" ? "ACCEPTED" : "REJECTED";
    
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: newStatus }
    });

    // 3. SI ACEPTA -> TRANSFERENCIA DE PODERES
    if (decision === "ACCEPT") {
      
      // A) Crear asignación
      await prisma.propertyAssignment.upsert({
        where: { propertyId: campaign.propertyId }, 
        update: {
          agencyId: campaign.agencyId,
          status: "ACTIVE",
          campaignId: campaign.id
        },
        create: {
          propertyId: campaign.propertyId,
          agencyId: campaign.agencyId,
          status: "ACTIVE",
          campaignId: campaign.id
        }
      });

      // B) ENVIAR EMAIL (Usando el import global de la línea 6)
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        try {
            // Usamos la clase Resend importada arriba. No re-importamos.
            const resend = new Resend(resendApiKey);

            await resend.emails.send({
                from: 'Stratosfere <info@stratosfere.com>', // Su remitente real
                to: campaign.agency.email, 
                subject: `🚀 ¡CAPTACIÓN ÉXITO! ${campaign.property.address}`,
                html: `
                  <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #059669;">¡Nuevo Mandato Conseguido!</h2>
                    <p>El propietario ha aceptado tu propuesta para <strong>${campaign.property.address}</strong>.</p>
                    <p>Ya tienes acceso completo al expediente.</p>
                    <a href="https://stratosfere.com/dashboard" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ir al Panel</a>
                  </div>
                `
            });
            console.log("✅ [SERVER] Email enviado a la agencia.");
        } catch (mailError) {
            console.error("⚠️ [SERVER] Falló email (pero la DB está OK):", mailError);
        }
      }
    }

    revalidatePath("/");
    return { success: true };

  } catch (error: any) {
    console.error("💥 [SERVER] Error crítico:", error);
    return { success: false, error: String(error.message || "Error del servidor") };
  }
}
// =========================================================
// 🏠 2. GESTIÓN DE PROPIETARIO (CON DATOS COMPLETOS DE AGENCIA)
// =========================================================

export async function getMyPropertiesAction() {
  try {
    const userRes = await getUserMeAction();
    if (!userRes.success || !userRes.data) return { success: false, data: [] };
    const user = userRes.data;

    const properties = await prisma.property.findMany({
      where: { userId: user.id },
      include: {
        images: true,
        // 🔥 AQUÍ ESTABA EL CORTE: AHORA TRAEMOS TODOS LOS DATOS DE LA AGENCIA
        campaigns: { 
            where: { OR: [{ status: "SENT" }, { status: "ACCEPTED" }] },
            include: { 
                agency: { 
                    select: { 
                        id: true, 
                        name: true, 
                        companyName: true,
                        email: true,
                        phone: true,
                        mobile: true,
                        avatar: true,
                        companyLogo: true, // Importante para el logo
                        coverImage: true,  // Importante para el fondo
                        licenseNumber: true,
                        website: true,
                        role: true
                    } 
                } 
            } 
        },
        openHouses: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    const processed = properties.map((p: any) => {
        let activeCampaign = p.campaigns.find((c: any) => c.status === "ACCEPTED");
        if (!activeCampaign) activeCampaign = p.campaigns.find((c: any) => c.status === "SENT");

        if (activeCampaign) {
            // Parseo de mensaje (igual que antes)
            if (!activeCampaign.commissionPct && activeCampaign.message) {
                 const msg = activeCampaign.message;
                 const commMatch = msg.match(/(\d+(?:[.,]\d+)?)\s*%/);
                 if (commMatch) activeCampaign.commissionPct = parseFloat(commMatch[1].replace(',', '.'));
                 if (msg.toLowerCase().includes("exclusiva")) activeCampaign.mandateType = "EXCLUSIVE";
                 const durationMatch = msg.match(/(\d+)\s*meses/i);
                 if (durationMatch) activeCampaign.duration = `${durationMatch[1]} Meses`;
            }
            activeCampaign.services = Array.isArray(activeCampaign.serviceIds) ? activeCampaign.serviceIds : [];
            
            // Cálculo Financiero (igual que antes)
            const comm = activeCampaign.commissionPct || activeCampaign.commission || 0;
            const price = p.price || 0;
            const ivaPct = 21; 
            const base = (price * comm) / 100;
            const ivaAmt = (base * ivaPct) / 100;
            const total = base + ivaAmt;

            activeCampaign.financials = {
                base: new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(base),
                ivaAmount: new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(ivaAmt),
                total: new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total),
                ivaPct: ivaPct
            };
        }

        // Nombre para la tarjeta
        const agencyName = activeCampaign?.agency?.companyName || activeCampaign?.agency?.name || "Agencia Asociada";

        return {
            ...p,
            id: p.id,
            images: (p.images || []).map((i: any) => i.url),
            img: p.images?.[0]?.url || p.mainImage || null,
            formattedPrice: new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(p.price || 0),
            activeCampaign: activeCampaign,
            isManaged: activeCampaign?.status === "ACCEPTED",
            agencyName: agencyName 
        };
    });

    return { success: true, data: processed };
  } catch (error) {
    console.error("Error getMyPropertiesAction:", error);
    return { success: false, error: "Error al cargar propiedades" };
  }
}

// =========================================================
// 🦅 RADAR DE GESTIÓN: ¿QUIÉN CONTROLA ESTA PROPIEDAD?
// =========================================================
export async function getActiveManagementAction(propertyId: string) {
  try {
    const me = await getCurrentUser();
    if (!me?.id) return { success: false, error: "UNAUTH" };

    // Buscamos si ALGUIEN (cualquier agencia) tiene un contrato ACEPTADO
    const winningCampaign = await prisma.campaign.findFirst({
      where: {
        propertyId: propertyId,
        status: "ACCEPTED" // 🔥 La clave: solo nos importa el contrato vigente
      },
      include: {
        // Traemos los datos de la agencia que ganó para pintar su ficha
        agency: {
          select: {
            id: true,
            name: true,
            companyName: true,
            companyLogo: true, // Vital para el logo
            avatar: true,
            coverImage: true,  // Vital para el fondo
            phone: true,
            mobile: true,
            email: true,
            licenseNumber: true,
            role: true,
            zone: true,
            tagline: true
          }
        }
      }
    });

    if (!winningCampaign) return { success: false, data: null };

    return { success: true, data: winningCampaign };

  } catch (e: any) {
    console.error("getActiveManagementAction error:", e);
    return { success: false, error: "Error consultando gestión" };
  }
}

// Z. SISTEMA DE ESTADÍSTICAS (Nuevo al final de actions.ts)
export async function incrementStatsAction(propertyId: string, metric: 'view' | 'photo' | 'share') {
  try {
    const pid = String(propertyId || "").trim();
    if (!pid) return;

    const dataToUpdate: any = {};
    if (metric === 'view') dataToUpdate.views = { increment: 1 };
    if (metric === 'photo') dataToUpdate.photoViews = { increment: 1 };
    if (metric === 'share') dataToUpdate.shareCount = { increment: 1 };

    await prisma.property.update({
      where: { id: pid },
      data: dataToUpdate
    });
    // No devolvemos nada, es una operación silenciosa
  } catch (error) {
    console.error("Error incrementando estadísticas:", error);
  }
}