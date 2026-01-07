"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from './lib/prisma'; 
import { cookies } from "next/headers";

// =========================================================
// 🔐 SECCIÓN 1: AUTENTICACIÓN
// =========================================================

async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionEmail = cookieStore.get('stratos_session_email')?.value;

  if (!sessionEmail) return null;

  try {
    const user = await prisma.user.findUnique({
        where: { email: sessionEmail } 
    });
    return user;
  } catch (e) {
    console.error("Error identificando usuario:", e);
    return null;
  }
}

export async function loginWithEmail(email: string) {
    if (!email) return { success: false, error: "Email requerido" };
    
    try {
        let user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            user = await prisma.user.create({
                data: { 
                    email, 
                    name: email.split('@')[0], 
                    role: 'AGENCIA',           
                    avatar: "" 
                }
            });
        }

        const cookieStore = await cookies();
        cookieStore.set('stratos_session_email', email, { 
            secure: process.env.NODE_ENV === 'production', 
            httpOnly: true, 
            path: '/', 
            maxAge: 60 * 60 * 24 * 30 
        });

        return { success: true, user };
    } catch (error) {
        console.error("❌ Error en Login:", error);
        return { success: false, error: "Error de conexión" };
    }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.getAll().forEach((cookie) => {
    cookieStore.delete(cookie.name);
  });
  return { success: true };
}

// =========================================================
// 🚀 SECCIÓN 2: LEADS
// =========================================================

export async function createLead(formData: FormData) {
  const email = formData.get('email') as string;
  
  if (!email || !email.includes('@')) {
      return { success: false, error: "Email incorrecto" };
  }

  try {
    await prisma.user.create({
      data: {
        email: email,
        name: "Lead Landing",
        role: "PARTICULAR"
      }
    });
    revalidatePath('/'); 
    return { success: true };
  } catch (error) {
    if (String(error).includes("Unique constraint")) {
        return { success: true };
    }
    return { success: false, error: "Error de conexión" }; 
  }
}

// =========================================================
// 🏠 SECCIÓN 3: PROPIEDADES
// =========================================================

export async function savePropertyAction(data: any) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
        return { success: false, error: "Debes iniciar sesión para publicar." };
    }

    const cleanPrice = parseFloat(String(data.price).replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.]/g, '') || '0');
    const cleanM2 = parseFloat(String(data.mBuilt).replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.]/g, '') || '0');
    
    let finalServices = Array.isArray(data.selectedServices) ? [...data.selectedServices] : [];
    if (!finalServices.some((s: string) => s.startsWith('pack_'))) {
        finalServices.push('pack_basic');
    }

    const imagesList = Array.isArray(data.images) ? data.images : [];
    const mainImage = imagesList.length > 0 ? imagesList[0] : null;

    const payload = {
        userId: user.id,
        type: data.type || 'Piso',
        title: data.title || `Oportunidad en ${data.city || 'Madrid'}`,
        description: data.description || "",
        price: cleanPrice,
        mBuilt: cleanM2,
        address: data.address || "Dirección desconocida",
        city: data.city || "Madrid",
        region: data.region || null,
        postcode: data.postcode || null,
        latitude: data.coordinates ? data.coordinates[1] : 40.4168,
        longitude: data.coordinates ? data.coordinates[0] : -3.7038,
        rooms: Number(data.rooms || 0),
        baths: Number(data.baths || 0),
        floor: data.floor ? String(data.floor) : null,
        door: data.door ? String(data.door) : null,
        elevator: Boolean(data.elevator),
        pool: Boolean(data.pool) || finalServices.includes('pool'),
        garage: Boolean(data.garage) || finalServices.includes('garage'),
        terrace: Boolean(data.terrace) || finalServices.includes('terrace'),
        garden: Boolean(data.garden) || finalServices.includes('garden'),
        storage: Boolean(data.storage) || finalServices.includes('storage'),
        ac: Boolean(data.ac) || finalServices.includes('ac'),
        security: Boolean(data.security) || finalServices.includes('security'),
        exterior: data.exterior !== false,
        selectedServices: finalServices,
        mainImage: mainImage,
        energyConsumption: data.energyConsumption || null,
        energyEmissions: data.energyEmissions || null,
        energyPending: Boolean(data.energyPending),
    };

    let result;
    
    if (data.id && data.id.length > 20) { 
        const existing = await prisma.property.findUnique({ where: { id: data.id }});
        
        if (existing && existing.userId === user.id) {
            await prisma.image.deleteMany({ where: { propertyId: data.id } }); 
            result = await prisma.property.update({
                where: { id: data.id },
                data: {
                    ...payload,
                    images: { create: imagesList.map((url: string) => ({ url })) }
                },
                include: { images: true }
            });
        } else {
             result = await prisma.property.create({ 
                 data: { ...payload, images: { create: imagesList.map((url: string) => ({ url })) } },
                 include: { images: true }
             });
        }
    } else {
        result = await prisma.property.create({ 
            data: { ...payload, images: { create: imagesList.map((url: string) => ({ url })) } },
            include: { images: true }
        });
    }

    revalidatePath('/'); 
    return { success: true, property: result };

  } catch (error) {
    console.error("❌ Error guardando propiedad:", error);
    return { success: false, error: String(error) };
  }
}

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
        const allImages = p.images.map((img: any) => img.url);
        if (allImages.length === 0 && p.mainImage) allImages.push(p.mainImage);

        return {
            ...p,
            id: p.id,
            coordinates: [p.longitude || -3.7038, p.latitude || 40.4168],
            images: allImages,
            img: allImages[0] || null,
            price: new Intl.NumberFormat('es-ES').format(p.price || 0),
            rawPrice: p.price,
            priceValue: p.price,
            pool: p.pool,
            garage: p.garage,
            elevator: p.elevator
        };
    });

    return { success: true, data: mappedProps };

  } catch (error) {
    console.error("Error leyendo propiedades:", error);
    return { success: false, data: [] };
  }
}

export async function deletePropertyAction(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "No autorizado" };

    const result = await prisma.property.deleteMany({ 
        where: { id: id, userId: user.id } 
    });

    if (result.count === 0) return { success: false, error: "No se pudo borrar" };
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// =========================================================
// 👤 SECCIÓN 4: PERFIL (CORREGIDO)
// =========================================================

export async function getUserMeAction() {
  const user = await getCurrentUser();
  if (!user) return { success: false };
  return { success: true, data: user };
}

// ⬇️ ESTA ES LA FUNCIÓN QUE DABA ERROR ROJO EN PROFILEPANEL.TSX
// Ahora devuelve { success: false, error: ... } si falla, como espera el frontend.
export async function updateUserAction(data: any) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  try {
    await prisma.user.update({
        where: { id: user.id },
        data: {
            name: data.name,
            avatar: data.avatar || undefined
        }
    });
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

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
        return {
            ...p,
            img: p.mainImage || (p.images[0]?.url) || null,
            price: new Intl.NumberFormat('es-ES').format(p.price || 0)
        }
    }).filter(Boolean);

    return { success: true, data: cleanFavs };
}