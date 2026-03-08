import { Redis } from '@upstash/redis';

// ⚡️ CONEXIÓN AL MOTOR DE MEMORIA RAM (UPSTASH)
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

console.log("⚡️ Motor Redis (Upstash) en línea y listo para operar.");