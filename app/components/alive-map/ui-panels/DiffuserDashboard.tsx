"use client";

import React, { useState } from 'react';
import { 
  TrendingUp, Zap, ArrowRight, Youtube, Lock, Plus, 
  CheckCircle2, Play, BarChart3, Globe, X, Wallet, ArrowUpRight
} from 'lucide-react';

const OPPORTUNITIES = [
  { id: 101, title: "Villa Minimalista", location: "La Finca, Madrid", price: "4.5M€", commission: "15.000€", platform: "Instagram", match: 98, img: "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80" },
  { id: 102, title: "Penthouse Diagonal", location: "Barcelona", price: "2.1M€", commission: "8.500€", platform: "Youtube", match: 85, img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80" },
  { id: 103, title: "Cortijo Luxury", location: "Sevilla", price: "1.2M€", commission: "4.000€", platform: "TikTok", match: 72, img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
];

export default function DiffuserDashboard({ onClose }: any) {
  const [activeSlots, setActiveSlots] = useState<any[]>([
      { id: 99, title: "Loft Industrial", status: "ACTIVE", earnings: "3.200€", type: "Youtube", progress: 65 }
  ]); 

  const handleAccept = (opp: any) => {
      if (activeSlots.length >= 3) return;
      setActiveSlots([...activeSlots, { ...opp, status: "PENDING", earnings: opp.commission, type: "Multi", progress: 0 }]);
  };

  return (
    <div className="fixed inset-0 z-[60000] flex items-center justify-center font-sans text-slate-900 animate-fade-in">
      
      {/* 1. FONDO CON TEXTURA Y BLUR (Estilo iOS/VisionOS) */}
      <div className="absolute inset-0 bg-[#F2F2F7]">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-400/20 blur-[150px] rounded-full mix-blend-multiply animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-orange-400/20 blur-[150px] rounded-full mix-blend-multiply animate-pulse delay-1000"></div>
          {/* Malla de ruido sutil para textura premium */}
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
      </div>

      {/* 2. CONTENEDOR PRINCIPAL FLOTANTE */}
      <div className="relative z-10 w-[95%] max-w-[1400px] h-[90vh] bg-white/60 backdrop-blur-3xl rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-white/50 flex overflow-hidden ring-1 ring-white/80">
          
          {/* BARRA LATERAL (MENU) */}
          <div className="w-24 border-r border-white/20 flex flex-col items-center py-8 gap-8 shrink-0 bg-white/20">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap size={24} fill="currentColor" />
              </div>
              <div className="flex-1 flex flex-col gap-6">
                  <button className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-900 hover:scale-110 transition-transform"><BarChart3 size={24}/></button>
                  <button className="w-12 h-12 rounded-2xl bg-transparent flex items-center justify-center text-slate-400 hover:bg-white/50 hover:text-slate-900 transition-all"><Globe size={24}/></button>
                  <button className="w-12 h-12 rounded-2xl bg-transparent flex items-center justify-center text-slate-400 hover:bg-white/50 hover:text-slate-900 transition-all"><Wallet size={24}/></button>
              </div>
              <button onClick={onClose} className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all">
                  <X size={20}/>
              </button>
          </div>

          {/* CONTENIDO INTERNO */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* ZONA IZQUIERDA: DASHBOARD */}
              <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                  
                  {/* HERO HEADER */}
                  <div className="mb-10">
                      <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">Hola, Partner.</h1>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-400/20 text-green-700 rounded-full text-xs font-bold border border-green-500/20">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Sistema Online
                        </span>
                        <p className="text-slate-500 font-medium">Tienes <strong className="text-slate-900">3 oportunidades</strong> que encajan con tu audiencia.</p>
                      </div>
                  </div>

                  {/* CARDS GRID */}
                  <div className="grid grid-cols-1 gap-6">
                      {OPPORTUNITIES.map((opp) => (
                          <div key={opp.id} className="group relative bg-white/80 rounded-[32px] p-2 pr-6 hover:bg-white transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl border border-white flex items-center gap-6 cursor-pointer">
                              {/* Imagen con efecto hover */}
                              <div className="w-48 h-36 rounded-[24px] overflow-hidden relative shadow-sm">
                                  <img src={opp.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                              </div>
                              
                              {/* Info */}
                              <div className="flex-1 py-2">
                                  <div className="flex items-start justify-between mb-2">
                                      <div>
                                          <h3 className="text-xl font-bold text-slate-900">{opp.title}</h3>
                                          <p className="text-sm text-slate-500 font-medium">{opp.location}</p>
                                      </div>
                                      <div className="text-right">
                                          <div className="text-2xl font-black text-slate-900">{opp.commission}</div>
                                          <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-lg inline-block">Comisión Estimada</div>
                                      </div>
                                  </div>
                                  
                                  {/* Stats Badges */}
                                  <div className="flex gap-3 mt-4">
                                      <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2">
                                          <div className="p-1 bg-white rounded-md shadow-sm"><Youtube size={14} className="text-red-500"/></div>
                                          <span className="text-xs font-bold text-slate-600">{opp.platform}</span>
                                      </div>
                                      <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2">
                                          <div className="p-1 bg-white rounded-md shadow-sm"><TrendingUp size={14} className="text-blue-500"/></div>
                                          <span className="text-xs font-bold text-slate-600">{opp.match}% Compatibilidad</span>
                                      </div>
                                  </div>
                              </div>

                              {/* Action Button */}
                              <button onClick={() => handleAccept(opp)} className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 hover:rotate-90 transition-all shadow-xl group-active:scale-95">
                                  <Plus size={28}/>
                              </button>
                          </div>
                      ))}
                  </div>
              </div>

              {/* ZONA DERECHA: WALLET & SLOTS (BENTO GRID) */}
              <div className="w-[420px] bg-white/50 border-l border-white/40 p-10 flex flex-col gap-8 shrink-0 relative overflow-hidden">
                  
                  {/* WALLET CARD - ESTILO TARJETA DE CRÉDITO */}
                  <div className="w-full aspect-[1.6] rounded-[32px] bg-slate-900 p-8 text-white relative overflow-hidden shadow-2xl group cursor-pointer hover:scale-[1.02] transition-transform">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity translate-x-1/2 -translate-y-1/2"></div>
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity -translate-x-1/2 translate-y-1/2"></div>
                      
                      <div className="relative z-10 flex flex-col justify-between h-full">
                          <div className="flex justify-between items-start">
                              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest">Saldo Disponible</span>
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Zap size={16} fill="white"/></div>
                          </div>
                          <div>
                              <div className="text-5xl font-black tracking-tighter mb-2">3.200€</div>
                              <div className="flex items-center gap-2 text-white/50 text-xs font-medium">
                                  <span>**** 8842</span>
                                  <span className="w-1 h-1 rounded-full bg-white/50"></span>
                                  <span>Stratos Wallet</span>
                              </div>
                          </div>
                          <div className="flex gap-2">
                              <button className="flex-1 py-3 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors">Retirar</button>
                              <button className="flex-1 py-3 bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors">Historial</button>
                          </div>
                      </div>
                  </div>

                  {/* ACTIVE SLOTS */}
                  <div className="flex-1">
                      <div className="flex justify-between items-end mb-6">
                          <h3 className="text-xl font-black text-slate-900">Slots Activos</h3>
                          <span className="text-xs font-bold text-slate-400">{activeSlots.length}/3 Ocupados</span>
                      </div>
                      
                      <div className="space-y-4">
                          {activeSlots.map((slot, i) => (
                              <div key={i} className="p-5 rounded-[24px] bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group">
                                  <div className="absolute top-0 left-0 h-1 bg-green-500 transition-all duration-1000" style={{width: `${slot.progress}%`}}></div>
                                  <div className="flex justify-between items-start mb-3">
                                      <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                                              <Youtube size={16}/>
                                          </div>
                                          <div>
                                              <h4 className="font-bold text-sm text-slate-900 leading-none">{slot.title}</h4>
                                              <span className="text-[10px] font-bold text-gray-400 uppercase">En progreso</span>
                                          </div>
                                      </div>
                                      <ArrowUpRight size={18} className="text-slate-300 group-hover:text-slate-900 transition-colors"/>
                                  </div>
                                  <div className="flex justify-between items-end">
                                      <div className="text-2xl font-black text-slate-900">{slot.earnings}</div>
                                      <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">+12% hoy</div>
                                  </div>
                              </div>
                          ))}

                          {/* EMPTY SLOTS */}
                          {[...Array(3 - activeSlots.length)].map((_, i) => (
                              <div key={`empty-${i}`} className="h-24 rounded-[24px] border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center text-gray-300 hover:text-blue-500 cursor-pointer group">
                                  <Plus size={24} className="mb-1 group-hover:scale-110 transition-transform"/>
                                  <span className="text-[10px] font-bold uppercase tracking-widest">Añadir Campaña</span>
                              </div>
                          ))}
                      </div>
                  </div>

              </div>
          </div>
      </div>
    </div>
  );
}


