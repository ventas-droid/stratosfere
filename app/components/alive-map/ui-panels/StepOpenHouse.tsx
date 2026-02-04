"use client";
import React, { useState } from "react";
import { Calendar, Clock, PartyPopper, Users, Check, Music, Coffee, Gift } from "lucide-react";

export default function StepOpenHouse({ formData, setFormData }: any) {
  // Inicializar si no existe
  if (!formData.openHouse) {
    formData.openHouse = { enabled: false, amenities: [] };
  }

  const toggleOpenHouse = () => {
    setFormData((prev: any) => ({
      ...prev,
      openHouse: { ...prev.openHouse, enabled: !prev.openHouse?.enabled }
    }));
  };

  const updateOH = (field: string, val: any) => {
    setFormData((prev: any) => ({
      ...prev,
      openHouse: { ...prev.openHouse, [field]: val }
    }));
  };

  const toggleAmenity = (am: string) => {
    const current = formData.openHouse?.amenities || [];
    const exists = current.includes(am);
    const next = exists ? current.filter((x:string) => x !== am) : [...current, am];
    updateOH("amenities", next);
  };

  const isEnabled = formData.openHouse?.enabled;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* CABECERA ACTIVACIÓN */}
      <div 
        onClick={toggleOpenHouse}
        className={`cursor-pointer rounded-3xl p-6 border transition-all duration-300 flex items-center gap-4 group
        ${isEnabled 
            ? 'bg-slate-900 border-black text-white shadow-xl shadow-slate-900/20' 
            : 'bg-white border-slate-200 hover:border-slate-300'}`}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors
            ${isEnabled ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-400'}`}>
            <PartyPopper size={24} />
        </div>
        <div className="flex-1">
            <h3 className={`font-black text-lg ${isEnabled ? 'text-white' : 'text-slate-900'}`}>
                Organizar Open House
            </h3>
            <p className={`text-xs font-medium ${isEnabled ? 'text-white/60' : 'text-slate-500'}`}>
                Crea un evento exclusivo, gestiona lista de invitados y tickets.
            </p>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
            ${isEnabled ? 'border-emerald-400 bg-emerald-400 text-slate-900' : 'border-slate-300'}`}>
            {isEnabled && <Check size={14} strokeWidth={4}/>}
        </div>
      </div>

      {isEnabled && (
        <div className="animate-in slide-in-from-top-2 duration-300 space-y-6 pl-2">
            
            {/* FECHA Y HORA */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1">
                        <Calendar size={12}/> Inicio del Evento
                    </label>
                    <input 
                        type="datetime-local"
                        value={formData.openHouse?.startTime || ""}
                        onChange={(e) => updateOH("startTime", e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none"
                    />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1">
                        <Clock size={12}/> Fin del Evento
                    </label>
                    <input 
                        type="datetime-local"
                        value={formData.openHouse?.endTime || ""}
                        onChange={(e) => updateOH("endTime", e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none"
                    />
                </div>
            </div>

            {/* AFORO Y TÍTULO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1">
                        <Users size={12}/> Aforo Máximo
                    </label>
                    <input 
                        type="number"
                        placeholder="Ej: 50"
                        value={formData.openHouse?.capacity || ""}
                        onChange={(e) => updateOH("capacity", e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300"
                    />
                </div>
                 <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2">
                        Título del Evento
                    </label>
                    <input 
                        type="text"
                        placeholder="Ej: Gran Inauguración VIP"
                        value={formData.openHouse?.title || ""}
                        onChange={(e) => updateOH("title", e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300"
                    />
                </div>
            </div>

            {/* EXTRAS (AMENITIES) */}
            <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block">
                    Experiencia & Extras
                </label>
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {[
                        { id: "DJ", label: "DJ Set Live", icon: <Music size={14}/> },
                        { id: "Catering", label: "Catering Gourmet", icon: <Coffee size={14}/> },
                        { id: "WelcomePack", label: "Welcome Pack", icon: <Gift size={14}/> },
                        { id: "Sorteo", label: "Sorteo", icon: <PartyPopper size={14}/> },
                    ].map((item) => {
                        const active = (formData.openHouse?.amenities || []).includes(item.id);
                        return (
                            <button
                                key={item.id}
                                onClick={() => toggleAmenity(item.id)}
                                className={`shrink-0 px-4 py-3 rounded-xl border flex items-center gap-2 transition-all
                                ${active 
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                            >
                                {item.icon}
                                <span className="text-xs font-bold">{item.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}