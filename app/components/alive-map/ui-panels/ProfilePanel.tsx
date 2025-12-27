"use client";

import React, { useState, useEffect } from "react";
import { 
    X, User, Settings, Edit3, Trash2, MapPin, Zap, ShieldCheck,
    Star, Award, Crown, TrendingUp, Camera, Globe, Box, Newspaper, Share2, Shield, Hammer, Mail, Smartphone, Ruler, FileText, Activity, LayoutGrid, Droplets, Paintbrush, Truck, FileCheck, Building2, Heart, Store, LogOut, Plus, ChevronRight, ArrowLeft, Crosshair
} from "lucide-react";

// --- DICCIONARIO DE ICONOS (Sincronizado con todo el sistema) ---
const ICON_MAP: Record<string, any> = {
    'pack_basic': Star, 'pack_pro': Award, 'pack_elite': Crown, 'pack_investor': TrendingUp, 'pack_express': Zap,
    'foto': Camera, 'video': Globe, 'drone': Globe, 'tour3d': Box, 'destacado': TrendingUp, 
    'ads': Share2, 'web': Smartphone, 'render': Hammer, 'plano_2d': Ruler, 'plano_3d': Box,
    'email': Mail, 'copy': FileText, 'certificado': FileText, 'cedula': FileText, 'nota_simple': Shield,
    'tasacion': TrendingUp, 'lona': LayoutGrid, 'buzoneo': MapPin, 'revista': Newspaper, 
    'openhouse': Zap, 'homestaging': Box, 'limpieza': Droplets, 'pintura': Paintbrush, 
    'mudanza': Truck, 'seguro': ShieldCheck
};

export default function ProfilePanel({ 
  rightPanel, 
  toggleRightPanel, 
  toggleMainPanel, // <--- Necesario para abrir el Market desde aquí
  onEdit,          // <--- Cable para editar
  soundEnabled, 
  playSynthSound 
}: any) {
  
  const [internalView, setInternalView] = useState<'MAIN' | 'PROPERTIES'>('MAIN');
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [user, setUser] = useState({ name: "Isidro", role: "PROPIETARIO", email: "isidro@stratosfere.com" });

  // 1. CARGAR MEMORIA
  const loadData = () => {
      if (typeof window === 'undefined') return;
      const saved = localStorage.getItem('stratos_my_properties');
      if (saved) {
        try { setMyProperties(JSON.parse(saved)); } 
        catch (e) { console.error(e); }
      }
  };

  useEffect(() => {
    if (rightPanel === 'PROFILE') loadData();
  }, [rightPanel]);

  useEffect(() => {
    const handleReload = () => loadData();
    window.addEventListener('reload-profile-assets', handleReload);
    return () => window.removeEventListener('reload-profile-assets', handleReload);
  }, []);

  // 2. BORRAR
  const handleDelete = (e: any, id: number) => {
      e.stopPropagation();
      if(confirm('¿Seguro que quieres eliminar este activo? Esta acción es irreversible.')) {
          const updated = myProperties.filter(p => p.id !== id);
          setMyProperties(updated);
          localStorage.setItem('stratos_my_properties', JSON.stringify(updated));
          if(soundEnabled && playSynthSound) playSynthSound('error');
      }
  };

  // 3. EDITAR (Envia los datos al ArchitectHud)
  const handleEditClick = (e: any, property: any) => {
      e.stopPropagation();
      if(soundEnabled && playSynthSound) playSynthSound('click');
      // Cerramos perfil para dar espacio, pero abrimos el modo Arquitecto con datos
      toggleRightPanel('NONE'); 
      if (onEdit) onEdit(property); 
  };

  // 4. TELETRANSPORTE (Ir a la casa en el mapa)
  const handleFlyTo = (e: any, coords: any) => {
      e.stopPropagation();
      if(soundEnabled && playSynthSound) playSynthSound('click');
      toggleRightPanel('NONE'); // Cerramos para ver el mapa
      
      if (coords && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('fly-to-location', { 
              detail: { center: coords, zoom: 18, pitch: 60 } 
          }));
      } else {
          alert("⚠️ Este activo antiguo no tiene coordenadas GPS. Elimínelo y cree uno nuevo.");
      }
  };

  // Navegación interna
  const navigateTo = (view: 'MAIN' | 'PROPERTIES') => {
    if (soundEnabled && playSynthSound) playSynthSound('click');
    setInternalView(view);
  };

  if (rightPanel !== 'PROFILE') return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] z-[60000] flex flex-col pointer-events-auto animate-slide-in-right bg-[#E5E5EA] shadow-2xl">
      
      {/* CABECERA */}
      <div className="p-8 pb-4 flex justify-between items-start">
        <div>
          {internalView === 'MAIN' ? (
            <>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">Perfil.</h2>
              <p className="text-slate-500 font-bold text-xs tracking-widest uppercase">Gestiona tu identidad.</p>
            </>
          ) : (
            <button onClick={() => navigateTo('MAIN')} className="flex items-center gap-2 text-slate-500 hover:text-black transition-colors group cursor-pointer">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
              <span className="font-bold text-sm uppercase tracking-wider">Volver</span>
            </button>
          )}
        </div>
        <button 
            onClick={() => toggleRightPanel('NONE')} 
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer"
        >
            <X size={20} className="text-slate-900"/>
        </button>
      </div>

      {/* CONTENIDO SCROLLABLE */}
      <div className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar">
        
        {/* VISTA PRINCIPAL (MENU) */}
        {internalView === 'MAIN' && (
          <div className="animate-fade-in space-y-8">
            {/* TARJETA USUARIO */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm flex items-center gap-4 relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-slate-200 border-4 border-white shadow-lg overflow-hidden relative z-10 flex items-center justify-center">
                    <User size={32} className="text-slate-400"/>
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-black text-slate-900">{user.name}</h3>
                    <p className="text-xs font-bold text-slate-400">{user.email}</p>
                    <div className="mt-2 inline-flex bg-black text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{user.role}</div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-bl-full pointer-events-none"></div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-[24px] shadow-sm text-center">
                    <div className="text-3xl font-black text-slate-900">{myProperties.length}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Activos</div>
                </div>
                <div className="bg-white p-5 rounded-[24px] shadow-sm text-center flex flex-col items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mb-2"></div>
                    <div className="text-[9px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-full">Online</div>
                </div>
            </div>

           {/* MENÚ DE ACCESO */}
            <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4 mb-2">Sistema</p>
                
                <button onClick={() => navigateTo('PROPERTIES')} className="w-full bg-white p-4 rounded-[20px] flex items-center justify-between group hover:scale-[1.02] transition-all shadow-sm border border-transparent hover:border-blue-200 cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"><Building2 size={18}/></div>
                        <span className="font-bold text-slate-900 text-sm">Mis Propiedades</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500"/>
                </button>

                <button onClick={() => { if(soundEnabled && playSynthSound) playSynthSound('click'); toggleRightPanel('VAULT'); }} className="w-full bg-white p-4 rounded-[20px] flex items-center justify-between group hover:scale-[1.02] transition-all shadow-sm cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-500 transition-colors"><Heart size={18} /></div>
                        <span className="font-bold text-slate-900 text-sm">Favoritos</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300"/>
                </button>

                {/* CORREGIDO: Eliminado el comando de cierre, ahora solo abre Market */}
                <button onClick={() => { if(soundEnabled && playSynthSound) playSynthSound('click'); toggleMainPanel('MARKETPLACE'); }} className="w-full bg-white p-4 rounded-[20px] flex items-center justify-between group hover:scale-[1.02] transition-all shadow-sm cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors"><Store size={18} /></div>
                        <span className="font-bold text-slate-900 text-sm">Marketplace</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300"/>
                </button>
            </div>
            
            <button className="w-full py-4 mt-8 bg-red-50 text-red-500 font-bold rounded-[20px] flex items-center justify-center gap-2 hover:bg-red-100 transition-colors cursor-pointer">
                <LogOut size={16}/> Cerrar Sesión
            </button>
          </div>
        )}

        {/* VISTA MIS PROPIEDADES (DETALLE) */}
        {internalView === 'PROPERTIES' && (
          <div className="animate-fade-in-right space-y-6">
            <div className="flex justify-between items-end mb-4">
               <h3 className="text-2xl font-black text-slate-900">Mis Activos</h3>
               <button 
                    onClick={() => { toggleRightPanel('NONE'); toggleMainPanel('ARCHITECT'); }} 
                    className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
               >
                    <Plus size={14}/> CREAR NUEVO
               </button>
            </div>

            {myProperties.length === 0 ? (
                <div className="text-center py-12 opacity-50">
                    <Building2 size={40} className="mx-auto mb-2 text-slate-400"/>
                    <p className="text-sm font-bold">No tienes propiedades aún.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {myProperties.map((prop) => (
                        <div key={prop.id} className="group bg-white p-5 rounded-[24px] shadow-sm border border-transparent hover:border-blue-500/30 transition-all cursor-default">
                            
                            {/* CABECERA */}
                            <div className="flex gap-4 mb-4">
                                <div className="w-20 h-20 rounded-2xl bg-slate-200 overflow-hidden shrink-0 shadow-inner">
                                    <img src={prop.img || prop.images?.[0] || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80"} className="w-full h-full object-cover" alt="Propiedad"/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-slate-900 truncate text-lg">{prop.title || "Sin título"}</h4>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-green-100 text-green-700`}>ONLINE</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                        <MapPin size={10} />
                                        <span className="truncate">{prop.location || prop.address}</span>
                                    </div>
                                    <p className="text-base font-black text-slate-900 mt-1">{prop.price}€</p>
                                </div>
                            </div>

                            {/* 🔥 SERVICIOS ACTIVOS (VISUAL) */}
                            {prop.selectedServices && prop.selectedServices.length > 0 && (
                                <div className="mb-4 bg-slate-50 p-3 rounded-2xl">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-2 tracking-wider flex items-center gap-1">
                                        <Zap size={10} className="text-yellow-500"/> Estrategia Activa
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {prop.selectedServices.slice(0, 4).map((srvId: string) => {
                                            const Icon = ICON_MAP[srvId] || Zap;
                                            const isPack = srvId.startsWith('pack');
                                            return (
                                                <div key={srvId} className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-bold uppercase ${isPack ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-white border-slate-200 text-slate-500'}`}>
                                                    <Icon size={10} />
                                                    <span>{srvId.replace('pack_', '')}</span>
                                                </div>
                                            );
                                        })}
                                        {prop.selectedServices.length > 4 && (
                                            <span className="text-[9px] text-slate-400 self-center font-bold">+{prop.selectedServices.length - 4}</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* BARRA DE ACCIONES */}
                            <div className="pt-3 border-t border-slate-100 flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                
                                {/* 1. VER EN MAPA */}
                                <button 
                                    onClick={(e) => handleFlyTo(e, prop.coordinates)}
                                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                    title="Ver en Mapa"
                                >
                                    <Crosshair size={14}/>
                                </button>

                                {/* 2. EDITAR (CARGA EL FORMULARIO) */}
                                <button 
                                    onClick={(e) => handleEditClick(e, prop)} 
                                    className="flex-1 py-2 bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                    <Edit3 size={12}/> GESTIONAR
                                </button>

                                {/* 3. ELIMINAR */}
                                <button 
                                    onClick={(e) => handleDelete(e, prop.id)}
                                    className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center cursor-pointer"
                                    title="Eliminar Activo"
                                >
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

