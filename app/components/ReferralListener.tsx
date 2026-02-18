"use client";

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
// 👇 Ajustado para buscar en la carpeta 'app' (un nivel arriba)
import { trackAffiliateClickAction } from '../actions-ambassador';

export default function ReferralListener({ propertyId }: { propertyId: string }) {
    const searchParams = useSearchParams();
    const processed = useRef(false); // Evita contar doble

    useEffect(() => {
        const refCode = searchParams.get('ref');

        // Si hay un código ?ref=CARLOS y no lo hemos procesado aún...
        if (refCode && propertyId && !processed.current) {
            
            console.log("🕵️ Detectado embajador:", refCode);
            processed.current = true;

            // Llamamos al servidor para contar el click y poner la cookie
            trackAffiliateClickAction(propertyId, refCode);
        }
    }, [searchParams, propertyId]);

    // Este componente es invisible, no renderiza nada visual
    return null;
}