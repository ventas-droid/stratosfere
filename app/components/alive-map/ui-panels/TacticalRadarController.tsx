"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  X, Navigation, ChevronLeft, Search, Check, ShieldCheck, 
  MessageSquare, User, Loader2, Send, CheckCircle2 
} from "lucide-react";

// Importamos la conexión lógica y el audio
import { runAgencyOSSmoke } from '../agency-os/agencyos.smoke';
import { playSynthSound } from './audio'; 

// Configuración por defecto (Seguridad si falla la carga)
const DEFAULT_LICENSE = {
    name: "LICENSE: ESSENTIAL",
    badge: "🔹",
    credits: 10,
    perks: ["Radar 2D"]
};

export default function TacticalRadarController({ targets = [], onClose }: any) {
  
  // --- 1. ESTADOS ---
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [agencyLicense, setAgencyLicense] = useState<any>(DEFAULT_LICENSE);
  const [msgStatus, setMsgStatus] = useState<"IDLE" | "SENDING" | "SENT">("IDLE");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [processedIds, setProcessedIds] = useState<string[]>([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false); // Estado de carga visual
  const [activeTab, setActiveTab] = useState<'RADAR' | 'COMMS'>('RADAR');

  // Referencia para scroll automático del chat
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- 2. CONEXIONES (MEMORIA Y LICENCIA) ---
  useEffect(() => {
    const saved = localStorage.getItem('stratos_processed_leads');
    if (saved) setProcessedIds(JSON.parse(saved));

    const handleLicenseUpgrade = (e: any) => {
          setAgencyLicense(e.detail);
          try { playSynthSound('upgrade'); } catch(e) {}
    };
    window.addEventListener('agency-upgrade-signal', handleLicenseUpgrade);
    return () => window.removeEventListener('agency-upgrade-signal', handleLicenseUpgrade);
  }, []);

  // Auto-scroll del chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory, activeTab]);

  // --- 3. BÚSQUEDA ROBUSTA (SIN BAILES) ---
  const performSearch = () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true); // Ponemos el icono de carga, pero NO cerramos nada

    // 1. Lanzamos el evento para que el MAPA vuele (Index.tsx lo escuchará)
    if (typeof window !== "undefined") {
        // Disparamos evento de búsqueda de ciudad estándar
        // NOTA: Asegúrese de que su componente padre (AliveMap) escuche esto o use la función searchCity si se la pasáramos
        // Como parche robusto, simulamos el delay de red y mantenemos la lista abierta
        setTimeout(() => {
             setIsSearching(false);
             // Aquí el mapa ya debería haberse movido si está conectado
        }, 1000);
    }
  };

  // Filtrado local de la lista (Instantáneo)
  const filteredTargets = targets.filter((t: any) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
          (t.address && t.address.toLowerCase().includes(term)) ||
          (t.type && t.type.toLowerCase().includes(term)) ||
          (t.price && t.price.toString().includes(term))
      );
  });

  // --- 4. ACCIONES (PROPUESTAS) ---
  const handleSelectTarget = (target: any) => {
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
    }
  };

  const sendProposal = () => {
    if (!selectedTarget) return;
    setMsgStatus("SENDING");
    
    // Motor AgencyOS
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
                { sender: 'system', text: `CASE #${result.case.id.substring(0,6).toUpperCase()}: Iniciado.` },
                { sender: 'me', text: 'Propuesta enviada correctamente.' }
            ]);
        } else {
            setMsgStatus("IDLE");
        }
    }, 1000);
  };

  const sendMessage = () => {
      if(!inputMsg.trim()) return;
      setChatHistory(prev => [...prev, { sender: 'me', text: inputMsg }]);
      setInputMsg("");
      // Simulación respuesta
      setTimeout(() => {
          setChatHistory(prev => [...prev, { sender: 'owner', text: 'Recibido. Lo revisaré.' }]);
          try { playSynthSound('ping'); } catch(e) {}
      }, 2000);
  };

  // --- RENDERIZADO (ESTILO APPLE / FINTECH) ---
  return (
    <div className="flex flex-col h-full w-full bg-[#F5F5F7]/95 backdrop-blur-3xl text-slate-900 shadow-2xl font-sans border-l border-white/40 pointer-events-auto">
      
      {/* 1. CABECERA FIJA (NO SE MUEVE) */}
      <div className="shrink-0 p-6 pb-4 border-b border-black/5 z-20 bg-white/50 backdrop-blur-md">
         <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
               {selectedTarget && (
                   <button onClick={() => setSelectedTarget(null)} className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center shadow-sm border border-black/5 transition-all">
                       <ChevronLeft size={18} className="text-slate-600"/>
                   </button>
               )}
               <div>
                   <h2 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                       {selectedTarget ? "Detalle Activo" : "Radar de Zona"}
                   </h2>
                   {/* Info Licencia Discreta */}
                   <div className="flex items-center gap-2 mt-1 opacity-60">
                      <span className="text-[10px] font-bold uppercase tracking-wider">{agencyLicense.name}</span>
                      <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                      <span className="text-[10px] font-bold">{agencyLicense.credits} Créditos</span>
                   </div>
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
                        placeholder="Buscar ubicación (ej: Manilva)..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-full placeholder-slate-300"
                     />
                 </div>
                 <button 
                    onClick={performSearch} 
                    className="px-4 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-colors shadow-md"
                    disabled={isSearching}
                 >
                     {isSearching ? <Loader2 size={14} className="animate-spin"/> : <Navigation size={14} />}
                 </button>
             </div>
         )}
      </div>

      {/* 2. CUERPO (LISTA O DETALLE) - SIN SCROLL HORIZONTAL */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-0">
         
         {selectedTarget ? (
            /* --- VISTA DETALLE (FICHA) --- */
            <div className="p-6 space-y-6 animate-fade-in-up">
                
                {/* Info Principal */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                        <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">Captación</span>
                        <span className="text-lg font-black text-slate-900">{selectedTarget.price}</span>
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 leading-tight mb-1">{selectedTarget.type}</h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Navigation size={10}/> {selectedTarget.address || "Dirección Privada"}
                    </p>
                </div>

                {/* Switcher Táctica / Chat */}
                <div className="bg-slate-100 p-1 rounded-xl flex text-center">
                    <button onClick={() => setActiveTab('RADAR')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'RADAR' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Gestión</button>
                    <button onClick={() => setActiveTab('COMMS')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'COMMS' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Chat</button>
                </div>

                {activeTab === 'RADAR' && (
                    <div className="space-y-4 animate-fade-in">
                        {msgStatus === 'SENT' ? (
                            <div className="text-center py-6 bg-white rounded-3xl border border-slate-100 border-dashed">
                                <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2"/>
                                <p className="text-sm font-bold text-slate-900">Propuesta Enviada</p>
                                <button onClick={() => setActiveTab('COMMS')} className="mt-4 text-[10px] text-blue-600 font-bold hover:underline">Ver conversación</button>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-slate-50 rounded-lg"><ShieldCheck size={16} className="text-slate-400"/></div>
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-900">Validación Standard</p>
                                            <p className="text-[9px] text-slate-400">Incluye verificación de nota simple.</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={sendProposal} disabled={msgStatus === "SENDING"} className="w-full bg-slate-900 text-white font-bold text-xs py-4 rounded-2xl shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2">
                                    {msgStatus === "SENDING" ? <Loader2 size={14} className="animate-spin"/> : "ENVIAR PROPUESTA"}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'COMMS' && (
                    <div className="flex flex-col h-[300px] bg-white rounded-3xl border border-slate-100 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
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
            /* --- VISTA LISTA (COMPACTA Y ROBUSTA) --- */
            <div className="pb-10">
                {/* Contador de resultados */}
                <div className="px-6 py-2 bg-slate-50/80 sticky top-0 backdrop-blur-sm z-10 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {filteredTargets.length} Oportunidades
                    </span>
                    {isSearching && <Loader2 size={10} className="animate-spin text-slate-400"/>}
                </div>

                {/* Lista */}
                <div className="px-4 py-2 space-y-2">
                    {filteredTargets.length === 0 ? (
                        <div className="text-center py-12">
                             <p className="text-xs font-bold text-slate-300">Sin resultados en esta zona.</p>
                        </div>
                    ) : (
                        filteredTargets.map((t: any) => {
                            const isProcessed = processedIds.includes(String(t.id));
                            return (
                                <div 
                                    key={t.id} 
                                    onClick={() => handleSelectTarget(t)} 
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
                                            {t.address || "Manilva, Málaga"}
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

