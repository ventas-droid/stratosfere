"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, GripHorizontal, CalendarPlus, Share2, Save, Trash2, ShieldCheck } from "lucide-react";

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
        // Calculamos los límites máximos de la pantalla actual
        const maxX = window.innerWidth - 340; // 320px de ancho + 20px de margen
        const maxY = window.innerHeight - 400; // 380px de alto + 20px de margen
        
        // Empujamos el Post-it hacia adentro si se ha quedado fuera
        return {
          x: Math.min(Math.max(10, prev.x), Math.max(10, maxX)),
          y: Math.min(Math.max(10, prev.y), Math.max(10, maxY))
        };
      });
    };

    // Encendemos el radar para que escuche cada vez que se mueve la ventana
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
className="fixed z-[90000] flex flex-col shadow-2xl rounded-2xl border border-white/40 bg-white/10 backdrop-blur-2xl animate-fade-in pointer-events-auto relative" style={{ 
        left: position.x, 
        top: position.y, 
        width: '320px', 
        minHeight: '380px',
        resize: 'both', 
        overflow: 'hidden'
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* CABECERA ARRASTRABLE LUMINOSA */}
      <div 
        className={`h-10 flex items-center justify-between px-3 transition-all touch-none border-b border-slate-100 shrink-0 ${
          isDragging 
            ? 'bg-amber-100 cursor-grabbing' 
            : 'bg-white cursor-grab hover:bg-slate-50'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <GripHorizontal size={14} className="text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-700"> SF Notes </span>
        </div>
        <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-red-500 transition-colors pointer-events-auto">
          <X size={14} />
        </button>
      </div>

      {/* ÁREA DE TEXTO CLARA */}
     <textarea
  value={content}
  onChange={(e) => setContent(e.target.value)}
  placeholder="Apunta aquí referencias, ideas, precios a negociar..."
  className="flex-1 w-full bg-slate-50/50 text-slate-800 p-4 text-base font-medium outline-none resize-none placeholder-slate-400 custom-scrollbar pointer-events-auto leading-relaxed"
  spellCheck="false"
/>

      {/* BARRA DE HERRAMIENTAS INFERIOR CLARA */}
      <div className="h-12 bg-white border-t border-slate-100 flex items-center justify-between px-2 shrink-0 pointer-events-auto">
        <div className="flex items-center gap-1">
          <button onClick={exportToCalendar} className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Exportar a Agenda (Google/Apple)">
            <CalendarPlus size={16} />
          </button>
          <button onClick={shareNotes} className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Compartir">
            <Share2 size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2 pr-2">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                {isSaving ? <span className="animate-spin text-amber-500">⏳</span> : <Save size={12} className="text-emerald-500" />} 
                {isSaving ? 'Guardando...' : 'Guardado'}
            </span>
            <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
            <button onClick={() => { if(window.confirm('¿Borrar todas las notas? Esta acción no se puede deshacer.')) setContent(''); }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Limpiar Notas">
                <Trash2 size={14} />
            </button>
        </div>
      </div>

      {/* 🛡️ OVERLAY DE PRIVACIDAD (Se mueve aquí abajo para que pise a todo lo demás) */}
      {showPrivacyMsg && (
        <div className="absolute inset-0 z-[100] bg-white rounded-2xl flex flex-col p-5 animate-fade-in pointer-events-auto">
          
          <div className="flex flex-col items-center text-center mt-2 mb-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mb-2 shadow-inner">
                 <ShieldCheck size={20} className="text-emerald-500" />
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Su Privacidad,<br/>Nuestra Prioridad</h3>
          </div>
          
          <p className="text-[11px] text-slate-500 mb-5 leading-relaxed text-center font-medium">
              Sus anotaciones son <strong className="text-emerald-600">100% confidenciales</strong>. Se almacenan únicamente en su dispositivo.
          </p>
          
          <ul className="space-y-3 mb-auto px-1">
              <li className="flex items-center gap-3 text-[10px] text-slate-700 font-bold uppercase tracking-widest">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-500"><CalendarPlus size={14} /></div>
                  Añada eventos a su agenda
              </li>
              <li className="flex items-center gap-3 text-[10px] text-slate-700 font-bold uppercase tracking-widest">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-500"><Share2 size={14} /></div>
                  Comparta por WhatsApp
              </li>
              <li className="flex items-center gap-3 text-[10px] text-slate-700 font-bold uppercase tracking-widest">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-500"><Save size={14} /></div>
                  Guardado Automático
              </li>
          </ul>
          
          <div className="mt-4 flex flex-col gap-3">
              <label className="flex items-center justify-center gap-2 cursor-pointer group">
                  <input 
                      type="checkbox" 
                      checked={dontShowAgain}
                      onChange={(e) => setDontShowAgain(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500/50 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest group-hover:text-slate-800 transition-colors">No volver a mostrar</span>
              </label>
              <button 
                  onClick={handleDismissPrivacy}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/30"
              >
                  Comenzar
              </button>
          </div>
        </div>
      )}
    </div>
  );
}