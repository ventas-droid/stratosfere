// @ts-nocheck
"use client";

import React, { useState } from 'react';

// --- IMÁGENES STRATOS ---
const IMG_HOME = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
const IMG_OFFICE = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80";
const IMG_LAND = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80";

export default function ExplorerHud({ onCloseMode }: any) {
  
  // ESTADO DE NAVEGACIÓN: 'MENU' | 'VIVIENDA' | 'NEGOCIO' | 'SUELO'
  const [currentView, setCurrentView] = useState('MENU');
  
  // ESTADO DE CIERRE (Animación)
  const [isClosing, setIsClosing] = useState(false);

  // VALORES VISUALES (Los conectaremos al cerebro luego)
  const [price, setPrice] = useState(50); // % del slider
  const [surface, setSurface] = useState(30); // % del slider

  // FUNCIÓN PARA CERRAR EL HUB E IR AL MAPA
  const handleLaunch = () => {
    setIsClosing(true);
    setTimeout(() => {
        if (onCloseMode) onCloseMode();
    }, 300);
  };

  // --- COMPONENTE: TARJETA DEL MENÚ ---
  const MenuCard = ({ title, subtitle, img, onClick, color }) => (
    <div onClick={onClick} className="group relative h-80 rounded-[32px] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
      <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity">
        <div className="absolute bottom-8 left-8 text-left">
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit mb-3 border border-white/10">
                <span className="text-white text-[10px] font-bold uppercase tracking-widest">{subtitle}</span>
            </div>
            <h3 className="text-3xl font-bold text-white leading-none">{title}</h3>
        </div>
      </div>
    </div>
  );

  // --- COMPONENTE: CONTROL DESLIZANTE (ACTUALIZADO) ---
  const AppleSlider = ({ label, value, onChange, colorClass, isSurface }) => (
    <div className="mb-8">
        <div className="flex justify-between mb-3 px-1">
            <span className="text-sm font-bold text-gray-500 tracking-wide uppercase">{label}</span>
            <span className={`text-sm font-bold ${colorClass}`}>
                {/* SI ES SUPERFICIE MUESTRA m², SI NO MUESTRA € */}
                {isSurface ? `${value * 10} m²` : `${value * 20}k €`} 
            </span> 
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`absolute top-0 bottom-0 left-0 rounded-full ${colorClass.replace('text-', 'bg-')}`} style={{ width: `${value}%` }}></div>
        </div>
        <input 
            type="range" min="0" max="100" value={value} onChange={(e) => onChange(e.target.value)}
            className="absolute -mt-2 w-full h-4 opacity-0 cursor-pointer"
        />
    </div>
  );

  // --- RENDERIZADO PRINCIPAL ---
  return (
<div className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 pointer-events-auto transition-opacity duration-500 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      {/* CÁPSULA FLOTANTE */}
      <div className={`bg-white/90 backdrop-blur-2xl rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.3)] w-full max-w-5xl h-[600px] overflow-hidden transform transition-all duration-500 flex flex-col relative ${isClosing ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'}`}>
        
        {/* BOTÓN CERRAR (X) */}
        <button onClick={handleLaunch} className="absolute top-8 right-8 z-20 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* --- VISTA 1: MENÚ PRINCIPAL --- */}
        {currentView === 'MENU' && (
            <div className="p-12 h-full flex flex-col justify-center animate-fade-in">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Stratosfere OS.</h1>
                    <p className="text-lg text-gray-500 font-medium">Seleccione su objetivo estratégico.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MenuCard title="Vivir." subtitle="Residencial" img={IMG_HOME} onClick={() => setCurrentView('VIVIENDA')} />
                    <MenuCard title="Pro." subtitle="Corporativo" img={IMG_OFFICE} onClick={() => setCurrentView('NEGOCIO')} />
                    <MenuCard title="Suelo." subtitle="Inversión" img={IMG_LAND} onClick={() => setCurrentView('SUELO')} />
                </div>
            </div>
        )}

        {/* --- VISTA 2: DETALLE (VIVIENDA / NEGOCIO / SUELO) --- */}
        {currentView !== 'MENU' && (
            <div className="flex h-full animate-fade-in-up">
                
                {/* LADO IZQUIERDO: IMAGEN GRANDE */}
                <div className="w-1/3 relative hidden md:block">
                    <img 
                        src={currentView === 'VIVIENDA' ? IMG_HOME : currentView === 'NEGOCIO' ? IMG_OFFICE : IMG_LAND} 
                        className="absolute inset-0 w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute bottom-10 left-10 text-white">
                        <h2 className="text-5xl font-black mb-2">{currentView === 'VIVIENDA' ? 'Vivir.' : currentView === 'NEGOCIO' ? 'Pro.' : 'Suelo.'}</h2>
                        <p className="text-white/80 font-medium tracking-wide">Configuración de búsqueda</p>
                    </div>
                </div>

                {/* LADO DERECHO: CONTROLES */}
                <div className="w-full md:w-2/3 p-12 flex flex-col">
                    
                    {/* Botón Atrás */}
                    <button onClick={() => setCurrentView('MENU')} className="self-start flex items-center gap-2 text-gray-400 hover:text-gray-800 font-bold text-sm mb-10 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                        VOLVER AL MENÚ
                    </button>

                    <div className="flex-1 max-w-lg mx-auto w-full">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Defina sus parámetros.</h3>
                            <p className="text-gray-500">Ajuste el rango para filtrar el mapa en tiempo real.</p>
                        </div>

                        <AppleSlider 
    label="Presupuesto Máximo" 
    value={price} 
    onChange={setPrice} 
    colorClass="text-blue-600" 
/>

<AppleSlider 
    label="Superficie Mínima" 
    value={surface} 
    onChange={setSurface} 
    colorClass="text-blue-600" 
    isSurface={true}  // <--- ¡ESTA ES LA CLAVE!
/>

                        {/* Botón de Acción */}
                        <button 
                            onClick={handleLaunch}
                            className={`w-full mt-8 py-5 text-white text-lg font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3
                            ${currentView === 'VIVIENDA' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' : 
                              currentView === 'NEGOCIO' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30' : 
                              'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30'}`}
                        >
                            Ver Resultados en Mapa
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                </div>
            </div>
        )}

      </div>
    </div>
  );
}

