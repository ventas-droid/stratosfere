'use client'

import { useState } from 'react';
import { registerUser } from '@/app/actions/register';
import { Building2, User, Phone, Mail, ShieldCheck, Lock, Loader2, Handshake, MapPin, Eye, EyeOff } from 'lucide-react';

export default function JoinClient({ sponsorId, sponsor }: { sponsorId?: string, sponsor: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // 🛡️ EXTRACCIÓN DE SUS DATOS REALES
  const sponsorName = sponsor?.companyName || sponsor?.name || "Red Stratosfere";
  const sponsorImage = sponsor?.companyLogo || sponsor?.avatar; 
  const sponsorPhone = sponsor?.mobile || sponsor?.phone || "";

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    
    // Forzamos el rol para que los que se registran aquí sean Agencias/Profesionales
    formData.append('role', 'AGENCIA');
    
    const result = await registerUser(formData);
    if (result?.error) {
        setMessage(`❌ ${result.error}`);
        setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* ========================================================= */}
        {/* LADO IZQUIERDO: SUS DATOS (EL GENERAL) */}
        {/* ========================================================= */}
        <div className="p-4 lg:pr-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black tracking-[0.2em] uppercase mb-6">
            <ShieldCheck size={14} /> Vanguard Market Network
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white mb-6 leading-tight">
            Alianza <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Estratégica</span> B2B.
          </h1>
          
          <p className="text-zinc-400 text-lg mb-10 leading-relaxed font-medium">
            Únase a la red operativa de <strong className="text-white">{sponsorName}</strong>. Podrá compartir stock off-market, captar leads calificados y operar bajo un entorno de comisiones protegidas.
          </p>

          {/* LA TARJETA DE SU AGENCIA */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>
            
            <div className="flex items-start gap-5">
              <div className="w-24 h-24 rounded-2xl bg-black border border-white/10 overflow-hidden shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.15)] flex items-center justify-center">
                 {sponsorImage ? (
                     <img src={sponsorImage} alt={sponsorName} className="w-full h-full object-cover" />
                 ) : (
                     <Building2 size={40} className="text-zinc-600" />
                 )}
              </div>
              
              <div className="flex-1">
                <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Invitación Oficial Emitida Por:</div>
                <h3 className="text-2xl font-black text-white leading-none mb-3">{sponsorName}</h3>
                
                {/* SUS DATOS CORPORATIVOS */}
                <div className="space-y-2 mt-4">
                  {sponsor?.licenseNumber && (
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                      <ShieldCheck size={14} className="text-amber-500" /> Licencia: {sponsor.licenseNumber}
                    </div>
                  )}
                  {sponsor?.zone && (
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                      <MapPin size={14} className="text-amber-500" /> Zona: {sponsor.zone}
                    </div>
                  )}
                  {sponsorPhone && (
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                      <Phone size={14} className="text-amber-500" /> {sponsorPhone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LADO DERECHO: FORMULARIO DE REGISTRO */}
        {/* ========================================================= */}
        <div className="bg-zinc-900/80 backdrop-blur-xl p-8 lg:p-10 rounded-[40px] border border-zinc-800 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">Activar Licencia</h2>
            <p className="text-sm text-zinc-400 mt-2 font-medium">Registro exclusivo para Agencias y Profesionales Independientes.</p>
            {message && (
                <div className="mt-4 p-4 rounded-xl text-sm font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {message}
                </div>
            )}
          </div>

          <form action={handleSubmit} className="space-y-6">
            {/* 🎯 LA TRAMPA INVISIBLE: PASAMOS SU ID AL REGISTRO */}
            {sponsorId && <input type="hidden" name="sponsor" value={sponsorId} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nombre del Gerente</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input name="name" type="text" required className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-zinc-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="Nombre completo" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Empresa / Agencia</label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input name="companyName" type="text" required className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-zinc-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="Nombre Comercial" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">CIF / NIF</label>
                <div className="relative">
                    <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input name="cif" type="text" required className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-zinc-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="B12345678" />
                </div>
                </div>

                <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Teléfono Directo</label>
                <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input name="phone" type="tel" required className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-zinc-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="+34 600 000 000" />
                </div>
                </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Email Profesional</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input name="email" type="email" required className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-zinc-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="gerencia@agencia.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Contraseña de Acceso</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input name="password" type={showPassword ? "text" : "password"} required className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-12 text-white font-bold placeholder:text-zinc-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.3)] flex justify-center items-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <><Handshake size={20} /> Sellar Alianza B2B</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}