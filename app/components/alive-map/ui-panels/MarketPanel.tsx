// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Star, Crown, CheckCircle2, Home, ArrowRight, Mail, Building2, Bed, Bath, Maximize2, Gem, ShieldCheck } from 'lucide-react';

// 🔥 IMPORTACIÓN CORREGIDA: Traemos la acción de la propiedad Y la acción de crear el Lead Fantasma
import { getPropertyByIdAction, submitLeadAction, getUserMeAction } from '@/app/actions';
import VanguardRequestModal from './VanguardRequestModal';
// 🔥 IMPORTACIÓN AÑADIDA: Traemos el chivato de clics y la campaña
import { getZoneCampaignAction, trackCampaignClickAction } from '@/app/actions-zones';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw';

export default function MarketPanel({ toggleRightPanel, onClose, currentCenter }: any) {  
  const [locationName, setLocationName] = useState("INICIALIZANDO RADAR...");
  const [postalCode, setPostalCode] = useState("00000");
  const [isScanning, setIsScanning] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);

  // 🔥 RADAR DE IDENTIDAD Y CONTROL DE MODAL
  const [userRole, setUserRole] = useState("PARTICULAR");
  const [userData, setUserData] = useState<any>(null); // Guardamos los datos para dárselos al modal
  const [showVipModal, setShowVipModal] = useState(false); // Controla si el modal se ve o no

  useEffect(() => {
      getUserMeAction().then(res => {
          if (res?.success && res?.data) {
              setUserRole(res.data.role || "PARTICULAR");
              setUserData(res.data); // Guardamos toda la info (email, teléfono, id)
          }
      });
  }, []);

  useEffect(() => {
    let timeoutId: any; 

    const scanArea = async (lng: number, lat: number) => {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=postcode,locality,place&language=es`;
        const res = await fetch(url);
        const data = await res.json();
        
        let zip = "00000", city = "Área Local";
        if (data.features && data.features.length > 0) {
          data.features.forEach((f: any) => {
            if (f.place_type.includes('postcode')) zip = f.text;
            if (f.place_type.includes('locality') || f.place_type.includes('place')) city = f.text;
          });
        }
        
        setPostalCode(zip);
        setLocationName(`${city.toUpperCase()} / CP: ${zip}`);

        const dbCampaign = await getZoneCampaignAction(zip);
        
        if (dbCampaign?.success && dbCampaign.data) {
             const dbData = dbCampaign.data;
             const prop = dbData.property as any; 
             const agency = dbData.agency as any; 

             setActiveCampaign({
                 id: dbData.id, 
                 agencyId: agency?.id, 
                 agencyName: agency?.companyName || agency?.name || "Agencia VIP",
                 subtitle: dbData.subtitle || "ZONA VIP",
                 bio: dbData.customBio || agency?.bio || agency?.tagline || "Agencia destacada en esta zona.",
                 address: agency?.address || city,
                 phone: [agency?.phone, agency?.mobile].filter(Boolean).join(" / ") || "Sin teléfono",
                 email: agency?.email,
                 logo: dbData.finalLogo || "", 
                 cover: agency?.coverImage || "", 
                 
                 property: {
                     id: prop?.id || "N/A",
                     ref: prop?.refCode || "Ref. Oculta",
                     title: prop?.title || "Propiedad Exclusiva",
                     price: prop?.price ? `${new Intl.NumberFormat("es-ES").format(prop.price)} €` : "Consultar",
                     discount: null, 
                     image: dbData.finalMainImage || prop?.mainImage || "",
                     desc: prop?.description || "Exclusiva propiedad disponible en este código postal.",
                     specs: [
                        { icon: <Bed size={14}/>, text: `${prop?.rooms || prop?.bedrooms || 0} Dorm` },
                        { icon: <Bath size={14}/>, text: `${prop?.baths || prop?.bathrooms || 0} Baños` },
                        { icon: <Maximize2 size={14}/>, text: `${prop?.mBuilt || prop?.surface || 0} m²` }
                     ]
                 },
                 lng: prop?.longitude || lng,
                 lat: prop?.latitude || lat
             });
        } else {
             setActiveCampaign(null); 
        }

      } catch (error) {
        setLocationName("SEÑAL DÉBIL");
      }
      setIsScanning(false);
    };

    const handleMapMovement = (e: any) => {
        const { lng, lat } = e.detail;
        if (lng && lat) {
            clearTimeout(timeoutId);
            setIsScanning(true); 
            timeoutId = setTimeout(() => scanArea(lng, lat), 150); 
        }
    };

    window.addEventListener('map-center-updated', handleMapMovement);

    if (currentCenter) {
        let lng = null, lat = null;
        if (Array.isArray(currentCenter) && currentCenter.length >= 2) { lng = currentCenter[0]; lat = currentCenter[1]; } 
        else if (currentCenter && currentCenter.lng !== undefined) { lng = currentCenter.lng; lat = currentCenter.lat; }
        if (lng && lat) {
            setIsScanning(true);
            scanArea(lng, lat);
        }
    }

    return () => {
        window.removeEventListener('map-center-updated', handleMapMovement);
        clearTimeout(timeoutId);
    };
  }, [currentCenter]);

  const executeCinematicStrike = async (campaign: any) => {
      if (!campaign || !campaign.property) return;
      
      const targetLng = campaign.lng;
      const targetLat = campaign.lat;
      const propId = campaign.property.id;
      
      if (!targetLng || !targetLat || !propId) return;

      if (campaign.id) {
          trackCampaignClickAction(campaign.id).catch(err => console.error(err));
      }

      submitLeadAction({
          propertyId: propId,
          name: "👁️ Visita Ficha VIP",
          email: "Interés Anónimo",
          phone: "Posible llamada directa",
          message: "Un usuario ha accedido a la ficha 3D de esta propiedad a través de tu campaña VIP en el mapa. Es posible que haya contactado por teléfono.",
          source: 'MARKET_NETWORK'
      }).catch(err => console.error("Error creando lead fantasma", err));

      try {
          const res = await getPropertyByIdAction(propId);
          let fullProperty = campaign.property;

          if (res?.success && res?.data) {
              fullProperty = res.data;
          }

          const richPayload = {
              ...fullProperty,
              id: String(propId),
              isAgencyContext: true,
              isFromMarket: true,
              source: 'MARKET_NETWORK', 
              campaignId: campaign.id,  
              user: { 
                  ...(fullProperty.user || fullProperty.ownerSnapshot || {}), 
                  id: campaign.agencyId, 
                  role: 'AGENCIA'
              }
          };

          if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent("select-property-signal", { detail: { id: String(propId) } }));
              (window as any).__currentOpenPropertyId = String(propId);
              window.dispatchEvent(new CustomEvent('open-details-signal', { detail: richPayload }));
              
              setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('fly-to-location', { 
                      detail: { center: [targetLng, targetLat], zoom: 18.5, pitch: 60, duration: 1500 } 
                  }));
              }, 200);
          }
      } catch (error) {
          console.error("❌ Error crítico en secuencia de impacto:", error);
      }
  };

  return (
    <div className="fixed inset-y-0 left-0 w-full md:w-[540px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-left border-r border-slate-200 bg-[#F5F5F7] shadow-[30px_0_60px_rgba(0,0,0,0.15)]">
      
      <div className="relative z-10 flex flex-col h-full text-slate-900">
        
        {/* HEADER ESTRATÉGICO */}
        <div className="p-8 pb-5 shrink-0 border-b border-slate-200/80 flex flex-col gap-5 bg-white">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Crown size={18} className="text-amber-500 fill-amber-500"/>
                        <h2 className="text-[10px] font-black tracking-widest text-amber-600 uppercase">Vanguard Market Network</h2>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Top Agency.</h2>
                    <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full w-fit border mt-2 transition-colors duration-500 ${activeCampaign ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20'}`}>
                        <MapPin size={14} className={isScanning ? "animate-pulse" : ""} />
                        <span className="text-[11px] font-black uppercase tracking-widest">
                            ZONA: {locationName}
                        </span>
                    </div>
                </div>
                 {/* 🔥 BOTÓN X (Idéntico a DetailsPanel + Efecto Giro) 🔥 */}
                     <button onClick={onClose} className="absolute top-12 right-8 w-10 h-10 bg-black/40 hover:bg-black/60 hover:rotate-90 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-md border border-white/20 text-white shadow-xl z-50">
                         <X size={20}/>
                     </button>
            </div>
        </div>

        {/* 🏢 CONTENIDO PRINCIPAL */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide pb-24 relative">
            
            {activeCampaign ? (
                
                <div className="animate-fade-in flex flex-col gap-6" key={`campaign-${postalCode}`}>
                    
                    {/* TARJETA DE EMPRESA ACTUALIZADA CON DOBLE REALIDAD */}
                    <div className="bg-white rounded-[28px] overflow-hidden shadow-xl border border-slate-100 relative">
                        
                        {/* 🚨 CHIVATO PARA AGENCIAS: Si eres agencia y ves esto, es territorio ocupado */}
                        {userRole === 'AGENCIA' && (
                            <div className="absolute top-4 right-4 z-20 bg-red-600/90 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg uppercase tracking-widest border border-red-400/50">
                                <ShieldCheck size={12} /> REFERENCIA EN ZONA
                            </div>
                        )}

                        <div className="h-40 w-full relative bg-slate-800">
                            {activeCampaign.cover && (
                                <img src={activeCampaign.cover} alt="Cover" className="w-full h-full object-cover opacity-80" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            
                            {activeCampaign.logo && (
                                <div className="absolute -bottom-8 left-6 w-20 h-20 bg-white rounded-2xl border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                                    <img src={activeCampaign.logo} alt="Logo" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="pt-12 px-6 pb-6">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                {activeCampaign.agencyName}
                                <CheckCircle2 size={18} className="text-[#007AFF] fill-blue-50" />
                            </h3>
                            <p className="text-[10px] font-black text-[#007AFF] uppercase tracking-widest mt-1">{activeCampaign.subtitle}</p>
                            
                            <p className="text-sm text-slate-600 leading-relaxed mt-4 font-medium">
                                {activeCampaign.bio}
                            </p>

                            {/* 📞 BOTONES INTERACTIVOS Y COPIABLES */}
                            <div className="mt-6 space-y-2">
                                <div className="flex items-start gap-3 text-sm p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5"/>
                                    <span className="text-slate-700 font-medium">{activeCampaign.address}</span>
                                </div>
                                
                                <a href={`tel:${activeCampaign.phone}`} className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl hover:bg-emerald-50 transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm shrink-0">
                                            <Phone size={14}/>
                                        </div>
                                        <span className="text-slate-900 font-bold select-all">{activeCampaign.phone}</span>
                                    </div>
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pr-2">Llamar</span>
                                </a>
                                
                                <a href={`mailto:${activeCampaign.email}`} className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white text-[#007AFF] flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                                            <Mail size={14}/>
                                        </div>
                                        <span className="text-[#007AFF] font-medium select-all truncate">{activeCampaign.email}</span>
                                    </div>
                                    <span className="text-[9px] font-black text-[#007AFF] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pr-2">Escribir</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* PROPIEDAD SÚPER ESTRELLA */}
                    <div className="mb-2 flex items-center gap-2 px-2">
                        <Crown size={16} className="text-amber-500" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">Activo Estrella en {postalCode}</h4>
                    </div>

                   <div 
                        className="bg-white rounded-[28px] overflow-hidden shadow-2xl border-2 border-amber-400/50 cursor-pointer group hover:scale-[1.02] transition-all duration-300 transform-gpu [-webkit-mask-image:-webkit-radial-gradient(white,black)]"
                        onClick={() => {
                            if(onClose) onClose();
                        }}
                    >
                        <div className="relative h-64 w-full bg-slate-100">
                            {activeCampaign.property.image && (
                                <img src={activeCampaign.property.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Propiedad"/>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                            
                            <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-red-600/30 uppercase tracking-widest border border-white/20">
                                EXCLUSIVA VIP
                            </div>

                            <div className="absolute bottom-5 left-5 right-5">
                                <h5 className="text-white font-black text-xl leading-tight line-clamp-2 drop-shadow-md">{activeCampaign.property.title}</h5>
                                <div className="flex items-end gap-3 mt-2">
                                    <span className="text-3xl font-black text-amber-400 drop-shadow-lg">{activeCampaign.property.price}</span>
                                </div>
                                {activeCampaign.property.discount && (
                                    <span className="inline-block mt-2 bg-red-500/20 backdrop-blur-md text-red-100 border border-red-500/30 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                                        {activeCampaign.property.discount}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="flex justify-between items-center py-3 px-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                                {activeCampaign.property.specs.map((spec: any, i: number) => (
                                    <React.Fragment key={i}>
                                        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                            <span className="text-slate-400">{spec.icon}</span> {spec.text}
                                        </div>
                                        {i < 2 && <div className="w-px h-5 bg-slate-200"></div>}
                                    </React.Fragment>
                                ))}
                            </div>
                            
                            <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3 mb-5">
                                {activeCampaign.property.desc}
                            </p>

                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    executeCinematicStrike(activeCampaign);
                                }}
                                className="w-full bg-slate-900 hover:bg-black text-white font-bold tracking-widest text-[11px] py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                VER EN EL MAPA 3D <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                    
                </div>
            ) : (
                
               <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in px-6" key="free-zone">
                
                {/* 💎 NÚCLEO DIAMANTE VIP CON ONDAS */}
                <div className="relative flex items-center justify-center mb-8 mt-4 mx-auto w-24 h-24">
                    {/* Onda expansiva exterior */}
                    <div className="absolute inset-0 bg-amber-400/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                    {/* Onda pulsante intermedia */}
                    <div className="absolute inset-2 bg-orange-500/20 rounded-full animate-pulse"></div>
                    {/* Núcleo Sólido */}
                    <div className="relative w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)] border-2 border-amber-200 z-10 hover:scale-110 transition-transform cursor-default">
                        <Gem size={28} className="text-white drop-shadow-lg" strokeWidth={2.5} />
                    </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Zona Estratégica Libre</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    El código postal <strong className="text-slate-800">{postalCode}</strong> actualmente no tiene ninguna Agencia Referente asignada.
                </p>
                    
             {userRole === 'AGENCIA' ? (
                    // 🔴 REALIDAD AGENCIA: MODO EXCLUSIVIDAD B2B
                    <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 w-full max-w-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                        <h4 className="font-black text-slate-900 text-lg mb-2">Posiciónate en tu Mercado</h4>
                        <ul className="text-left text-xs text-slate-600 space-y-3 mb-6 font-medium">
                            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-500"/> Posición #1 Exclusiva en {postalCode}</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-500"/> Nano Card VIP (Fuego)</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-500"/> Leads y llamadas directas</li>
                        </ul>
                        <button 
                            onClick={() => {
                                // 🔥 ABRIMOS EL MODAL DIRECTAMENTE AQUÍ (Sin cerrar el panel del mapa)
                                setShowVipModal(true);
                            }}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black tracking-widest text-[10px] py-4 rounded-xl transition-all shadow-lg shadow-amber-500/30 uppercase cursor-pointer"
                        >
                            Solicitar Exclusividad
                        </button>
                    </div>
                ) : (
                    // 🟢 REALIDAD PARTICULAR: MODO PAZ Y CONFIANZA
                    <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 w-full max-w-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                        <h4 className="font-black text-slate-900 text-lg mb-2">Zona Libre de Intermediarios</h4>
                        <p className="text-sm text-slate-500 mb-6">
                            Actualmente no hay agencias VIP asignadas en esta zona. Disfruta de un ecosistema limpio y operaciones de trato directo.
                        </p>
                        <button 
                            onClick={() => { if (onClose) onClose(); }}
                            className="w-full bg-slate-900 hover:bg-black text-white font-black tracking-widest text-[10px] py-4 rounded-xl transition-all shadow-lg uppercase cursor-pointer"
                        >
                            Continuar Explorando
                        </button>
                    </div>
                )}
                
                {/* 🛡️ EL MODAL OSCURO INYECTADO DIRECTAMENTE AQUÍ 🛡️ */}
                <VanguardRequestModal 
                    isOpen={showVipModal} 
                    onClose={() => setShowVipModal(false)} 
                    agencyData={userData} 
                />

                </div>
            )}
        </div>
      </div>
    </div>
  );
}