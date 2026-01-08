"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  X, Navigation, ChevronLeft, Search, Check, ShieldCheck, 
  MessageSquare, User, Loader2, Send, CheckCircle2, FileText, MapPin
} from "lucide-react";

// Eliminamos dependencias de "juego" o "demos". 
// Usamos lógica directa de negocio.

export default function TacticalRadarController({ targets = [], onClose }: any) {
  
  // --- 1. ESTADOS ---
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [msgStatus, setMsgStatus] = useState<"IDLE" | "SENDING" | "SENT">("IDLE");
  
  // Chat Real
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Memoria Local (Simulando Base de Datos del Navegador)
  const [processedIds, setProcessedIds] = useState<string[]>([]); 

  // Búsqueda y Navegación
  const [searchTerm, setSearchTerm] = useState("");
  const [isFlying, setIsFlying] = useState(false); // Estado de vuelo del mapa
  const [activeTab, setActiveTab] = useState<'RADAR' | 'COMMS'>('RADAR');

  // --- 2. MEMORIA (Persistencia Real Local) ---
  useEffect(() => {
    const saved = localStorage.getItem('stratos_processed_leads');
    if (saved) {
        setProcessedIds(JSON.parse(saved));
    }
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory, activeTab]);

  // --- 3. MOTOR DE BÚSQUEDA (SIN FILTRAR LA LISTA - SOLO VUELO) ---
  const performGlobalSearch = async () => {
    if (!searchTerm) return;
    
    setIsFlying(true); // Activamos indicador de vuelo
    
    // 1. No filtramos la lista local. Dejamos que el usuario vea lo que hay o lo que vendrá.
    // 2. Buscamos coordenadas y movemos el mapa.
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            const location = data[0];
            const lat = parseFloat(location.lat);
            const lon = parseFloat(location.lon);
            
            if (typeof window !== "undefined") {
                // Evento de vuelo real
                window.dispatchEvent(new CustomEvent("fly-to-location", { 
                    detail: { center: [lon, lat], zoom: 14, pitch: 45 } 
                }));
                
                // Disparamos señal de escaneo para cargar propiedades REALES de esa zona
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('trigger-scan-signal'));
                    setIsFlying(false);
                }, 2000);
            }
        } else {
            setIsFlying(false);
        }
    } catch (error) {
        console.error("Error navegación:", error);
        setIsFlying(false);
    }
  };

  // --- 4. LÓGICA DE NEGOCIO (LEER NANOCARD) ---
  const handleTrabajar = (target: any) => {
    setSelectedTarget(target);
    const isProcessed = processedIds.includes(String(target.id));
    
    // Si ya existe historial, lo cargamos (Lógica real, no demo)
    if (isProcessed) {
        setMsgStatus("SENT");
        setActiveTab("COMMS");
        // Aquí conectaría con su base de datos real para traer el chat
        const savedChat = localStorage.getItem(`chat_${target.id}`);
        setChatHistory(savedChat ? JSON.parse(savedChat) : []);
    } else {
        setMsgStatus("IDLE");    
        setActiveTab("RADAR");
        setChatHistory([]);
    }
  };

  const handleVolarAPropiedad = (e: any, target: any) => {
    e.stopPropagation(); 
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("fly-to-location", { 
        detail: { center: [target.lng || target.longitude, target.lat || target.latitude], zoom: 18, pitch: 60 } 
      }));
    }
  };

  // --- 5. ACEPTAR ENCARGO (REAL) ---
  const aceptarEncargo = () => {
    if (!selectedTarget) return;
    setMsgStatus("SENDING");
    
    // Simulamos la latencia de red de una petición real
    setTimeout(() => {
        setMsgStatus("SENT");
        
        // 1. Guardar en "Mis Expedientes"
        const newProcessed = [...processedIds, String(selectedTarget.id)];
        setProcessedIds(newProcessed);
        localStorage.setItem('stratos_processed_leads', JSON.stringify(newProcessed));

        // 2. Iniciar Chat Real
        setActiveTab('COMMS');
        const initialChat = [
            { sender: 'me', text: `Hola, he revisado su propiedad en ${selectedTarget.address}. Acepto las condiciones de la campaña.` }
        ];
        setChatHistory(initialChat);
        localStorage.setItem(`chat_${selectedTarget.id}`, JSON.stringify(initialChat));

    }, 800);
  };

  const enviarMensaje = () => {
      if(!inputMsg.trim()) return;
      
      const newMsg = { sender: 'me', text: inputMsg };
      const updatedChat = [...chatHistory, newMsg];
      
      setChatHistory(updatedChat);
      setInputMsg("");
      
      // Guardado persistente real
      if (selectedTarget) {
          localStorage.setItem(`chat_${selectedTarget.id}`, JSON.stringify(updatedChat));
      }
  };

  // --- RENDERIZADO ---
  return (
    <div className="flex flex-col h-full w-full bg-[#F5F5F7]/95 backdrop-blur-3xl text-slate-900 shadow-2xl font-sans border-l border-white/40 pointer-events-auto">
      
      {/* 1. CABECERA DE CONTROL DE MISIÓN (SIEMPRE VISIBLE) */}
      <div className="shrink-0 p-6 pb-4 border-b border-black/5 z-20 bg-white/40 backdrop-blur-md">
         <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
               {selectedTarget && (
                   <button onClick={() => setSelectedTarget(null)} className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center shadow-sm border border-black/5 transition-all">
                       <ChevronLeft size={18} className="text-slate-600"/>
                   </button>
               )}
               <div>
                   <h2 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                       {selectedTarget ? "Expediente" : "Radar de Zona"}
                   </h2>
                   {!selectedTarget && (
                       <p className="text-[10px] font-medium text-slate-500 mt-1 flex items-center gap-1">
                           {isFlying ? <Loader2 size={10} className="animate-spin"/> : <MapPin size={10}/>}
                           {isFlying ? "Reposicionando satélite..." : "Escaneo activo"}
                       </p>
                   )}
               </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all">
               <X size={16} />
            </button>
         </div>

         {/* BARRA DE NAVEGACIÓN (VUELO) - NO FILTRA, SOLO MUEVE */}
         {!selectedTarget && (
             <div className="flex gap-2">
                 <div className="flex-1 bg-white flex items-center px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm focus-within:border-blue-500 transition-all">
                     <Search size={14} className="text-slate-400 mr-2" />
                     <input 
                        type="text" 
                        placeholder="Ir a zona (ej: Manilva)..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && performGlobalSearch()}
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-full placeholder-slate-400"
                     />
                 </div>
                 <button 
                    onClick={performGlobalSearch} 
                    className="px-4 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-colors shadow-md"
                    disabled={isFlying}
                 >
                     {isFlying ? <Loader2 size={14} className="animate-spin"/> : <Navigation size={14} />}
                 </button>
             </div>
         )}
      </div>

      {/* 2. CUERPO PRINCIPAL */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-0">
         
         {selectedTarget ? (
            /* --- VISTA DE EXPEDIENTE (NANOCARD REAL) --- */
            <div className="p-6 space-y-6 animate-fade-in-up">
                
                {/* FICHA TÉCNICA */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                        <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">Campaña Activa</span>
                        <span className="text-lg font-black text-slate-900">{selectedTarget.price || "Consultar"}</span>
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 leading-tight mb-1">{selectedTarget.type || "Propiedad Residencial"}</h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Navigation size={10}/> {selectedTarget.address || "Ubicación por confirmar"}
                    </p>
                </div>

                {/* TABS DE GESTIÓN */}
                <div className="bg-slate-100 p-1 rounded-xl flex text-center">
                    <button onClick={() => setActiveTab('RADAR')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'RADAR' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Campaña</button>
                    <button onClick={() => setActiveTab('COMMS')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'COMMS' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Chat Directo</button>
                </div>

                {activeTab === 'RADAR' && (
                    <div className="animate-fade-in">
                        {msgStatus === 'SENT' ? (
                            <div className="text-center py-6 bg-white rounded-3xl border border-slate-100 border-dashed">
                                <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2"/>
                                <p className="text-sm font-bold text-slate-900">Encargo Aceptado</p>
                                <p className="text-[10px] text-slate-400 mt-1">El propietario ha recibido su confirmación.</p>
                                <button onClick={() => setActiveTab('COMMS')} className="mt-4 text-[10px] text-blue-600 font-bold hover:underline">Ir a mensajería</button>
                            </div>
                        ) : (
                            <>
                                {/* LECTURA DE LA NANOCARD (REQUISITOS REALES) */}
                                <div className="mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Requisitos del Cliente</p>
                                    
                                    <div className="bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
                                        {/* Aquí leemos lo que trae el TARGET (target.services o target.requirements) */}
                                        {/* Si no trae nada, mostramos mensaje de "Sin requisitos especiales" */}
                                        {selectedTarget.requirements && selectedTarget.requirements.length > 0 ? (
                                            selectedTarget.requirements.map((req: string, i: number) => (
                                                <div key={i} className="flex items-center gap-3 p-3 border-b border-slate-50 last:border-0">
                                                    <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                                        <Check size={12} strokeWidth={3}/>
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700">{req}</span>
                                                </div>
                                            ))
                                        ) : (
                                            /* Si la NanoCard viene vacía de requisitos, mostramos los estándar */
                                            <div className="p-4 text-center">
                                                <p className="text-xs text-slate-500 font-medium mb-2">Este cliente solicita gestión estándar:</p>
                                                <div className="flex flex-wrap gap-2 justify-center">
                                                    <span className="bg-slate-50 px-2 py-1 rounded-md text-[10px] font-bold text-slate-600 border border-slate-200">Nota Simple</span>
                                                    <span className="bg-slate-50 px-2 py-1 rounded-md text-[10px] font-bold text-slate-600 border border-slate-200">Reportaje Foto</span>
                                                    <span className="bg-slate-50 px-2 py-1 rounded-md text-[10px] font-bold text-slate-600 border border-slate-200">Cert. Energético</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button onClick={aceptarEncargo} disabled={msgStatus === "SENDING"} className="w-full bg-slate-900 text-white font-bold text-xs py-4 rounded-2xl shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2">
                                    {msgStatus === "SENDING" ? <Loader2 size={14} className="animate-spin"/> : "ACEPTAR CAMPAÑA"}
                                </button>
                                <p className="text-[9px] text-center text-slate-400 mt-3">Al aceptar, se abrirá un canal directo con el propietario.</p>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'COMMS' && (
                    <div className="flex flex-col h-[350px] bg-white rounded-3xl border border-slate-100 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                            {chatHistory.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full opacity-40">
                                    <MessageSquare size={24} className="mb-2 text-slate-400"/>
                                    <p className="text-[10px] font-medium">Historial vacío</p>
                                </div>
                            )}
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex gap-2 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`p-3 rounded-2xl text-[11px] max-w-[85%] font-medium leading-relaxed ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                            <input 
                                value={inputMsg}
                                onChange={e => setInputMsg(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && enviarMensaje()}
                                type="text" 
                                placeholder="Escribir al propietario..."
                                className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-xs outline-none text-slate-800 font-medium"
                            />
                            <button onClick={enviarMensaje} className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-black"><Send size={14}/></button>
                        </div>
                    </div>
                )}
            </div>
         ) : (
            /* --- VISTA LISTA (RESULTADOS DEL ESCANEO) --- */
            <div className="pb-10">
                <div className="px-6 py-3 bg-slate-50/80 sticky top-0 backdrop-blur-sm z-10 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Resultados ({targets.length})
                    </span>
                    {isFlying && <Loader2 size={12} className="animate-spin text-slate-400"/>}
                </div>

                <div className="px-4 py-2 space-y-2">
                    {targets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 opacity-50">
                             <Search size={32} className="mb-3 text-slate-300"/>
                             <p className="text-xs font-bold text-slate-400">Sin señales en este sector.</p>
                             <p className="text-[10px] text-slate-400 mt-1 max-w-[150px] text-center">Use el buscador superior para mover el satélite.</p>
                        </div>
                    ) : (
                        targets.map((t: any) => {
                            const isProcessed = processedIds.includes(String(t.id));
                            return (
                                <div 
                                    key={t.id} 
                                    onClick={() => handleTrabajar(t)} 
                                    className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border border-transparent
                                        ${isProcessed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white hover:border-slate-200 hover:shadow-md'}
                                    `}
                                >
                                    <div className="flex-1 min-w-0 pr-3">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="font-bold text-slate-900 text-xs truncate">{t.type || "Propiedad"}</span>
                                            {isProcessed && <CheckCircle2 size={12} className="text-emerald-500"/>}
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1">
                                            <MapPin size={10} className="shrink-0"/> {t.address || "Ubicación desconocida"}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="block font-black text-slate-900 text-xs">{t.price || "---"}</span>
                                        <div className="flex justify-end mt-1">
                                            <button 
                                                onClick={(e) => handleVolarAPropiedad(e, t)}
                                                className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all"
                                            >
                                                <Navigation size={10}/>
                                            </button>
                                        </div>
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

