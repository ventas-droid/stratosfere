"use client";
import React from "react";
import { Calendar, Clock, PartyPopper, Users, Check, Music, Coffee, Gift, Sparkles, MapPin } from "lucide-react";

export default function StepOpenHouse({ formData, setFormData }: any) {
  
  // 1. INICIALIZACIÓN SEGURA
  const ohData = formData.openHouse || { enabled: false, amenities: [] };
  const isEnabled = ohData.enabled === true || String(ohData.enabled) === "true";

  // 2. HELPER PARA INPUTS DE FECHA (Convierte ISO a formato input)
  // Los inputs datetime-local necesitan "YYYY-MM-DDTHH:mm"
  const toInputFormat = (dateStr: any) => {
      if (!dateStr) return "";
      try {
          // Si ya viene formateado, lo devolvemos
          if (typeof dateStr === 'string' && dateStr.includes('T') && dateStr.length === 16) return dateStr;
          const d = new Date(dateStr);
          // Ajuste de zona horaria simple para input local
          const offset = d.getTimezoneOffset() * 60000;
          const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
          return localISOTime;
      } catch (e) {
          return "";
      }
  };

  const updateOH = (field: string, val: any) => {
    setFormData((prev: any) => ({
      ...prev,
      openHouse: { 
          ...prev.openHouse, 
          enabled: true, // Si toco algo, asumo que quiero activarlo
          [field]: val 
      }
    }));
  };

  const toggleOpenHouse = () => {
    const newState = !isEnabled;
    setFormData((prev: any) => ({
      ...prev,
      openHouse: { 
          ...prev.openHouse, 
          enabled: newState,
          // Si activamos y no hay fechas, ponemos unas por defecto (mañana a las 10)
          startTime: newState && !prev.openHouse?.startTime ? new Date(Date.now() + 86400000).toISOString() : prev.openHouse?.startTime,
          endTime: newState && !prev.openHouse?.endTime ? new Date(Date.now() + 90000000).toISOString() : prev.openHouse?.endTime
      }
    }));
  };

  const toggleAmenity = (am: string) => {
    const current = ohData.amenities || [];
    const exists = current.includes(am);
    const next = exists ? current.filter((x:string) => x !== am) : [...current, am];
    updateOH("amenities", next);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* 1. TARJETA INTERRUPTOR */}
      <div 
        onClick={toggleOpenHouse}
        className={`cursor-pointer rounded-[24px] p-6 border-2 transition-all duration-300 flex items-center gap-5 group relative overflow-hidden
        ${isEnabled 
            ? 'bg-[#1c1c1e] border-[#1c1c1e] text-white shadow-2xl shadow-black/20 scale-[1.02]' 
            : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'}`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shrink-0
            ${isEnabled ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400'}`}>
            <PartyPopper size={24} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className={`font-black text-lg leading-tight mb-1 ${isEnabled ? 'text-white' : 'text-slate-900'}`}>
                Organizar Open House
            </h3>
            <p className={`text-xs font-medium leading-relaxed ${isEnabled ? 'text-white/60' : 'text-slate-500'}`}>
                Crea un evento exclusivo para captar leads cualificados.
            </p>
        </div>
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
            ${isEnabled ? 'border-emerald-400 bg-emerald-400 text-slate-900 scale-110' : 'border-slate-200'}`}>
            {isEnabled && <Check size={16} strokeWidth={4}/>}
        </div>
      </div>

      {isEnabled && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-500 space-y-6">
            
            {/* TÍTULO DEL EVENTO */}
            <div className="group">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1.5 pl-1">
                    <Sparkles size={12}/> Título del Evento
                </label>
                <input 
                    type="text"
                    placeholder="Ej: Gran Inauguración VIP..."
                    value={ohData.title || ""}
                    onChange={(e) => updateOH("title", e.target.value)}
                    className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all placeholder:text-slate-300"
                />
            </div>

            {/* FECHAS (GRID) */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1.5 pl-1">
                        <Calendar size={12}/> Inicio
                    </label>
                    <div className="relative">
                        <input 
                            type="datetime-local"
                            value={toInputFormat(ohData.startTime)}
                            onChange={(e) => updateOH("startTime", new Date(e.target.value).toISOString())}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1.5 pl-1">
                        <Clock size={12}/> Fin
                    </label>
                    <div className="relative">
                        <input 
                            type="datetime-local"
                            value={toInputFormat(ohData.endTime)}
                            onChange={(e) => updateOH("endTime", new Date(e.target.value).toISOString())}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* AFORO */}
            <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1.5 pl-1">
                    <Users size={12}/> Aforo Máximo
                </label>
                <div className="flex items-center gap-4">
                    <input 
                        type="range"
                        min="5" max="100" step="5"
                        value={ohData.capacity || 50}
                        onChange={(e) => updateOH("capacity", Number(e.target.value))}
                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <div className="w-16 py-2 bg-slate-100 rounded-xl text-center font-black text-slate-900 text-sm border border-slate-200">
                        {ohData.capacity || 50}
                    </div>
                </div>
            </div>

            {/* EXTRAS (AMENITIES) */}
            <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block pl-1">
                    Experiencia & Extras
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: "DJ", label: "DJ Set Live", icon: <Music size={14}/> },
                        { id: "Catering", label: "Catering", icon: <Coffee size={14}/> },
                        { id: "WelcomePack", label: "Welcome Pack", icon: <Gift size={14}/> },
                        { id: "Sorteo", label: "Sorteo", icon: <PartyPopper size={14}/> },
                    ].map((item) => {
                        const active = (ohData.amenities || []).includes(item.id);
                        return (
                            <button
                                key={item.id}
                                onClick={() => toggleAmenity(item.id)}
                                className={`px-4 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all
                                ${active 
                                    ? 'bg-black border-black text-white shadow-lg scale-[1.02]' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                {item.icon}
                                <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
            
            {/* NOTA */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                <MapPin size={16} className="text-blue-600 mt-0.5 shrink-0"/>
                <div>
                    <h4 className="text-xs font-bold text-blue-900 mb-0.5">Ubicación del Evento</h4>
                    <p className="text-[10px] text-blue-700 leading-snug">
                        El evento se creará automáticamente en la ubicación de la propiedad. Los asistentes recibirán un código QR.
                    </p>
                </div>
            </div>

        </div>
      )}
    </div>
  );
}