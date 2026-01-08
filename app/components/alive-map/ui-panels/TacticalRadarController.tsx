"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  X, Navigation, ChevronLeft, Search, Check, ShieldCheck, 
  Plus, MessageSquare, Bell, User, Loader2, Send, Zap, CheckCircle2
} from "lucide-react";

import { runAgencyOSSmoke } from '../agency-os/agencyos.smoke';
import { SERVICE_CATALOG } from '../agency-os/agencyos.catalog'; // Conectado al catálogo limpio
import { playSynthSound } from './audio';

export default function TacticalRadarController({ targets = [], onClose }: any) {
  
  // --- 1. LICENCIA Y SALDO ---
  const [agencyLicense, setAgencyLicense] = useState<any>({ 
      name: "CUENTA PROFESSIONAL", 
      credits: 50, 
  });

  // Escuchar actualizaciones de saldo (Mercado)
  useEffect(() => {
      const handleUpgrade = (e: any) => {
          setAgencyLicense(e.detail);
      };
      window.addEventListener('agency-upgrade-signal', handleUpgrade);
      return () => window.removeEventListener('agency-upgrade-signal', handleUpgrade);
  }, []);

  // --- 2. ESTADOS ---
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [activeServices, setActiveServices] = useState<string[]>(['LEGAL_CHECK']); 
  const [customServices, setCustomServices] = useState<any[]>([]); 
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");

  const [msgStatus, setMsgStatus] = useState<"IDLE" | "SENDING" | "SENT">("IDLE");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [processedIds, setProcessedIds] = useState<string[]>([]); 
  useEffect(() => {
    const saved = localStorage.getItem('stratos_processed_leads');
    if (saved) setProcessedIds(JSON.parse(saved));
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  // --- 3. BÚSQUEDA INTELIGENTE (LA QUE USTED QUERÍA) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // A. Filtro Local (Base de Datos)
  const filteredTargets = targets.filter((t: any) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
          (t.address && t.address.toLowerCase().includes(term)) ||
          (t.type && t.type.toLowerCase().includes(term)) ||
          (t.price && t.price.toString().includes(term))
      );
  });

  // B. Búsqueda Global (OpenStreetMap / Nominatim) - RECUPERADA
  const performGlobalSearch = async () => {
    if (!searchTerm) return;
    setIsSearching(true);
    try {
        // Busca coordenadas reales
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
                // 2. Dispara escaneo en la nueva zona
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

  // --- 4. OPERATIVA ---
  const handleTrabajar = (target: any) => {
    setSelectedTarget(target);
    const isProcessed = processedIds.includes(String(target.id));
    
    if (isProcessed) {
        setMsgStatus("SENT");
        setChatHistory([
            { sender: 'system', text: 'Expediente consultado.' },
            { sender: 'me', text: 'Propuesta enviada anteriormente.' }
        ]);
    } else {
        setMsgStatus("IDLE");    
        setChatHistory([]);
        setActiveServices(['LEGAL_CHECK']); 
    }
  };

  const toggleService = (id: string) => {
      setActiveServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const calculateCost = () => {
      let cost = 0;
      activeServices.forEach(srvId => {
          if (SERVICE_CATALOG[srvId]) cost += SERVICE_CATALOG[srvId].costCredits;
      });
      return cost;
  };

  const sendProposal = () => {
    if (!selectedTarget) return;
    
    // Consumo de saldo (Simulado visualmente)
    const cost = calculateCost();
    setAgencyLicense((prev: any) => ({ ...prev, credits: Math.max(0, prev.credits - cost) }));

    setMsgStatus("SENDING");
    
    const result = runAgencyOSSmoke({
        scope: { ownerId: 'demo', agencyId: 'corp' },
        target: { propertyId: String(selectedTarget.id), title: selectedTarget.type || "Propiedad" }
    });

    setTimeout(() => {
        if (result && result.ok) {
            setMsgStatus("SENT");
            try { playSynthSound('success'); } catch(e) {}
            
            const newProcessed = [...processedIds, String(selectedTarget.id)];
            setProcessedIds(newProcessed);
            localStorage.setItem('stratos_processed_leads', JSON.stringify(newProcessed));

            setChatHistory([
                { sender: 'system', text: `Expediente #${result.case.id.substring(0,6)} generado.` },
                { sender: 'me', text: 'Propuesta comercial enviada.' }
            ]);
        }
    }, 1000);
  };

  const sendMessage = () => {
      if(!inputMsg.trim()) return;
      try { playSynthSound('click'); } catch(e) {}
      setChatHistory(prev => [...prev, { sender: 'me', text: inputMsg }]);
      setInputMsg("");
      setTimeout(() => {
          setChatHistory(prev => [...prev, { sender: 'owner', text: 'Recibido.' }]);
      }, 1500);
  };

  // --- RENDERIZADO PROFESIONAL ---
  return (
    <div className="flex flex-col h-full w-full bg-[#F5F5F7]/95 backdrop-blur-3xl text-slate-900 shadow-xl font-sans border-l border-white/20 pointer-events-auto">
      
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
                   <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-0.5">Radar.</h2>
                   <div className="flex items-center gap-2 mt-1 opacity-70">
                      <span className="text-[10px] font-bold uppercase tracking-wider">{agencyLicense.name}</span>
                      <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                      <span className="text-[10px] font-bold">Saldo: {agencyLicense.credits} Cr</span>
                   </div>
               </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all">
               <X size={18} />
            </button>
         </div>

         {/* BUSCADOR REAL */}
         {!selectedTarget && (
             <div className="flex gap-2">
                 <div className="flex-1 bg-white flex items-center px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm focus-within:border-blue-500 transition-all">
                     <Search size={14} className="text-slate-400 mr-2" />
                     <input 
                        type="text" 
                        placeholder="Buscar ubicación (ej: Manilva)..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && performGlobalSearch()}
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-full placeholder-slate-400"
                     />
                 </div>
                 <button onClick={performGlobalSearch} className="px-4 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-colors shadow-md">
                     {isSearching ? <Loader2 size={14} className="animate-spin"/> : <Search size={14} />}
                 </button>
             </div>
         )}
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
         
         {selectedTarget ? (
            <div className="bg-white rounded-[24px] shadow-sm border border-white/60 overflow-hidden animate-fade-in-up">
                {/* INFO PROPIEDAD */}
                <div className="p-6 pb-0">
                    <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">Captación</span>
                    <h3 className="font-bold text-xl text-slate-900 leading-tight mt-2">{selectedTarget.type}</h3>
                    <div className="text-lg font-black text-slate-900 mb-4">{selectedTarget.price}</div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 p-3 rounded-xl mb-5">
                        <Navigation size={14} className="text-slate-400"/> 
                        <span className="truncate">{selectedTarget.address || "Ubicación Privada"}</span>
                    </div>
                </div>

                {/* OPERATIVA */}
                <div className="px-6 pb-6 bg-slate-50/50 pt-4 border-t border-slate-100">
                    
                    {msgStatus === 'SENT' ? (
                        <div className="flex flex-col h-[300px]">
                             <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl mb-3 flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-600"/>
                                <span className="text-[10px] font-bold text-emerald-800">Propuesta Activa</span>
                             </div>
                             <div className="flex-1 overflow-y-auto space-y-2 p-1 mb-2">
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex gap-2 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`p-2 rounded-xl text-[10px] max-w-[85%] font-medium ${msg.sender === 'me' ? 'bg-[#1c1c1e] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef}/>
                             </div>
                             <div className="flex gap-2">
                                <input value={inputMsg} onChange={e=>setInputMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none" placeholder="Escribir mensaje..."/>
                                <button onClick={sendMessage} className="bg-slate-900 text-white p-2 rounded-lg"><Send size={14}/></button>
                             </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-end mb-3">
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Servicios Incluidos</p>
                                <span className="text-[10px] font-bold text-slate-400">{calculateCost()} Créditos</span>
                            </div>

                            <div className="space-y-2 mb-6">
                                {Object.values(SERVICE_CATALOG).map((service: any) => {
                                    const isSelected = activeServices.includes(service.id);
                                    return (
                                        <div key={service.id} onClick={() => toggleService(service.id)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500/10' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                                    {isSelected && <Check size={8} className="text-white" strokeWidth={4}/>}
                                                </div>
                                                <span className="text-xs font-medium text-slate-900">{service.label}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">{service.priceEUR}€</span>
                                        </div>
                                    )
                                })}
                            </div>

                            <button onClick={sendProposal} disabled={msgStatus === "SENDING"} className="w-full bg-[#1c1c1e] text-white font-bold text-xs py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-black transition-all">
                                {msgStatus === "SENDING" ? <Loader2 size={14} className="animate-spin"/> : "ENVIAR PROPUESTA"}
                            </button>
                        </>
                    )}
                </div>
            </div>
         ) : (
             <div className="space-y-3 pb-10">
                <div className="flex justify-between items-end px-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resultados ({filteredTargets.length})</p>
                </div>
                
                {filteredTargets.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-xs font-bold text-slate-400">Sin propiedades en esta zona.</p>
                        <p className="text-[10px] text-slate-300 mt-1">Pruebe a buscar otra ubicación.</p>
                    </div>
                ) : (
                    filteredTargets.map((t: any) => {
                        const isProcessed = processedIds.includes(String(t.id));
                        return (
                            <div key={t.id} onClick={() => handleTrabajar(t)} className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition-all flex justify-between items-center group relative overflow-hidden ${isProcessed ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100'}`}>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-slate-900 text-xs">{t.type}</span>
                                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{t.price}</span>
                                        {isProcessed && <span className="text-emerald-600 text-[9px] font-bold flex items-center gap-1"><CheckCircle2 size={10}/> Enviado</span>}
                                    </div>
                                    <p className="text-[10px] text-slate-500 truncate max-w-[180px]">
                                        {t.address || "Dirección Privada"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-all border border-slate-200"><Navigation size={14} /></button>
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

