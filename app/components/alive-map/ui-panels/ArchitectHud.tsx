// path: lib/ui/alive-map/ui-panels/ArchitectHud.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Building as BuildingIcon, X, Bed, Bath, Camera } from 'lucide-react';

export default function ArchitectHud({ onCloseMode, soundFunc }: any) {
  const [viewState, setViewState] = useState('INTRO'); // INTRO, DATA, SPECS, PHOTO, SCAN, SUCCESS

  const playSound = (t: string) => { if(soundFunc) soundFunc(t); };

  // Efecto de simulación de escaneo
  useEffect(() => {
    if (viewState === 'SCAN') {
      const timer = setTimeout(() => { playSound('complete'); setViewState('SUCCESS'); }, 4000);
      return () => clearTimeout(timer);
    }
  }, [viewState]);

  // CLASES COMUNES
  const modalContainer = "fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in pointer-events-auto";
  const modalBox = "glass-panel w-full max-w-xl rounded-[2.5rem] p-10 shadow-[0_0_80px_rgba(245,158,11,0.2)] relative overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar pointer-events-auto";

  if (viewState === 'INTRO') return (
    <div className={modalContainer}>
        <div className={`${modalBox} text-center`}>
            <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-amber-500/20 animate-pulse"><BuildingIcon className="text-amber-500" size={48} /></div>
            <h3 className="text-white font-light text-4xl mb-4">MODO ARQUITECTO</h3>
            <p className="text-white/50 text-sm mb-10">Digitalice su activo inmobiliario.</p>
            <button onClick={() => { playSound('click'); setViewState('DATA'); }} className="w-full py-5 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold text-sm tracking-[0.25em] rounded-2xl hover:scale-105 transition-transform shadow-xl">COMENZAR</button>
            <button onClick={() => onCloseMode(false)} className="mt-6 text-white/30 text-[10px] hover:text-white uppercase tracking-widest">CANCELAR</button>
        </div>
    </div>
  );

  return (
    <div className={modalContainer}>
      <div className={modalBox}>
         <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4 sticky top-0 bg-[#050505]/90 z-10"><div className="flex items-center gap-3"><BuildingIcon className="text-amber-500" size={20}/><span className="text-xs font-bold text-amber-500 tracking-widest">SISTEMA ARQUITECTO</span></div><button onClick={()=>onCloseMode(false)} className="text-white/30 hover:text-white"><X size={18}/></button></div>
         
         {viewState === 'DATA' && (
             <div className="space-y-6 animate-fade-in">
                 <h3 className="text-2xl text-white font-light mb-6">1. Datos del Activo</h3>
                 <input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-amber-500" placeholder="Dirección..." />
                 <input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-amber-500" placeholder="Precio (€)..." />
                 <button onClick={()=>{playSound('click'); setViewState('SPECS');}} className="w-full mt-4 py-4 bg-white text-black font-bold tracking-widest rounded-xl hover:bg-gray-200">SIGUIENTE</button>
             </div>
         )}
         {viewState === 'SPECS' && (
             <div className="space-y-8 animate-fade-in">
                 <h3 className="text-2xl text-white font-light mb-6">2. Características</h3>
                 <div className="flex gap-4 items-center"><Bed className="text-white/50"/><div className="flex gap-2 flex-1">{[1,2,3,4,5].map(n=><button key={n} className="flex-1 h-12 border border-white/10 rounded-lg text-white hover:bg-white hover:text-black transition-all">{n}</button>)}</div></div>
                 <div className="flex gap-4 items-center mt-4"><Bath className="text-white/50"/><div className="flex gap-2 flex-1">{[1,2,3,4].map(n=><button key={n} className="flex-1 h-12 border border-white/10 rounded-lg text-white hover:bg-white hover:text-black transition-all">{n}</button>)}</div></div>
                 <button onClick={()=>{playSound('click'); setViewState('PHOTO');}} className="w-full mt-4 py-4 bg-white text-black font-bold tracking-widest rounded-xl hover:bg-gray-200">SIGUIENTE</button>
             </div>
         )}
         {viewState === 'PHOTO' && (
             <div className="space-y-6 animate-fade-in text-center">
                 <h3 className="text-2xl text-white font-light">3. Material Visual</h3>
                 <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 hover:border-amber-500/50 cursor-pointer transition-all"><Camera className="mx-auto text-white/30 mb-4" size={32}/><p className="text-xs text-white/50 uppercase tracking-widest">Subir Imágenes</p></div>
                 <button onClick={()=>{playSound('boot'); setViewState('SCAN');}} className="w-full mt-4 py-4 bg-amber-500 text-black font-bold tracking-widest rounded-xl hover:bg-amber-400">FINALIZAR Y ESCANEAR</button>
             </div>
         )}
         {viewState === 'SCAN' && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                 <div className="relative w-24 h-24 mb-8"><div className="absolute inset-0 border-4 border-amber-500/30 rounded-full animate-ping"></div><div className="absolute inset-0 border-4 border-t-amber-500 rounded-full animate-spin"></div><BuildingIcon className="absolute inset-0 m-auto text-amber-500 animate-pulse" /></div>
                 <h3 className="text-xl text-white font-light tracking-widest mb-2">DIGITALIZANDO ACTIVO</h3>
                 <p className="text-white/30 text-xs font-mono">ENCRIPTANDO DATOS...</p>
              </div>
         )}
         {viewState === 'SUCCESS' && (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in-up">
                 <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/50"><div className="text-green-400 text-3xl">✓</div></div>
                 <h3 className="text-3xl text-white font-light mb-2">¡ACTIVO DIGITALIZADO!</h3>
                 <button onClick={() => onCloseMode(true)} className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-bold tracking-widest text-white transition-all">ENTRAR AL SISTEMA</button>
              </div>
         )}
      </div>
    </div>
  );

  
}