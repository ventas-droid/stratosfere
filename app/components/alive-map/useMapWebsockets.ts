// @ts-nocheck
"use client";

import { useEffect } from 'react';
import { getPusherClient } from '@/app/utils/pusher';

export const useMapWebsockets = () => {
  // 🔥🔥🔥 WEBSOCKETS: RADAR DE MAPA EN VIVO 🔥🔥🔥
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    // Nos suscribimos al canal global donde aterrizan las propiedades
    const channel = pusher.subscribe('stratos-global');

    // Escuchamos si cae un misil con una nueva propiedad
    channel.bind('new-property', (newProp: any) => {
      console.log("🛸 [PUSHER] ¡Nueva propiedad detectada en el espacio aéreo!", newProp.id);
      
      // Disparamos la misma señal interna que ya usaba su sistema
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('add-property-signal', { detail: newProp }));
      }
    });

    return () => {
      channel.unbind('new-property');
      pusher.unsubscribe('stratos-global');
    };
  }, []);
};