"use client";

import React, { useState, useMemo, useEffect } from 'react';

// --- 1. DEFINICIÓN DE TIPOS (Interfaces) ---

export type ViewType = 'MENU' | 'VIVIENDA' | 'NEGOCIO' | 'SUELO';

// Estructura de los datos que enviaremos al padre
export interface FilterData {
  category: ViewType;
  price: number;
  surface: number;
}

interface ExplorerHudProps {
  onCloseMode?: () => void;
  // El "cable" para enviar los datos al componente padre
  onSearch?: (filters: FilterData) => void; 
}

interface AppleSliderProps {
  label: string;
  displayValue: string;
  value: number;
  onChange: (val: number) => void;
  colorClass: string;
}

// --- 2. CONSTANTES E IMÁGENES ---
const IMG_HOME = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
const IMG_OFFICE = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80";
const IMG_LAND = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80";

// --- 3. SUB-COMPONENTES (Fuera para evitar lentitud) ---

const MenuCard = ({ title, subtitle, img, onClick }: { title: string, subtitle: string, img: string, onClick: () => void }) => (
  <div onClick={onClick} className="group relative h-80 rounded-[32px] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] border border-white/20">
    <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
    <div className="absolute bottom-0 left-0 p-8 w-full transform transition-transform duration-500 group-hover:translate-y-[-5px]">
      <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit mb-3 border border-white/10 shadow-sm">
        <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">{subtitle}</span>
      </div>
      <h3 className="text-4xl font-black text-white leading-none tracking-tight">{title}</h3>
    </div>
  </div>
);

const AppleSlider = ({ label, displayValue, value, onChange, colorClass }: AppleSliderProps) => (
  <div className="mb-10 group relative select-none">
    {/* Cabecera del Slider */}
    <div className="flex justify-between mb-4 px-1 items-end">
      <span className="text-xs font-black text-gray-400 tracking-widest uppercase">{label}</span>
      <div className="bg-white/50 px-3 py-1 rounded-lg border border-gray-100 backdrop-blur-sm min-w-[100px] text-right">
        <span className={`text-lg font-black tracking-tight ${colorClass} tabular-nums`}>
          {displayValue}
        </span>
      </div>
    </div>
    
    {/* Barra Visual */}
    <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
      <div 
        className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-75 ease-out ${colorClass.replace('text-', 'bg-')}`} 
        style={{ width: `${value}%` }}
      />
    </div>

    {/* Input Invisible (Motor Táctil) */}
    <input 
      type="range" 
      min="0" 
      max="100" 
      step="0.1"
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      className="absolute bottom-0 left-0 w-full h-10 opacity-0 cursor-pointer z-20"
      style={{ transform: 'translateY(25%)' }} 
    />
  </div>
);

// --- 4. COMPONENTE PRINCIPAL ---

export default function ExplorerHud({ onCloseMode, onSearch }: ExplorerHudProps) {
  
  const [currentView, setCurrentView] = useState<ViewType>('MENU');
  const [isClosing, setIsClosing] = useState(false);
  
 // Posición de los sliders (0-100)
  const [pricePos, setPricePos] = useState(100); // 100% = Presupuesto Infinito (+6M)
  const [surfacePos, setSurfacePos] = useState(0); // 0% = Cualquier tamaño (0m²)

  // Efecto: Resetea ligeramente los sliders al cambiar de vista
  useEffect(() => {
    if (currentView !== 'MENU') {
        setPricePos(30);
        setSurfacePos(20);
    }
  }, [currentView]);

  // --- MATEMÁTICAS DEL PRECIO ---
  const getPriceValue = (pos: number) => {
      if (pos >= 100) return 6000000; 
      if (pos <= 50) return Math.round(pos * 20000);
      return 1000000 + Math.round((pos - 50) * 100000);
  };

  const formatPrice = (val: number, pos: number) => {
      if (pos >= 100) return "+ 6M €";
      if (val >= 1000000) {
          const inMillions = val / 1000000;
          return `${Number(inMillions.toFixed(2))}M €`;
      }
      return `${Math.round(val / 1000)}k €`;
  };

  // --- MATEMÁTICAS DE SUPERFICIE ---
  const getSurfaceValue = (pos: number) => {
      if (currentView === 'SUELO') {
          if (pos >= 100) return 100000;
          return Math.round(pos * 1000); 
      }
      if (currentView === 'NEGOCIO') {
          if (pos >= 100) return 5000;
          return Math.round(pos * 50); 
      }
      // VIVIENDA
      return Math.round(pos * 10);
  };

  const formatSurface = (val: number, pos: number) => {
      if (pos >= 100) {
          if (currentView === 'SUELO') return "+ 10 Ha";
          if (currentView === 'NEGOCIO') return "+ 5.000 m²";
          return "+ 1.000 m²";
      }
      if (currentView === 'SUELO' && val >= 10000) {
          return `${(val / 10000).toFixed(1)} Ha`; 
      }
      return `${val.toLocaleString('es-ES')} m²`;
  };

  // --- CÁLCULOS MEMORIZADOS ---
  const finalPrice = useMemo(() => getPriceValue(pricePos), [pricePos]);
  const displayPrice = useMemo(() => formatPrice(finalPrice, pricePos), [finalPrice, pricePos]);
  
  const finalSurface = useMemo(() => getSurfaceValue(surfacePos), [surfacePos, currentView]);
  const displaySurface = useMemo(() => formatSurface(finalSurface, surfacePos), [finalSurface, surfacePos, currentView]);

  // --- TEMA DE COLORES DINÁMICO ---
  const themeColor = useMemo(() => {
      switch(currentView) {
          case 'VIVIENDA': return { text: 'text-blue-600', bg: 'bg-blue-600', hover: 'hover:bg-blue-700', shadow: 'shadow-blue-500/30', badge: 'bg-blue-50' };
          case 'NEGOCIO': return { text: 'text-purple-600', bg: 'bg-purple-600', hover: 'hover:bg-purple-700', shadow: 'shadow-purple-500/30', badge: 'bg-purple-50' };
          case 'SUELO': return { text: 'text-emerald-600', bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', shadow: 'shadow-emerald-500/30', badge: 'bg-emerald-50' };
          default: return { text: 'text-gray-600', bg: 'bg-gray-600', hover: '', shadow: '', badge: '' };
      }
  }, [currentView]);

  // --- LANZAMIENTO DE LA BÚSQUEDA ---
  const handleLaunch = () => {
    setIsClosing(true);

    // Si existe la función onSearch, enviamos los datos calculados
    if (onSearch) {
        onSearch({
            category: currentView,
            price: finalPrice,
            surface: finalSurface
        });
    }

    // Animación de cierre
    setTimeout(() => {
        if (onCloseMode) onCloseMode();
    }, 400);
  };

  // --- RENDER ---
  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/30 backdrop-blur-xl p-4 md:p-6 pointer-events-auto transition-all duration-500 ease-out ${isClosing ? 'opacity-0 backdrop-blur-none' : 'opacity-100'}`}>
      
      <div className={`
          bg-white/80 backdrop-blur-2xl rounded-[32px] md:rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] 
          border border-white/40 ring-1 ring-white/50
          w-full max-w-6xl h-[650px] md:h-[700px] overflow-hidden flex flex-col relative 
          transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
          ${isClosing ? 'scale-90 translate-y-10 opacity-0' : 'scale-100 translate-y-0 opacity-100'}
      `}>
        
        {/* Botón Cerrar (X) */}
        <button 
            onClick={() => setIsClosing(true)} 
            className="absolute top-6 right-6 md:top-8 md:right-8 z-50 w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 backdrop-blur flex items-center justify-center transition-all duration-300 group"
        >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {currentView === 'MENU' ? (
            // --- VISTA 1: MENÚ PRINCIPAL ---
            <div className="p-8 md:p-16 h-full flex flex-col justify-center animate-in fade-in duration-700">
                <div className="text-center mb-8 md:mb-14">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3 tracking-tighter">Stratosfere OS.</h1>
                    <p className="text-lg md:text-xl text-gray-500 font-medium tracking-tight">Seleccione su vector de búsqueda.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 px-0 md:px-8 overflow-y-auto md:overflow-visible pb-4">
                    <MenuCard title="Vivir." subtitle="Residencial" img={IMG_HOME} onClick={() => setCurrentView('VIVIENDA')} />
                    <MenuCard title="Pro." subtitle="Corporativo" img={IMG_OFFICE} onClick={() => setCurrentView('NEGOCIO')} />
                    <MenuCard title="Suelo." subtitle="Inversión" img={IMG_LAND} onClick={() => setCurrentView('SUELO')} />
                </div>
            </div>
        ) : (
            // --- VISTA 2: CONFIGURACIÓN (SPLIT VIEW) ---
            <div className="flex h-full">
                {/* Lado Izquierdo: Imagen Decorativa */}
                <div className="w-[40%] relative hidden md:block overflow-hidden animate-in slide-in-from-left duration-700">
                    <img 
                        src={currentView === 'VIVIENDA' ? IMG_HOME : currentView === 'NEGOCIO' ? IMG_OFFICE : IMG_LAND} 
                        className="absolute inset-0 w-full h-full object-cover scale-105" 
                        alt="Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-12 left-12 text-white max-w-xs">
                        <div className="w-12 h-1 bg-white mb-6 rounded-full" />
                        <h2 className="text-6xl font-black mb-4 tracking-tighter leading-none">
                            {currentView === 'VIVIENDA' ? 'Vivir.' : currentView === 'NEGOCIO' ? 'Pro.' : 'Suelo.'}
                        </h2>
                        <p className="text-white/70 font-medium text-lg leading-relaxed">
                            Configure los parámetros para filtrar el mapa en tiempo real.
                        </p>
                    </div>
                </div>

                {/* Lado Derecho: Formulario Interactivo */}
                <div className="w-full md:w-[60%] p-8 md:p-16 flex flex-col bg-white/50 backdrop-blur-sm animate-in slide-in-from-right duration-500">
                    <button 
                        onClick={() => setCurrentView('MENU')} 
                        className="self-start flex items-center gap-2 text-gray-400 hover:text-gray-900 font-black text-xs uppercase tracking-widest mb-8 md:mb-12 transition-colors group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver al menú
                    </button>

                    <div className="flex-1 max-w-xl mx-auto w-full flex flex-col justify-center">
                        <div className="mb-10 md:mb-12">
                            <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 ${themeColor.badge} ${themeColor.text}`}>
                                Configuración
                            </span>
                            <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Defina sus parámetros.</h3>
                            <p className="text-gray-500 font-medium">El sistema filtrará los activos disponibles.</p>
                        </div>

                        {/* Slider de Precio */}
                        <AppleSlider 
                            label="Presupuesto Máximo" 
                            displayValue={displayPrice} 
                            value={pricePos} 
                            onChange={setPricePos} 
                            colorClass={themeColor.text} 
                        />
                        
                        {/* Slider de Superficie */}
                        <AppleSlider 
                            label="Superficie Mínima" 
                            displayValue={displaySurface} 
                            value={surfacePos} 
                            onChange={setSurfacePos} 
                            colorClass={themeColor.text} 
                        />

                        {/* Botón de Lanzamiento */}
                        <button 
                            onClick={handleLaunch} 
                            className={`w-full mt-4 md:mt-8 h-20 text-white text-lg font-bold rounded-[24px] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between px-8 group ${themeColor.bg} ${themeColor.hover} ${themeColor.shadow}`}
                        >
                            <span className="flex flex-col items-start">
                                <span className="text-[10px] opacity-60 uppercase tracking-widest font-black">Lanzar Búsqueda</span>
                                <span className="text-xl font-black tracking-tight">Ver Resultados</span>
                            </span>
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

