"use client";

import React, { useState } from 'react';
import { 
    X, MessageCircle, Phone, MapPin, 
    ShieldCheck, Star, Trophy, ExternalLink, 
    Check, Zap, Camera, Video, FileText, 
    Briefcase, LayoutGrid, Globe, Crown
} from 'lucide-react';

// ==================================================================================
// 1. DICCIONARIO DE SERVICIOS (El mismo que usa la Agencia en su Radar)
// ==================================================================================
const SERVICE_ICONS: Record<string, any> = {
    'foto': Camera, 'video': Video, 'drone': Globe, 'tour3d': LayoutGrid,
    'destacado': Zap, 'ads': Zap, 'legal': FileText, 'certificado': FileText,
    'openhouse': Trophy, 'homestaging': LayoutGrid, 'limpieza': Zap
};

const SERVICE_LABELS: Record<string, string> = {
    'foto': 'Fotografía HDR', 'video': 'Vídeo Cine 4K', 'drone': 'Vuelo Drone',
    'tour3d': 'Tour Virtual', 'legal': 'Asesoría Jurídica', 'openhouse': 'Open House VIP',
    'ads': 'Campaña Social Ads', 'destacado': 'Posicionamiento Top'
};

// ==================================================================================
// 2. SIMULACIÓN DE BASE DE DATOS (AGENCIES PER ZONE)
// ==================================================================================
// Esto es lo que el servidor devolvería: "SELECT * FROM Agencies WHERE Zone = 'Manilva' LIMIT 3"
const SPONSORED_AGENCIES = [
    {
        id: "agency_bernabeu",
        name: "Bernabeu Realty",
        slogan: "Excellence in Real Estate",
        logo: "B", // Simulado
        coverImage: "https://images.unsplash.com/photo-1600596542815-2495db98dada?q=80&w=2088&auto=format&fit=crop", // Villa de lujo
        description: "Especialistas en propiedades exclusivas en la Costa del Sol. Transformamos tu propiedad en un producto de deseo mediante marketing cinematográfico y gestión legal impecable.",
        zone: "Manilva",
        tier: "PLATINUM", // El que más paga
        website: "https://www.bernabeurealty.com/",
        phone: "34600000000",
        
        // 🔥 ESTO ES LO QUE LA AGENCIA ACTIVÓ EN SU "TACTICAL RADAR"
        activeServices: ['video', 'drone', 'openhouse', 'legal', 'ads'],
        
        stats: { sold: 120, avgTime: "45 días", rating: 4.9 }
    },
    {
        id: "agency_costa",
        name: "Costa Living",
        slogan: "Venta rápida y segura",
        logo: "C",
        coverImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
        description: "Agencia local enfocada en el trato cercano y la rapidez. Conocemos a cada vecino de Manilva.",
        zone: "Manilva",
        tier: "GOLD",
        website: "#",
        phone: "34611111111",
        activeServices: ['foto', 'certificado', 'destacado'],
        stats: { sold: 85, avgTime: "60 días", rating: 4.7 }
    },
    {
        id: "agency_sun",
        name: "Sun Properties",
        slogan: "Tu casa al sol",
        logo: "S",
        coverImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
        description: "Expertos en clientes internacionales. Hablamos 6 idiomas y traemos compradores de todo el mundo.",
        zone: "Manilva",
        tier: "GOLD",
        website: "#",
        phone: "34622222222",
        activeServices: ['tour3d', 'legal', 'ads'],
        stats: { sold: 200, avgTime: "90 días", rating: 4.5 }
    }
];

export default function AgencyMarketPanel({ onClose, activeProperty }: any) {
  
  // 1. Detectar Zona de la Propiedad (Simulado)
  const propAddress = activeProperty?.address || activeProperty?.location || "";
  // Si la dirección contiene "Manilva", mostramos las de Manilva. Si no, mostramos vacio o nacionales.
  // Para la demo, forzamos que SIEMPRE salgan las de Manilva si no detecta nada, para que usted lo vea.
  const relevantAgencies = SPONSORED_AGENCIES; 

  const handleContact = (agency: any) => {
      const msg = `Hola ${agency.name}, he visto vuestro perfil Premium en Stratosfere. Tengo una propiedad en ${propAddress} y me interesa vuestra propuesta de gestión.`;
      window.open(`https://wa.me/${agency.phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-y-0 left-0 w-full md:w-[500px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-left bg-[#F5F5F7] border-r border-slate-200 shadow-2xl">
      
      {/* --- CABECERA (CONTEXTO) --- */}
      <div className="bg-white px-8 pt-10 pb-6 border-b border-slate-100 shrink-0">
          <div className="flex justify-between items-start mb-4">
              <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">
                      Top Agencies.
                  </h1>
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit border border-emerald-100">
                      <MapPin size={12} fill="currentColor" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Zona: {activeProperty?.city || "Manilva / Sotogrande"}</span>
                  </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors">
                  <X size={20} className="text-slate-500"/>
              </button>
          </div>
          
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
             Estas son las 3 agencias certificadas con mayor rendimiento en tu código postal. 
             Contacta directamente para activar sus servicios.
          </p>
      </div>

      {/* --- LISTA DE AGENCIAS (EL ESCAPARATE) --- */}
      <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar space-y-8">
          
          {relevantAgencies.map((agency, index) => {
              const isPlatinum = agency.tier === 'PLATINUM';
              
              return (
                  <div key={agency.id} className={`group relative bg-white rounded-[32px] overflow-hidden transition-all duration-300 ${isPlatinum ? 'shadow-2xl shadow-blue-900/10 ring-1 ring-blue-100' : 'shadow-sm hover:shadow-xl border border-slate-100'}`}>
                      
                      {/* BADGE PLATINUM (SOLO PARA BERNABEU) */}
                      {isPlatinum && (
                          <div className="absolute top-4 right-4 z-20 bg-slate-900 text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                              <Crown size={12} fill="#FFD700" className="text-yellow-400"/>
                              <span className="text-[9px] font-black uppercase tracking-widest">Partner Oficial</span>
                          </div>
                      )}

                      {/* 1. PORTADA CORPORATIVA */}
                      <div className="h-40 relative overflow-hidden">
                          <img src={agency.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Cover"/>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                          
                          {/* Logo y Nombre sobre la imagen */}
                          <div className="absolute bottom-4 left-6 right-6 text-white">
                              <div className="flex items-end justify-between">
                                  <div>
                                      <h2 className="text-2xl font-black leading-none mb-1">{agency.name}</h2>
                                      <p className="text-[11px] text-slate-300 font-medium tracking-wide opacity-90">{agency.slogan}</p>
                                  </div>
                                  <div className="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center font-black text-lg shadow-lg">
                                      {agency.logo}
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* 2. CUERPO DE LA FICHA */}
                      <div className="p-6">
                          
                          {/* Descripción */}
                          <p className="text-xs text-slate-500 font-medium leading-relaxed mb-5 line-clamp-3">
                              {agency.description}
                          </p>

                          {/* Estadísticas (Social Proof) */}
                          <div className="grid grid-cols-3 gap-2 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                              <div className="text-center border-r border-slate-200">
                                  <div className="text-lg font-black text-slate-900">{agency.stats.sold}</div>
                                  <div className="text-[8px] font-bold text-slate-400 uppercase">Ventas</div>
                              </div>
                              <div className="text-center border-r border-slate-200">
                                  <div className="text-lg font-black text-slate-900">{agency.stats.avgTime}</div>
                                  <div className="text-[8px] font-bold text-slate-400 uppercase">Tiempo Medio</div>
                              </div>
                              <div className="text-center">
                                  <div className="text-lg font-black text-slate-900 flex items-center justify-center gap-1">
                                      {agency.stats.rating} <Star size={12} fill="currentColor" className="text-yellow-400"/>
                                  </div>
                                  <div className="text-[8px] font-bold text-slate-400 uppercase">Valoración</div>
                              </div>
                          </div>

                          {/* 3. PROPUESTA DE VALOR (SERVICIOS ACTIVOS) */}
                          <div className="mb-6">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <Briefcase size={12}/> Estrategia Incluida
                              </p>
                              <div className="flex flex-wrap gap-2">
                                  {agency.activeServices.map(srvId => {
                                      const Icon = SERVICE_ICONS[srvId] || Star;
                                      const label = SERVICE_LABELS[srvId] || srvId;
                                      return (
                                          <div key={srvId} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg flex items-center gap-1.5">
                                              <Icon size={12}/>
                                              <span className="text-[9px] font-bold uppercase">{label}</span>
                                          </div>
                                      )
                                  })}
                              </div>
                          </div>

                          {/* 4. BOTONES DE ACCIÓN */}
                          <div className="flex gap-3">
                              <button 
                                  onClick={() => window.open(agency.website, '_blank')}
                                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                              >
                                  <ExternalLink size={18}/>
                              </button>
                              <button 
                                  onClick={() => handleContact(agency)}
                                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all ${isPlatinum ? 'bg-slate-900 text-white hover:bg-black' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                              >
                                  <MessageCircle size={16}/> Contactar Agencia
                              </button>
                          </div>

                      </div>
                  </div>
              )
          })}

          {/* ESPACIO VACÍO (Upselling para Agencias que ven esto) */}
          <div className="p-8 border-2 border-dashed border-slate-300 rounded-[32px] text-center opacity-50 hover:opacity-100 transition-opacity cursor-pointer group">
              <Briefcase className="mx-auto text-slate-400 mb-2 group-hover:text-indigo-500 transition-colors" size={32}/>
              <h3 className="font-bold text-slate-900 uppercase text-xs mb-1">Espacio Disponible en Manilva</h3>
              <p className="text-[10px] text-slate-500">¿Eres agencia? Domina esta zona.</p>
          </div>

      </div>
    </div>
  );
}