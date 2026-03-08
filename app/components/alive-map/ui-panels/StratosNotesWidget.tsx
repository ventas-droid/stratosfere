"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, GripHorizontal, CalendarPlus, Share2, Save, Trash2, ShieldCheck, Lock } from "lucide-react";

export default function StratosNotesWidget({ isOpen, onClose, soundEnabled, playSynthSound }: any) {
  const [content, setContent] = useState("");
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);

  const [showPrivacyMsg, setShowPrivacyMsg] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar notas al abrir
  useEffect(() => {
    if (isOpen) {
      if (soundEnabled && playSynthSound) playSynthSound('boot');
      
      const saved = localStorage.getItem("stratos_tactical_notes");
      if (saved) setContent(saved);

      const privacyDismissed = localStorage.getItem("stratos_notes_privacy_dismissed");
      if (!privacyDismissed) {
        setShowPrivacyMsg(true);
      }
    }
  }, [isOpen, soundEnabled, playSynthSound]);

  // Auto-guardado silencioso
  useEffect(() => {
    if (!isOpen) return;
    
    setIsSaving(true);
    const timer = setTimeout(() => {
      localStorage.setItem("stratos_tactical_notes", content);
      setIsSaving(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [content, isOpen]);

  // ==========================================
  // 2.5 RADAR DE BORDES (Anti-Pérdida al encoger pantalla)
  // ==========================================
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      setPosition((prev) => {
        const maxX = window.innerWidth - 340; 
        const maxY = window.innerHeight - 400; 
        return {
          x: Math.min(Math.max(10, prev.x), Math.max(10, maxX)),
          y: Math.min(Math.max(10, prev.y), Math.max(10, maxY))
        };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation(); 
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y,
    };
    if (e.target instanceof Element) e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    e.stopPropagation(); 
    if (!isDragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: Math.max(0, dragRef.current.initX + dx),
      y: Math.max(0, dragRef.current.initY + dy),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation(); 
    setIsDragging(false);
    if (e.target instanceof Element) e.target.releasePointerCapture(e.pointerId);
  };

  const exportToCalendar = () => {
    if (soundEnabled && playSynthSound) playSynthSound('click');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); 
    
    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, "");
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDate(now)}
DTEND:${formatDate(tomorrow)}
SUMMARY:Revisión Propiedades - Stratosfere OS
DESCRIPTION:${content.replace(/\n/g, '\\n')}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'stratos_agenda.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareNotes = async () => {
    if (soundEnabled && playSynthSound) playSynthSound('click');
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mis Notas de Stratosfere',
          text: content,
        });
      } catch (err) {
        console.log("Compartir cancelado o no soportado");
      }
    } else {
      alert("Tu navegador no soporta compartir nativo. ¡Copia el texto!");
    }
  };

  const handleDismissPrivacy = () => {
    if (soundEnabled && playSynthSound) playSynthSound('click');
    if (dontShowAgain) {
      localStorage.setItem("stratos_notes_privacy_dismissed", "true");
    }
    setShowPrivacyMsg(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed z-[90000] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl border border-white/10 bg-[#1B2234]/95 backdrop-blur-2xl animate-fade-in pointer-events-auto relative overflow-hidden" 
      style={{ 
        left: position.x, 
        top: position.y, 
        width: '320px', 
        minHeight: '380px',
        resize: 'both', 
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* 🔥 HILO DE ORO VIP SUPERIOR 🔥 */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/80 to-transparent z-50 pointer-events-none"></div>

      {/* CABECERA ARRASTRABLE DARK PREMIUM */}
      <div 
        className={`h-12 flex items-center justify-between px-4 transition-all touch-none border-b border-white/5 shrink-0 relative z-20 ${
          isDragging 
            ? 'bg-black/40 cursor-grabbing' 
            : 'bg-transparent cursor-grab hover:bg-white/5'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="flex items-center gap-2.5 pointer-events-none">
          <GripHorizontal size={14} className="text-slate-500" />
          <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400"> SF Notes </span>
          </div>
        </div>

        {/* 🔥 BOTÓN X (Nano-Tornillo de Cristal) 🔥 */}
        <button 
          onClick={onClose} 
          className="w-6 h-6 bg-white/10 hover:bg-white/20 hover:rotate-90 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-md border border-white/10 text-white shadow-md pointer-events-auto shrink-0"
        >
          <X size={12} />
        </button>
      </div>

      {/* ÁREA DE TEXTO DARK GLASS */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Apunta aquí referencias, ideas, estrategias..."
        className="flex-1 w-full bg-transparent text-white p-5 text-sm font-medium outline-none resize-none placeholder-slate-500/50 custom-scrollbar pointer-events-auto leading-relaxed relative z-10"
        spellCheck="false"
      />

      {/* BARRA DE HERRAMIENTAS INFERIOR DARK */}
      <div className="h-12 bg-black/20 border-t border-white/5 flex items-center justify-between px-3 shrink-0 pointer-events-auto relative z-20">
        <div className="flex items-center gap-2">
          <button onClick={exportToCalendar} className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors border border-transparent hover:border-blue-500/20" title="Exportar a Agenda">
            <CalendarPlus size={16} />
          </button>
          <button onClick={shareNotes} className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors border border-transparent hover:border-emerald-500/20" title="Compartir">
            <Share2 size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                {isSaving ? <span className="animate-spin text-amber-400">⏳</span> : <Save size={12} className="text-emerald-400" />} 
                {isSaving ? 'Guardando...' : 'Guardado'}
            </span>
            <div className="w-[1px] h-4 bg-white/10"></div>
            <button onClick={() => { if(window.confirm('¿Borrar todas las notas? Esta acción no se puede deshacer.')) setContent(''); }} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Limpiar Notas">
                <Trash2 size={14} />
            </button>
        </div>
      </div>

     {/* 🛡️ OVERLAY DE PRIVACIDAD REDISEÑADO (Con Scroll y Ajuste de Altura) */}
      {showPrivacyMsg && (
        <div className="absolute inset-0 z-[100] bg-[#1B2234]/95 backdrop-blur-xl flex flex-col p-5 overflow-y-auto custom-scrollbar animate-fade-in pointer-events-auto border border-white/10">
          
          <div className="flex flex-col items-center text-center mt-2 mb-3 relative shrink-0">
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
              <div className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center mb-2 shadow-inner border border-white/10 relative z-10">
                 <Lock size={16} className="text-emerald-400" />
              </div>
              <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em] leading-tight">Canal Seguro<br/><span className="text-emerald-400">Activado</span></h3>
          </div>
          
          <p className="text-[10px] text-slate-400 mb-4 leading-relaxed text-center font-medium px-1 shrink-0">
              Esta consola de inteligencia es <strong className="text-white">100% privada</strong>. Los datos no se envían al servidor.
          </p>
          
          <ul className="space-y-2 mb-auto px-1 shrink-0">
              <li className="flex items-center gap-3 text-[9px] text-slate-300 font-bold uppercase tracking-widest bg-white/5 p-2 rounded-lg border border-white/5">
                  <div className="text-blue-400"><CalendarPlus size={14} /></div>
                  Exportación a Calendario
              </li>
              <li className="flex items-center gap-3 text-[9px] text-slate-300 font-bold uppercase tracking-widest bg-white/5 p-2 rounded-lg border border-white/5">
                  <div className="text-emerald-400"><Share2 size={14} /></div>
                  Compartir Cifrado
              </li>
              <li className="flex items-center gap-3 text-[9px] text-slate-300 font-bold uppercase tracking-widest bg-white/5 p-2 rounded-lg border border-white/5">
                  <div className="text-amber-400"><Save size={14} /></div>
                  Auto-Guardado Local
              </li>
          </ul>
          
          <div className="mt-4 flex flex-col gap-3 shrink-0">
              <label className="flex items-center justify-center gap-2 cursor-pointer group">
                  <input 
                      type="checkbox" 
                      checked={dontShowAgain}
                      onChange={(e) => setDontShowAgain(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-500/50 cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest group-hover:text-white transition-colors">No mostrar de nuevo</span>
              </label>
              
              <button 
                  onClick={handleDismissPrivacy}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400/50 shrink-0"
              >
                  ENTENDIDO
              </button>
          </div>
        </div>
      )}
    </div>
  );
}