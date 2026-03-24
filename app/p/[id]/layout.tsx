import { Metadata } from "next";
import { getPropertyByIdAction } from "@/app/actions";

// 🔥 EL GENERADOR DE MINIATURAS PARA WHATSAPP (ACTUALIZADO PARA NEXT.JS MODERNO)
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    
    // 1. DESEMPAQUETAMOS LA PROMESA (Esta es la clave que pedía el error)
    const resolvedParams = await params;
    
    // 2. El radar busca la casa usando el ID ya desempaquetado
    const res = await getPropertyByIdAction(resolvedParams.id);
    const prop = res?.data;

    if (!prop) {
        return { title: "Propiedad Exclusiva | Stratosfere" };
    }

    // Preparamos los textos
    const title = `${prop.title || "Propiedad Exclusiva"} | REF: ${prop.refCode || "VIP"}`;
    const description = `${prop.rooms || 0} Hab. • ${prop.baths || 0} Baños • Descubra todos los detalles y solicite su visita.`;
    const image = prop.img || prop.mainImage || (prop.images && prop.images[0]) || "/placeholder.jpg";

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: [image],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: title,
            description: description,
            images: [image],
        }
    };
}

export default function PublicPropertyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}