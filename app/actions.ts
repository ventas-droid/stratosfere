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

// =========================================================
// 🌍 2. PROPIEDADES (GLOBALES Y PRIVADAS)
// =========================================================

// A. MAPA GLOBAL (SOLUCIÓN DEFINITIVA A LOS 0 m² Y DATOS FALTANTES)
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
        favoritedBy: { select: { userId: true } }
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

        return {
            ...p,
            id: p.id,
            coordinates: [p.longitude || -3.7038, p.latitude || 40.4168],
            images: allImages,
            img: realImg || null,
            
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

            // 🔥 DATOS CRÍTICOS RECUPERADOS (Aquí estaba el fallo de los 0m2 y N/D)
            m2: Number(p.mBuilt || 0),             // Esto arregla la NanoCard vacía
            mBuilt: Number(p.mBuilt || 0),         // Doble seguridad
            communityFees: p.communityFees || 0,   // Esto arregla el Panel de Detalles
            energyConsumption: p.energyConsumption,// Esto arregla la letra de consumo
            energyEmissions: p.energyEmissions,    // Esto arregla la letra de emisiones
            energyPending: p.energyPending         // Esto marca "En trámite" correctamente
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

// F. ACTUALIZAR PERFIL (Necesaria para ProfilePanel)
export async function updateUserAction(data: any) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };
  try {
    await prisma.user.update({
        where: { id: user.id },
        data: { name: data.name, avatar: data.avatar || undefined }
    });
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// G. TOGGLE LIKE (Necesaria para los corazones)
export async function toggleFavoriteAction(propertyId: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false };

    const existing = await prisma.favorite.findUnique({
        where: { userId_propertyId: { userId: user.id, propertyId } }
    });

    if (existing) {
        await prisma.favorite.delete({ where: { id: existing.id } });
        return { success: true, isFavorite: false };
    } else {
        await prisma.favorite.create({ data: { userId: user.id, propertyId } });
        return { success: true, isFavorite: true };
    }
}

// H. LEER FAVORITOS (BÓVEDA)
export async function getFavoritesAction() {
    const user = await getCurrentUser();
    if (!user) return { success: false, data: [] };

    const favs = await prisma.favorite.findMany({
        where: { userId: user.id },
        include: { property: { include: { images: true } } }
    });

    const cleanFavs = favs.map(f => {
        const p: any = f.property;
        if(!p) return null;
        const realImg = (p.images && p.images.length > 0) ? p.images[0].url : p.mainImage;

        return {
            ...p,
            id: p.id,
            img: realImg || null, 
            isFavorited: true, // Siempre true aquí
            price: new Intl.NumberFormat('es-ES').format(p.price || 0),
            rawPrice: p.price,
            
            // 🔥 DATOS COMPLETOS TAMBIÉN EN FAVORITOS
            m2: Number(p.mBuilt || 0),
            communityFees: p.communityFees || 0,
            energyConsumption: p.energyConsumption,
            energyEmissions: p.energyEmissions,
            energyPending: p.energyPending
        }
    }).filter(Boolean);

    return { success: true, data: cleanFavs };
}

