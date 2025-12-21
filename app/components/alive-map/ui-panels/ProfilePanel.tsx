"use client";

import React from "react";
import { 
  X, User, Heart, Store, Settings, LogOut, 
  HelpCircle, ChevronRight, CreditCard, ShieldCheck, Activity 
} from "lucide-react";

export default function ProfilePanel({
  rightPanel,
  toggleRightPanel,
  toggleMainPanel,
  selectedReqs = [],
  soundEnabled,
  playSynthSound,
}: any) {
  const isOpen = rightPanel === "PROFILE";

  // --- HANDLERS ---
  const close = () => {
    if (soundEnabled) playSynthSound("click");
    toggleRightPanel("PROFILE");
  };

  const handleNavigation = (action: () => void) => {
    if (soundEnabled) playSynthSound("click");
    toggleRightPanel("PROFILE"); 
    action();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[420px] z-[50000] flex flex-col pointer-events-auto animate-slide-in-right">
        
        {/* FONDO: BLANCO TRANSLÚCIDO (Estilo "Efecto Perticno Virpino") */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-3xl shadow-[-20px_0_40px_rgba(0,0,0,0.1)]"></div>

        {/* CONTENIDO */}
        <div className="relative z-10 flex flex-col h-full p-8 text-slate-900">
            
            {/* 1. CABECERA ESTILO VAULT */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-black mb-1">
                        Perfil.
                    </h2>
                    <p className="text-lg font-medium text-slate-500">
                        Gestiona tu identidad.
                    </p>
                </div>
                <button 
                    onClick={close}
                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                >
                    <X size={20} />
                </button>
            </div>

            {/* 2. TARJETA DE USUARIO HERO */}
            <div className="flex items-center gap-5 mb-8">
                <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-slate-200 to-slate-100 shadow-lg">
                    <div className="w-full h-full rounded-full bg-white overflow-hidden border border-white">
                         <img
                            src="https://i.pravatar.cc/150?u=isidro"
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            onError={(e: any) => (e.currentTarget.style.display = "none")}
                        />
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 leading-none mb-1">Isidro</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-1">
                        <span>isidro@stratosfere.com</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-black text-white uppercase tracking-wider shadow-md shadow-black/20">
                        Propietario
                    </span>
                </div>
            </div>

            {/* CONTENIDO SCROLLABLE */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                
                {/* 3. WIDGETS DE ESTADÍSTICAS */}
                <div className="grid grid-cols-2 gap-4">
                     {/* Widget 1 */}
                     <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-1">
                        <span className="text-3xl font-extrabold text-slate-900 tracking-tighter">
                            {selectedReqs.length}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                            Servicios
                        </span>
                     </div>
                     {/* Widget 2 */}
                     <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[9px] font-bold uppercase">Online</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                            Estado
                        </span>
                     </div>
                </div>

                {/* 4. MENÚ DE NAVEGACIÓN (Estilo iOS Grouped) */}
                <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
                        Sistema
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <MenuItem 
                            icon={Heart} 
                            label="Favoritos" 
                            onClick={() => handleNavigation(() => toggleRightPanel("VAULT"))} 
                        />
                        <div className="h-[1px] bg-slate-100 ml-14" />
                        <MenuItem 
                            icon={Store} 
                            label="Marketplace" 
                            onClick={() => handleNavigation(() => toggleMainPanel("MARKETPLACE"))} 
                        />
                    </div>
                </div>

                <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
                        Configuración
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <MenuItem 
                            icon={CreditCard} 
                            label="Facturación" 
                            onClick={() => handleNavigation(() => console.log("Billing"))} 
                        />
                        <div className="h-[1px] bg-slate-100 ml-14" />
                        <MenuItem 
                            icon={Settings} 
                            label="Preferencias" 
                            onClick={() => handleNavigation(() => console.log("Settings"))} 
                        />
                        <div className="h-[1px] bg-slate-100 ml-14" />
                        <MenuItem 
                            icon={HelpCircle} 
                            label="Ayuda y Soporte" 
                            onClick={() => handleNavigation(() => console.log("Help"))} 
                        />
                    </div>
                </div>

            </div>

            {/* 5. FOOTER */}
            <div className="mt-6 pt-6 border-t border-slate-200">
                <button
                    onClick={() => console.log("Logout")}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-200 active:scale-95"
                >
                    <LogOut size={18} />
                    <span className="text-sm font-bold">Cerrar Sesión</span>
                </button>
                <div className="mt-4 text-center">
                    <p className="text-[10px] text-slate-300 font-mono tracking-widest">STRATOSFERE OS v2.0</p>
                </div>
            </div>
        </div>
    </div>
  );
}

// --- SUB-COMPONENTE HELPER ---
function MenuItem({ icon: Icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors group text-left"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-white group-hover:shadow-sm transition-all duration-200">
          <Icon size={18} />
        </div>
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>
      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
    </button>
  );
}

