"use server";

import { prisma } from './lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);


// 🚀 1. SUBIDA DE FOTOS
export async function uploadLocalImageAction(formData: FormData, type: 'LOGO' | 'CASA' | 'COVER') {
  try {
    const file = formData.get('file') as File;
    if (!file) return { success: false, error: "No se ha recibido ningún archivo." };

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const fileName = `${Date.now()}_${cleanName}`;
    
    const folder = type === 'LOGO' ? 'logo' : type === 'CASA' ? 'fotos' : 'cover';
    const folderPath = path.join(process.cwd(), 'public', folder);

    if (!existsSync(folderPath)) await mkdir(folderPath, { recursive: true });

    const filepath = path.join(folderPath, fileName);
    await writeFile(filepath, buffer);

    return { success: true, url: `/${folder}/${fileName}` };
  } catch (error: any) {
    return { success: false, error: `Fallo interno: ${error.message}` };
  }
}

// 📡 2. EL CEREBRO VIP (Con Auto-Destrucción por Tiempo y blindaje TypeScript)
export async function getZoneCampaignAction(postalCode: string) {
  try {
    const campaign = await prisma.zoneCampaign.findFirst({
      where: { 
        postalCode: postalCode, 
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: { agency: true, property: true }
    });

    if (!campaign) return { success: false, data: null };
    
    return { 
      success: true, 
      data: {
        ...campaign,
        finalLogo: (campaign as any).campaignLogo || (campaign.agency as any)?.companyLogo || (campaign.agency as any)?.avatar,
        finalMainImage: (campaign as any).campaignMainImage || (campaign.property as any)?.mainImage,
        finalCover: (campaign as any).campaignCover || (campaign.agency as any)?.coverImage
      }
    };
  } catch (error) {
    return { success: false, error: "Fallo de conexión satelital" };
  }
}

// 📋 3. LISTAR CAMPAÑAS
export async function getAdminZoneCampaignsAction() {
  try {
    const campaigns = await prisma.zoneCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        agency: { select: { name: true, companyName: true, email: true } },
        property: { select: { refCode: true, title: true, price: true } }
      }
    });
    return { success: true, data: campaigns };
  } catch (error) {
    return { success: false, error: "Error al cargar las campañas" };
  }
}

/// 🚀 4. CREAR CAMPAÑA (Con disparo de email por Resend)
export async function createZoneCampaignAction(data: {
  postalCode: string;
  agencyId: string;
  propertyRef: string;
  subtitle?: string;
  customBio?: string;
  campaignLogo?: string | null;
  campaignMainImage?: string | null;
  campaignCover?: string | null;
  durationDays?: number;
}) {
  try {
    const existing = await prisma.zoneCampaign.findUnique({ where: { postalCode: data.postalCode } });
    if (existing) return { success: false, error: "Este Código Postal ya está dominado." };

    let cleanRef = data.propertyRef.replace("REF:", "").replace("ref:", "").trim().toUpperCase();
    const property = await prisma.property.findFirst({ where: { refCode: cleanRef } });
    
    if (!property) return { success: false, error: `❌ Base de datos: No existe ninguna casa con la referencia '${cleanRef}'` };

    // Buscamos el email de la agencia para poder avisarle
    const agency = await prisma.user.findUnique({ where: { id: data.agencyId.trim() } });

    let expiresAt: Date | null = null;
    if (data.durationDays && data.durationDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + data.durationDays);
    }

    const createPayload: any = {
        postalCode: data.postalCode,
        agencyId: data.agencyId.trim(),
        propertyId: property.id, 
        subtitle: data.subtitle || "TU AGENTE DE CONFIANZA",
        customBio: data.customBio || "",
        campaignLogo: data.campaignLogo,
        campaignMainImage: data.campaignMainImage,
        campaignCover: data.campaignCover,
        isActive: true,
        expiresAt: expiresAt
    };

    const newCampaign = await prisma.zoneCampaign.create({
      data: createPayload
    });

   // 👔 DISPARO DEL EMAIL DE BIENVENIDA (VERSIÓN CORPORATIVA)
    if (agency && agency.email) {
        try {
            await resend.emails.send({
                from: 'Stratosfere <info@stratosfere.com>', // ⚠️ Revise que su dominio está configurado
                to: agency.email,
                subject: `✨ Posicionamiento Premium Activado: CP ${data.postalCode}`,
                html: `
                    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                        <div style="background-color: #0f172a; padding: 30px; text-align: center;">
                            <h1 style="color: #fbbf24; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Vanguard Market Network</h1>
                        </div>
                        <div style="padding: 30px; color: #334155;">
                            <p style="font-size: 16px;">Hola, <strong>${agency.companyName || agency.name}</strong>.</p>
                            <p style="font-size: 16px;">Nos complace confirmarle que su <strong>Campaña de Posicionamiento Exclusivo</strong> ya está activa en nuestro ecosistema 3D.</p>
                            <ul style="background-color: #f8fafc; padding: 20px 40px; border-radius: 8px; font-weight: bold; font-size: 15px;">
                                <li>Zona Asignada (CP): <span style="color: #4f46e5;">${data.postalCode}</span></li>
                                <li>Propiedad Destacada: <span style="color: #4f46e5;">${property.refCode}</span></li>
                                <li>Vigencia hasta: <span style="color: #10b981;">${expiresAt ? expiresAt.toLocaleDateString('es-ES') : 'Renovación Automática'}</span></li>
                            </ul>
                            <p style="font-size: 16px;">A partir de este momento, los usuarios y profesionales que exploren esta área verán su perfil de agencia posicionado como referente destacado en exclusiva.</p>
                        </div>
                    </div>
                `
            });
        } catch (e) {
            console.error("Fallo al enviar el email de bienvenida:", e);
        }
    }

    return { success: true, data: newCampaign };
  } catch (error) {
    return { success: false, error: "Fallo al registrar la campaña" };
  }
}

// ✏️ 5. ACTUALIZAR CAMPAÑA (Blindada contra errores)
export async function updateZoneCampaignAction(id: string, incomingData: {
  postalCode?: string;
  agencyId?: string;
  propertyRef?: string;
  subtitle?: string;
  customBio?: string;
  campaignLogo?: string | null;
  campaignMainImage?: string | null;
  campaignCover?: string | null;
  isActive?: boolean;
  durationToAdd?: number;
}) {
  try {
    let finalPropertyId = undefined;
    if (incomingData.propertyRef) {
        let cleanRef = incomingData.propertyRef.replace("REF:", "").replace("ref:", "").trim().toUpperCase();
        const property = await prisma.property.findFirst({ where: { refCode: cleanRef } });
        if (!property) return { success: false, error: `❌ Base de datos: Referencia '${cleanRef}' no encontrada.` };
        finalPropertyId = property.id;
    }

    const current = await prisma.zoneCampaign.findUnique({ where: { id } });
    if (!current) return { success: false, error: "Campaña no encontrada." };

    let newExpiresAt: Date | null = current.expiresAt;
    if (incomingData.durationToAdd && incomingData.durationToAdd > 0) {
        if (newExpiresAt) {
            newExpiresAt = new Date(newExpiresAt);
            newExpiresAt.setDate(newExpiresAt.getDate() + incomingData.durationToAdd);
        } else {
            newExpiresAt = new Date();
            newExpiresAt.setDate(newExpiresAt.getDate() + incomingData.durationToAdd);
        }
    }

    const updatePayload: any = {};
    if (incomingData.postalCode !== undefined) updatePayload.postalCode = incomingData.postalCode;
    if (incomingData.agencyId !== undefined) updatePayload.agencyId = incomingData.agencyId.trim();
    if (finalPropertyId !== undefined) updatePayload.propertyId = finalPropertyId;
    if (incomingData.subtitle !== undefined) updatePayload.subtitle = incomingData.subtitle;
    if (incomingData.customBio !== undefined) updatePayload.customBio = incomingData.customBio;
    if (incomingData.campaignLogo !== undefined) updatePayload.campaignLogo = incomingData.campaignLogo;
    if (incomingData.campaignMainImage !== undefined) updatePayload.campaignMainImage = incomingData.campaignMainImage;
    if (incomingData.campaignCover !== undefined) updatePayload.campaignCover = incomingData.campaignCover;
    if (incomingData.isActive !== undefined) updatePayload.isActive = incomingData.isActive;
    updatePayload.expiresAt = newExpiresAt;

    const updatedCampaign = await prisma.zoneCampaign.update({
      where: { id },
      data: updatePayload,
    });
    
    return { success: true, data: updatedCampaign };
  } catch (error) {
    return { success: false, error: "Fallo al actualizar la campaña" };
  }
}

// 🗑️ 6. ELIMINAR CAMPAÑA
export async function deleteZoneCampaignAction(id: string) {
  try {
    await prisma.zoneCampaign.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al liberar la zona" };
  }
}

// 📈 7. REGISTRAR UN CLIC (Apertura de tarjeta)
export async function trackCampaignClickAction(id: string) {
  try {
    await prisma.zoneCampaign.update({
      where: { id },
      data: { clicks: { increment: 1 } }
    });
    return { success: true };
  } catch (error) {
    return { success: false }; // Fallo silencioso, no molestamos al usuario
  }
}

// 📈 8. REGISTRAR UN LEAD DIRECTO (Intento de contacto)
export async function trackCampaignLeadAction(id: string) {
  try {
    await prisma.zoneCampaign.update({
      where: { id },
      data: { leads: { increment: 1 } }
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// =========================================================
// 📩 NUEVO: RECIBIR PETICIÓN VANGUARD VIP (GROWTH TEAM)
// =========================================================
export async function createVanguardRequestAction(data: {
    targetZone: string;
    phone: string;
    agencyId: string;
    agencyEmail: string; 
    agencyName: string;  
    agencyDataSnapshot: any;
}) {
    "use server";
    try {
      // 🔥 1. CÁLCULO TÁCTICO AVANZADO: Contamos propias y cedidas
        let realTotalProps = 0;
        let realFireProps = 0;

        if (data.agencyId && data.agencyId !== "ID_DESCONOCIDO" && data.agencyId !== "null") {
            realTotalProps = await prisma.property.count({
                where: {
                    OR: [
                        { userId: data.agencyId },
                        { assignment: { agencyId: data.agencyId } }
                    ]
                }
            });

            realFireProps = await prisma.property.count({
                where: {
                    OR: [
                        { userId: data.agencyId },
                        { assignment: { agencyId: data.agencyId } }
                    ],
                    AND: [
                        {
                            OR: [
                                { isFire: true },
                                { promotedTier: 'FUEGO' }
                            ]
                        }
                    ]
                }
            });
        }

        // 🔥 2. RELOJ ATÓMICO: Generamos la marca de tiempo exacta
        const now = new Date();
        const timeStamp = now.toLocaleDateString('es-ES', { 
            day: '2-digit', month: '2-digit', year: 'numeric' 
        }) + ' a las ' + now.toLocaleTimeString('es-ES', { 
            hour: '2-digit', minute: '2-digit' 
        });

        // 3. Preparamos el Dossier inyectando la fecha en el título
        const notes = `👑 PETICIÓN LIDERAZGO VIP [${timeStamp}]
Zona Objetivo: ${data.targetZone}
Teléfono Directo: ${data.phone}
ID Agencia: ${data.agencyId}
--- DOSSIER DE INTELIGENCIA ---
Empresa: ${data.agencyName}
Email: ${data.agencyEmail}
CIF: ${data.agencyDataSnapshot?.cif || "No registrado"}
Licencia actual: ${data.agencyDataSnapshot?.licenseType || "STARTER"}
Dirección Física: ${data.agencyDataSnapshot?.address || "No registrada"}
Código Postal Agencia: ${data.agencyDataSnapshot?.postalCode || "No registrado"}
Zona Habitual: ${data.agencyDataSnapshot?.zone || "No registrada"}
Propiedades Totales en Radar: ${realTotalProps}
NanoCards Fuego Activas: ${realFireProps}`;

        // 4. Guardado en la base de datos (Acumulativo)
        const existingProspect = await prisma.agencyProspect.findFirst({
            where: { email: data.agencyEmail }
        });

        if (existingProspect) {
             let updatedCities = existingProspect.city || "";
             if (!updatedCities.includes(data.targetZone)) {
                 updatedCities = updatedCities ? `${updatedCities}, ${data.targetZone}` : data.targetZone;
             }

             const updatedNotes = notes + "\n\n=================================\n\n" + (existingProspect.notes || "");

             await prisma.agencyProspect.update({
                 where: { id: existingProspect.id },
                 data: { 
                     status: "VANGUARD_VIP",
                     city: updatedCities, 
                     notes: updatedNotes  
                 }
             });
        } else {
             await prisma.agencyProspect.create({
                 data: {
                     companyName: data.agencyName || "Agencia Desconocida",
                     email: data.agencyEmail,
                     phone: data.phone || data.agencyDataSnapshot?.phone,
                     city: data.targetZone,
                     status: "VANGUARD_VIP",
                     notes: notes
                 }
             });
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error creando petición Vanguard:", error);
        return { success: false, error: error.message };
    }
}