import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // ⚠️ Asegúrese de que esta ruta apunta bien a su archivo prisma
import { Resend } from 'resend';

// Inicializamos el cañón de Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
    try {
        // 1. Calculamos la ventana de tiempo (Dentro de 48 horas exactas)
        const now = new Date();
        const en48Horas = new Date(now.getTime() + (48 * 60 * 60 * 1000));

        // 2. Buscamos a los condenados (Activos, no avisados, y que caducan en menos de 48h)
        const condenados = await prisma.zoneCampaign.findMany({
            where: {
                isActive: true,
                warning48hSent: false, // El chivato para no hacer SPAM
                expiresAt: {
                    lte: en48Horas, // Caduca en 48h o menos
                    gt: now         // Pero todavía no ha caducado
                }
            },
            include: { agency: true }
        });

        let disparos = 0;

        // 3. Ametrallamos a los objetivos
        for (const camp of condenados) {
            const agency = camp.agency as any;
            
            if (agency && agency.email) {
                // Disparamos el email
               // 👔 DISPARO DEL EMAIL AVISO 48H (VERSIÓN CORPORATIVA)
                await resend.emails.send({
                    from: 'Stratosfere <info@stratosfere.com>', 
                    to: agency.email,
                    subject: `Aviso Importante: Su campaña en el CP ${camp.postalCode} finaliza en 48h`,
                    html: `
                        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #fed7aa; border-radius: 12px; overflow: hidden;">
                            <div style="background-color: #ea580c; padding: 30px; text-align: center;">
                                <h1 style="color: white; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Renovación de Campaña</h1>
                            </div>
                            <div style="padding: 30px; color: #334155;">
                                <p style="font-size: 16px;">Estimado equipo de <strong>${agency.companyName || agency.name}</strong>,</p>
                                <p style="font-size: 16px;">Le contactamos desde Stratosfere para informarle que su posicionamiento exclusivo en el <strong>Código Postal ${camp.postalCode}</strong> finalizará en las próximas 48 horas.</p>
                                <p style="font-size: 16px; color: #c2410c; font-weight: bold;">Una vez transcurrido este plazo, la zona volverá a estar disponible en la red para otros profesionales del sector.</p>
                                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
                                <p style="font-size: 16px; text-align: center;">Para mantener su ventaja competitiva y asegurar su flujo de contactos en esta área, por favor, gestione la renovación de su espacio a la mayor brevedad.</p>
                                <div style="text-align: center; margin-top: 30px;">
                                    <a href="mailto:info@stratosfere.com" style="background-color: #0f172a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Solicitar Extensión</a>
                                </div>
                            </div>
                        </div>
                    `
                });

                // Le marcamos en la frente que ya ha sido avisado
                await prisma.zoneCampaign.update({
                    where: { id: camp.id },
                    data: { warning48hSent: true }
                });

                disparos++;
            }
        }

        // Devolvemos el reporte de batalla
        return NextResponse.json({ success: true, disparosRealizados: disparos });

    } catch (error) {
        console.error("Error en el francotirador CRON:", error);
        return NextResponse.json({ success: false, error: "Fallo en el servidor." }, { status: 500 });
    }
}