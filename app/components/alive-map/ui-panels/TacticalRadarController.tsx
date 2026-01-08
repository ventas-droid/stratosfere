"use client";
import React, { useState, useEffect, useRef } from "react";
// CORRECCIÓN: He añadido CheckCircle2 a esta lista
import { 
  X, Navigation, ChevronLeft, Search, Check, ShieldCheck, 
  Plus, MessageSquare, Bell, User, Loader2, Send, Zap, CheckCircle2
} from "lucide-react";

// Conexiones al motor y catálogo
import { runAgencyOSSmoke } from '../agency-os/agencyos.smoke';
import { SERVICE_CATALOG } from '../agency-os/agencyos.catalog';
import { playSynthSound } from './audio';

export default function TacticalRadarController({ targets = [], onClose }: any) {
  
  // --- 1. MEMORIA Y LICENCIA (GAMIFICACIÓN) ---
  const [agencyLicense, setAgencyLicense] = useState<any>({ 
      name: "AGENTE NOVATO", 
      credits: 5, 
      badge: "🛡️" 
  });

  useEffect(() => {
      const handleUpgrade = (e: any) => {
          console.log("📡 RADAR: Recarga de Munición recibida ->", e.detail.name);
          setAgencyLicense(e.detail);
          try { playSynthSound('upgrade'); } catch(e) {}
      };
      window.addEventListener('agency-upgrade-signal', handleUpgrade);
      return () => window.removeEventListener('agency-upgrade-signal', handleUpgrade);
  }, []);

  // --- 2. ESTADOS DE INTERFAZ ---
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [activeServices, setActiveServices] = useState<string[]>(['LEGAL_CHECK']); 
  
  const [msgStatus, setMsgStatus] = useState<"IDLE" | "SENDING" | "SENT" | "NO_CREDITS">("IDLE");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [processedIds, setProcessedIds] = useState<string[]>([]); 
  useEffect(() => {
    const saved = localStorage.getItem('stratos_processed_leads');
    if (saved) setProcessedIds(JSON.parse(saved));
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  // --- 3. BÚSQUEDA ROBUSTA (SOLO FILTRO, NO CIERRA) ---
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredTargets = targets.filter((t: any) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
          (t.address && t.address.toLowerCase().includes(term)) ||
          (t.type && t.type.toLowerCase().includes(term)) ||
          (t.price && t.price.toString().includes(term))
      );
  });

  // --- 4. MECÁNICA DE JUEGO ---
  const calculateOperationCost = () => {
      let cost = 1; 
      activeServices.forEach(srvId => {
          if (SERVICE_CATALOG[srvId]) {
              cost += SERVICE_CATALOG[srvId].costCredits;
          }
      });
      return cost;
  };

  const operationCost = calculateOperationCost();

  const handleTrabajar = (target: any) => {
    setSelectedTarget(target);
    const isProcessed = processedIds.includes(String(target.id));
    
    if (isProcessed) {
        setMsgStatus("SENT");
        setChatHistory([
            { sender: 'system', text: 'Expediente recuperado.' },
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

  const sendProposal = () => {
    if (!selectedTarget) return;

    if (agencyLicense.credits < operationCost) {
        setMsgStatus("NO_CREDITS");
        try { playSynthSound('error'); } catch(e) {}
        return;
    }

    setMsgStatus("SENDING");
    
    setAgencyLicense((prev: any) => ({
        ...prev,
        credits: prev.credits - operationCost
    }));

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
                { sender: 'system', text: `CASE #${result.case.id.substring(0,6)} ABIERTO.` },
                { sender: 'system', text: `Munición consumida: ${operationCost} CR.` },
                { sender: 'me', text: 'Propuesta enviada al propietario.' }
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
      }, 1500);
  };

  // --- RENDERIZADO ---
  return (
    <div className="flex flex-col h-full w-full bg-[#F2F2F7]/95 backdrop-blur-3xl text-slate-900 shadow-xl font-sans border-l border-white/20 pointer-events-auto">
      
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
                   
                   {/* HUD DE JUEGO */}
                   <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5 bg-slate-200/50 px-2 py-0.5 rounded-md">
                          <span className="text-xs">{agencyLicense.badge}</span>
                          <span className="text-[10px] font-bold uppercase text-slate-600">{agencyLicense.name}</span>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${agencyLicense.credits < 5 ? 'bg-red-50 border-red-100 text-red-600 animate-pulse' : 'bg-white border-slate-200 text-slate-900'}`}>
                          <Zap size={10} className="fill-current"/>
                          <span className="text-[10px] font-black">{agencyLicense.credits} CR</span>
                      </div>
                   </div>

               </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white hover:bg-slate-200 text-slate-500 flex items-center justify-center shadow-sm border border-black/5">
               <X size={20} />
            </button>
         </div>

         {/* BUSCADOR */}
         {!selectedTarget && (
             <div className="flex gap-2 animate-fade-in">
                 <div className="flex-1 bg-white flex items-center px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm focus-within:border-blue-500 transition-all">
                     <Search size={14} className="text-slate-400 mr-2" />
                     <input 
                        type="text" 
                        placeholder="Filtrar objetivos..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-full"
                     />
                 </div>
             </div>
         )}
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
         
         {selectedTarget ? (
            <div className="bg-white rounded-[24px] shadow-sm border border-white/60 overflow-hidden animate-fade-in-up">
                {/* FICHA TÉCNICA */}
                <div className="p-6 pb-0">
                    <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-1 rounded-md uppercase">Oportunidad</span>
                    <h3 className="font-black text-2xl text-slate-900 leading-tight mt-2">{selectedTarget.type}</h3>
                    <div className="text-lg font-bold text-emerald-600 mb-4">{selectedTarget.price}</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl mb-5">
                        <Navigation size={14} className="text-blue-500"/> 
                        <span className="truncate">{selectedTarget.address || "Ubicación Privada"}</span>
                    </div>
                </div>

                {/* ZONA DE OPERACIONES */}
                <div className="px-6 pb-6 bg-slate-50/50 pt-4 border-t border-slate-100">
                    
                    {msgStatus === 'SENT' ? (
                        /* ESTADO: YA ENVIADO */
                        <div className="flex flex-col h-[300px]">
                             <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl mb-3 flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-600"/>
                                <span className="text-[10px] font-bold text-emerald-800">Conexión Establecida</span>
                             </div>
                             {/* CHAT MINI */}
                             <div className="flex-1 overflow-y-auto space-y-2 p-1 mb-2">
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex gap-2 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`p-2 rounded-xl text-[10px] max-w-[85%] ${msg.sender === 'me' ? 'bg-[#1c1c1e] text-white' : 'bg-white border border-slate-200'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef}/>
                             </div>
                             {/* INPUT */}
                             <div className="flex gap-2">
                                <input value={inputMsg} onChange={e=>setInputMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} className="flex-1 bg-white border border-slate-200 rounded-lg px-2 text-xs outline-none" placeholder="Mensaje..."/>
                                <button onClick={sendMessage} className="bg-black text-white p-2 rounded-lg"><Send size={12}/></button>
                             </div>
                        </div>
                    ) : (
                        /* ESTADO: PREPARANDO PROPUESTA */
                        <>
                            <div className="flex justify-between items-end mb-3">
                                <p className="text-[10px] font-black text-slate-900 uppercase">Configurar Ataque</p>
                                <div className="text-right">
                                    <span className="text-[9px] font-bold text-slate-400 block">Coste Operación</span>
                                    <span className={`text-sm font-black ${agencyLicense.credits < operationCost ? 'text-red-500' : 'text-slate-900'}`}>
                                        {operationCost} CR
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                {Object.values(SERVICE_CATALOG).map((service: any) => {
                                    const isSelected = activeServices.includes(service.id);
                                    return (
                                        <div key={service.id} onClick={() => toggleService(service.id)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-100 opacity-80'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                                    {isSelected && <Check size={8} className="text-white" strokeWidth={4}/>}
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-slate-700 block">{service.label}</span>
                                                    <span className="text-[9px] text-slate-400 font-medium">Valorado en {service.priceEUR}€</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Zap size={10} className="text-slate-400"/>
                                                <span className="text-[10px] font-bold text-slate-500">{service.costCredits}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {msgStatus === 'NO_CREDITS' ? (
                                <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center animate-shake">
                                    <p className="text-xs font-black text-red-600 mb-1">¡MUNICIÓN INSUFICIENTE!</p>
                                    <p className="text-[10px] text-red-400 mb-3">Necesitas {operationCost} CR. Tienes {agencyLicense.credits}.</p>
                                    <button className="bg-red-600 text-white w-full py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-red-700">
                                        IR A LA ARMERÍA
                                    </button>
                                </div>
                            ) : (
                                <button onClick={sendProposal} disabled={msgStatus === "SENDING"} className="w-full bg-[#1c1c1e] text-white font-bold text-xs tracking-widest py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-black uppercase transition-all">
                                    {msgStatus === "SENDING" ? <Loader2 size={14} className="animate-spin"/> : `ENVIAR PROPUESTA (-${operationCost} CR)`}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
         ) : (
             /* LISTA DE OBJETIVOS */
             <div className="space-y-3 pb-10">
                <div className="flex justify-between items-end px-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En zona ({filteredTargets.length})</p>
                </div>
                
                {filteredTargets.length === 0 ? (
                    <div className="text-center py-12 opacity-50">
                        <p className="text-xs font-bold text-slate-400">Sin objetivos visibles.</p>
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
                                        <Navigation size={10} /> {t.address || "Dirección Desconocida"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 z-10">
                                    <button className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all shadow-sm border border-slate-100"><Navigation size={14} /></button>
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