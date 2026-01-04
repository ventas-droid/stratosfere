"use client";

import React, { useState, useEffect } from 'react';
import { 
    // Iconos de Interfaz
    X, Plus, ArrowLeft, User, Heart, ChevronRight, Store, LogOut,
    MapPin, Zap, Building2, Crosshair, Edit3, Trash2,
    
    // 🔥 TODOS LOS ICONOS DE SERVICIOS
    Waves, Car, Trees, ShieldCheck, ArrowUp, Sun, Box, Star, Award, Crown, 
    TrendingUp, Camera, Globe, Plane, Hammer, Ruler, LayoutGrid, Share2, 
    Mail, FileText, FileCheck, Activity, Newspaper, KeyRound, Sofa, 
    Droplets, Paintbrush, Truck, Briefcase, Sparkles
} from 'lucide-react';

// 👇 AÑADIR ESTO ARRIBA CON LOS OTROS IMPORTS
import { getPropertiesAction, deletePropertyAction } from '@/app/actions';


// DICCIONARIO MAESTRO (IDÉNTICO AL DE DETAILSPANEL)
const ICON_MAP: Record<string, any> = {
    'pool': Waves, 'piscina': Waves,
    'garage': Car, 'garaje': Car,
    'garden': Trees, 'jardin': Trees, 'jardín': Trees,
    'security': ShieldCheck, 'seguridad': ShieldCheck,
    'elevator': ArrowUp, 'ascensor': ArrowUp,
    'terrace': Sun, 'terraza': Sun,
    'storage': Box, 'trastero': Box, 'ac': Zap,
    'pack_basic': Star, 'pack_pro': Award, 'pack_elite': Crown, 
    'pack_investor': TrendingUp, 'pack_express': Zap,
    'foto': Camera, 'video': Globe, 'drone': Plane, 
    'tour3d': Box, 'render': Hammer, 'plano_2d': Ruler, 'plano_3d': LayoutGrid, 
    'destacado': TrendingUp, 'ads': Share2, 'email': Mail, 'copy': FileText, 
    'certificado': FileCheck, 'cedula': FileText, 'nota_simple': FileText, 
    'tasacion': Activity, 'lona': LayoutGrid, 'buzoneo': MapPin, 
    'revista': Newspaper, 'openhouse': KeyRound, 'homestaging': Sofa, 
    'limpieza': Droplets, 'pintura': Paintbrush, 'mudanza': Truck, 
    'seguro': ShieldCheck, 'abogado': Briefcase
};

// ✅ Separador de "ficha técnica" vs "servicios" (evita mezclar POOL/GARAGE/etc. dentro de Servicios)
const normalizeKey = (v: any) => String(v || '').toLowerCase().trim();

// Estos NO son servicios del Market: son amenities/ficha técnica. (Se filtran en "Mis Activos")
const NON_SERVICE_KEYS = new Set([
    'pool','piscina',
    'garden','jardin','jardín',
    'garage','garaje',
    'security','seguridad',
    'elevator','ascensor',
    'parking','aparcamiento',
    'trastero','storage',
    'terraza','terraz','balcon','balcón',
    'aire','air','aircon','ac','calefaccion','calefacción','heating',
    'm2','mbuilt','m_built',
    'bed','beds','bath','baths','room','rooms','habitacion','habitaciones','baño','baños','bano','banos'
]);

const getServiceIds = (prop: any): string[] => {
    const ids = Array.isArray(prop?.selectedServices) ? prop.selectedServices : [];
    const filtered = ids.filter((id: any) => {
        const k = normalizeKey(id);
        if (!k) return false;
        return !NON_SERVICE_KEYS.has(k);
    });
    // 🔥 EL FIX: 'Set' elimina duplicados automáticamente
    return Array.from(new Set(filtered));
};

export default function ProfilePanel({ 
  rightPanel, 
  toggleRightPanel, 
  toggleMainPanel, 
  onEdit,          
  soundEnabled, 
  playSynthSound 
}: any) {
  
  const [internalView, setInternalView] = useState<'MAIN' | 'PROPERTIES'>('MAIN');
  const [myProperties, setMyProperties] = useState<any[]>([]);
    const [servicesModalProp, setServicesModalProp] = useState<any | null>(null); // ✅ Modal: ver todos los servicios
const [user, setUser] = useState({ name: "Isidro", role: "PROPIETARIO", email: "isidro@stratosfere.com" });

 const loadData = async () => {
      if (typeof window === 'undefined') return;
      
      try {
          // 1. Intentamos leer de la Base de Datos Real
          const response = await getPropertiesAction();
          
          if (response.success && response.data) {
             // Mapeamos los datos de la DB al formato de su Panel
             const dbProperties = response.data.map((p: any) => ({
                 ...p,
                 // Aseguramos que la imagen se llame 'img' como espera su diseño
                 img: p.mainImage || (p.images && p.images[0]?.url) || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3",
                 // Recuperamos los servicios booleanos para que salgan los iconos
                 selectedServices: [
                    ...(p.selectedServices || []), // Si hubiera guardados
                    p.pool ? 'pool' : null, 
                    p.garage ? 'garage' : null,
                    p.elevator ? 'elevator' : null,
                    p.terrace ? 'terrace' : null,
                    p.garden ? 'garden' : null,
                    p.storage ? 'storage' : null,
                    p.ac ? 'ac' : null,
                    p.security ? 'security' : null
                 ].filter(Boolean),
                 // Aseguramos formato numérico
                 mBuilt: Number(p.mBuilt || 0),
                 price: p.rawPrice 
        ? new Intl.NumberFormat('es-ES').format(p.rawPrice) // 1. Prioridad: Usar el número puro guardado
        : (typeof p.price === 'number' 
            ? new Intl.NumberFormat('es-ES').format(p.price) // 2. Si price es número, formatear
            : p.price), // 3. Si ya es texto ("375.000"), mostrarlo tal cual sin tocar
                 coordinates: [p.longitude, p.latitude]
             }));
             setMyProperties(dbProperties);
          } else {
             // Si falla o está vacío, fallback a local (opcional)
             const saved = localStorage.getItem('stratos_my_properties');
             if (saved) setMyProperties(JSON.parse(saved));
          }
      } catch (e) { console.error("Error cargando perfil:", e); }
 };

  useEffect(() => {
    if (rightPanel === 'PROFILE') loadData();
  }, [rightPanel]);

  useEffect(() => {
    // 1. Función para recarga total (desde base de datos)
    const handleReload = () => loadData();

    // 2. 🔥 NUEVO: Función para inyectar la casa AL INSTANTE (sin esperar)
    const handleNewProperty = (e: any) => {
        const newProp = e.detail;
        if (newProp) {
            // Añadimos la nueva casa arriba del todo inmediatamente
            setMyProperties(prev => [newProp, ...prev]);
        }
    };
    
    // Suscripciones
    window.addEventListener('reload-profile-assets', handleReload);
    window.addEventListener('add-property-signal', handleNewProperty); 

    return () => {
        window.removeEventListener('reload-profile-assets', handleReload);
        window.removeEventListener('add-property-signal', handleNewProperty);
    };
  }, []);

  // 2. BORRAR (CONECTADO A BASE DE DATOS)
  const handleDelete = async (e: any, id: any) => {
      e.stopPropagation();
      if(confirm('⚠️ ¿CONFIRMAR ELIMINACIÓN DE BASE DE DATOS?\nEsta acción es irreversible.')) {

          // A. Borrado visual inmediato (Optimista)
          const backup = [...myProperties];
          setMyProperties(prev => prev.filter(p => p.id !== id));

          if(soundEnabled && playSynthSound) playSynthSound('error');

          // B. Borrado Real en Servidor
          try {
              const result = await deletePropertyAction(String(id));

              if (!result.success) {
                  // Si falla, restauramos la lista antigua
                  alert("Error al borrar: " + result.error);
                  setMyProperties(backup);
              } else {
                  // C. Avisar al mapa para que quite la chincheta
                  if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('force-map-refresh'));
                      window.dispatchEvent(new CustomEvent('reload-profile-assets'));
                  }
              }
          } catch (error) {
              setMyProperties(backup); // Restaurar si hay error crítico
          }
      }
  };

  // 3. EDITAR (ABRE EL FORMULARIO CON DATOS REALES)
  const handleEditClick = (e: any, property: any) => {
      e.stopPropagation();
      if(soundEnabled && playSynthSound) playSynthSound('click');
      toggleRightPanel('NONE');
      if (onEdit) onEdit(property);
  };
  
  // 4. MANIOBRA DE DESPLIEGUE "VAULT" (Copiada de Favoritos)
  const handleFlyTo = (e: any, property: any) => {
      // Detenemos el click para controlar nosotros la secuencia
      if (e && e.stopPropagation) e.stopPropagation();
      
      if (soundEnabled && playSynthSound) playSynthSound('click');
      
      // ⛔️ IMPORTANTE: NO CERRAMOS EL PANEL DERECHO
      // toggleRightPanel('NONE'); <--- Al anular esto, usted se queda en su perfil.

      if (typeof window !== 'undefined') {
          console.log("🦅 Ejecutando protocolo de vuelo cruzado...");

          // ✅ A. LA SEÑAL CLAVE (Copiada de VaultPanel)
          // Esta es la orden prioritaria que obliga al sistema a desplegar el panel izquierdo
          window.dispatchEvent(new CustomEvent('open-details-signal', { detail: property }));

          // ✅ B. LA ORDEN DE VUELO
          // Usamos el sistema de eventos global para mover la cámara
          if (property.coordinates) {
              window.dispatchEvent(new CustomEvent('fly-to-location', { 
                  detail: { center: property.coordinates, zoom: 18.5, pitch: 60 } 
              }));
          }
      }
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
            <button onClick={() => setInternalView('MAIN')} className="flex items-center gap-2 text-slate-500 hover:text-black transition-colors group cursor-pointer">
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
                
                <button onClick={() => setInternalView('PROPERTIES')} className="w-full bg-white p-4 rounded-[20px] flex items-center justify-between group hover:scale-[1.02] transition-all shadow-sm border border-transparent hover:border-blue-200 cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"><Building2 size={18}/></div>
                        <span className="font-bold text-slate-900 text-sm">Mis Propiedades</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500"/>
                </button>

                {/* BOTÓN FAVORITOS */}
                <button onClick={() => { if(soundEnabled && playSynthSound) playSynthSound('click'); toggleRightPanel('VAULT'); }} className="w-full bg-white p-4 rounded-[20px] flex items-center justify-between group hover:scale-[1.02] transition-all shadow-sm cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-500 transition-colors"><Heart size={18} /></div>
                        <span className="font-bold text-slate-900 text-sm">Favoritos</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300"/>
                </button>

              {/* BOTÓN MARKETPLACE */}
                <button 
                    onClick={() => { 
                        if(soundEnabled && playSynthSound) playSynthSound('click'); 
                        if(toggleMainPanel) toggleMainPanel('MARKETPLACE'); 
                    }} 
                    className="w-full bg-white p-4 rounded-[20px] flex items-center justify-between group hover:scale-[1.02] transition-all shadow-sm cursor-pointer border border-transparent hover:border-emerald-200"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                            <Store size={18} />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">Marketplace</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500"/>
                </button>
            </div>
            
            {/* BOTÓN CERRAR SESIÓN */}
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
                    onClick={() => { toggleRightPanel('NONE'); if(toggleMainPanel) toggleMainPanel('ARCHITECT'); }} 
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
                    {myProperties.map((prop) => {
                        const serviceIds = getServiceIds(prop);
                        return (
                        <div 
                            key={prop.id} 
                            // 🔥 1. CLICK EN EL CUERPO PARA VOLAR + ABRIR DETAILS (Sin cerrar perfil)
                            onClick={(e) => handleFlyTo(e, prop)}
                            className="group bg-white p-5 rounded-[24px] shadow-sm border border-transparent hover:border-blue-500/30 transition-all cursor-pointer relative"
                        >
                            
                            {/* CABECERA DE LA TARJETA */}
                            <div className="flex gap-4 mb-4">
                                <div className="w-20 h-20 rounded-2xl bg-slate-200 overflow-hidden shrink-0 shadow-inner relative">
                                    <img src={prop.img || (prop.images && prop.images[0]) || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80"} className="w-full h-full object-cover" alt="Propiedad"/>
                                    {prop.elevator && <div className="absolute top-1 right-1 bg-green-500 p-1 rounded-md text-white shadow-sm"><ArrowUp size={8} strokeWidth={4}/></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-slate-900 truncate text-lg group-hover:text-blue-600 transition-colors">{prop.title || "Sin título"}</h4>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-green-100 text-green-700`}>ONLINE</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                        <MapPin size={10} />
                                        <span className="truncate">{prop.location || prop.address}</span>
                                    </div>
                                    <p className="text-base font-black text-slate-900 mt-1">{prop.price}€</p>
                                </div>
                            </div>

                            {/* SERVICIOS ACTIVOS */}
                            {prop.selectedServices && serviceIds.length > 0 && (
                                <div className="mb-4 bg-slate-50 p-3 rounded-2xl">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-2 tracking-wider flex items-center gap-1">
                                        <Zap size={10} className="text-yellow-500 fill-yellow-500"/> Estrategia Activa
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {serviceIds.slice(0, 4).map((srvId: string) => {
                                            const key = srvId.toLowerCase().trim();
                                            const Icon = ICON_MAP[key] || ICON_MAP[srvId] || Sparkles;
                                            const isPack = key.startsWith('pack');
                                            const label = srvId.replace('pack_', '').replace(/_/g, ' ');
                                            
                                            return (
                                                <div key={srvId} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-bold uppercase ${isPack ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-white border-slate-200 text-slate-500'}`}>
                                                    <Icon size={10} />
                                                    <span>{label}</span>
                                                </div>
                                            );
                                        })}
                                        {serviceIds.length > 4 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setServicesModalProp(prop); }}
                                                className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-widest uppercase border border-slate-900 hover:bg-slate-800 transition-colors"
                                                title="Ver todos los servicios"
                                            >
                                                VER TODO · +{serviceIds.length - 4}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                           {/* BARRA DE ACCIONES */}
                            <div className="pt-3 border-t border-slate-100 flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                
                               {/* 🔥 BOTÓN MARKETPLACE (SIN CERRAR PERFIL) */}
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        if(soundEnabled && playSynthSound) playSynthSound('click');
                                        
                                        // 1. INYECCIÓN DE DATOS: 
                                        // Le decimos al sistema: "Carga la configuración de ESTA propiedad en el ArchitectHud"
                                        if (typeof window !== 'undefined') {
                                            window.dispatchEvent(new CustomEvent('edit-asset-services', { detail: prop }));
                                        }

                                        // 2. ABRIR PANEL IZQUIERDO (Marketplace/ArchitectHud)
                                        if(toggleMainPanel) toggleMainPanel('MARKETPLACE'); 
                                        
                                        // ⛔️ ANULADO: Ya no cerramos el panel derecho.
                                        // toggleRightPanel('NONE'); 
                                    }}
                                    className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-emerald-100"
                                    title="Gestionar Servicios"
                                >
                                    <Store size={14}/>
                                </button>

                                {/* GESTIONAR */}
                                <button 
                                    onClick={(e) => handleEditClick(e, prop)} 
                                    className="flex-1 py-2 bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                    <Edit3 size={12}/> GESTIONAR
                                </button>

                                {/* ELIMINAR */}
                                <button 
                                    onClick={(e) => handleDelete(e, prop.id)}
                                    className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center cursor-pointer"
                                    title="Eliminar Activo"
                                >
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                        </div>
                    );
                    })}
                </div>
            )}
          </div>
        )}
      </div>


{/* ✅ MODAL: Ver todos los servicios (solo Market services, sin ficha técnica) */}
{servicesModalProp && (
    <div
        className="fixed inset-0 z-[999999] pointer-events-auto flex items-center justify-center bg-black/30 backdrop-blur-sm"
        onClick={() => setServicesModalProp(null)}
    >
        <div
            className="w-[min(720px,92vw)] max-h-[82vh] bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_30px_80px_rgba(0,0,0,0.20)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="px-8 pt-8 pb-4 flex items-start justify-between border-b border-slate-100">
                <div className="min-w-0">
                    <p className="text-[11px] font-black tracking-[0.35em] text-slate-400 uppercase flex items-center gap-2">
                        <Sparkles size={14} className="text-indigo-500" />
                        SERVICIOS ACTIVOS
                    </p>
                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-2 truncate">
                        {servicesModalProp.title || "Activo"}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <MapPin size={14} />
                        <span className="truncate">{servicesModalProp.location || servicesModalProp.address || "Ubicación"}</span>
                    </div>
                </div>

                <button
                    className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                    onClick={() => setServicesModalProp(null)}
                    aria-label="Cerrar"
                    title="Cerrar"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="px-8 py-6 overflow-y-auto">
                {(() => {
                    const allSrv = getServiceIds(servicesModalProp);
                    if (!allSrv.length) {
                        return (
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
                                <p className="text-sm font-bold text-slate-600">Este activo aún no tiene servicios del Market.</p>
                                <p className="text-xs text-slate-400 mt-2">Pulsa “Gestionar” para activar fotografía, vídeo, tour 3D, etc.</p>
                            </div>
                        );
                    }

                    return (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {allSrv.map((srvId: string) => {
                                const key = normalizeKey(srvId);
                                const Icon = ICON_MAP[key] || ICON_MAP[srvId] || Sparkles;
                                const isPack = key.startsWith('pack');
                                const label = srvId.replace('pack_', '').replace(/_/g, ' ');

                                return (
                                    <div
                                        key={srvId}
                                        className="rounded-[2rem] bg-white border border-slate-200 hover:border-indigo-300 transition-all p-5 flex flex-col items-center text-center"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                                            isPack ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'
                                        }`}>
                                            <Icon size={22} className={isPack ? 'text-indigo-600' : 'text-slate-700'} />
                                        </div>
                                        <p className="mt-3 text-[12px] font-black tracking-wide uppercase text-slate-700">
                                            {label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </div>

            <div className="px-8 pb-8 pt-2">
                <button
                    onClick={() => setServicesModalProp(null)}
                    className="w-full h-12 rounded-full bg-slate-900 text-white font-black tracking-widest uppercase text-[12px] hover:bg-slate-800 transition-colors"
                >
                    CERRAR
                </button>
            </div>
        </div>
    </div>
)}

    </div>
  );
}