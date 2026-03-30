'use client'

import { useState } from 'react';
import { registerUser } from '@/app/actions/register';
import { Building2, User, Phone, Mail, ShieldCheck, Lock, Loader2, Handshake, MapPin, ArrowRight } from 'lucide-react';

export default function JoinClient({ sponsorId, sponsor }: { sponsorId?: string, sponsor: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sponsorName = sponsor?.companyName || sponsor?.name || "Agencia Top Partner";
  const sponsorImage = sponsor?.companyLogo || sponsor?.avatar || "/placeholder.jpg";
  const sponsorPhone = sponsor?.mobile || sponsor?.phone || "Contactar por plataforma";

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    
    // Forzamos el rol AGENCIA porque es una alianza B2B pura
    formData.append('role', 'AGENCIA');
    
    const result = await registerUser(formData);
    if (result?.error) {
        setMessage(`❌ ${result.error}`);
        setLoading(false);
    }
    // Si hay éxito, su backend ya redirige automáticamente.
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Luces Tácticas de Fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        
        {/* ========================================================= */}
        {/* LADO IZQUIERDO: EL PODER DEL GENERAL (SU PERFIL) */}
        {/* ========================================================= */}
        <div className="p-8 lg:pr-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black tracking-[0.2em] uppercase mb-6">
            <ShieldCheck size={14} /> Red Vanguard Market
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white mb-6 leading-tight">
            Alianza <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Bidireccional</span> B2B.
          </h1>
          
          <p className="text-zinc-400 text-lg mb-10 leading-relaxed font-medium">
            Al registrarse a través de este enlace cifrado, usted y <strong className="text-white">{sponsorName}</strong> quedarán conectados en tiempo real para compartir stock off-market y cruzar operaciones con comisiones blindadas.
          </p>

          {/* LA TARJETA DEL SPONSOR (SUS DATOS) */}
          {sponsor && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>
              
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-black border border-white/10 overflow-hidden shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.15)] group-hover:scale-105 transition-transform">
                  <img src={sponsorImage} alt={sponsorName} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1">
                  <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Agencia Principal</div>
                  <h3 className="text-xl font-black text-white leading-none mb-2">{sponsorName}</h3>
                  
                  <div className="space-y-2 mt-4">
                    {sponsor.zone && (
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                        <MapPin size={14} className="text-amber-500" /> Zona: {sponsor.zone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                      <Phone size={14} className="text-amber-500" /> {sponsorPhone}
                    </div>
                    {sponsor.email && (
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                        <Mail size={14} className="text-amber-500" /> {sponsor.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* LADO DERECHO: EL FORMULARIO DE CAPTURA B2B */}
        {/* ========================================================= */}
        <div className="bg-zinc-900/80 backdrop-blur-xl p-8 lg:p-10 rounded-[40px] border border-zinc-800 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">Activar Credenciales</h2>
            <p className="text-sm text-zinc-400 mt-2 font-medium">Complete sus datos de profesional para acceder al panel de la agencia.</p>
            {message && (
                <div className="mt-4 p-4 rounded-xl text-sm font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {message}
                </div>
            )}
          </div>

          <form action={handleSubmit} className="space-y-5">
            {/* LA TRAMPA INVISIBLE */}
            {sponsorId && <input type="hidden" name="sponsor" value={sponsorId} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nombre del Agente</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input name="name" type="text" required className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-zinc-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="Ej: Isidro Llorca" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Empresa / Agencia</label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input name="companyName" type="text" required className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-zinc-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="Ej: Llorca Realty" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Teléfono Directo (WhatsApp)</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input name="phone" type="tel" required className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-zinc-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="+34 600 000 000" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Email Profesional</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input name="email" type="email" required className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-zinc-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="agencia@correo.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Contraseña de Acceso</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input name="password" type="password" required className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-zinc-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.3)] flex justify-center items-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <><Handshake size={20} /> Sellar Alianza B2B</>}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-600 font-medium mt-6">
            Al registrarse, acepta los términos operativos y de confidencialidad de la red Stratosfere.
          </p>
        </div>
      </div>
    </div>
  );
}