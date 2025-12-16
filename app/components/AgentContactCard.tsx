import React from 'react';
import { Activity, Shield, Phone, MessageSquare } from 'lucide-react';

interface AgentContactCardProps {
  name: string;
  codename: string;
  role: string;
  status: 'active' | 'offline' | 'busy';
  avatarUrl?: string;
  onCall?: () => void;
  onMessage?: () => void;
}

export const AgentContactCard: React.FC<AgentContactCardProps> = ({
  name,
  codename,
  role,
  status,
  avatarUrl,
  onCall,
  onMessage
}) => {
  
  // Configuración de colores dinámicos según el estado del agente
  const statusColors = {
    active: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
    offline: 'bg-slate-500',
    busy: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
  };

  return (
    <div className="group relative w-full max-w-sm overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 p-4 backdrop-blur-md transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10">
      
      {/* Esquinas decorativas estilo HUD */}
      <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-emerald-500/30 transition-colors group-hover:border-emerald-400" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-emerald-500/30 transition-colors group-hover:border-emerald-400" />

      <div className="flex items-start gap-4">
        {/* Contenedor del Avatar */}
        <div className="relative">
          <div className="h-16 w-16 overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={codename} 
                className="h-full w-full object-cover" 
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-500">
                <Shield size={24} />
              </div>
            )}
          </div>
          
          {/* Luz Indicadora de Estado (punto de color) */}
          <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-950 ${statusColors[status]}`} />
        </div>

        {/* Información del Agente */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-lg font-bold text-slate-100 tracking-wide">{codename}</h3>
            <Activity size={14} className={status === 'active' ? 'text-emerald-500 animate-pulse' : 'text-slate-600'} />
          </div>
          <p className="text-xs font-semibold text-emerald-500/80 uppercase tracking-wider">{role}</p>
          <p className="mt-1 text-sm text-slate-400">{name}</p>
        </div>
      </div>

      {/* Botones de Acción (COMMS y CONNECT) */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button 
          onClick={onMessage}
          className="flex items-center justify-center gap-2 rounded bg-slate-800 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white active:scale-95"
        >
          <MessageSquare size={14} />
          COMMS
        </button>
        <button 
          onClick={onCall}
          className="flex items-center justify-center gap-2 rounded bg-emerald-900/20 py-2 text-xs font-medium text-emerald-400 border border-emerald-900/50 transition-colors hover:bg-emerald-500/20 hover:text-emerald-300 active:scale-95"
        >
          <Phone size={14} />
          CONNECT
        </button>
      </div>
    </div>
  );
};

export default AgentContactCard;

