'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from './lib/prisma'

// 🔐 IDENTIFICADOR TEMPORAL (Simulamos que usted está logueado)
// Buscamos su usuario exacto en la base de datos para firmar las acciones.
async function getCurrentUser() {
  const user = await prisma.user.findUnique({
    where: { email: "isidroberllorca@gmail.com" } 
  });
  return user;
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
// 2. 🏠 GUARDAR PROPIEDAD (SAVE) - BLINDADO
// ---------------------------------------------------------
export async function savePropertyAction(data: any) {
  console.log("💾 GUARDANDO DATOS:", data.address);

  try {
    // A. LIMPIEZA DE NÚMEROS
    const cleanPrice = typeof data.rawPrice === 'number' ? data.rawPrice : parseFloat(String(data.price).replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.]/g, '') || '0');
    const cleanM2 = typeof data.mBuilt === 'number' ? data.mBuilt : parseFloat(String(data.mBuilt).replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.]/g, '') || '0');
    
    // Limpieza comunidad
    let cleanCommunity = null;
    if (data.communityFees) {
        cleanCommunity = parseFloat(String(data.communityFees).replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.]/g, ''));
    }

    // B. MAPEO DE SERVICIOS (Detectar si piscina/garaje están marcados)
    // Esto asegura que si marca el checkbox, se guarde en la lista
    const services = data.selectedServices || [];
    const hasService = (id: string) => services.includes(id) || data[id] === true;

    // C. PREPARAR EL PAQUETE DE DATOS
    const payload = {
        address: data.address || "Dirección desconocida",
        city: data.city || data.location,
        region: data.region || null,
        postcode: data.postcode || null,
        
        // Coordenadas (Evitar ceros)
        latitude: data.coordinates ? data.coordinates[1] : 40.4168,
        longitude: data.coordinates ? data.coordinates[0] : -3.7038,
        
        type: data.type || 'Piso',
        title: data.title || null,
        description: data.description || null,
        
        price: cleanPrice,
        communityFees: cleanCommunity,
        
        mBuilt: cleanM2,
        rooms: Number(data.rooms || 0),
        baths: Number(data.baths || 0),
        floor: data.floor ? String(data.floor) : null,
        door: data.door ? String(data.door) : null,
        state: data.state || "Buen estado",

        // Energía
        energyConsumption: data.energyConsumption || null,
        energyEmissions: data.energyEmissions || null,
        energyPending: data.energyPending === true,

        // Extras (Booleanos para filtros rápidos)
        elevator: Boolean(data.elevator),
        exterior: data.exterior !== false,
        pool: hasService('pool'),
        garage: hasService('garage'),
        terrace: hasService('terrace'),
        garden: hasService('garden'),
        storage: hasService('storage'),
        ac: hasService('ac'),
        security: hasService('security'),

        // Servicios contratados (Array de texto para el perfil)
        selectedServices: services,

        // Imagen principal
        mainImage: data.images?.[0] || null,
        
        status: 'PUBLICADO',
    };

    // D. EJECUTAR
    let result;
    if (data.id && data.id.length > 20) {
        // Actualizar
        result = await prisma.property.update({
            where: { id: data.id },
            data: payload
        });
    } else {
        // Crear (con imágenes)
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
    console.error("❌ ERROR SAVE:", error);
    return { success: false, error: String(error) };
  }
}

// ---------------------------------------------------------
// 3. 📡 LEER PROPIEDADES (DATA BRIDGE V3 - FILTRADO POR USUARIO)
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
        userId: user.id // <--- AQUÍ ESTÁ LA CLAVE: Solo trae SU material
      },
      orderBy: { createdAt: 'desc' },
      include: { images: true }
    });

    // PROCESO DE TRADUCCIÓN (DATOS DB -> DATOS FRONTEND)
    // (Mantenemos toda su lógica original intacta)
    const safeProperties = properties.map((p: any) => {
      
      // A. GESTIÓN DE FOTOS (ARREGLO DEL SLIDER)
      // 1. Sacamos todas las URLs de la tabla de imagenes
      let allImages = p.images.map((i: any) => i.url);
      
      // 2. Si la lista está vacía, intentamos rescatar la mainImage antigua
      if (allImages.length === 0 && p.mainImage && !p.mainImage.includes("{") && p.mainImage.startsWith("http")) {
          allImages.push(p.mainImage);
      }
      
      // 3. Definimos la imagen de portada (la primera de la lista)
      const coverImg = allImages.length > 0 ? allImages[0] : null;

      // B. RECUPERACIÓN DE SERVICIOS (CRÍTICO - NO TOCAR)
      // Esto asegura que los iconos de la tarjeta se vean bien
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

      // C. COORDENADAS DE RESCATE (OPERACIÓN MADRID)
      let finalCoords = [Number(p.longitude), Number(p.latitude)];
      
      // Si las coordenadas son 0 o nulas, aplicamos la dispersión en Madrid
      if (!p.longitude || !p.latitude || (p.longitude === 0 && p.latitude === 0)) {
          const baseLng = -3.7038;
          const baseLat = 40.4168;
          const magic = p.id ? p.id.charCodeAt(p.id.length - 1) : 0;
          const offset = (magic % 50) * 0.0005; 
          finalCoords = [baseLng + offset, baseLat - offset];
      }

      // D. RETORNO DEL OBJETO (CON TODO EL EQUIPAMIENTO)
      return {
          ...p, // Mantiene cualquier dato extra de la DB
          id: p.id,
          
          // 1. FOTOS ARREGLADAS
          images: allImages,  // <--- Array completo para el Slider (HoloInspector)
          img: coverImg,      // <--- Solo una para la Tarjeta (MapNanoCard)
          
          // 2. PRECIOS
          price: new Intl.NumberFormat('es-ES').format(p.price || 0),
          rawPrice: p.price,
          priceValue: p.price,

          // 3. SERVICIOS (Para los iconos)
          selectedServices: reconstructedServices,
          
          // 4. BOOLEANOS EXPLÍCITOS (Para que el panel de detalles no falle)
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
// 4. BORRAR PROPIEDAD (LA PIEZA PERDIDA)
// ---------------------------------------------------------
export async function deletePropertyAction(id: string) {
  try {
    await prisma.property.delete({ where: { id } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// ---------------------------------------------------------
// 5. 👤 OBTENER MI PERFIL (NOMBRE, AVATAR, ROL)
// ---------------------------------------------------------
export async function getUserMeAction() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
        return { success: false, error: "Usuario no identificado" };
    }

    // Devolvemos los datos del soldado
    return { 
        success: true, 
        data: {
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
    console.error("Error User Me:", error);
    return { success: false, error: String(error) };
  }
}

// ---------------------------------------------------------
// 6. 🖊️ ACTUALIZAR DATOS DEL PERFIL
// ---------------------------------------------------------
export async function updateUserAction(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "No autorizado" };

    // Actualizamos la ficha del soldado
    await prisma.user.update({
        where: { id: user.id },
        data: {
            name: data.name,
            phone: data.phone,
            website: data.website,
            companyName: data.companyName,
            // Si nos mandan avatar, lo guardamos (url de cloudinary)
            avatar: data.avatar ? data.avatar : undefined 
        }
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error Update User:", error);
    return { success: false, error: String(error) };
  }
}
// ---------------------------------------------------------
// 7. ❤️ GESTIÓN DE FAVORITOS (BÓVEDA SEGURA)
// ---------------------------------------------------------

// A. INTERRUPTOR (GUARDAR / BORRAR)
export async function toggleFavoriteAction(propertyId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Identifíquese primero" };

    // 1. Buscamos si ya existe
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: user.id,
          propertyId: propertyId
        }
      }
    });

    if (existing) {
      // 2. Si existe, lo BORRAMOS (Quitar de la bóveda)
      await prisma.favorite.delete({
        where: { id: existing.id }
      });
      revalidatePath('/');
      return { success: true, isFavorite: false };
    } else {
      // 3. Si no existe, lo CREAMOS (Meter en la bóveda)
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
    console.error("Error Toggle Fav:", error);
    return { success: false, error: String(error) };
  }
}

// B. RADAR (LEER MIS FAVORITOS)
export async function getFavoritesAction() {
  try {
    const user = await getCurrentUser();
    // Si no hay usuario, la bóveda está cerrada (lista vacía)
    if (!user) return { success: false, data: [] };

    // 1. Obtenemos SOLO los favoritos de este soldado
    const favs = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        property: {
          include: { images: true }
        }
      },
      orderBy: { id: 'desc' }
    });

    // 2. Traducimos los datos para el frontend
    const safeFavs = favs.map((f: any) => {
        const p = f.property;
        if (!p) return null;

        // Recuperación de Fotos
        let allImages = p.images.map((i: any) => i.url);
        if (allImages.length === 0 && p.mainImage && p.mainImage.startsWith("http")) {
            allImages.push(p.mainImage);
        }
        
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
    console.error("Error Get Favs:", error);
    return { success: false, data: [] };
  }
}