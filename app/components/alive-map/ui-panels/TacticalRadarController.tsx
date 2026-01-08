"use client";
import React, { useState, useEffect } from "react";
import { 
  Zap, CheckCircle2, X, Navigation, ChevronLeft, Search, 
  Check, ShieldCheck, Plus, MessageSquare, Bell, User, Loader2, Send
} from "lucide-react";

// Importamos el motor real para generar expedientes
import { runAgencyOSSmoke } from '../agency-os/agencyos.smoke';
import { playSynthSound } from './audio';

// Servicios base (Tal cual usted los definió)
const AVAILABLE_SERVICES = [
  { id: 'foto', label: 'Fotografía Premium', price: 150 },
  { id: 'tour', label: 'Tour Virtual 3D', price: 200 },
  { id: 'plano', label: 'Plano Técnico', price: 80 },
  { id: 'cert', label: 'Certificado Energ.', price: 120 },
];

export default function TacticalRadarController({ targets = [], onClose }: any) {
  
  // --- 1. ESTADOS ---
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  
  // Estado de servicios (mezcla los fijos y los custom)
  const [activeServices, setActiveServices] = useState<string[]>([]);
  const [customServices, setCustomServices] = useState<any[]>([]); 
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");

  // Mensajería y Memoria
  const [msgStatus, setMsgStatus] = useState<"IDLE" | "SENDING" | "SENT">("IDLE");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  
  // Memoria Persistente (LocalStorage)
  const [processedIds, setProcessedIds] = useState<string[]>([]); 

  // Búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'RADAR' | 'COMMS'>('RADAR');

  // --- 2. EFECTO DE MEMORIA ---
  useEffect(() => {
    const saved = localStorage.getItem('stratos_processed_leads');
    if (saved) {
        setProcessedIds(JSON.parse(saved));
    }
  }, []);

  // --- 3. BÚSQUEDA Y FILTRADO REAL (Su Base de Datos) ---
  const filteredTargets = targets.filter((t: any) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      // Filtramos por lo que haya en sus datos reales (tipo, dirección o precio)
      return (
          (t.address && t.address.toLowerCase().includes(searchLower)) ||
          (t.type && t.type.toLowerCase().includes(searchLower)) ||
          (t.price && t.price.toString().includes(searchLower))
      );
  });

  // Búsqueda Global (Nominatim/OSM) - Solo para mover el mapa si no encuentra nada local
  const performGlobalSearch = async () => {
    if (!searchTerm) {
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('trigger-scan-signal'));
        return;
    }
    setIsSearching(true);
    try {
        // Busca en OpenStreetMap
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            const location = data[0];
            const lat = parseFloat(location.lat);
            const lon = parseFloat(location.lon);
            
            if (typeof window !== "undefined") {
                // Mueve el mapa
                window.dispatchEvent(new CustomEvent("fly-to-location", { 
                    detail: { center: [lon, lat], zoom: 14, pitch: 45 } 
                }));
                // Dispara escaneo para buscar propiedades en esa zona
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('trigger-scan-signal'));
                    setIsSearching(false);
                }, 2000);
            }
        } else {
            setIsSearching(false);
        }
    } catch (error) {
        setIsSearching(false);
    }
  };

  // --- 4. LÓGICA DE NEGOCIO ---
  const handleTrabajar = (target: any) => {
    setSelectedTarget(target);
    
    const isProcessed = processedIds.includes(String(target.id));
    
    if (isProcessed) {
        setMsgStatus("SENT");
        setActiveTab("COMMS");
        setChatHistory([
            { sender: 'system', text: 'Propuesta recuperada.' },
            { sender: 'me', text: 'Esperando respuesta del propietario...' }
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

  // Gestión de Servicios
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

  // --- 5. ACCIONES TÁCTICAS (CONECTADAS AL MOTOR AGENCY OS) ---

  const sendProposal = () => {
    if (!selectedTarget) return;
    setMsgStatus("SENDING");
    
    // 1. Ejecutamos el motor REAL
    const result = runAgencyOSSmoke({
        scope: { ownerId: 'demo_owner', agencyId: 'alpha_corp' },
        target: { 
            propertyId: String(selectedTarget.id), 
            title: selectedTarget.type || "Propiedad"
        }
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
                { sender: 'system', text: `CASE #${result.case.id.substring(0,8).toUpperCase()}: Generado.` },
                { sender: 'me', text: 'Propuesta enviada correctamente.' }
            ]);
        } else {
            setMsgStatus("IDLE");
            try { playSynthSound('error'); } catch(e) {}
        }
    }, 1500);
  };

  const sendMessage = () => {
      if(!inputMsg.trim()) return;
      
      try { playSynthSound('click'); } catch(e) {}

      const newMsg = { sender: 'me', text: inputMsg };
      setChatHistory(prev => [...prev, newMsg]);
      setInputMsg("");
      
      setTimeout(() => {
          setChatHistory(prev => [...prev, { sender: 'owner', text: 'Recibido.' }]);
          try { playSynthSound('ping'); } catch(e) {}
      }, 3000);
  };

  // --- RENDERIZADO (SU INTERFAZ LIMPIA ORIGINAL) ---
  return (
    <div className="flex flex-col h-full w-full bg-[#F2F2F7]/95 backdrop-blur-3xl text-slate-900 shadow-[-20px_0_40px_rgba(0,0,0,0.15)] font-sans border-l border-white/20 pointer-events-auto">
      
      {/* CABECERA */}
      <div className="shrink-0 p-6 pb-4 border-b border-black/5 z-20 space-y-4">
         <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
               {selectedTarget && (
                   <button onClick={() => setSelectedTarget(null)} className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 flex items-center justify-center shadow-sm border border-black/5">
                       <ChevronLeft size={20} />
                   </button>
               )}
               <div>
                   <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-0.5">Radar.</h2>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Stratos OS v2.1</p>
                   </div>
               </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white hover:bg-slate-200 text-slate-500 flex items-center justify-center shadow-sm border border-black/5">
               <X size={20} />
            </button>
         </div>

         {!selectedTarget && (
             <div className="flex gap-2 animate-fade-in">
                 <div className="flex-1 bg-white flex items-center px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm focus-within:border-blue-500 transition-all">
                     <Search size={14} className="text-slate-400 mr-2" />
                     <input 
                        type="text" 
                        placeholder="Buscar zona (ej: Manilva)..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && performGlobalSearch()}
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-full"
                     />
                 </div>
                 <button onClick={performGlobalSearch} className="px-4 bg-[#1c1c1e] text-white rounded-xl flex items-center justify-center">
                     {isSearching ? <Loader2 size={14} className="animate-spin"/> : <Search size={14} />}
                 </button>
             </div>
         )}
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
         
         {selectedTarget ? (
            <div className="bg-white rounded-[24px] shadow-sm border border-white/60 overflow-hidden animate-fade-in-up">
                {/* DATOS PROPIEDAD */}
                <div className="p-6 pb-0">
                    <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-1 rounded-md uppercase">Oportunidad</span>
                    <h3 className="font-black text-2xl text-slate-900 leading-tight mt-2">{selectedTarget.type}</h3>
                    <div className="text-lg font-bold text-emerald-600 mb-4">{selectedTarget.price}</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl mb-5">
                        <Navigation size={14} className="text-blue-500"/> 
                        <span className="truncate">{selectedTarget.address}</span>
                    </div>
                    <div className="h-px w-full bg-slate-100 mb-4"></div>
                </div>

                {/* TABS */}
                <div className="px-6 pb-4">
                    <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
                        <button onClick={() => setActiveTab('RADAR')} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-md transition-all ${activeTab === 'RADAR' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>Servicios</button>
                        <button onClick={() => setActiveTab('COMMS')} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-md transition-all ${activeTab === 'COMMS' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>Comms</button>
                    </div>

                    {/* PANEL SERVICIOS */}
                    {activeTab === 'RADAR' && (
                        <div className="animate-fade-in">
                            {msgStatus === 'SENT' ? (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="font-bold text-slate-900">Propuesta Activa</h3>
                                    <p className="text-xs text-slate-500 mt-2 mb-4">Ya has enviado una oferta a esta propiedad.</p>
                                    <button onClick={() => setActiveTab('COMMS')} className="px-8 py-3 bg-[#1c1c1e] text-white rounded-full text-[10px] font-bold uppercase">Ver Chat</button>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 pb-6 mb-[-12px] relative z-0">
                                        <div className="flex items-center gap-2 mb-3">
                                            <ShieldCheck size={12} className="text-emerald-600" />
                                            <span className="text-[10px] font-black text-emerald-800 uppercase">Pack Base</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {['Cert. Energético', 'Nota Simple'].map((s, i) => (
                                                <span key={i} className="text-[9px] px-2 py-1 bg-white text-emerald-700 rounded-md font-bold shadow-sm border border-emerald-100">{s}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Botón + REAL */}
                                    <div className="relative z-10 flex justify-center">
                                        <button 
                                            onClick={() => setShowAddService(!showAddService)}
                                            className="bg-white border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-500 p-1.5 rounded-full shadow-sm transition-all active:scale-90"
                                        >
                                            <Plus size={14} strokeWidth={4} />
                                        </button>
                                    </div>

                                    {/* Formulario Añadir Servicio */}
                                    {showAddService && (
                                        <div className="mt-2 bg-white border border-blue-100 p-3 rounded-xl shadow-lg animate-fade-in-down mb-4 relative z-20">
                                            <p className="text-[10px] font-black uppercase mb-2">Nuevo Servicio</p>
                                            <div className="flex gap-2 mb-2">
                                                <input value={newServiceName} onChange={e=>setNewServiceName(e.target.value)} placeholder="Ej: Video Dron" className="flex-1 bg-slate-50 text-xs p-2 rounded-lg outline-none"/>
                                                <input value={newServicePrice} onChange={e=>setNewServicePrice(e.target.value)} placeholder="€" type="number" className="w-16 bg-slate-50 text-xs p-2 rounded-lg outline-none"/>
                                            </div>
                                            <button onClick={handleAddCustomService} className="w-full bg-blue-600 text-white text-[10px] font-bold py-2 rounded-lg">AÑADIR A LA LISTA</button>
                                        </div>
                                    )}

                                    <div className="bg-transparent mt-[-12px] pt-6 pb-2 relative z-0">
                                        <div className="flex justify-between items-end mb-3 px-1">
                                            <p className="text-[10px] font-black text-slate-900 uppercase">Estrategia</p>
                                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{activeServices.length} extras</span>
                                        </div>
                                        
                                        <div className="space-y-2 mb-6">
                                            {[...AVAILABLE_SERVICES, ...customServices].map(service => {
                                                const isSelected = activeServices.includes(service.id);
                                                return (
                                                    <div key={service.id} onClick={() => toggleService(service.id)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-blue-200 shadow-sm translate-x-1' : 'bg-white border-slate-100'}`}>
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

                                        <button onClick={sendProposal} disabled={msgStatus === "SENDING"} className="w-full bg-[#1c1c1e] text-white font-bold text-xs tracking-widest py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-black uppercase transition-all">
                                            {msgStatus === "SENDING" ? "Firmando Digitalmente..." : "Enviar Propuesta"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* PANEL CHAT */}
                    {activeTab === 'COMMS' && (
                        <div className="animate-fade-in flex flex-col h-[400px]">
                            {/* AREA DE MENSAJES */}
                            <div className="flex-1 overflow-y-auto space-y-3 p-2 custom-scrollbar">
                                <div className="flex gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center"><Bell size={10}/></div>
                                    <div className="bg-slate-100 p-2 rounded-xl rounded-tl-none text-[10px] text-slate-600 max-w-[80%]">
                                        Sistema: Conexión establecida con el propietario.
                                    </div>
                                </div>
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex gap-2 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${msg.sender === 'me' ? 'bg-[#1c1c1e] text-white' : 'bg-blue-100 text-blue-600'}`}>
                                            <User size={10}/>
                                        </div>
                                        <div className={`p-2 rounded-xl text-[10px] max-w-[80%] ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* INPUT CHAT */}
                            <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 flex items-center gap-2 pr-2">
                                <input 
                                    value={inputMsg}
                                    onChange={e => setInputMsg(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                    type="text" 
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 bg-transparent text-xs px-3 py-2 outline-none font-medium text-slate-700 placeholder-slate-400"
                                />
                                <button onClick={sendMessage} className="p-2 bg-[#1c1c1e] text-white rounded-lg hover:bg-black transition-colors">
                                    <Send size={12}/>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
         ) : (
             /* LISTA DE RESULTADOS */
             <div className="space-y-3 pb-10">
                <div className="flex justify-between items-end px-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objetivos ({filteredTargets.length})</p>
                    {searchTerm && <p className="text-[9px] font-bold text-blue-500 uppercase animate-pulse">Radar Activo</p>}
                </div>
                
                {filteredTargets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-300 opacity-60">
                        <Search size={40} strokeWidth={1.5} className="mb-3"/>
                        <p className="text-xs font-bold uppercase tracking-wider text-center max-w-[200px]">Sin señal en el sector</p>
                        {/* NOTA PARA USTED GENERAL: Si sale esto, es que 'targets' llega vacío del componente padre */}
                    </div>
                ) : (
                    filteredTargets.map((t: any) => {
                        const isProcessed = processedIds.includes(String(t.id));
                        return (
                            <div key={t.id} onClick={() => handleTrabajar(t)} className={`bg-white p-4 rounded-[20px] shadow-sm border cursor-pointer hover:shadow-lg transition-all flex justify-between items-center group relative overflow-hidden ${isProcessed ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100 hover:border-blue-300'}`}>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-black text-slate-900 text-sm">{t.type}</span>
                                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{t.price}</span>
                                        {isProcessed && <span className="bg-emerald-100 text-emerald-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Contactado</span>}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold truncate max-w-[180px] flex items-center gap-1 uppercase">
                                        <Navigation size={10} /> {t.address}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 z-10">
                                    <button onClick={(e) => handleVolar(e, t)} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all shadow-sm border border-slate-100"><Navigation size={14} /></button>
                                </div>
                            </div>
                        )
                    })
                )}
             </div>
         )}
      </div>
    </div>
  );
}