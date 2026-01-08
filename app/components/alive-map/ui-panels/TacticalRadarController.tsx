"use client";
import React, { useState, useEffect } from "react";
import { 
  Zap, CheckCircle2, X, Navigation, ChevronLeft, Search, 
  Check, ShieldCheck, Plus, MessageSquare, Bell, User, Loader2, Send,
  Crown, LayoutGrid // Iconos nuevos para rangos
} from "lucide-react";

// Importamos conexión segura al motor y audio
import { runAgencyOSSmoke } from '../agency-os/agencyos.smoke';
import { playSynthSound } from './audio'; // Aseguramos el sonido

// Configuración Inicial (Por defecto somos novatos)
const DEFAULT_LICENSE = {
    name: "LICENSE: ESSENTIAL",
    badge: "🔹",
    credits: 10,
    perks: ["Radar 2D"]
};

export default function TacticalRadarController({ targets = [], onClose }: any) {
  
  // --- 1. ESTADOS ---
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [activeServices, setActiveServices] = useState<string[]>([]);
  
  // 🔥 ESTADO DE LICENCIA (LA ANTENA)
  const [agencyLicense, setAgencyLicense] = useState<any>(DEFAULT_LICENSE);
  
  // Mensajería y Memoria
  const [msgStatus, setMsgStatus] = useState<"IDLE" | "SENDING" | "SENT">("IDLE");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [processedIds, setProcessedIds] = useState<string[]>([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'RADAR' | 'COMMS'>('RADAR');

  // --- 2. EFECTOS DE CONEXIÓN ---
  
  // A. Memoria Persistente (Leads trabajados)
  useEffect(() => {
    const saved = localStorage.getItem('stratos_processed_leads');
    if (saved) setProcessedIds(JSON.parse(saved));
  }, []);

  // B. 🔥 LA ANTENA RECEPTORA (Escucha al Mercado)
  useEffect(() => {
      const handleLicenseUpgrade = (e: any) => {
          console.log("📡 RADAR: Nueva Licencia Detectada ->", e.detail.name);
          setAgencyLicense(e.detail); // Actualizamos el rango
          
          // Efecto visual/sonoro de "Upgrade"
          try { playSynthSound('upgrade'); } catch(e) {}
      };

      window.addEventListener('agency-upgrade-signal', handleLicenseUpgrade);
      return () => window.removeEventListener('agency-upgrade-signal', handleLicenseUpgrade);
  }, []);

  // --- 3. BÚSQUEDA Y VUELO ---
  const filteredTargets = targets.filter((t: any) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
          (t.address && t.address.toLowerCase().includes(searchLower)) ||
          (t.type && t.type.toLowerCase().includes(searchLower)) ||
          (t.price && t.price.toString().includes(searchLower))
      );
  });

  const performGlobalSearch = async () => {
    if (!searchTerm) {
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('trigger-scan-signal'));
        return;
    }
    setIsSearching(true);
    try {
        // Simulación de búsqueda inteligente
        setTimeout(() => {
             if (typeof window !== "undefined") {
                // Buscamos coordenadas falsas cerca de Madrid para el ejemplo
                window.dispatchEvent(new CustomEvent("fly-to-location", { 
                    detail: { center: [-3.6883, 40.4280], zoom: 14, pitch: 45 } 
                }));
                window.dispatchEvent(new CustomEvent('trigger-scan-signal'));
             }
             setIsSearching(false);
        }, 1500);
    } catch (error) { setIsSearching(false); }
  };

  // --- 4. LÓGICA TÁCTICA ---
  const handleTrabajar = (target: any) => {
    setSelectedTarget(target);
    const isProcessed = processedIds.includes(String(target.id));
    
    if (isProcessed) {
        setMsgStatus("SENT");
        setActiveTab("COMMS");
        setChatHistory([
            { sender: 'system', text: 'Expediente recuperado de AgencyOS.' },
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

  const sendProposal = () => {
    if (!selectedTarget) return;
    setMsgStatus("SENDING");
    
    // Conexión al Motor AgencyOS
    const result = runAgencyOSSmoke({
        scope: { ownerId: 'demo', agencyId: 'corp' },
        target: { propertyId: String(selectedTarget.id), title: selectedTarget.type }
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
                { sender: 'system', text: `CASE #${result.case.id.substring(0,6).toUpperCase()}: Activo.` },
                { sender: 'system', text: `Licencia ${agencyLicense.name} verificada.` },
                { sender: 'me', text: 'Propuesta enviada. Esperando validación.' }
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

  // --- RENDER ---
  return (
    <div className="flex flex-col h-full w-full bg-[#F5F5F7]/95 backdrop-blur-3xl text-slate-900 shadow-2xl font-sans border-l border-white/40 pointer-events-auto">
      
      {/* CABECERA INTELIGENTE (Muestra tu Rango) */}
      <div className="shrink-0 p-6 pb-4 border-b border-black/5 z-20 space-y-4">
         <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
               {selectedTarget && (
                   <button onClick={() => setSelectedTarget(null)} className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 flex items-center justify-center shadow-sm border border-black/5 transition-all">
                       <ChevronLeft size={18} />
                   </button>
               )}
               <div>
                   <h2 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">Radar.</h2>
                   
                   {/* 🔥 AQUÍ ESTÁ LA MAGIA: Muestra la Licencia Activa */}
                   <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-sm">{agencyLicense.badge}</span>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pt-0.5">
                          {agencyLicense.name.replace("LICENSE: ", "")}
                      </p>
                      <span className="bg-slate-200 text-slate-600 px-1.5 rounded text-[9px] font-bold">
                          {agencyLicense.credits} CR
                      </span>
                   </div>

               </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-slate-500 flex items-center justify-center transition-all">
               <X size={16} />
            </button>
         </div>

         {!selectedTarget && (
             <div className="flex gap-2 animate-fade-in">
                 <div className="flex-1 bg-white flex items-center px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                     <Search size={14} className="text-slate-400 mr-2" />
                     <input 
                        type="text" 
                        placeholder="Escanear sector..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && performGlobalSearch()}
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-full placeholder-slate-300"
                     />
                 </div>
                 <button onClick={performGlobalSearch} className="px-4 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-colors shadow-lg">
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
                    <div className="flex justify-between items-start">
                        <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Oportunidad</span>
                        <div className="text-right">
                            <div className="text-lg font-black text-slate-900">{selectedTarget.price}</div>
                        </div>
                    </div>
                    <h3 className="font-black text-2xl text-slate-900 leading-tight mt-2 mb-1">{selectedTarget.type}</h3>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-400 mb-5">
                        <Navigation size={12}/> 
                        <span className="truncate uppercase">{selectedTarget.address || "Ubicación Privada"}</span>
                    </div>
                    <div className="h-px w-full bg-slate-100 mb-4"></div>
                </div>

                {/* TABS */}
                <div className="px-6 pb-6">
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                        <button onClick={() => setActiveTab('RADAR')} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'RADAR' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Táctica</button>
                        <button onClick={() => setActiveTab('COMMS')} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'COMMS' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Comms</button>
                    </div>

                    {/* PANEL SERVICIOS */}
                    {activeTab === 'RADAR' && (
                        <div className="animate-fade-in">
                            {msgStatus === 'SENT' ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-emerald-50">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="font-bold text-slate-900">Propuesta Activa</h3>
                                    <p className="text-xs text-slate-500 mt-2 mb-6 max-w-[200px] mx-auto">El propietario ha recibido su oferta. Acceda al canal seguro.</p>
                                    <button onClick={() => setActiveTab('COMMS')} className="px-6 py-3 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg">Abrir Canal</button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400"><ShieldCheck size={16}/></div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-900 uppercase">Pack Básico</p>
                                                    <p className="text-[9px] text-slate-400">Verificación incluida</p>
                                                </div>
                                            </div>
                                            <Check size={14} className="text-emerald-500"/>
                                        </div>
                                    </div>

                                    <button onClick={sendProposal} disabled={msgStatus === "SENDING"} className="w-full bg-blue-600 text-white font-bold text-xs tracking-widest py-4 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all uppercase">
                                        {msgStatus === "SENDING" ? (
                                            <>
                                                <Loader2 size={14} className="animate-spin"/> Generando...
                                            </>
                                        ) : (
                                            <>Enviar Propuesta <Send size={14}/></>
                                        )}
                                    </button>
                                    <p className="text-center text-[9px] text-slate-400 mt-3 font-medium">
                                        Coste: 1 Crédito de {agencyLicense.credits} disponibles
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {/* PANEL CHAT */}
                    {activeTab === 'COMMS' && (
                        <div className="animate-fade-in flex flex-col h-[300px]">
                            <div className="flex-1 overflow-y-auto space-y-3 p-1 custom-scrollbar">
                                {chatHistory.length === 0 && (
                                    <div className="text-center py-10 opacity-50">
                                        <MessageSquare size={24} className="mx-auto mb-2"/>
                                        <p className="text-[10px]">Canal seguro encriptado.</p>
                                    </div>
                                )}
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex gap-2 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'me' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>
                                            {msg.sender === 'me' ? <User size={10}/> : (msg.sender === 'system' ? <ShieldCheck size={10}/> : <User size={10}/>)}
                                        </div>
                                        <div className={`p-2.5 rounded-2xl text-[10px] max-w-[85%] font-medium leading-relaxed ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-600 rounded-tl-sm shadow-sm'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-2 bg-white border border-slate-200 rounded-xl p-1.5 flex items-center gap-2 pr-2 shadow-sm focus-within:border-blue-500 transition-colors">
                                <input 
                                    value={inputMsg}
                                    onChange={e => setInputMsg(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                    type="text" 
                                    placeholder="Escribir mensaje..."
                                    className="flex-1 bg-transparent text-xs px-3 py-2 outline-none font-medium text-slate-700 placeholder-slate-300"
                                />
                                <button onClick={sendMessage} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-black transition-colors">
                                    <Send size={12}/>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
         ) : (
             /* LISTA DE RESULTADOS */
             <div className="space-y-3 pb-20">
                <div className="flex justify-between items-end px-1 mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objetivos ({filteredTargets.length})</p>
                    {isSearching && <p className="text-[9px] font-bold text-blue-500 uppercase animate-pulse">Escaneando...</p>}
                </div>
                
                {filteredTargets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                        <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                            <Search size={24} className="opacity-50"/>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider text-center max-w-[200px]">Sin señal en el sector</p>
                        <button onClick={() => setSearchTerm("")} className="mt-4 text-[10px] text-blue-500 font-bold hover:underline">Reiniciar Radar</button>
                    </div>
                ) : (
                    filteredTargets.map((t: any) => {
                        const isProcessed = processedIds.includes(String(t.id));
                        return (
                            <div key={t.id} onClick={() => handleTrabajar(t)} className={`group relative p-4 rounded-[24px] cursor-pointer transition-all duration-300 border hover:shadow-lg hover:-translate-y-1 ${isProcessed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-black text-slate-900 text-sm">{t.type}</span>
                                    {isProcessed ? (
                                        <span className="bg-emerald-100 text-emerald-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1"><CheckCircle2 size={8}/> Contactado</span>
                                    ) : (
                                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{t.price}</span>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold truncate flex items-center gap-1.5 uppercase mb-3">
                                    <Navigation size={10} /> {t.address || "Zona Desconocida"}
                                </p>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                                    <span className="text-[9px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">VER FICHA</span>
                                    <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <ChevronLeft size={12} className="rotate-180"/>
                                    </div>
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

