"use client";

import React, { useState } from 'react';
import { Crosshair, History } from 'lucide-react';

// 🚀 IMPORTAMOS NUESTRAS DOS ARMAS PESADAS
import AdminBillingRadar from './AdminBillingRadar'; // Ajuste la ruta si están en otra carpeta
import AdminBillingHistory from './AdminBillingHistory'; // Ajuste la ruta si están en otra carpeta

export default function AdminBillingManager() {
  // Estado para controlar qué pantalla estamos viendo
  const [activeTab, setActiveTab] = useState<'RADAR' | 'HISTORY'>('RADAR');

  return (
    <div className="w-full animate-fade-in">
      
      {/* 🎛️ PANEL DE CONTROL (PESTAÑAS) */}
      <div className="max-w-7xl mx-auto px-6 pt-6 flex justify-center sm:justify-start">
        <div className="bg-slate-200/50 p-1.5 rounded-2xl flex gap-1 border border-slate-300/50 shadow-inner">
          
          <button 
            onClick={() => setActiveTab('RADAR')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 ${
              activeTab === 'RADAR' 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-100' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-300/50 scale-95'
            }`}
          >
            <Crosshair size={16} /> Lanzamisiles (Radar)
          </button>

          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 ${
              activeTab === 'HISTORY' 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-100' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-300/50 scale-95'
            }`}
          >
            <History size={16} /> Historial Operaciones
          </button>
          
        </div>
      </div>

      {/* 🖥️ PANTALLA PRINCIPAL (Muestra uno u otro) */}
      <div className="mt-4">
        {activeTab === 'RADAR' && <AdminBillingRadar />}
        {activeTab === 'HISTORY' && <AdminBillingHistory />}
      </div>

    </div>
  );
}