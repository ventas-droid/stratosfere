"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from './lib/prisma'; 
import { cookies } from "next/headers";

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

// A. MAPA GLOBAL (CORREGIDO: AHORA TRAE LA IDENTIDAD DEL CREADOR)
export async function getGlobalPropertiesAction() {
  try {
    const user = await getCurrentUser();
    const currentUserId = user?.id;

    // Traemos TODAS las publicadas
    const properties = await prisma.property.findMany({
      where: { status: 'PUBLICADO' },
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
        favoritedBy: { select: { userId: true } },
        // 🔥 CRÍTICO: AQUÍ PEDIMOS LOS DATOS DEL DUEÑO A LA BASE DE DATOS
        user: {
            select: {
                id: true,
                name: true,
                avatar: true,
                companyName: true,  // Por si es Agencia
                companyLogo: true,  // Por si es Agencia
                role: true,
                phone: true,
                mobile: true,
                cif: true,
                licenseNumber: true
            }
        }
      }
    });

    const mappedProps = properties.map((p: any) => {
        // Gestión de fotos (Prioridad: Galería -> Portada -> Null)
        const realImg = (p.images && p.images.length > 0) ? p.images[0].url : p.mainImage;
        let allImages = p.images.map((img: any) => img.url);
        if (allImages.length === 0 && realImg) allImages = [realImg];

        // Verificar si yo le di like
        const isFavoritedByMe = currentUserId
            ? p.favoritedBy.some((fav: any) => fav.userId === currentUserId)
            : false;

        // 🔥 GESTIÓN DE IDENTIDAD: Preparamos los datos del dueño
        const creator = p.user || {};
        
        // Si tiene nombre de empresa, usamos ese. Si no, el personal.
        const finalName = creator.companyName || creator.name || "Usuario Stratos";
        // Si tiene logo de empresa, usamos ese. Si no, el avatar personal.
        const finalAvatar = creator.companyLogo || creator.avatar || null;
        // Preferimos el móvil, si no el fijo.
        const finalPhone = creator.mobile || creator.phone || null;

        const ownerIdentity = {
            name: finalName,
            avatar: finalAvatar,
            role: creator.role || "PARTICULAR",
            phone: finalPhone,
            isVerified: !!(creator.cif || creator.licenseNumber || creator.role === 'AGENCIA')
        };

        return {
            ...p,
            id: p.id,
            coordinates: [p.longitude || -3.7038, p.latitude || 40.4168],
            images: allImages,
            img: realImg || null,
            
            // 🔥 AQUÍ ENVIAMOS EL "CARNET" DEL DUEÑO AL FRONTEND
            user: ownerIdentity, 
            
            // Fallbacks por compatibilidad (para asegurar que se vea algo)
            userName: finalName,
            userAvatar: finalAvatar,
            role: creator.role || "PARTICULAR",
            
            // PRECIO
            price: new Intl.NumberFormat('es-ES').format(p.price || 0),
            rawPrice: p.price,
            priceValue: p.price,
            
            // ESTADO
            isFavorited: isFavoritedByMe,

            // EXTRAS BÁSICOS
            pool: p.pool,
            garage: p.garage,
            elevator: p.elevator,

            // DATOS TÉCNICOS
            m2: Number(p.mBuilt || 0),             
            mBuilt: Number(p.mBuilt || 0),         
            communityFees: p.communityFees || 0,   
            energyConsumption: p.energyConsumption,
            energyEmissions: p.energyEmissions,    
            energyPending: p.energyPending         
        };
    });

    return { success: true, data: mappedProps };
  } catch (error) {
    console.error("Error mapa global:", error);
    return { success: false, data: [] };
  }
}

// B. MIS PROPIEDADES (PERFIL)
export async function getPropertiesAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, data: [] };

    const properties = await prisma.property.findMany({
      where: { userId: user.id }, 
      orderBy: { createdAt: 'desc' },
      include: { images: true } 
    });

    const mappedProps = properties.map((p: any) => {
        const realImg = (p.images && p.images.length > 0) ? p.images[0].url : p.mainImage;
        let allImages = p.images.map((img: any) => img.url);
        if (allImages.length === 0 && realImg) allImages = [realImg];

        return {
            ...p,
            id: p.id,
            coordinates: [p.longitude || -3.7038, p.latitude || 40.4168],
            images: allImages,
            img: realImg || null,
            price: new Intl.NumberFormat('es-ES').format(p.price || 0),
            rawPrice: p.price,
            pool: p.pool,
            garage: p.garage,
            elevator: p.elevator,

            // 🔥 ASEGURAMOS CONSISTENCIA EN EL PERFIL TAMBIÉN
            m2: Number(p.mBuilt || 0),
            mBuilt: Number(p.mBuilt || 0),
            communityFees: p.communityFees || 0,
            energyConsumption: p.energyConsumption,
            energyEmissions: p.energyEmissions,
            energyPending: p.energyPending
        };
    });

    return { success: true, data: mappedProps };
  } catch (error) {
    return { success: false, data: [] };
  }
}

// C. GUARDAR PROPIEDAD (ESCRITURA BLINDADA)
export async function savePropertyAction(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Debes iniciar sesión." };

    // Limpieza de Precio
    const cleanPrice = parseFloat(String(data.price).replace(/\D/g, '') || '0');
    
    // 🔥 LIMPIEZA DE M2 "AGRESIVA": Busca en mBuilt, m2 o surface
    const rawM2 = data.mBuilt || data.m2 || data.surface || '0';
    const cleanM2 = parseFloat(String(rawM2).replace(/\D/g, '') || '0');
    
    // Servicios
    let finalServices = Array.isArray(data.selectedServices) ? [...data.selectedServices] : [];
    if (!finalServices.some((s: string) => s.startsWith('pack_'))) finalServices.push('pack_basic');

    // Imágenes
    const imagesList = Array.isArray(data.images) ? data.images : [];
    if (data.mainImage && !imagesList.includes(data.mainImage)) imagesList.unshift(data.mainImage);
    const mainImage = imagesList.length > 0 ? imagesList[0] : null;

    // Construcción del objeto para la BD
    const payload = {
        userId: user.id,
        type: data.type || 'Piso',
        title: data.title || `Propiedad en ${data.city}`,
        description: data.description || "",
        price: cleanPrice,
        mBuilt: cleanM2, // Aquí guardamos el valor limpio
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

        // 🔥 MAPEO EXACTO AL ESQUEMA DE PRISMA (CORREGIDO communityFees)
        communityFees: Number(data.communityFees || 0), 
        energyConsumption: data.energyConsumption || null, 
        energyEmissions: data.energyEmissions || null,     
        energyPending: Boolean(data.energyPending),        
    };

    const imageCreateLogic = { create: imagesList.map((url: string) => ({ url })) };
    let result;

    if (data.id && data.id.length > 20) { 
        // EDICIÓN
        const existing = await prisma.property.findUnique({ where: { id: data.id }});
        if (existing && existing.userId === user.id) {
            await prisma.image.deleteMany({ where: { propertyId: data.id } });
            result = await prisma.property.update({
                where: { id: data.id },
                data: { ...payload, images: imageCreateLogic },
                include: { images: true }
            });
        } else {
             // Si el ID es raro, creamos nueva por seguridad
             result = await prisma.property.create({ 
                 data: { ...payload, images: imageCreateLogic },
                 include: { images: true }
             });
        }
    } else {
        // CREACIÓN
        result = await prisma.property.create({ 
            data: { ...payload, images: imageCreateLogic },
            include: { images: true }
        });
    }

    revalidatePath('/'); 
    return { success: true, property: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// D. BORRAR PROPIEDAD
export async function deletePropertyAction(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "No autorizado" };
    await prisma.property.deleteMany({ where: { id: id, userId: user.id } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
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
export async function updateUserAction(data: any) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  try {
    const updateData: any = {};

    // 1. Identidad Personal
    if (data.name !== undefined) updateData.name = data.name;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    // 2. Identidad Corporativa (Agencia)
    if (data.companyName !== undefined) updateData.companyName = data.companyName;
    if (data.companyLogo !== undefined) updateData.companyLogo = data.companyLogo;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.tagline !== undefined) updateData.tagline = data.tagline;
    if (data.zone !== undefined) updateData.zone = data.zone;
    if (data.licenseNumber !== undefined) updateData.licenseNumber = data.licenseNumber;
    if (data.cif !== undefined) updateData.cif = data.cif;

    // 3. Contacto & Web
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.mobile !== undefined) updateData.mobile = data.mobile;
    if (data.website !== undefined) updateData.website = data.website;

    // Ejecutar en DB
    await prisma.user.update({
        where: { id: user.id },
        data: updateData
    });

    revalidatePath('/'); 
    return { success: true };
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
    const where = { userId_propertyId: { userId: user.id, propertyId: safePropertyId } };

    const existing = await prisma.favorite.findUnique({ where });
    const exists = !!existing;

    // ✅ IDEMPOTENCIA:
    // - Si desired viene (true/false), obedecemos
    // - Si no viene, hacemos toggle clásico
    const shouldAdd = typeof desired === "boolean" ? desired : !exists;

    // Si me piden un estado que ya es el actual -> no hago nada
    if (shouldAdd === exists) {
      return {
        success: true,
        isFavorite: exists,
        action: "noop",
      };
    }

    if (shouldAdd) {
      await prisma.favorite.create({
        data: { userId: user.id, propertyId: safePropertyId },
      });
      return { success: true, isFavorite: true, action: "added" };
    } else {
      await prisma.favorite.delete({ where });
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
        include: { property: { include: { images: true } } }
    });

    const cleanFavs = favs.map(f => {
        const p: any = f.property;
        if (!p) return null;

        // Imágenes consistentes
        let allImages = (p.images || []).map((img: any) => img.url);
        if (allImages.length === 0 && p.mainImage) allImages = [p.mainImage];
        const realImg = allImages[0] || null;

        const lng = (p.longitude ?? -3.7038);
        const lat = (p.latitude ?? 40.4168);

        return {
            ...p,
            id: p.id,

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
            price: new Intl.NumberFormat('es-ES').format(p.price || 0),
            rawPrice: p.price,
            priceValue: p.price,

            // ✅ Datos críticos
            m2: Number(p.mBuilt || 0),
            mBuilt: Number(p.mBuilt || 0),
            communityFees: p.communityFees || 0,
            energyConsumption: p.energyConsumption,
            energyEmissions: p.energyEmissions,
            energyPending: p.energyPending
        };
    }).filter(Boolean);

    return { success: true, data: cleanFavs };
}
// =========================================================
// 🏢 4. GESTIÓN DE AGENCIA (STOCK BLINDADO)
// =========================================================

// A. OBTENER PORTAFOLIO COMPLETO (PROPIAS + FAVORITOS)
export async function getAgencyPortfolioAction() {
  try {
    const user = await getUserMeAction();
    if (!user.success || !user.data) return { success: false, data: [] };

    // 1. Mis Propiedades (Soy dueño)
    const myProperties = await prisma.property.findMany({
      where: { userId: user.data.id },
      include: { images: true }
    });

    // 2. Mis Favoritos (He dado like)
    const myFavorites = await prisma.favorite.findMany({
      where: { userId: user.data.id },
      include: { property: { include: { images: true } } }
    });

    // 3. Unificar listas (Normalizando datos)
    const owned = myProperties.map((p: any) => ({ ...p, isOwner: true, isFavorited: true }));
    const favs = myFavorites.map((f: any) => ({ ...f.property, isOwner: false, isFavorited: true }));

    // 4. Eliminar duplicados (Por si di like a mi propia casa)
    const combined = [...owned];
    const ownedIds = new Set(owned.map((p:any) => p.id));
    
    favs.forEach((f:any) => {
        if (!ownedIds.has(f.id)) combined.push(f);
    });

    // 5. Formatear para el Mapa (Precio, Fotos, Coordenadas)
    const cleanList = combined.map((p: any) => {
        if (!p) return null;
        let allImages = (p.images || []).map((img: any) => img.url);
        if (allImages.length === 0 && p.mainImage) allImages = [p.mainImage];
        
        return {
            ...p,
            id: p.id,
            images: allImages,
            img: allImages[0] || null,
            price: new Intl.NumberFormat('es-ES').format(p.price || 0),
            rawPrice: p.price,
            priceValue: p.price,
            coordinates: [p.longitude || -3.7038, p.latitude || 40.4168],
            m2: Number(p.mBuilt || 0),
            communityFees: p.communityFees || 0
        };
    }).filter(Boolean);

    return { success: true, data: cleanList };
  } catch (error) {
    console.error("Error Stock:", error);
    return { success: false, error: "Error de conexión" };
  }
}

// B. BORRAR DEL STOCK (LÓGICA PRIORITARIA)
export async function deleteFromStockAction(propertyId: string) {
    try {
        const user = await getUserMeAction();
        if (!user.success || !user.data) return { success: false };

        // 1. ¿SOY EL DUEÑO? -> BORRADO TOTAL
        const ownedProp = await prisma.property.findFirst({
            where: { id: propertyId, userId: user.data.id }
        });

        if (ownedProp) {
            // Prisma se encarga de borrar las imágenes y favoritos asociados si está configurado en Cascade
            // Pero por seguridad, borramos imágenes primero
            await prisma.image.deleteMany({ where: { propertyId } });
            await prisma.property.delete({ where: { id: propertyId } });
            
            revalidatePath('/');
            return { success: true, type: 'property_deleted' };
        }

        // 2. NO SOY DUEÑO -> BORRAR SOLO MI FAVORITO
        const fav = await prisma.favorite.findUnique({
            where: { userId_propertyId: { userId: user.data.id, propertyId } }
        });

        if (fav) {
            await prisma.favorite.delete({ where: { id: fav.id } });
            revalidatePath('/');
            return { success: true, type: 'favorite_removed' };
        }

        return { success: false, error: "No tienes permisos sobre este activo." };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}