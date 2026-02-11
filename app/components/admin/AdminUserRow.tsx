"use client";
import { useState } from "react";
// IMPORTANTE: Aquí importamos su NUEVO archivo de acciones
import { toggleUserSubscriptionAction } from "@/app/admin-actions"; 
import { ShieldCheck, Ban, Loader2, User } from "lucide-react";

export default function AdminUserRow({ user }: any) {
  const [loading, setLoading] = useState(false);
  
  // Detectamos si tiene suscripción activa AHORA (buscando la palabra ACTIVE)
  const isPro = user.subscription?.status === "ACTIVE";

  const handleToggle = async () => {
    setLoading(true);
    // Si ya es PRO, lo pasamos a INACTIVE. Si no, a ACTIVE.
    const newStatus = isPro ? "INACTIVE" : "ACTIVE"; 
    
    await toggleUserSubscriptionAction(user.id, newStatus);
    setLoading(false);
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-3">
            {user.avatar ? (
                <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" />
            ) : (
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                    <User size={20} />
                </div>
            )}
            <div>
                <p className="font-bold text-slate-900 text-sm">{user.name || "Sin Nombre"}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
            </div>
        </div>
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.role === 'AGENCY' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
            {user.role || "USER"}
        </span>
      </td>
      <td className="p-4">
        {isPro ? (
            <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                <ShieldCheck size={14}/> ACTIVO
            </span>
        ) : (
            <span className="text-slate-400 font-bold text-xs">INACTIVO</span>
        )}
      </td>
      <td className="p-4 text-right">
        <button 
            onClick={handleToggle}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 ml-auto ${
                isPro 
                ? "bg-white border border-red-200 text-red-600 hover:bg-red-50" 
                : "bg-slate-900 text-white hover:bg-black"
            }`}
        >
            {loading ? <Loader2 size={14} className="animate-spin"/> : isPro ? <><Ban size={14}/> BLOQUEAR</> : <><ShieldCheck size={14}/> ACTIVAR</>}
        </button>
      </td>
    </tr>
  );
}