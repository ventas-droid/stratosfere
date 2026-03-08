import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// 🚀 1. EL TRANSMISOR (Solo lo usa el Servidor para DISPARAR mensajes)
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
  useTLS: true,
});

// 📡 2. EL RECEPTOR (Solo lo usan los Componentes React para ESCUCHAR)
export const getPusherClient = () => {
  // Nos aseguramos de que esto solo corra en el navegador (Cliente)
  if (typeof window !== 'undefined') {
    // Patrón Singleton: Evita crear múltiples antenas si la pantalla se recarga
    if (!(window as any).pusherClientInstance) {
      (window as any).pusherClientInstance = new PusherClient(
        process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
        {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
        }
      );
    }
    return (window as any).pusherClientInstance;
  }
  return null;
};