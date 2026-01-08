"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  X, Navigation, ChevronLeft, Search, Check, ShieldCheck, 
  Plus, MessageSquare, Bell, User, Loader2, Send, CheckCircle2
} from "lucide-react";

// Importamos el motor y audio
import { runAgencyOSSmoke } from '../agency-os/agencyos.smoke';
import { playSynthSound } from './audio';

// Servicios disponibles (Sin cambios, manteniendo su lógica de negocio)
const AVAILABLE_SERVICES = [
  { id: 'foto', label: 'Fotografía Premium', price: 150 },
  { id: 'tour', label: 'Tour Virtual 3D', price: 200 },
  { id: 'plano', label: 'Plano Técnico', price: 80 },
  { id: 'cert', label: 'Certificado Energ.', price: 120 },
];

export default function TacticalRadarController({ targets = [], onClose }: any) {
  
  // --- ESTADOS PRINCIPALES ---
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  
  // Servicios y Personalización
  const [activeServices, setActiveServices] = useState<string[]>([]);
  const [customServices, setCustomServices] = useState<any[]>([]); 
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");

  // Mensajería y Chat
  const [msgStatus, setMsgStatus] = useState<"IDLE" | "SENDING" | "SENT">("IDLE");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Memoria (Leads contactados)
  const [processedIds, setProcessedIds] = useState<string[]>([]); 

  // Búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'RADAR' | 'COMMS'>('RADAR');

  // --- EFECTOS ---
  // 1. Cargar memoria de leads contactados
  useEffect(() => {
    const saved = localStorage.getItem('stratos_processed_leads');
    if (saved) setProcessedIds(JSON.parse(saved));
  }, []);

  // 2. Scroll automático en el chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, activeTab]);

  // --- LÓGICA DE BÚSQUEDA (ESTABLE) ---
  
  // A. Filtrado local (Su Base de Datos) - INSTANTÁNEO
  const filteredTargets = targets.filter((t: any) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
          (t.address && t.address.toLowerCase().includes(term)) ||
          (t.type && t.type.toLowerCase().includes(term)) ||
          (t.price && t.price.toString().includes(term))
      );
  });

  // B. Búsqueda de Zona (Para mover el mapa) - SIN CERRAR EL PANEL
  const performGlobalSearch = async () => {
    if (!searchTerm) {
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('trigger-scan-signal'));
        return;
    }
    
    setIsSearching(true); // Solo activa el icono de carga, NO oculta la lista

    try {
        // Busca coordenadas en OpenStreetMap para mover la cámara
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            const location = data[0];
            const lat = parseFloat(location.lat);
            const lon = parseFloat(location.lon);
            
            if (typeof window !== "undefined") {
                // 1. Mueve el mapa
                window.dispatchEvent(new CustomEvent("fly-to-location", { 
                    detail: { center: [lon, lat], zoom: 14, pitch: 45 } 
                }));
                // 2. Avisa al sistema de escaneo
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('trigger-scan-signal'));
                    setIsSearching(false);
                }, 1500);
            }
        } else {
            setIsSearching(false);
        }
    } catch (error) {
        setIsSearching(false);
    }
  };

  // --- OPERACIONES ---
  const handleTrabajar = (target: any) => {
    setSelectedTarget(target);
    const isProcessed = processedIds.includes(String(target.id));
    
    if (isProcessed) {
        setMsgStatus("SENT");
        setActiveTab("COMMS");
        setChatHistory([
            { sender: 'system', text: 'Expediente recuperado.' },
            { sender: 'me', text: 'Propuesta enviada anteriormente.' }
        ]);
    } else {
        setMsgStatus("IDLE");    
        setActiveTab("RADAR");
        setChatHistory([]);
        setActiveServices([]);
    }
  };

  const handleVolar = (e: any, target: any) => {
    e.stopPropagation(); 
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("fly-to-location", { 
        detail: { center: [target.lng, target.lat], zoom: 18, pitch: 60 } 
      }));
    }
  };

  const toggleService = (id: string) => {
    setActiveServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleAddCustomService = () => {
      if (!newServiceName || !newServicePrice) return;
      const newId = `custom-${Date.now()}`;
      const newSrv = { id: newId, label: newServiceName, price: Number(newServicePrice) };
      setCustomServices([...customServices, newSrv]);
      setActiveServices([...activeServices, newId]); 
      setShowAddService(false);
      setNewServiceName("");
      setNewServicePrice("");
  };

  // --- ENVÍO DE PROPUESTA ---
  const sendProposal = () => {
    if (!selectedTarget) return;
    setMsgStatus("SENDING");
    
    const result = runAgencyOSSmoke({
        scope: { ownerId: 'demo_owner', agencyId: 'alpha_corp' },
        target: { propertyId: String(selectedTarget.id), title: selectedTarget.type || "Propiedad" }
    });

    setTimeout(() => {
        if (result && result.ok) {
            setMsgStatus("SENT");
            try { playSynthSound('success'); } catch(e) {}

            const newProcessed = [...processedIds, String(selectedTarget.id)];
            setProcessedIds(newProcessed);
            localStorage.setItem('stratos_processed_leads', JSON.stringify(newProcessed));

            setActiveTab('COMMS');
            setChatHistory([
                { sender: 'system', text: `Propuesta registrada (Ref: ${result.case.id.substring(0,6)}).` },
                { sender: 'system', text: `Incluye ${activeServices.length} servicios.` },
                { sender: 'me', text: 'Quedo a la espera de validación.' }
            ]);
        } else {
            setMsgStatus("IDLE");
        }
    }, 1200);
  };

  const sendMessage = () => {
      if(!inputMsg.trim()) return;
      try { playSynthSound('click'); } catch(e) {}
      setChatHistory(prev => [...prev, { sender: 'me', text: inputMsg }]);
      setInputMsg("");
      setTimeout(() => {
          setChatHistory(prev => [...prev, { sender: 'owner', text: 'Recibido.' }]);
          try { playSynthSound('ping'); } catch(e) {}
      }, 2000);
  };

  // --- RENDERIZADO (LIMPIO, ESTÁTICO Y PROFESIONAL) ---
  return (
    <div className="flex flex-col h-full w-full bg-[#F5F5F7]/95 backdrop-blur-3xl text-slate-900 shadow-xl font-sans border-l border-white/40 pointer-events-auto">
      
      {/* 1. CABECERA FIJA (NO SE MUEVE) */}
      <div className="shrink-0 p-6 pb-4 border-b border-black/5 z-20 bg-white/40 backdrop-blur-md">
         <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
               {selectedTarget && (
                   <button onClick={() => setSelectedTarget(null)} className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center shadow-sm border border-black/5 transition-all">
                       <ChevronLeft size={18} className="text-slate-600"/>
                   </button>
               )}
               <div>
                   <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                       Radar.
                   </h2>
               </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all">
               <X size={16} />
            </button>
         </div>

         {/* BARRA DE BÚSQUEDA (Solo visible en lista) */}
         {!selectedTarget && (
             <div className="flex gap-2">
                 <div className="flex-1 bg-white flex items-center px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm focus-within:border-blue-500 transition-all">
                     <Search size={14} className="text-slate-400 mr-2" />
                     <input 
                        type="text" 
                        placeholder="Buscar zona (ej: Manilva)..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && performGlobalSearch()}
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-full placeholder-slate-300"
                     />
                 </div>
                 <button 
                    onClick={performGlobalSearch} 
                    className="px-4 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-colors shadow-md"
                 >
                     {isSearching ? <Loader2 size={14} className="animate-spin"/> : <Search size={14} />}
                 </button>
             </div>
         )}
      </div>

      {/* 2. CUERPO (LISTA O DETALLE) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-0">
         
         {selectedTarget ? (
            /* --- VISTA DETALLE --- */
            <div className="p-6 space-y-6 animate-fade-in-up">
                
                {/* Info Principal */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                        <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">Captación</span>
                        <span className="text-lg font-black text-slate-900">{selectedTarget.price}</span>
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 leading-tight mb-1">{selectedTarget.type}</h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Navigation size={10}/> {selectedTarget.address || "Ubicación Privada"}
                    </p>
                </div>

                {/* Tabs */}
                <div className="bg-slate-200/50 p-1 rounded-xl flex text-center">
                    <button onClick={() => setActiveTab('RADAR')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'RADAR' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Servicios</button>
                    <button onClick={() => setActiveTab('COMMS')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'COMMS' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Chat</button>
                </div>

                {/* CONTENIDO SERVICIOS */}
                {activeTab === 'RADAR' && (
                    <div className="animate-fade-in">
                        {msgStatus === 'SENT' ? (
                            <div className="text-center py-8 bg-white rounded-3xl border border-slate-100">
                                <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2"/>
                                <p className="text-sm font-bold text-slate-900">Propuesta Enviada</p>
                                <button onClick={() => setActiveTab('COMMS')} className="mt-4 text-[10px] text-blue-600 font-bold hover:underline">Ver conversación</button>
                            </div>
                        ) : (
                            <>
                                {/* Lista de Servicios */}
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between items-center px-1 mb-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Seleccionar Extras</p>
                                        <button onClick={() => setShowAddService(!showAddService)} className="text-[10px] text-blue-600 font-bold flex items-center gap-1"><Plus size={10}/> Personalizar</button>
                                    </div>

                                    {showAddService && (
                                        <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm mb-4 animate-fade-in-down">
                                            <div className="flex gap-2 mb-2">
                                                <input value={newServiceName} onChange={e=>setNewServiceName(e.target.value)} placeholder="Servicio..." className="flex-1 bg-slate-50 text-xs p-2 rounded-lg outline-none border border-slate-100"/>
                                                <input value={newServicePrice} onChange={e=>setNewServicePrice(e.target.value)} placeholder="€" type="number" className="w-16 bg-slate-50 text-xs p-2 rounded-lg outline-none border border-slate-100"/>
                                            </div>
                                            <button onClick={handleAddCustomService} className="w-full bg-blue-600 text-white text-[10px] font-bold py-2 rounded-lg">Añadir</button>
                                        </div>
                                    )}

                                    {[...AVAILABLE_SERVICES, ...customServices].map(service => {
                                        const isSelected = activeServices.includes(service.id);
                                        return (
                                            <div key={service.id} onClick={() => toggleService(service.id)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                                        {isSelected && <Check size={10} className="text-white" strokeWidth={3}/>}
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-700">{service.label}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400">{service.price}€</span>
                                            </div>
                                        )
                                    })}
                                </div>

                                <button onClick={sendProposal} disabled={msgStatus === "SENDING"} className="w-full bg-slate-900 text-white font-bold text-xs py-4 rounded-2xl shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2">
                                    {msgStatus === "SENDING" ? <Loader2 size={14} className="animate-spin"/> : "ENVIAR PROPUESTA"}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* CONTENIDO CHAT */}
                {activeTab === 'COMMS' && (
                    <div className="flex flex-col h-[300px] bg-white rounded-3xl border border-slate-100 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 custom-scrollbar">
                            {chatHistory.length === 0 && (
                                <div className="text-center py-10 opacity-40">
                                    <MessageSquare size={20} className="mx-auto mb-2"/>
                                    <p className="text-[10px]">Inicie la conversación</p>
                                </div>
                            )}
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex gap-2 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`p-3 rounded-2xl text-[10px] max-w-[85%] font-medium ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-600 rounded-tl-sm shadow-sm'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-2 bg-white border-t border-slate-100 flex gap-2">
                            <input 
                                value={inputMsg}
                                onChange={e => setInputMsg(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                type="text" 
                                placeholder="Escribir..."
                                className="flex-1 bg-slate-100 rounded-xl px-3 text-xs outline-none text-slate-800"
                            />
                            <button onClick={sendMessage} className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-black"><Send size={12}/></button>
                        </div>
                    </div>
                )}
            </div>
         ) : (
            /* --- VISTA LISTA (FILTRADA Y LIMPIA) --- */
            <div className="pb-10">
                {/* Cabecera Lista */}
                <div className="px-6 py-2 bg-slate-50/80 sticky top-0 backdrop-blur-sm z-10 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Resultados: {filteredTargets.length}
                    </span>
                </div>

                {/* Lista de Resultados */}
                <div className="px-4 py-2 space-y-2">
                    {filteredTargets.length === 0 ? (
                        <div className="text-center py-12">
                             <p className="text-xs font-bold text-slate-300">No hay propiedades en esta vista.</p>
                             {/* NOTA: Si está vacío, es porque el mapa no ha enviado propiedades. Mueva el mapa a una zona con casas. */}
                        </div>
                    ) : (
                        filteredTargets.map((t: any) => {
                            const isProcessed = processedIds.includes(String(t.id));
                            return (
                                <div 
                                    key={t.id} 
                                    onClick={() => handleTrabajar(t)} 
                                    className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border border-transparent
                                        ${isProcessed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white hover:border-slate-200 hover:shadow-md'}
                                    `}
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-900 text-xs">{t.type}</span>
                                            {isProcessed && <CheckCircle2 size={10} className="text-emerald-500"/>}
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium truncate max-w-[180px]">
                                            {t.address || "Dirección desconocida"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-black text-slate-900 text-xs">{t.price}</span>
                                        <span className="text-[9px] text-blue-500 font-bold group-hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Ver</span>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
         )}
      </div>
    </div>
  );
}

