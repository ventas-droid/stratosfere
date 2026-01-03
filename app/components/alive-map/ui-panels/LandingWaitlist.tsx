// @ts-nocheck
"use client";
import React, { useState } from 'react';
import { ArrowRight, Lock } from 'lucide-react';

export default function LandingWaitlist({ onUnlock }: any) {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoin = (e: any) => {
    e.preventDefault();
    setJoined(true);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#F5F5F7] text-[#1D1D1F] flex flex-col items-center justify-center p-6 font-sans select-none">
       
       {/* CONTENIDO CENTRAL */}
       <div className="w-full max-w-2xl flex flex-col items-center text-center space-y-10 animate-fade-in-up">
           
           {/* LOGO / TÍTULO */}
           {/* Tipografía pesada y tracking cerrado estilo Apple */}
           <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter text-[#1D1D1F]">
               Stratosfere.
           </h1>
           
           {/* SUBTÍTULO */}
           {/* Gris medio, fácil de leer, elegante */}
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
                         className="flex-1 px-5 py-4 bg-white border border-[#D2D2D7] rounded-xl text-[17px] text-[#1D1D1F] placeholder-[#86868B] outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 transition-all"
                         required
                       />
                       <button type="submit" className="px-8 py-4 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl font-medium text-[15px] transition-all shadow-sm flex items-center justify-center gap-2">
                           Unirme <ArrowRight size={16}/>
                       </button>
                   </form>
               ) : (
                   /* ESTADO DE ÉXITO */
                   <div className="bg-white border border-[#D2D2D7] px-8 py-6 rounded-2xl shadow-sm animate-fade-in">
                       <p className="text-[#1D1D1F] font-semibold text-lg">Estás en la lista.</p>
                       <p className="text-[#86868B] text-sm mt-1">Te avisaremos cuando tu acceso esté listo.</p>
                   </div>
               )}
               
               {!joined && (
                   <p className="text-[12px] text-[#86868B]">
                       Acceso limitado para profesionales.
                   </p>
               )}
           </div>

       </div>

       {/* FOOTER MINIMALISTA */}
       <div className="absolute bottom-6 w-full text-center">
           <p className="text-[11px] text-[#86868B] font-medium">
               Copyright © 2026 Alpha Corp. All rights reserved.
           </p>
       </div>

       {/* 🔐 ACCESO ADMIN (Discreto, gris suave) */}
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