"use client";

import React from 'react';
import { X, Trophy, Users, Target, Crown, Calendar, Share2, Award } from 'lucide-react';

interface AgencyCardProps {
  data: any;
  onClose: () => void;
}

const AgencyCard = ({ data, onClose }: AgencyCardProps) => {
  if (!data) return null;

  return (
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden font-mono animate-scale-up">
      
      {/* --- HEADER: LA MARCA --- */}
      <div className="relative h-40 bg-gradient-to-r from-purple-900 via-black to-black flex items-center px-8 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
        </button>

        {/* Logo y Nombre */}
        <div className="flex items-center gap-6 z-10">
            <div className="w-24 h-24 bg-black border-2 border-purple-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <span className="text-3xl font-bold text-white">S|R</span>
            </div>
            <div>
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-white tracking-tight">SKYLINE REALTY</h2>
                    <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-1 rounded border border-yellow-500/50 uppercase tracking-widest font-bold flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Elite Partner
                    </span>
                </div>
                <p className="text-white/50 text-sm mt-1">Dominio de zona: Barrio Salamanca • Retiro</p>
            </div>
        </div>

        {/* Stats Rápidos (Ratio de Tiro) */}
        <div className="ml-auto text-right z-10">
            <div className="text-4xl font-bold text-white">94%</div>
            <div className="text-purple-400 text-xs uppercase tracking-wider">Ratio de Cierre</div>
        </div>
      </div>

      {/* --- CUERPO: EL ARSENAL --- */}
      <div className="p-8 grid grid-cols-12 gap-8 bg-black/95 backdrop-blur-xl">
        
        {/* COLUMNA IZQUIERDA: SERVICIOS Y RANGO */}
        <div className="col-span-7 space-y-6">
            
            {/* Título */}
            <div className="flex items-center gap-2 text-white/40 uppercase text-xs font-bold tracking-widest mb-2">
                <Target className="w-4 h-4" /> Protocolos de Actuación
            </div>

            {/* PAQUETES GAMIFICADOS */}
            <div className="space-y-3">
                <div className="group flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-purple-500/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 font-bold">I</div>
                        <div>
                            <div className="text-white font-bold group-hover:text-purple-400 transition-colors">Protocolo Alpha</div>
                            <div className="text-white/40 text-xs">Gestión táctica y posicionamiento SEO.</div>
                        </div>
                    </div>
                </div>

                <div className="group flex items-center justify-between p-4 rounded-xl border border-purple-500/30 bg-purple-900/10 hover:bg-purple-900/20 transition-all cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-500/20 to-transparent"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold shadow-lg">II</div>
                        <div>
                            <div className="text-white font-bold group-hover:text-purple-300 transition-colors">Vector Sigma</div>
                            <div className="text-purple-200/60 text-xs">Staging 3D + Campaña Redes + IA.</div>
                        </div>
                    </div>
                    <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded ml-auto">POPULAR</span>
                </div>

                <div className="group flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-yellow-500/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-yellow-500 font-bold">III</div>
                        <div>
                            <div className="text-white font-bold group-hover:text-yellow-400 transition-colors">Dominio Total</div>
                            <div className="text-white/40 text-xs">Evento Privado + Cobertura Press + Influencers.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA: SOCIAL PROOF & EVENTOS */}
        <div className="col-span-5 space-y-6 border-l border-white/5 pl-8">
            
            {/* BLOGGERS / INFLUENCERS (Intel Network) */}
            <div>
                <div className="flex items-center gap-2 text-white/40 uppercase text-xs font-bold tracking-widest mb-4">
                    <Share2 className="w-4 h-4" /> Intel Network (Bloggers)
                </div>
                <div className="flex -space-x-3 overflow-hidden p-2">
                    {[1,2,3,4].map((i) => (
                        <div key={i} className="relative w-10 h-10 rounded-full border-2 border-black bg-gray-700 hover:scale-110 hover:z-10 transition-transform cursor-pointer overflow-hidden">
                            <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="Blogger" className="w-full h-full object-cover" />
                            {i === 0 && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border border-black rounded-full"></div>}
                        </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-black bg-white/10 flex items-center justify-center text-xs text-white font-bold">+12</div>
                </div>
                <p className="text-white/30 text-[10px] mt-2 italic">"Avalados por los mejores creadores de contenido lifestyle de Madrid."</p>
            </div>

            {/* EVENTO OFFLINE (El Ticket) */}
            <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-yellow-400 blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-black border border-yellow-500/50 p-4 rounded-xl flex items-center gap-4">
                    <div className="bg-yellow-500/20 p-3 rounded-lg text-yellow-500">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest mb-1">Próximo Evento Offline</div>
                        <div className="text-white font-bold text-sm">Gala Sunset: Velázquez 24</div>
                        <div className="text-white/50 text-xs">Jueves 12 • Solo Invitación</div>
                    </div>
                </div>
            </div>

            {/* BOTÓN CONTACTAR AGENCIA */}
            <button className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <Users className="w-4 h-4" /> SOLICITAR REUNIÓN TÁCTICA
            </button>

        </div>
      </div>
    </div>
  );
};

export default AgencyCard;

