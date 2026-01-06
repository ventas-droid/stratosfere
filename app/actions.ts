"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from './lib/prisma';
import { cookies } from "next/headers";

// ==============================================================================
// 1. SISTEMA DE SEGURIDAD E IDENTIDAD (CEREBRO CENTRAL)
// ==============================================================================

// A. OBTENER USUARIO ACTUAL (Lee la cookie blindada)
async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionEmail = cookieStore.get('stratos_session_email')?.value;

  if (!sessionEmail) return null;

  const user = await prisma.user.findUnique({
    where: { email: sessionEmail } 
  });
  return user;
}

// B. LOGIN DE EMERGENCIA (Para pruebas rápidas con botón)
export async function loginWithEmail(email: string) {
    if (!email) return { success: false, error: "Email requerido" };
    
    try {
        // 1. Buscamos o creamos
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: { email, name: email.split('@')[0], role: 'AGENCIA', avatar: "" }
            });
        }

        // 2. 🔥 ACTIVAMOS LA SESIÓN (COOKIE)
        const cookieStore = await cookies();
        cookieStore.set('stratos_session_email', email, { 
            secure: true, httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 
        });

        return { success: true, user };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

// C. REGISTRO DESDE LANDING (LOGIN AUTOMÁTICO)
export async function createLead(formData: FormData) {
  const email = formData.get('email') as string;
  
  if (!email || !email.includes('@')) {
      return { success: false, error: "Email incorrecto" };
  }

  try {
    let user = await prisma.user.findUnique({ where: { email } });
    
    // Si no existe, lo creamos
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: email,
                name: email.split('@')[0], // Nombre temporal
                role: 'AGENCIA', // Rol por defecto
                avatar: ""
            }
        });
    }

    // 🔥 ESTO FALTABA: INICIO DE SESIÓN AUTOMÁTICO
    const cookieStore = await cookies();
    cookieStore.set('stratos_session_email', email, { 
        secure: true, 
        httpOnly: true, 
        path: '/', 
        maxAge: 60 * 60 * 24 * 7 
    });
    
    revalidatePath('/'); 
    return { success: true, user };

  } catch (error) {
    console.error("Error Login:", error);
    if (String(error).includes("Unique constraint")) return { success: true };
    return { success: false, error: "Error de conexión" }; 
  }
}

// D. CERRAR SESIÓN (BOMBA NUCLEAR DE COOKIES)
export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Borrado Masivo
    if (allCookies.length > 0) {
        allCookies.forEach((cookie) => {
          cookieStore.delete(cookie.name);
        });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// ==============================================================================
// 2. GESTIÓN DE PROPIEDADES (EL NEGOCIO)
// ==============================================================================

// A. GUARDAR PROPIEDAD (CON VINCULACIÓN DE USUARIO Y PACKS)
export async function savePropertyAction(data: any) {
  try {
    // 1. VERIFICAMOS IDENTIDAD
    const user = await getCurrentUser();
    
    // 🛑 CANDADO DE ACERO
    if (!user || !user.id) {
        console.error("⛔ INTENTO DE GUARDADO SIN USUARIO.");
        return { success: false, error: "ERROR CRÍTICO: No estás logueado." };
    }

    console.log(`💾 GUARDANDO PARA: ${user.email}`);

    // 2. LIMPIEZA DE DATOS
    const cleanPrice = typeof data.rawPrice === 'number' ? data.rawPrice : parseFloat(String(data.price).replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.]/g, '') || '0');
    const cleanM2 = typeof data.mBuilt === 'number' ? data.mBuilt : parseFloat(String(data.mBuilt).replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.]/g, '') || '0');
    
    // 3. GESTIÓN DE PACKS (REGLA DE HIERRO)
    let finalServices = Array.isArray(data.selectedServices) ? [...data.selectedServices] : [];
    if (!finalServices.some((s: string) => s.startsWith('pack_'))) {
        finalServices.push('pack_basic');
    }

    // 4. PREPARACIÓN DEL PAQUETE DB
    const hasService = (id: string) => finalServices.includes(id) || data[id] === true;

    const payload = {
        userId: user.id, // VINCULACIÓN
        
        title: data.title || null,
        description: data.description || null,
        address: data.address || "Dirección desconocida",
        city: data.city || data.location,
        region: data.region || null,
        postcode: data.postcode || null,
        
        latitude: data.coordinates ? data.coordinates[1] : 40.4168,
        longitude: data.coordinates ? data.coordinates[0] : -3.7038,
        
        type: data.type || 'Piso',
        price: cleanPrice,
        communityFees: data.communityFees ? parseFloat(String(data.communityFees)) : null,
        
        mBuilt: cleanM2,
        rooms: Number(data.rooms || 0),
        baths: Number(data.baths || 0),
        floor: data.floor ? String(data.floor) : null,
        door: data.door ? String(data.door) : null,
        state: data.state || "Buen estado",

        elevator: Boolean(data.elevator),
        pool: hasService('pool'),
        garage: hasService('garage'),
        terrace: hasService('terrace'),
        garden: hasService('garden'),
        storage: hasService('storage'),
        ac: hasService('ac'),
        security: hasService('security'),
        exterior: data.exterior !== false,

        selectedServices: finalServices, 
        mainImage: data.images?.[0] || data.img || null,
        status: 'PUBLICADO',
    };

    let result;
    
    // 5. EJECUCIÓN
    if (data.id && data.id.length > 20) { 
        const existing = await prisma.property.findUnique({ where: { id: data.id }});
        if (existing) {
             result = await prisma.property.update({ where: { id: data.id }, data: payload });
        } else {
             result = await prisma.property.create({
                data: { ...payload, images: { create: (data.images || []).map((url: string) => ({ url })) } }
            });
        }
    } else {
        result = await prisma.property.create({
            data: {
                ...payload,
                images: { create: (data.images || []).map((url: string) => ({ url })) }
            }
        });
    }

    revalidatePath('/');
    return { success: true, property: result };

  } catch (error) {
    console.error("❌ ERROR SAVE:", error);
    return { success: false, error: String(error) };
  }
}

// B. LEER PROPIEDADES (SOLO LAS DEL USUARIO)
export async function getPropertiesAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, data: [] };

    const properties = await prisma.property.findMany({
      where: { userId: user.id }, 
      orderBy: { createdAt: 'desc' },
      include: { images: true }
    });

    const safeProperties = properties.map((p: any) => {
      let allImages = p.images.map((i: any) => i.url);
      if (allImages.length === 0 && p.mainImage) allImages.push(p.mainImage);
      
      const combinedServices = [
          ...(p.selectedServices || []),
          p.pool ? 'pool' : null, p.garage ? 'garage' : null,
          p.elevator ? 'elevator' : null, p.terrace ? 'terrace' : null,
          p.garden ? 'garden' : null, p.storage ? 'storage' : null,
          p.ac ? 'ac' : null, p.security ? 'security' : null
      ].filter(Boolean);

      let finalCoords = [Number(p.longitude), Number(p.latitude)];
      if (!p.longitude || !p.latitude || (p.longitude === 0 && p.latitude === 0)) {
           const offset = (p.id.charCodeAt(0) % 50) * 0.0005; 
           finalCoords = [-3.7038 + offset, 40.4168 - offset];
      }

      return {
          ...p,
          images: allImages,
          img: allImages[0] || null,
          price: new Intl.NumberFormat('es-ES').format(p.price || 0),
          rawPrice: p.price,
          selectedServices: Array.from(new Set(combinedServices)),
          coordinates: finalCoords
      };
    });

    return { success: true, data: safeProperties };
  } catch (error) {
    return { success: false, data: [], error: String(error) };
  }
}

// C. BORRAR PROPIEDAD
export async function deletePropertyAction(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "No autorizado" };

    await prisma.property.deleteMany({ 
        where: { id: id, userId: user.id } 
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// ==============================================================================
// 3. PERFIL Y FAVORITOS (EXTRAS)
// ==============================================================================

export async function getUserMeAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Usuario no logueado" };

    return { 
        success: true, 
        data: {
            id: user.id,
            name: user.name || "",
            email: user.email,
            avatar: user.avatar || "",
            role: user.role || "AGENCIA",
            phone: user.phone || "",
            companyName: user.companyName || "",
            licenseNumber: user.licenseNumber || "",
            website: user.website || ""
        }
    };
  } catch (error) { return { success: false, error: String(error) }; }
}

export async function updateUserAction(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "No autorizado" };
    
    await prisma.user.update({
        where: { id: user.id },
        data: { 
            name: data.name, 
            avatar: data.avatar
            // Agregue más campos aquí si lo necesita
        }
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) { 
    // 🔥 AQUÍ ESTÁ EL ARREGLO PARA PROFILEPANEL.TSX
    return { success: false, error: String(error) }; 
  }
}

export async function toggleFavoriteAction(propertyId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Login requerido" };
        
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
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

export async function getFavoritesAction() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, data: [] };
        
        const favs = await prisma.favorite.findMany({
            where: { userId: user.id },
            include: { property: { include: { images: true } } }
        });
        
        const data = favs.map((f: any) => ({
            ...f.property,
            img: f.property.images[0]?.url || f.property.mainImage,
            price: new Intl.NumberFormat('es-ES').format(f.property.price || 0),
            id: f.property.id
        }));
        return { success: true, data };
    } catch (error) {
        return { success: false, data: [], error: String(error) };
    }
}

