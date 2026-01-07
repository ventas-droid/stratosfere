"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from './lib/prisma'; 
import { cookies } from "next/headers";

// =========================================================
// 🔐 1. AUTENTICACIÓN
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

export async function loginUser(formData: FormData) { /* ... (Su código de login ya funciona en login.ts) ... */ }
// (Nota: Si usa login.ts separado, no necesita login aquí, pero dejo los helpers por si acaso)

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.getAll().forEach((cookie) => cookieStore.delete(cookie.name));
  return { success: true };
}

// =========================================================
// 🏠 2. PROPIEDADES (LÓGICA DE FOTOS REALES)
// =========================================================

export async function savePropertyAction(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Debes iniciar sesión." };

    // Limpieza de datos
    const cleanPrice = parseFloat(String(data.price).replace(/\D/g, '') || '0');
    const cleanM2 = parseFloat(String(data.mBuilt).replace(/\D/g, '') || '0');
    
    // Servicios
    let finalServices = Array.isArray(data.selectedServices) ? [...data.selectedServices] : [];
    if (!finalServices.some((s: string) => s.startsWith('pack_'))) finalServices.push('pack_basic');

    // FOTOS: Aseguramos que sea un array de strings reales
    const imagesList = Array.isArray(data.images) ? data.images : [];
    
    // Si viene mainImage pero no está en la lista, la añadimos (seguridad)
    if (data.mainImage && !imagesList.includes(data.mainImage)) {
        imagesList.unshift(data.mainImage);
    }
    
    // Definimos la portada real
    const mainImage = imagesList.length > 0 ? imagesList[0] : null;

   // En app/actions.ts -> dentro de savePropertyAction

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
        energyPending: Boolean(data.energyPending),

        // 🔥 AÑADA ESTA LÍNEA PARA QUE SALGA DEL BORRADOR:
        status: 'PUBLICADO', 
    };

    let result;
    
    // ESTRATEGIA DE GUARDADO DE IMÁGENES
    // Prisma creará filas en la tabla 'Image' por cada URL de la lista
    const imageCreateLogic = {
        create: imagesList.map((url: string) => ({ url }))
    };

    if (data.id && data.id.length > 20) { 
        const existing = await prisma.property.findUnique({ where: { id: data.id }});
        if (existing && existing.userId === user.id) {
            // Borramos fotos viejas y ponemos las nuevas
            await prisma.image.deleteMany({ where: { propertyId: data.id } });
            
            result = await prisma.property.update({
                where: { id: data.id },
                data: { ...payload, images: imageCreateLogic },
                include: { images: true }
            });
        } else {
             result = await prisma.property.create({ 
                 data: { ...payload, images: imageCreateLogic },
                 include: { images: true }
             });
        }
    } else {
        result = await prisma.property.create({ 
            data: { ...payload, images: imageCreateLogic },
            include: { images: true }
        });
    }

    revalidatePath('/'); 
    return { success: true, property: result };

  } catch (error) {
    console.error("❌ Error guardando:", error);
    return { success: false, error: String(error) };
  }
}

// 🔥 AQUÍ ESTÁ LA CLAVE: RECUPERAR FOTOS REALES
export async function getPropertiesAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, data: [] };

    const properties = await prisma.property.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { images: true } // IMPORTANTE: Traer la tabla de imágenes
    });

    const mappedProps = properties.map((p: any) => {
        // 1. Sacamos las URLs de la tabla relacionada (Image)
        let dbImages = p.images.map((img: any) => img.url);
        
        // 2. Si la tabla estaba vacía pero teníamos un mainImage antiguo, lo usamos
        if (dbImages.length === 0 && p.mainImage) {
            dbImages = [p.mainImage];
        }

        return {
            ...p,
            id: p.id,
            coordinates: [p.longitude || -3.7038, p.latitude || 40.4168],
            
            // 🔥 RAW DATA: Aquí van las fotos reales. 
            // Si el array está vacío, el frontend recibirá vacío y no mostrará nada.
            images: dbImages, 
            img: dbImages[0] || null, // La portada es la primera foto real o NULL.
            
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
    console.error("Error leyendo:", error);
    return { success: false, data: [] };
  }
}

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
// ❤️ 3. FAVORITOS (FOTOS REALES TAMBIÉN)
// =========================================================
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

        // Extraer foto real
        const realImg = (p.images && p.images.length > 0) ? p.images[0].url : p.mainImage;

        return {
            ...p,
            // Solo pasamos la foto real. Si es null, el componente sabrá que no hay foto.
            img: realImg || null,
            price: new Intl.NumberFormat('es-ES').format(p.price || 0)
        }
    }).filter(Boolean);

    return { success: true, data: cleanFavs };
}

// (Mantenga el resto: getUserMeAction, updateUserAction, toggleFavoriteAction igual que antes)
export async function getUserMeAction() { /* ... */ const user = await getCurrentUser(); if (!user) return { success: false }; return { success: true, data: user }; }
export async function updateUserAction(data: any) { /* ... */ const user = await getCurrentUser(); if (!user) return { success: false, error: "No autorizado" }; try { await prisma.user.update({ where: { id: user.id }, data: { name: data.name, avatar: data.avatar || undefined } }); revalidatePath('/'); return { success: true }; } catch (e) { return { success: false, error: String(e) }; } }
export async function toggleFavoriteAction(propertyId: string) { /* ... */ const user = await getCurrentUser(); if (!user) return { success: false }; const existing = await prisma.favorite.findUnique({ where: { userId_propertyId: { userId: user.id, propertyId } } }); if (existing) { await prisma.favorite.delete({ where: { id: existing.id } }); return { success: true, isFavorite: false }; } else { await prisma.favorite.create({ data: { userId: user.id, propertyId } }); return { success: true, isFavorite: true }; } }