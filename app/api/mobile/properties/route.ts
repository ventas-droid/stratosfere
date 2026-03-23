import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Extraemos TODAS las propiedades con sus relaciones completas
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        // Incluimos los datos del usuario creador
        user: {
          select: { role: true, name: true, companyName: true, companyLogo: true, avatar: true, tagline: true }
        },
        // Incluimos los datos de la agencia asignada (si la hay)
        assignment: {
          include: { agency: { select: { companyName: true, companyLogo: true, avatar: true, tagline: true } } }
        },
        // Incluimos datos de campaña activa
        campaigns: {
          where: { status: 'ACCEPTED' },
          include: { agency: { select: { companyName: true, companyLogo: true, avatar: true, tagline: true } } }
        }
      }
    });

  // Formateamos para el móvil pero CONSERVANDO (...p) todos los campos originales
    const formattedProperties = properties.map((p: any) => {
      
      // 📸 PURIFICADOR DE GALERÍA
      let cleanImages = [];
      if (Array.isArray(p.images)) {
        cleanImages = p.images.map((img: any) => typeof img === 'string' ? img : (img.url || img));
      } else if (typeof p.images === 'string') {
        try { cleanImages = JSON.parse(p.images); } catch (e) {}
      } else if (Array.isArray(p.gallery)) {
        cleanImages = p.gallery.map((img: any) => typeof img === 'string' ? img : (img.url || img));
      }

      // 🧠 CEREBRO B2B: IDENTIFICADOR DE AGENCIA PARA EL MARKETPLACE MÓVIL
      const activeAssignment = p.assignment && String(p.assignment.status || '').toUpperCase() === 'ACTIVE' ? p.assignment : null;
      const activeCampaign = Array.isArray(p.campaigns) && p.campaigns.length > 0 ? p.campaigns[0] : null;

      const managingAgency = activeAssignment?.agency || activeCampaign?.agency || null;
      const agencyName = managingAgency?.companyName || managingAgency?.name || null;
      const isManaged = !!managingAgency;

      return {
        ...p, 
        image: p.mainImage || cleanImages[0] || null,
        images: cleanImages, 
        location: [p.address, p.city, p.region].filter(Boolean).join(', '),
        beds: p.rooms || p.bedrooms || 0,
        baths: p.baths || p.bathrooms || 0,
        sqm: p.mBuilt || p.surface || 0,
        rawPrice: p.price, 
        price: p.price ? `${p.price.toLocaleString('es-ES')} €` : 'Consultar',
        
        // 🔥 LAS 3 VARIABLES VITALES PARA QUE EL MÓVIL PINTE EL AZUL CORRECTAMENTE 🔥
        activeCampaign: activeCampaign,
        agencyName: agencyName,
        isManaged: isManaged
      };
    });

    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error("Error en la API de propiedades:", error);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}