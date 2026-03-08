"use client";

import React, { useState } from 'react';
import { 
    X, Check, Zap, Crown, Flame, 
    ArrowRight, Star, ShieldCheck, 
    CreditCard, LayoutGrid, Clock, AlertTriangle
} from 'lucide-react';

// ✅ IMPORT DE LA PASARELA (Aunque usaremos simulación ahora)
import { startPropertyPayment } from '@/app/components/billing/startPropertyPayment';

export default function PremiumUpgradePanel({ onClose, property }: any) {
  
  // ESTRATEGIA DE PRECIOS: 15 Días (Express) vs 30 Días (Full)
  const [planType, setPlanType] = useState<'EXPRESS' | 'FULL'>('EXPRESS');

  const PRICE_EXPRESS = "29.90"; 
  const PRICE_FULL = "49.90";    

  // Detectamos si es una propiedad real o la tienda genérica
  const isRealProperty = property?.id && property?.id !== "generic_store_id";

  const handleUpgrade = async () => {
      // 1. VALIDACIÓN DE OBJETIVO (Seguridad)
      if (!isRealProperty) {
          alert("⚠️ MODO TIENDA GENERAL\n\nPara activar el Fuego, vaya a su Portafolio (Botón Maletín) o a su Perfil y pulse el icono del Rayo ⚡ sobre la propiedad específica.");
          return;
      }

      // ===========================================================================
      // 🧪 INTERRUPTOR DE PRUEBAS (MODO VISUAL)
      // ✅ true = Simula el éxito y enciende el fuego (GRATIS)
      // ❌ false = Llama a la pasarela de pago real (COBRAR)
      // ===========================================================================
      const MODO_PRUEBAS = false; 

      if (MODO_PRUEBAS) {
          // A) Simulamos éxito visual
          const confirmacion = confirm("🧪 MODO PRUEBAS: ¿Simular activación de FUEGO (Gratis) para ver el efecto?");
          
          if(confirmacion) {
              // B) Enviamos la señal al sistema para que "pinte" la tarjeta de Premium
              if (typeof window !== 'undefined') {
                  // Señal 1: Actualizar datos de la propiedad en vivo
                  window.dispatchEvent(new CustomEvent('update-property-signal', {
                      detail: {
                          id: property.id,
                          updates: {
                              promotedTier: 'PREMIUM', 
                              status: 'PUBLICADO',
                              isPromoted: true,
                              // Simulamos que dura 15 días desde hoy
                              promotedUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
                          }
                      }
                  }));
                  
                  // Señal 2: Refrescar marcadores del mapa
                  window.dispatchEvent(new CustomEvent('sync-property-state', { 
                      detail: { id: property.id, isFav: true } 
                  }));
              }

              // C) Cerramos el panel
              onClose();
          }
          return; // ⛔ AQUÍ SE DETIENE PARA NO COBRAR
      }

     // ===========================================================================
      // 💰 ZONA DE COBRO REAL
      // ===========================================================================
      const amount = planType === 'EXPRESS' ? PRICE_EXPRESS : PRICE_FULL;
      const desc = `Nano Card Premium (${planType === 'EXPRESS' ? '15 Días' : '30 Días'})`;

      try {
         await startPropertyPayment(property.id, {
             amount: amount,   
             description: desc,
             
             // 🔥🔥🔥 ESTA ES LA LÍNEA QUE FALTA. SI NO LA PONE, COBRA 9.90€ 🔥🔥🔥
             kind: 'PREMIUM_BOOST', 
             
             redirectPath: window.location.pathname + "?premium_activated=1"
         });

      } catch (e: any) {
         console.error(e);
         alert("Error iniciando la pasarela: " + (e?.message || e));
      }
  };

  return (
    // 🔥 CONFIGURACIÓN VISUAL: Puntero activado y cursor normal
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] z-[60000] h-[100dvh] flex flex-col bg-slate-900 text-white shadow-2xl animate-slide-in-right border-l border-slate-800 pointer-events-auto cursor-default">
      
      {/* --- CABECERA --- */}
      <div className="px-8 pt-12 pb-8 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700/50 shrink-0 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Flame size={200} className="text-orange-500 animate-pulse"/>
          </div>

          <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                  <div className="flex items-center gap-2 text-orange-400 mb-2">
                      <Crown size={18} fill="currentColor" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Nivel Táctico Superior</span>
                  </div>
                  <h1 className="text-4xl font-black text-white tracking-tighter leading-none">
                      Nano Card <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">PREMIUM</span>.
                  </h1>
              </div>
              
             {/* 🔥 BOTÓN CERRAR (Efecto Tornillo Unificado) 🔥 */}
              <button 
                  onClick={(e) => { e.stopPropagation(); onClose(); }} 
                  className="relative z-50 w-10 h-10 bg-black/40 hover:bg-black/60 hover:rotate-90 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-md border border-white/20 text-white shadow-xl"
              >
                  <X size={20} />
              </button>
          </div>
          
          <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[90%] relative z-10">
             Venta Ultra-Rápida. Activa el modo Fuego para multiplicar x5 las visitas y cerrar la operación en tiempo récord.
          </p>
      </div>

      {/* --- CUERPO --- */}
      <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar space-y-10">
          
          {/* AVISO SI NO HAY PROPIEDAD SELECCIONADA */}
          {!isRealProperty && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex gap-3 items-start animate-pulse">
                  <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                  <div>
                      <h4 className="text-sm font-bold text-yellow-500 mb-1">Modo Visualización</h4>
                      <p className="text-xs text-yellow-200/70 leading-relaxed">
                          Para comprar, abre este panel pulsando el icono ⚡ en una de tus propiedades.
                      </p>
                  </div>
              </div>
          )}

          {/* VISUALIZACIÓN DE LA TARJETA EN LLAMAS */}
          <div className="relative p-1 rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 shadow-[0_0_40px_rgba(249,115,22,0.3)] z-10">
              <div className="bg-slate-900 rounded-xl p-4 h-full relative overflow-hidden flex items-center gap-4">
                   <div className="h-20 w-24 bg-slate-800 rounded-lg relative overflow-hidden shrink-0 group">
                       {/* Si no hay imagen real, mostramos demo */}
{/* Si no hay imagen real, mostramos una demo blindada de alta calidad */}
                       <img 
                           src={isRealProperty && property.img ? property.img : "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"} 
                           className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" 
                           alt="Demo Premium"
                       />                       <div className="absolute top-1 right-1 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1">
                           <Flame size={6} fill="currentColor"/> HOT
                       </div>
                   </div>
                   <div>
                       <div className="text-sm font-bold text-white mb-1">
                           {isRealProperty ? (property.title || "Tu Propiedad") : "Ejemplo Visual"}
                       </div>
                       <div className="text-[10px] text-slate-400 flex items-center gap-1">
                           <Zap size={10} className="text-orange-500"/> Visibilidad Máxima Activada
                       </div>
                   </div>
              </div>
          </div>

          {/* LISTA DE ARSENAL TÁCTICO */}
          <ul className="space-y-4">
              {[
                  { icon: Flame, color: "text-orange-500", title: "Efecto Fuego en Mapa", desc: "Imposible de ignorar por los compradores." },
                  { icon: Crown, color: "text-yellow-400", title: "Posición Top #1", desc: "Aparece siempre encima de la competencia en tu zona." },
                  { icon: LayoutGrid, color: "text-blue-400", title: "Tarjeta Expandida XL", desc: "Muestra vídeo y tour 3D directamente en la portada." },
                  { icon: Clock, color: "text-emerald-400", title: "Venta Acelerada", desc: "Diseñado para cerrar el trato en menos de 30 días." }
              ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start p-3 rounded-xl hover:bg-slate-800/50 transition-colors group cursor-default">
                      <div className={`mt-1 p-2 rounded-lg bg-slate-800 ${item.color} group-hover:scale-110 transition-transform`}>
                          <item.icon size={20} />
                      </div>
                      <div>
                          <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>
                  </li>
              ))}
          </ul>

      </div>

      {/* --- FOOTER (SELECTOR DE PRECIO Y CTA) --- */}
      <div className="p-6 bg-slate-900 border-t border-slate-800 shrink-0 relative z-20">
          
          {/* SELECTOR DE PLAN (15 vs 30 Días) */}
          <div className="flex bg-slate-800 p-1 rounded-xl mb-6 relative cursor-pointer">
              <div 
                  className={`absolute top-1 bottom-1 w-[48%] bg-indigo-600 rounded-lg shadow-lg transition-all duration-300 ${planType === 'EXPRESS' ? 'left-1' : 'left-[51%]'}`}
              ></div>
              
              <button 
                  onClick={() => setPlanType('EXPRESS')}
                  className={`flex-1 relative z-10 text-xs font-bold py-3 text-center transition-colors ${planType === 'EXPRESS' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              >
                  15 Días (Express)
              </button>
              <button 
                  onClick={() => setPlanType('FULL')}
                  className={`flex-1 relative z-10 text-xs font-bold py-3 text-center transition-colors ${planType === 'FULL' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              >
                  30 Días (Full)
              </button>
          </div>

          {/* TOTAL Y BOTÓN DE PAGO */}
          <div className="flex items-center justify-between gap-6">
              <div>
                  <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
                      {planType === 'EXPRESS' ? `${PRICE_EXPRESS}€` : `${PRICE_FULL}€`}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium mt-1">
                      Pago único. Sin renovación.
                  </div>
              </div>

              <button 
                  onClick={handleUpgrade}
                  disabled={!isRealProperty}
                  className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg flex items-center gap-2 transition-all ${
                      isRealProperty 
                      ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white hover:scale-105 active:scale-95 shadow-orange-900/20 cursor-pointer" 
                      : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                  }`}
              >
                  <Zap size={16} fill={isRealProperty ? "currentColor" : "none"}/> 
                  {isRealProperty ? "Pagar y Activar" : "Selecciona Propiedad"}
              </button>
          </div>
      </div>

    </div>
  );
}