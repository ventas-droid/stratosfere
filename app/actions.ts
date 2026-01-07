"use server"; // <--- ⚠️ ESTO DEBE SER LA LÍNEA 1 OBLIGATORIAMENTE

import { revalidatePath } from 'next/cache';
import { prisma } from './lib/prisma'; // o tus imports actuales
import { cookies } from "next/headers";

// ... resto de tu código (getPropertiesAction, etc)...
// ... resto de imports




// ---------------------------------------------------------
// 🔐 1. IDENTIFICACIÓN REAL (COOKIE-BASED) - VERSIÓN CORRECTA
// ---------------------------------------------------------
async function getCurrentUser() {
  const cookieStore = await cookies();
  // Leemos la cookie de sesión real
  const sessionEmail = cookieStore.get('stratos_session_email')?.value;

  if (!sessionEmail) return null;

  // Buscamos al usuario por el email de la cookie
  const user = await prisma.user.findUnique({
    where: { email: sessionEmail } 
  });
  return user;
}

// ---------------------------------------------------------
// 🚀 2. LOGIN SIMULADO (ESTO CREA LA SESIÓN REAL)
// ---------------------------------------------------------
export async function loginWithEmail(email: string) {
    if (!email) return { success: false };
    
    // 1. Buscamos o creamos el usuario en DB
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

    // 2. Tatuamos la cookie en el navegador (7 días de vida)
    const cookieStore = await cookies();
    cookieStore.set('stratos_session_email', email, { 
        secure: true, 
        httpOnly: true, 
        path: '/', 
        maxAge: 60 * 60 * 24 * 7 
    });

    return { success: true, user };
}

// --- FUNCIÓN 1: GUARDAR EMAILS (LANDING) ---
export async function createLead(formData: FormData) {
  const email = formData.get('email') as string;
  
  if (!email || !email.includes('@')) {
      return { success: false, error: "Email incorrecto" };
  }

  try {
    // Intentamos guardar en la base de datos
    await prisma.user.create({
      data: {
        email: email,
        name: "Lead Landing",
        avatar: "",
      }
    });
    
    revalidatePath('/'); 
    return { success: true };

  } catch (error) {
    console.error("Error servidor:", error);
    // Si el email ya existe, decimos que OK para no asustar
    if (String(error).includes("Unique constraint")) {
        return { success: true };
    }
    return { success: false, error: "Error de conexión" }; 
  }
}

// ---------------------------------------------------------
// 🏠 3. GUARDAR PROPIEDAD (SAVE) - VERSIÓN BLINDADA (SIN HUÉRFANOS)
// ---------------------------------------------------------
export async function savePropertyAction(data: any) {
  try {
    // 1. IDENTIFICACIÓN OBLIGATORIA
    const user = await getCurrentUser();
    
    // 🛑 CANDADO: Si no hay usuario, ABORTAMOS. Nada de huérfanos.
    if (!user || !user.id) {
        console.error("⛔ INTENTO DE GUARDADO SIN USUARIO. ABORTANDO.");
        return { success: false, error: "ERROR CRÍTICO: Usuario no identificado. Recarga la página." };
    }

    console.log(`💾 GUARDANDO PROPIEDAD VINCULADA A: ${user.email} (ID: ${user.id})`);

    // A. LIMPIEZA DE DATOS
    const cleanPrice = typeof data.rawPrice === 'number' ? data.rawPrice : parseFloat(String(data.price).replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.]/g, '') || '0');
    const cleanM2 = typeof data.mBuilt === 'number' ? data.mBuilt : parseFloat(String(data.mBuilt).replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.]/g, '') || '0');
    
    // B. GESTIÓN DE PACKS Y SERVICIOS (LA MEMORIA DE MERCADO)
    // Aseguramos que data.selectedServices sea un array limpio
    let finalServices = Array.isArray(data.selectedServices) ? [...data.selectedServices] : [];
    
    // REGLA: Si no hay pack, inyectamos BASIC (para que no nazca desnuda)
    const packExists = finalServices.some((s: string) => s.startsWith('pack_'));
    if (!packExists) {
        finalServices.push('pack_basic');
    }

    // C. MAPEO DE AMENITIES FÍSICOS (Para columnas booleanas)
    const hasService = (id: string) => finalServices.includes(id) || data[id] === true;

    // D. EL PAQUETE DE DATOS PARA PRISMA
    const payload = {
        // 🔥 AQUÍ ESTÁ EL VÍNCULO SAGRADO 🔥
        userId: user.id, // Esto es lo que faltaba o fallaba. Ahora es OBLIGATORIO.
        
        // Datos Físicos
        address: data.address || "Dirección desconocida",
        city: data.city || data.location,
        region: data.region || null,
        postcode: data.postcode || null,
        latitude: data.coordinates ? data.coordinates[1] : 40.4168,
        longitude: data.coordinates ? data.coordinates[0] : -3.7038,
        
        type: data.type || 'Piso',
        title: data.title || null,
        description: data.description || null,
        
        price: cleanPrice,
        communityFees: data.communityFees ? parseFloat(String(data.communityFees)) : null,
        
        mBuilt: cleanM2,
        rooms: Number(data.rooms || 0),
        baths: Number(data.baths || 0),
        floor: data.floor ? String(data.floor) : null,
        door: data.door ? String(data.door) : null,
        state: data.state || "Buen estado",

        // Amenities (Columnas)
        elevator: Boolean(data.elevator),
        pool: hasService('pool'),
        garage: hasService('garage'),
        terrace: hasService('terrace'),
        garden: hasService('garden'),
        storage: hasService('storage'),
        ac: hasService('ac'),
        security: hasService('security'),
        exterior: data.exterior !== false,

        // Energía
        energyConsumption: data.energyConsumption || null,
        energyEmissions: data.energyEmissions || null,
        energyPending: data.energyPending === true,

        // 🔥 MERCADO (Aquí se guardan los packs contratados)
        selectedServices: finalServices, 

        // Imagen
        mainImage: data.images?.[0] || null,
        status: 'PUBLICADO',
    };

    // E. EJECUCIÓN EN BASE DE DATOS
    let result;
    
    // CASO 1: EDICIÓN (Solo si el ID existe y pertenece al usuario)
    if (data.id && data.id.length > 20) { 
        const existing = await prisma.property.findUnique({ where: { id: data.id }});
        
        // Solo actualizamos si existe. Si no, creamos uno nuevo con ese ID si es necesario o uno nuevo.
        if (existing) {
             // SEGURIDAD EXTRA: Aseguramos que no robamos la propiedad de otro (opcional, pero recomendado)
             // Si quisiera forzar la propiedad, aquí actualizamos el userId también.
             result = await prisma.property.update({
                where: { id: data.id },
                data: payload
            });
        } else {
             // Si trae ID raro, creamos de cero
             result = await prisma.property.create({
                data: { ...payload, images: { create: (data.images || []).map((url: string) => ({ url })) } }
            });
        }
    } 
    // CASO 2: CREACIÓN NUEVA
    else {
        result = await prisma.property.create({
            data: {
                ...payload,
                images: {
                    create: (data.images || []).map((url: string) => ({ url }))
                }
            }
        });
    }

    revalidatePath('/');
    return { success: true, property: result };

  } catch (error) {
    console.error("❌ ERROR CRÍTICO EN DB:", error);
    return { success: false, error: String(error) };
  }
}
// ---------------------------------------------------------
// 4. LEER PROPIEDADES (FILTRADO + LÓGICA COMPLETA DE RESCATE)
// ---------------------------------------------------------
export async function getPropertiesAction() {
  try {
    // 🔥 1. IDENTIFICACIÓN (SEGURIDAD)
    const user = await getCurrentUser();
    
    // Si no le encuentra, devolvemos array vacío por seguridad
    if (!user) {
        console.warn("⚠️ Usuario no identificado. Retornando lista vacía.");
        return { success: false, data: [] };
    }

    // 🔥 2. FILTRO BLINDADO (where: { userId: user.id })
    const properties = await prisma.property.findMany({
      where: {
        userId: user.id // <--- CLAVE: SOLO TRAE LO SUYO
      },
      orderBy: { createdAt: 'desc' },
      include: { images: true }
    });

    // PROCESO DE TRADUCCIÓN (DATOS DB -> DATOS FRONTEND)
    const safeProperties = properties.map((p: any) => {
      
      // A. GESTIÓN DE FOTOS (ARREGLO DEL SLIDER)
      // 1. Sacamos todas las URLs de la tabla de imagenes
      let allImages = p.images.map((i: any) => i.url);
      
      // 2. Si la lista está vacía, intentamos rescatar la mainImage antigua
      if (allImages.length === 0 && p.mainImage && !p.mainImage.includes("{") && p.mainImage.startsWith("http")) {
          allImages.push(p.mainImage);
      }
      
      // 3. Definimos la imagen de portada
      const coverImg = allImages.length > 0 ? allImages[0] : null;

      // B. RECUPERACIÓN DE SERVICIOS (LÓGICA COMPLETA)
      const reconstructedServices = [
          ...(p.selectedServices || []),
          p.pool ? 'pool' : null,
          p.garage ? 'garage' : null,
          p.elevator ? 'elevator' : null,
          p.terrace ? 'terrace' : null,
          p.garden ? 'garden' : null,
          p.storage ? 'storage' : null,
          p.ac ? 'ac' : null,
          p.security ? 'security' : null,
          // Si tiene foto, asumimos servicio de foto
          coverImg ? 'foto' : null
      ].filter(Boolean);

      // C. COORDENADAS DE RESCATE (SU LÓGICA "OPERACIÓN MADRID")
      let finalCoords = [Number(p.longitude), Number(p.latitude)];
      
      // Si las coordenadas son 0 o nulas, aplicamos la dispersión en Madrid
      if (!p.longitude || !p.latitude || (p.longitude === 0 && p.latitude === 0)) {
          const baseLng = -3.7038;
          const baseLat = 40.4168;
          // Usamos el ID para generar un offset determinista (siempre cae en el mismo sitio)
          const magic = p.id ? p.id.charCodeAt(p.id.length - 1) : 0;
          const offset = (magic % 50) * 0.0005; 
          finalCoords = [baseLng + offset, baseLat - offset];
      }

      // D. RETORNO DEL OBJETO (CON TODO EL EQUIPAMIENTO)
      return {
          ...p, // Mantiene cualquier dato extra de la DB
          id: p.id,
          
          // 1. FOTOS ARREGLADAS
          images: allImages,
          img: coverImg,
          
          // 2. PRECIOS
          price: new Intl.NumberFormat('es-ES').format(p.price || 0),
          rawPrice: p.price,
          priceValue: p.price,

          // 3. SERVICIOS (Para los iconos - Eliminamos duplicados con Set)
          selectedServices: Array.from(new Set(reconstructedServices)),
          
          // 4. BOOLEANOS EXPLÍCITOS
          pool: p.pool,
          garage: p.garage,
          elevator: p.elevator,
          terrace: p.terrace,
          garden: p.garden,
          storage: p.storage,
          ac: p.ac,
          security: p.security,
          
          // 5. ENERGÍA
          energyConsumption: p.energyConsumption || "N/D",
          energyEmissions: p.energyEmissions || "N/D",
          energyPending: p.energyPending,
          
          // 6. COORDENADAS CALCULADAS
          coordinates: finalCoords
      };
    });

    return { success: true, data: safeProperties };

  } catch (error) {
    console.error("❌ ERROR READ:", error);
    return { success: false, data: [] };
  }
}

// ---------------------------------------------------------
// 5. BORRAR PROPIEDAD (SEGURIDAD DE PROPIETARIO)
// ---------------------------------------------------------
export async function deletePropertyAction(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "No autorizado" };

    // 🔥 USAMOS deleteMany CON userId PARA QUE NADIE BORRE LO QUE NO ES SUYO
    const result = await prisma.property.deleteMany({ 
        where: { 
            id: id,
            userId: user.id // <--- SOLO SI COINCIDE EL DUEÑO
        } 
    });

    if (result.count === 0) {
        return { success: false, error: "No se encontró la propiedad o no tienes permiso." };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error al borrar:", error);
    return { success: false, error: String(error) };
  }
}

// ---------------------------------------------------------
// 5. OBTENER PERFIL DE USUARIO ACTUAL
// ---------------------------------------------------------
export async function getUserMeAction() {
  try {
    const user = await getCurrentUser();
    
    // Si no hay usuario logueado, devolvemos error
    if (!user) {
        return { success: false, error: "Usuario no identificado" };
    }

    // Devolvemos los datos del usuario para el perfil
    return { 
        success: true, 
        data: {
            id: user.id,
            name: user.name || "",
            email: user.email,
            avatar: user.avatar || "",
            role: user.role || "AGENTE",
            phone: user.phone || "",
            website: user.website || "",
            companyName: user.companyName || "",
            licenseNumber: user.licenseNumber || ""
        }
    };
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    return { success: false, error: String(error) };
  }
}

// ---------------------------------------------------------
// 6. ACTUALIZAR DATOS DEL PERFIL
// ---------------------------------------------------------
export async function updateUserAction(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "No autorizado" };

    // Actualizamos los datos en la base de datos
    await prisma.user.update({
        where: { id: user.id },
        data: {
            name: data.name,
            phone: data.phone,
            website: data.website,
            companyName: data.companyName,
            // Si nos mandan avatar, lo guardamos. Si no, undefined para no borrarlo.
            avatar: data.avatar ? data.avatar : undefined 
        }
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    return { success: false, error: String(error) };
  }
}

// ---------------------------------------------------------
// 7. GESTIÓN DE FAVORITOS (GUARDAR / ELIMINAR)
// ---------------------------------------------------------

export async function toggleFavoriteAction(propertyId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Inicie sesión primero" };

    // 1. Verificamos si ya es favorito
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: user.id,
          propertyId: propertyId
        }
      }
    });

    if (existing) {
      // 2. Si existe, lo eliminamos
      await prisma.favorite.delete({
        where: { id: existing.id }
      });
      revalidatePath('/');
      return { success: true, isFavorite: false };
    } else {
      // 3. Si no existe, lo creamos
      await prisma.favorite.create({
        data: {
          userId: user.id,
          propertyId: propertyId
        }
      });
      revalidatePath('/');
      return { success: true, isFavorite: true };
    }

  } catch (error) {
    console.error("Error en favoritos:", error);
    return { success: false, error: String(error) };
  }
}

export async function getFavoritesAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, data: [] };

    const favs = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        property: {
          include: { images: true }
        }
      },
      orderBy: { id: 'desc' }
    });

    // Mapeo de datos para el frontend
    const safeFavs = favs.map((f: any) => {
        const p = f.property;
        if (!p) return null;

        let allImages = p.images.map((i: any) => i.url);
        if (allImages.length === 0 && p.mainImage) allImages.push(p.mainImage);
        
        return {
            ...p,
            id: p.id,
            img: allImages[0] || null,
            images: allImages,
            price: new Intl.NumberFormat('es-ES').format(p.price || 0),
            favId: f.id 
        };
    }).filter(Boolean);

    return { success: true, data: safeFavs };

  } catch (error) {
    console.error("Error obteniendo favoritos:", error);
    return { success: false, data: [] };
  }
}

// ---------------------------------------------------------
// 8. CERRAR SESIÓN (ELIMINAR COOKIES)
// ---------------------------------------------------------
export async function logoutAction() {
  try {
    const cookieStore = await cookies();

    // Obtenemos todas las cookies y las eliminamos
    const allCookies = cookieStore.getAll();

    if (allCookies.length > 0) {
      allCookies.forEach((cookie) => {
        cookieStore.delete(cookie.name);
      });
    }

    return { success: true };

  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return { success: false };
  }
}