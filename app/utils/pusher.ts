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
  if (typeof window === 'undefined') return null;

  const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu';

  if (!key) {
    console.warn('⚠️ Falta NEXT_PUBLIC_PUSHER_APP_KEY');
    return null;
  }

  if (!(window as any).pusherClientInstance) {
    (window as any).pusherClientInstance = new PusherClient(key, {
      cluster,
    });
  }

  return (window as any).pusherClientInstance;
};