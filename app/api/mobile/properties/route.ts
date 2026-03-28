import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🔥 LISTA GENERAL: SIN PARÁMETROS
export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, role: true, name: true, companyName: true, companyLogo: true, avatar: true, tagline: true, phone: true, mobile: true, email: true, licenseType: true }
        },
        assignment: { // 🔥 CORREGIDO: Sin 'where' porque es 1 a 1
          include: { 
            agency: { 
              select: { id: true, role: true, name: true, companyName: true, companyLogo: true, avatar: true, tagline: true, phone: true, mobile: true, email: true, licenseType: true } 
            } 
          }
        },
        campaigns: {
          where: { status: 'ACCEPTED' },
          include: { 
            agency: { 
              select: { id: true, role: true, name: true, companyName: true, companyLogo: true, avatar: true, tagline: true, phone: true, mobile: true, email: true, licenseType: true } 
            } 
          }
        },
        images: true 
      }
    });

    const formattedProperties = properties.map((p: any) => {
      let cleanImages = [];
      if (Array.isArray(p.images)) {
        cleanImages = p.images.map((img: any) => typeof img === 'string' ? img : (img.url || img));
      } else if (typeof p.images === 'string') {
        try { cleanImages = JSON.parse(p.images); } catch (e) {}
      } else if (Array.isArray(p.gallery)) {
        cleanImages = p.gallery.map((img: any) => typeof img === 'string' ? img : (img.url || img));
      }

      // Validamos status del assignment en memoria
      const assignmentMatch = p.assignment && String(p.assignment.status || '').toUpperCase() === 'ACTIVE' ? p.assignment : null;

      let finalUser = p.user;
      const managingAgency = assignmentMatch?.agency || (p.campaigns && p.campaigns.length > 0 ? p.campaigns[0].agency : null);
      if (managingAgency) {
          finalUser = { ...managingAgency, role: 'AGENCIA' };
      }

      return {
        ...p, 
        user: finalUser,
        image: p.mainImage || cleanImages[0] || null,
        images: cleanImages, 
        location: [p.address, p.city, p.region].filter(Boolean).join(', '),
        beds: p.rooms || p.bedrooms || 0,
        baths: p.baths || p.bathrooms || 0,
        sqm: p.mBuilt || p.surface || 0,
        rawPrice: p.price,
        priceValue: p.price, 
        price: p.price ? `${p.price.toLocaleString('es-ES')} €` : 'Consultar',
      };
    });

    return NextResponse.json(formattedProperties);
  } catch (error) {
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}