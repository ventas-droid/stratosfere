import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // Asegúrese de que esta ruta apunta a su prisma
import { Resend } from 'resend';

export async function GET(request: Request) {
    // 🛡️ BARRERA DE SEGURIDAD: Solo Vercel (o usted con la clave) puede despertar al robot
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Acceso Denegado. Código de lanzamiento incorrecto.', { status: 401 });
    }

    try {
        console.log("🤖 [CRON JOB] Iniciando barrido de eventos huérfanos (48h)...");

        // 1. CALCULAMOS LA HORA LÍMITE (Hace exactamente 48 horas)
        const deadline = new Date(Date.now() - 48 * 60 * 60 * 1000);

        // 2. BUSCAMOS LOS OBJETIVOS: Eventos cancelados que no han sido borrados por la agencia
        const abandonedEvents = await prisma.openHouse.findMany({
            where: {
                status: 'CANCELED',
                updatedAt: { lte: deadline } // Modificados hace 48 horas o más
            },
            include: {
                attendees: true,
                property: { include: { user: true } }
            }
        });

        if (abandonedEvents.length === 0) {
            console.log("🤖 [CRON JOB] Sector despejado. No hay eventos caducados.");
            return NextResponse.json({ success: true, message: "Sector despejado." });
        }

        const resendApiKey = process.env.RESEND_API_KEY;
        const resend = resendApiKey ? new Resend(resendApiKey) : null;
        let deletedCount = 0;

        // 3. EJECUTAMOS LA SENTENCIA PARA CADA EVENTO ABANDONADO
        for (const event of abandonedEvents) {
            const eventTitle = event.title || 'Open House';

            // A) EL CORREO FRÍO A LOS INVITADOS (La Agencia falló en su deber, Stratosfere da la cara)
            if (resend && event.attendees.length > 0) {
                const emailPromises = event.attendees
                    .filter(t => t.email)
                    .map(ticket => 
                        resend.emails.send({
                            from: 'Stratosfere <info@stratosfere.com>',
                            to: ticket.email!,
                            subject: `🚫 CANCELACIÓN DEFINITIVA: ${eventTitle}`,
                            html: `
                                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #fee2e2; border-radius: 8px;">
                                    <p>Hola ${ticket.name || 'Invitado'},</p>
                                    <p>Te comunicamos de forma automatizada que el evento en <strong>${event.property.address}</strong> ha sido cancelado definitivamente por el organizador.</p>
                                    <p>Disculpa las molestias que esto haya podido ocasionar.</p>
                                    <p style="font-size: 12px; color: #666; margin-top: 20px;">Atentamente,<br/>El equipo de Stratosfere</p>
                                </div>
                            `
                        })
                    );
                await Promise.allSettled(emailPromises);
            }

            // B) EL REPORTE A LA AGENCIA (El tirón de orejas)
            if (resend && event.property.user?.email) {
                await resend.emails.send({
                    from: 'Stratosfere <info@stratosfere.com>',
                    to: event.property.user.email,
                    subject: `🗑️ Eliminación Automática: Evento en ${event.property.address}`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                            <h2 style="color: #475569;">Plazo de 48h Expirado</h2>
                            <p>El sistema ha detectado inactividad en el evento <strong>${eventTitle}</strong> que tenías marcado como cancelado hace más de 48 horas.</p>
                            <p>Para proteger a los usuarios, <strong>nuestro sistema ha notificado automáticamente a los ${event.attendees.length} asistentes</strong> y ha borrado el evento de tu panel.</p>
                            <p style="font-size: 12px; color: #666; margin-top: 20px;">Este es un mensaje automático de mantenimiento.</p>
                        </div>
                    `
                });
            }

            // C) LA VAPORIZACIÓN DE LA BASE DE DATOS
            await prisma.openHouse.delete({
                where: { id: event.id }
            });

            deletedCount++;
        }

        console.log(`🤖 [CRON JOB] Misión cumplida. ${deletedCount} eventos aniquilados.`);
        return NextResponse.json({ success: true, deleted: deletedCount });

    } catch (error) {
        console.error("💥 [CRON JOB] Error en la matriz:", error);
        return NextResponse.json({ success: false, error: "Fallo crítico en el sistema." }, { status: 500 });
    }
}