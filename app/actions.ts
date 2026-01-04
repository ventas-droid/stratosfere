'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from './lib/prisma'
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
// 3. 📡 LEER PROPIEDADES (EL GRAN TRADUCTOR)
// ---------------------------------------------------------
// Esta función es la que arregla su Frontend roto.
// Coge los datos nuevos y los disfraza de antiguos.
export async function getPropertiesAction() {
  try {
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      include: { images: true }
    });

    // PROCESO DE TRADUCCIÓN (DATOS DB -> DATOS FRONTEND)
    const safeProperties = properties.map((p: any) => {
      
      // A. LIMPIEZA DE FOTOS (SIN MAQUILLAJE)
      // Cambio clave: Si no hay foto, se queda vacío (null). Nada de fotos falsas.
      let cleanImg = null; 
      
      // Solo si la base de datos tiene una URL real y válida, la usamos:
      if (p.mainImage && !p.mainImage.includes("{") && p.mainImage.startsWith("http")) {
          cleanImg = p.mainImage;
      } else if (p.images && p.images.length > 0) {
          cleanImg = p.images[0].url; 
      }

      // B. RECUPERACIÓN DE SERVICIOS (CRÍTICO)
      // Fusionamos la lista de la DB con los booleanos para que los iconos vuelvan a salir
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
          cleanImg ? 'foto' : null
      ].filter(Boolean);

      // C. OBJETO FINAL (EL QUE SU DISEÑO ESPERA)
      return {
          ...p,
          id: p.id,
          
          // 1. Fotos arregladas
          img: cleanImg, 
          images: p.images.map((i: any) => i.url),
          
          // 2. Precios formateados (500.000) y puros (500000)
          price: new Intl.NumberFormat('es-ES').format(p.price || 0),
          rawPrice: p.price,
          priceValue: p.price, // Para las NanoCards

          // 3. Servicios completos
          selectedServices: reconstructedServices,
          
          // 4. Booleanos explícitos para DetailsPanel
          pool: p.pool,
          garage: p.garage,
          elevator: p.elevator,
          terrace: p.terrace,
          garden: p.garden,
          
          // 5. Energía
          energyConsumption: p.energyConsumption || "N/D",
          energyEmissions: p.energyEmissions || "N/D",
          energyPending: p.energyPending,
          
      // 6. COORDENADAS CON DISPERSIÓN (Para que no se apilen en Madrid)
          coordinates: (() => {
              // A. Si tiene coordenadas reales, las usamos
              if (p.longitude && p.latitude) {
                  return [Number(p.longitude), Number(p.latitude)];
              }

              // B. Si no, usamos Madrid con un pequeño desplazamiento basado en su ID
              // Esto separa los puntos para que se vean todos
              const baseLng = -3.7038;
              const baseLat = 40.4168;
              
              const magic = p.id ? p.id.charCodeAt(p.id.length - 1) : 0;
              const offset = (magic % 50) * 0.0005; 

              return [baseLng + offset, baseLat - offset];
          })()
      };
    });

    return { success: true, data: safeProperties };

  } catch (error) {
    console.error("❌ ERROR READ:", error);
    return { success: false, data: [] };
  }
}

// 4. BORRAR
export async function deletePropertyAction(id: string) {
  try {
    await prisma.property.delete({ where: { id } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

