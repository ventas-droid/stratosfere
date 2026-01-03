// @ts-nocheck
"use client";
import React, { useState } from 'react';
import { ArrowRight, Lock, Loader2 } from 'lucide-react';
// IMPORTANTE: Importamos la acción del servidor (el cerebro)
// Si le da error en la ruta '@', cambie por '../../../../actions'
import { createLead } from '@/app/actions'; 

export default function LandingWaitlist({ onUnlock }: any) {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado de carga
  const [message, setMessage] = useState(""); // Para mostrar errores si los hay

  const handleJoin = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Preparamos los datos para el viaje
    const formData = new FormData();
    formData.append('email', email);

    try {
      // 🚀 LLAMADA A LA BASE DE DATOS
      const result = await createLead(formData);

      if (result.success) {
        setJoined(true);
      } else {
        setMessage(result.message); // Ej: "Este correo ya está registrado"
      }
    } catch (error) {
      setMessage("Ocurrió un error. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#F5F5F7] text-[#1D1D1F] flex flex-col items-center justify-center p-6 font-sans select-none">
       
       {/* CONTENIDO CENTRAL */}
       <div className="w-full max-w-2xl flex flex-col items-center text-center space-y-10 animate-fade-in-up">
           
           {/* LOGO / TÍTULO */}
           <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter text-[#1D1D1F]">
               Stratosfere OS.
           </h1>
           
           {/* SUBTÍTULO */}
           <p className="text-xl md:text-2xl text-[#86868B] font-medium leading-relaxed max-w-lg">
               El sistema operativo diseñado para el mercado inmobiliario del futuro.
           </p>

           {/* FORMULARIO */}
           <div className="w-full flex flex-col items-center gap-6 mt-4">
               
               {!joined ? (
                   <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3 w-full max-w-[400px]">
                       <input 
                         type="email" 
                         placeholder="correo@empresa.com" 
                         value={email}
                         onChange={e => setEmail(e.target.value)}
                         disabled={isLoading}
                         className="flex-1 px-5 py-4 bg-white border border-[#D2D2D7] rounded-xl text-[17px] text-[#1D1D1F] placeholder-[#86868B] outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 transition-all disabled:opacity-50"
                         required
                       />
                       <button 
                         type="submit" 
                         disabled={isLoading}
                         className="px-8 py-4 bg-[#0071E3] hover:bg-[#0077ED] disabled:bg-[#86868B] text-white rounded-xl font-medium text-[15px] transition-all shadow-sm flex items-center justify-center gap-2 min-w-[140px]"
                       >
                           {isLoading ? (
                             <Loader2 className="animate-spin" size={20} />
                           ) : (
                             <>Unirme <ArrowRight size={16}/></>
                           )}
                       </button>
                   </form>
               ) : (
                   /* ESTADO DE ÉXITO */
                   <div className="bg-white border border-[#D2D2D7] px-8 py-6 rounded-2xl shadow-sm animate-fade-in">
                       <p className="text-[#1D1D1F] font-semibold text-lg">Estás en la lista.</p>
                       <p className="text-[#86868B] text-sm mt-1">Te avisaremos cuando tu acceso esté listo.</p>
                   </div>
               )}
               
               {/* MENSAJES DE ESTADO / ERROR */}
               {!joined && !message && (
                   <p className="text-[12px] text-[#86868B]">
                       Acceso limitado para profesionales.
                   </p>
               )}
               
               {message && (
                 <p className="text-[13px] text-red-500 font-medium animate-pulse">
                   {message}
                 </p>
               )}
           </div>

       </div>

       {/* FOOTER */}
       <div className="absolute bottom-6 w-full text-center">
           <p className="text-[11px] text-[#86868B] font-medium">
               Copyright © 2026 Alpha Corp. All rights reserved.
           </p>
       </div>

       {/* ADMIN LOGIN */}
       <button 
          onClick={onUnlock} 
          className="fixed bottom-6 right-6 p-3 text-[#D2D2D7] hover:text-[#86868B] transition-colors z-50"
          title="Admin Login"
       >
           <Lock size={16} />
       </button>

    </div>
  );
}