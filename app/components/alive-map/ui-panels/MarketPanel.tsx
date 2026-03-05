"use client";
import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Star, Crown, CheckCircle2, Home } from 'lucide-react';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw';

export default function MarketPanel({ toggleRightPanel, onClose, currentCenter }: any) {  
  const [locationName, setLocationName] = useState("ESCANEANDO...");
  const [postalCode, setPostalCode] = useState("00000");
  const [isScanning, setIsScanning] = useState(true);

  // 📡 RADAR DE SATÉLITE
  useEffect(() => {
    const scanArea = async () => {
      if (!currentCenter || !currentCenter.lng || !currentCenter.lat) {
        setLocationName("ZONA DESCONOCIDA");
        setIsScanning(false);
        return;
      }
      setIsScanning(true);
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${currentCenter.lng},${currentCenter.lat}.json?access_token=${MAPBOX_TOKEN}&types=postcode,locality,place&language=es`;
        const res = await fetch(url);
        const data = await res.json();
        let zip = "Desconocido", city = "Área Local";
        if (data.features && data.features.length > 0) {
          data.features.forEach((f: any) => {
            if (f.place_type.includes('postcode')) zip = f.text;
            if (f.place_type.includes('locality') || f.place_type.includes('place')) city = f.text;
          });
        }
        setPostalCode(zip);
        setLocationName(`${city.toUpperCase()} / CP: ${zip}`);
      } catch (error) {
        setLocationName("FALLO DE SATÉLITE");
      }
      setIsScanning(false);
    };
    scanArea();
  }, [currentCenter]);

  // 🪖 MOCKUPS PREMIUM CON IMÁGENES BLINDADAS
  const topAgencies = [
    {
      id: 1,
      name: "Bernabeu Realty",
      subtitle: "ZONA EXCLUSIVA: MARBELLA • ESTEPONA • SOTOGRANDE",
      desc: "Bienvenido a Bernabeu Realty, una empresa familiar con 25 años conectando con compradores y vendedores. Vende más rápido, compra con confianza. Con nosotros.",
      sales: 142,
      days: 30,
      rating: 5.0,
      tags: ["25 AÑOS EXPERIENCIA", "ZONA EXCLUSIVA", "ATENCIÓN VIP"],
      isPremium: true,
      
      // 🛑 CAMBIE ESTOS ENLACES POR "/ceo-bernabeu.jpg" y "/bernabeu-realty-logo-dark.png" CUANDO LOS TENGA EN LA CARPETA PUBLIC
      avatar: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400", // Avatar Hombre con traje
      cover: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", // Chalet de Lujo con piscina
      
      promotedProperty: {
        title: "Villa de Lujo en Elviria",
        price: "4.343.442 €",
        specs: "713 m² • 4 Dormitorios • Parcela 4.012 m²",
        desc: "Villa de lujo en venta en Elviria con parcela orientada al sur y vistas panorámicas al mar Mediterráneo. Piscina climatizada, garaje, estilo andaluz clásico con comodidad moderna y jardines que se sienten como un parque privado con palmeras y máxima privacidad."
      }
    },
    {
      id: 2,
      name: "Costa Living Properties",
      subtitle: "Especialistas en la Costa",
      desc: "Conectamos compradores internacionales con las mejores residencias de la zona. Rapidez, transparencia y asesoramiento legal completo.",
      sales: 89,
      days: 45,
      rating: 4.8,
      tags: ["ASESORÍA LEGAL", "TOUR VIRTUAL"],
      isPremium: false,
      avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400", // Avatar Mujer profesional
      cover: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", // Interior de lujo
      promotedProperty: null
    },
    {
      id: 3,
      name: "Horizon Real Estate",
      subtitle: "Gestión Integral y Ventas",
      desc: "Nuestra red de contactos garantiza una venta ágil. Valoramos su inmueble con Big Data para asegurar el máximo retorno de inversión.",
      sales: 64,
      days: 50,
      rating: 4.6,
      tags: ["VALORACIÓN BIG DATA", "CERTIFICADO ENERGÉTICO"],
      isPremium: false,
      avatar: "https://images.pexels.com/photos/3760373/pexels-photo-3760373.jpeg?auto=compress&cs=tinysrgb&w=400", // Avatar Hombre profesional
      cover: "https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", // Fachada moderna
      promotedProperty: null
    }
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-full md:w-[540px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-left border-r border-white/40 bg-transparent">
      
      {/* FONDO GRIS CUPERTINO */}
      <div className="absolute inset-0 bg-[#F5F5F7]/95 backdrop-blur-3xl shadow-[30px_0_60px_rgba(0,0,0,0.12)]"></div>

      <div className="relative z-10 flex flex-col h-full text-slate-900 bg-transparent">
        
        {/* HEADER */}
        <div className="p-8 pb-5 shrink-0 border-b border-slate-200/60 flex flex-col gap-5">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Top Agencies.</h2>
                    <div className="flex items-center gap-2 bg-[#007AFF]/10 text-[#007AFF] px-3.5 py-1.5 rounded-full w-fit border border-[#007AFF]/20 mt-2">
                        <MapPin size={14} className={isScanning ? "animate-pulse" : ""} />
                        <span className="text-[11px] font-black uppercase tracking-widest">
                            ZONA: {locationName}
                        </span>
                    </div>
                </div>
                <button 
                    // 🛑 FIX ANTICRASH: Comprueba que toggleRightPanel existe antes de usarlo
onClick={() => onClose ? onClose() : (toggleRightPanel && toggleRightPanel('NONE'))}                    className="w-10 h-10 rounded-full bg-white hover:bg-slate-100 text-slate-500 transition-all shadow-sm flex items-center justify-center cursor-pointer border border-slate-200 shrink-0"
                >
                    <X size={20} />
                </button>
            </div>
            
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                Descubre los 3 agentes con mayor rendimiento en la zona <strong className="text-slate-800">{postalCode}</strong>. Contacta directamente para un servicio de venta VIP.
            </p>
        </div>

        {/* LISTA DE AGENCIAS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide pb-24">
            
            {topAgencies.map((agency) => (
                <div key={agency.id} className="group bg-white rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative">
                    
                    {/* FOTO DE PORTADA */}
                    <div className={`${agency.promotedProperty ? 'h-48' : 'h-28'} w-full relative bg-slate-200 overflow-hidden`}>
                        <img 
                            src={agency.cover} 
                            alt="Cover" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        
                        {/* BADGE PREMIUM FLOTANTE */}
                        {agency.isPremium && (
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-yellow-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-amber-500/30 backdrop-blur-md z-10">
                                <Crown size={12} /> PARTNER OFICIAL
                            </div>
                        )}

                        {/* INFO DE PROPIEDAD SUPERPUESTA */}
                        {agency.promotedProperty && (
                             <div className="absolute bottom-5 left-6 right-6 z-10">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="bg-[#007AFF] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">EN VENTA</span>
                                    <span className="text-white/90 text-[10px] font-bold tracking-widest uppercase">{agency.promotedProperty.specs}</span>
                                </div>
                                <h4 className="text-xl font-black text-white leading-tight truncate">{agency.promotedProperty.title}</h4>
                                <p className="text-2xl font-black text-white mt-0.5 drop-shadow-md">{agency.promotedProperty.price}</p>
                             </div>
                        )}
                    </div>

                    {/* AVATAR DE LA AGENCIA */}
                    <div className={`absolute left-6 ${agency.promotedProperty ? 'top-40' : 'top-16'} z-20`}>
                        <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md relative overflow-hidden bg-white">
                            <img src={agency.avatar} alt={agency.name} className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* CONTENIDO DE LA TARJETA */}
                    <div className={`${agency.promotedProperty ? 'pt-14' : 'pt-10'} px-6 pb-6`}>
                        
                        {/* NOMBRE Y TÍTULO */}
                        <div className="mb-4">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                                {agency.name}
                                {agency.isPremium && <CheckCircle2 size={16} className="text-[#007AFF] fill-blue-50" />}
                            </h3>
                            <p className="text-[11px] font-bold text-[#007AFF] uppercase tracking-widest mt-0.5">{agency.subtitle}</p>
                        </div>

                        {/* BIOGRAFÍA DE LA AGENCIA */}
                        <p className="text-[13px] text-slate-600 leading-relaxed mb-5 font-medium">
                            {agency.desc}
                        </p>

                        {/* BLOQUE DE PROPIEDAD PROMOCIONADA */}
                        {agency.promotedProperty && (
                            <div className="mb-6 bg-[#007AFF]/5 rounded-2xl p-4 border border-[#007AFF]/10">
                                <h5 className="flex items-center gap-1.5 text-[10px] font-black text-[#007AFF] uppercase tracking-widest mb-2">
                                    <Home size={12} /> Nota del Agente sobre el Activo
                                </h5>
                                <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                                    {agency.promotedProperty.desc}
                                </p>
                            </div>
                        )}

                        {/* ESTADÍSTICAS */}
                        <div className="bg-[#F5F5F7] rounded-[18px] p-4 flex justify-between items-center mb-6">
                            <div className="text-center flex-1">
                                <p className="text-xl font-black text-slate-900">{agency.sales}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ventas</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <div className="text-center flex-1">
                                <p className="text-xl font-black text-slate-900">{agency.days}<span className="text-sm font-semibold text-slate-500">d</span></p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Media</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <div className="text-center flex-1">
                                <p className="text-xl font-black text-slate-900 flex items-center justify-center gap-1">
                                    {agency.rating.toFixed(1)} <Star size={14} className="text-amber-400 fill-amber-400" />
                                </p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Score</p>
                            </div>
                        </div>

                        {/* BOTÓN DE CONTACTO */}
                        <button className="w-full bg-[#007AFF] hover:bg-[#005bb5] text-white font-bold tracking-widest text-[11px] py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/25">
                            <Phone size={16} /> {agency.isPremium ? "CONTACTAR CON ISIDRO BERNABEU" : "CONTACTAR AGENCIA"}
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}