"use client";
import React from 'react';
import { X, Heart, Store, CreditCard, Settings, HelpCircle, LogOut, ChevronRight } from 'lucide-react';

export default function ProfilePanel({ 
  rightPanel, 
  toggleRightPanel, 
  toggleMainPanel, 
  selectedReqs = [], // Recibe los datos sincronizados del cerebro
  soundEnabled, 
  playSynthSound 
}: any) {
  
  if (rightPanel !== 'PROFILE') return null;

  const playClick = () => {
    if (soundEnabled && playSynthSound) playSynthSound('click');
  };

  const hasServices = selectedReqs.length > 0;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-right">
      
      {/* FONDO APPLE GLASS */}
      <div className="absolute inset-0 bg-[#E5E5EA]/90 backdrop-blur-3xl shadow-[-20px_0_40px_rgba(0,0,0,0.2)] border-l border-white/20"></div>

      {/* CONTENIDO */}
      <div className="relative z-10 flex flex-col h-full p-8 text-slate-900 overflow-y-auto scrollbar-hide">
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-10">
            <div>
                <h2 className="text-4xl font-black tracking-tight text-[#1c1c1e] mb-1">Perfil.</h2>
                <p className="text-sm font-bold text-slate-500">Gestiona tu identidad.</p>
            </div>
            <button 
                onClick={() => { playClick(); toggleRightPanel('NONE'); }} 
                className="w-10 h-10 rounded-full bg-white hover:bg-slate-200 text-slate-500 transition-all shadow-sm flex items-center justify-center cursor-pointer"
            >
                <X size={20} />
            </button>
        </div>

        {/* TARJETA USUARIO */}
        <div className="flex items-center gap-5 mb-10">
            <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-[3px] border-white shadow-lg">
                    <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-[3px] border-[#E5E5EA] rounded-full"></div>
            </div>
            <div>
                <h3 className="text-2xl font-black text-[#1c1c1e] leading-none mb-1">Isidro</h3>
                <p className="text-xs text-slate-500 font-mono mb-2">isidro@stratosfere.com</p>
                <span className="bg-black text-white text-[9px] px-2 py-0.5 rounded-md font-bold tracking-widest uppercase shadow-md shadow-black/20">PROPIETARIO</span>
            </div>
        </div>

        {/* ESTADÍSTICAS SINCRONIZADAS */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            {/* CAJA DE SERVICIOS (Reactiva) */}
            <div className={`p-5 rounded-[24px] shadow-sm text-center flex flex-col justify-center items-center transition-all duration-500 ${hasServices ? 'bg-white ring-2 ring-blue-500/20' : 'bg-white'}`}>
                <div className={`text-3xl font-black transition-colors duration-300 ${hasServices ? 'text-blue-600 scale-110' : 'text-[#1c1c1e]'}`}>
                    {selectedReqs.length}
                </div>
                <div className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${hasServices ? 'text-blue-400' : 'text-slate-400'}`}>
                    Servicios Activos
                </div>
            </div>

            {/* CAJA DE ESTADO */}
            <div className="bg-white p-5 rounded-[24px] shadow-sm text-center flex flex-col justify-center items-center">
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black mb-1 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div> ONLINE
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Estado</div>
            </div>
        </div>

        {/* MENÚ SISTEMA */}
        <div className="mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4">SISTEMA</div>
        <div className="bg-white rounded-[24px] p-2 shadow-sm mb-6 border border-white/50">
            
            {/* FAVORITOS */}
            <button 
                onClick={() => { playClick(); toggleRightPanel('VAULT'); }}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-[18px] transition-all group cursor-pointer"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                        <Heart size={18}/>
                    </div>
                    <span className="font-bold text-sm text-[#1c1c1e]">Favoritos</span>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500"/>
            </button>

            <div className="h-[1px] bg-slate-100 mx-4"></div>

            {/* 🚨 MARKETPLACE (SIN CERRAR EL PERFIL) */}
            <button 
                onClick={() => { 
                    playClick(); 
                    // YA NO CERRAMOS EL PERFIL AQUÍ
                    toggleMainPanel('MARKETPLACE'); 
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-[18px] transition-all group cursor-pointer"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <Store size={18}/>
                    </div>
                    <span className="font-bold text-sm text-[#1c1c1e]">Marketplace</span>
                </div>
                {/* Indicador visual si está abierto */}
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500"/>
            </button>
        </div>

        {/* MENÚ CONFIGURACIÓN */}
        <div className="mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4">CONFIGURACIÓN</div>
        <div className="bg-white rounded-[24px] p-2 shadow-sm mb-auto border border-white/50">
            {[
                {icon: CreditCard, label: "Facturación"},
                {icon: Settings, label: "Preferencias"},
                {icon: HelpCircle, label: "Ayuda y Soporte"}
            ].map((item, i) => (
                <div key={i}>
                    {i > 0 && <div className="h-[1px] bg-slate-100 mx-4"></div>}
                    <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-[18px] transition-all group cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                <item.icon size={18}/>
                            </div>
                            <span className="font-bold text-sm text-[#1c1c1e]">{item.label}</span>
                        </div>
                        <ChevronRight size={16} className="text-slate-300"/>
                    </button>
                </div>
            ))}
        </div>

        {/* FOOTER */}
        <div className="mt-8">
            <button className="w-full py-4 bg-[#FF3B30]/10 text-[#FF3B30] font-bold text-sm rounded-[20px] flex items-center justify-center gap-2 hover:bg-[#FF3B30]/20 transition-colors cursor-pointer">
                <LogOut size={16}/> Cerrar Sesión
            </button>
            <p className="text-center text-[9px] text-slate-300 font-bold tracking-[0.3em] mt-6 uppercase">
                Stratosfere OS v2.4
            </p>
        </div>

      </div>
    </div>
  );
}

