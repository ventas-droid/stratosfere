"use client";

import React, { useState } from 'react';
import { X, Star, MapPin, ExternalLink, MessageCircle, Crown, ShieldCheck, Camera, Video, Plane, Scale } from 'lucide-react';

export default function AgencyMarketPanel({ onClose, activeProperty }: any) {
    const [city] = useState(activeProperty?.city || "MANILVA / SOTOGRANDE");

    // Datos simulados (En el futuro vendrán de su base de datos Prisma donde las agencias pagan los 500€)
    const topAgencies = [
        {
            id: '1',
            name: 'Bernabeu Realty',
            subtitle: 'Excellence in Real Estate',
            description: 'Especialistas en propiedades exclusivas en la Costa del Sol. Transformamos tu propiedad en un producto de deseo mediante marketing cinematográfico y gestión legal impecable.',
            logo: 'B',
            cover: 'https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80',
            stats: { sales: 120, days: 45, rating: 4.9 },
            tags: ['VÍDEO CINE 4K', 'VUELO DRONE', 'OPEN HOUSE VIP', 'ASESORÍA JURÍDICA', 'CAMPAÑA SOCIAL ADS'],
            isPartner: true,
            theme: 'dark' // Botón negro
        },
        {
            id: '2',
            name: 'Costa Living',
            subtitle: 'Venta rápida y segura',
            description: 'Agencia local enfocada en el trato cercano y la rapidez. Conocemos a cada vecino de la zona y conectamos compradores y vendedores en tiempo récord.',
            logo: 'C',
            cover: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
            stats: { sales: 85, days: 60, rating: 4.7 },
            tags: ['FOTOGRAFÍA HDR', 'CERTIFICADO ENERGÉTICO', 'POSICIONAMIENTO TOP'],
            isPartner: false,
            theme: 'blue' // Botón azul
        }
    ];

    return (
        <div className="absolute inset-y-0 left-0 w-full md:w-[420px] bg-white shadow-[20px_0_50px_rgba(0,0,0,0.1)] z-[99999] flex flex-col pointer-events-auto animate-slide-in-left border-r border-slate-100">
            
            {/* HEADER */}
            <div className="p-6 pb-4 shrink-0 flex justify-between items-start border-b border-slate-50 bg-white">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">Top Agencies.</h2>
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest w-fit border border-emerald-100">
                        <MapPin size={10} /> ZONA: {city}
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-200 text-slate-500 transition-all shadow-sm flex items-center justify-center cursor-pointer"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="px-6 py-3 shrink-0 bg-white">
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Estas son las agencias certificadas con mayor rendimiento en tu código postal. Contacta directamente para activar sus servicios.
                </p>
            </div>

            {/* LISTA DE AGENCIAS */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar pb-24 bg-slate-50/50">
                {topAgencies.map((agency) => (
                    <div key={agency.id} className="bg-white rounded-[24px] shadow-sm hover:shadow-xl transition-all border border-slate-100 overflow-hidden flex flex-col relative group">
                        
                        {/* COVER & LOGO */}
                        <div className="relative h-32 w-full bg-slate-200 overflow-hidden">
                            <img src={agency.cover} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                            
                            {agency.isPartner && (
                                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-amber-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-amber-400/20 flex items-center gap-1.5 shadow-lg">
                                    <Crown size={12} fill="currentColor" /> PARTNER OFICIAL
                                </div>
                            )}

                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                <div>
                                    <h3 className="text-xl font-black text-white leading-tight drop-shadow-md">{agency.name}</h3>
                                    <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{agency.subtitle}</p>
                                </div>
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl font-black text-slate-900 shadow-lg shrink-0">
                                    {agency.logo}
                                </div>
                            </div>
                        </div>

                        {/* BODY */}
                        <div className="p-5 flex flex-col gap-5">
                            <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">
                                {agency.description}
                            </p>

                            {/* STATS */}
                            <div className="grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100 py-3">
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-lg font-black text-slate-900">{agency.stats.sales}</span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">VENTAS</span>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-lg font-black text-slate-900">{agency.stats.days} días</span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">TIEMPO MEDIO</span>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-lg font-black text-slate-900 flex items-center gap-1">
                                        {agency.stats.rating} <Star size={12} className="text-amber-400" fill="currentColor" />
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">VALORACIÓN</span>
                                </div>
                            </div>

                            {/* STRATEGY TAGS */}
                            <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <ShieldCheck size={12} /> ESTRATEGIA INCLUIDA
                                </span>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {agency.tags.map((tag, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[8px] font-bold uppercase tracking-wider border border-indigo-100">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex items-center gap-2 mt-2">
                                <button className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all shrink-0 active:scale-95">
                                    <ExternalLink size={16} />
                                </button>
                                <button className={`flex-1 h-12 rounded-xl text-white text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${agency.theme === 'dark' ? 'bg-[#1c1c1e] hover:bg-black' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                    <MessageCircle size={16} /> CONTACTAR AGENCIA
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* 🚀 UPSELL BANNER (Visible solo si soy agencia o si hay plazas libres) */}
                <div className="mt-8 p-6 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[24px] relative overflow-hidden shadow-2xl border border-indigo-500/30">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-40"></div>
                    <div className="relative z-10">
                        <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-indigo-500/30 mb-3 inline-block">1 Plaza Disponible</span>
                        <h4 className="text-xl font-black text-white tracking-tight mb-2">Domina {city}</h4>
                        <p className="text-xs text-indigo-200 font-medium mb-5 line-clamp-2">Asegura tu posición en el Top 3 y capta el 80% de los mandatos de la zona. 500€/mes.</p>
                        <button className="w-full py-3 bg-white text-indigo-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-50 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            SOLICITAR PLAZA AHORA
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}