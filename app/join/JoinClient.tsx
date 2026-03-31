'use client'

import { useState } from 'react';
import { registerUser } from '@/app/actions/register';
import { Building2, User, Phone, Mail, ShieldCheck, Lock, Loader2, Handshake, MapPin, Eye, EyeOff, Navigation } from 'lucide-react';

export default function JoinClient({ sponsorId, sponsor }: { sponsorId?: string, sponsor: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // 🛡️ EXTRACCIÓN DE SUS DATOS REALES
  const sponsorName = sponsor?.companyName || sponsor?.name || "Red Stratosfere";
  const sponsorImage = sponsor?.companyLogo || sponsor?.avatar; 
  const sponsorPhone = sponsor?.mobile || sponsor?.phone || "";
  
  // 🎯 EL GANCHO: Si el sponsor trae una propiedad destacada, la pintamos
  const property = sponsor?.featuredProperty || null;

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
      
      {/* 🚀 MARCA DE AGUA CORPORATIVA */}
      <div className="absolute top-6 left-6 lg:top-10 lg:left-10 z-50">
          <div className="text-2xl font-black tracking-tighter text-white opacity-80 hover:opacity-100 transition-opacity flex flex-col leading-none">
              <span>Stratosfere OS.</span>
              <span className="text-[9px] font-bold tracking-widest text-amber-500 uppercase mt-1">Search and work Better.</span>
          </div>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 pt-20 lg:pt-0">
        
        {/* ========================================================= */}
        {/* LADO IZQUIERDO: SUS DATOS Y LA INVITACIÓN B2B */}
        {/* ========================================================= */}
        <div className="p-4 lg:pr-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black tracking-[0.2em] uppercase mb-6">
            <ShieldCheck size={14} /> Vanguard Market Network
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white mb-6 leading-tight">
            Alianza <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Estratégica</span> B2B.
          </h1>
          
          {/* 🔥 EL MENSAJE DIRECTO SIN VASELINA */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 border-l-4 border-l-amber-500 shadow-lg">
             <p className="text-zinc-300 text-lg leading-relaxed font-medium">
                 Invitación exclusiva de <strong className="text-white text-xl">{sponsorName}</strong> para que formes parte de su red de embajadores y de colaboración B2B.
             </p>
             <p className="text-amber-400 text-sm font-bold mt-3 uppercase tracking-widest flex items-center gap-2">
                 <Handshake size={16} /> Únete a la red. Cierra el trato. Gana dinero hoy.
             </p>
          </div>

          {/* 🔥 EL ESCAPARATE: LA NANO-CARD GANCHO SI HAY PROPIEDAD 🔥 */}
          {property && Number(property.sharePct) > 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl relative group/prop">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>
                  
                  {/* Foto y Datos Rápidos */}
                  <div className="flex h-[120px] bg-zinc-900/50">
                      <div className="w-[120px] shrink-0 relative overflow-hidden bg-black border-r border-white/5">
                          <img src={property.mainImage || "/placeholder.jpg"} alt="Oportunidad B2B" className="w-full h-full object-cover opacity-80" />
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                              <Building2 size={10} className="text-amber-500"/>
                              <span className="text-[8px] font-black uppercase tracking-widest text-white">{property.type || "PISO"}</span>
                          </div>
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
                          <p className="text-[9px] font-black tracking-widest text-amber-500 uppercase truncate mb-1">
                              {property.refCode || "OPORTUNIDAD B2B"}
                          </p>
                          <h4 className="font-bold text-white text-sm truncate mb-1">{property.title || "Propiedad Confidencial"}</h4>
                          <p className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 truncate">
                              <Navigation size={12} className="text-zinc-500"/> {property.city || "Ubicación Privada"}
                          </p>
                      </div>
                  </div>

                  {/* La Comisión y la Mano Dorada */}
                  <div className="bg-gradient-to-r from-amber-900/40 to-black/40 p-5 flex items-center justify-between border-t border-white/5 relative z-10">
                      <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                              <Handshake size={24} className="text-amber-950" />
                          </div>
                          <div>
                              <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest">Colaboración Activa</span>
                              <div className="text-zinc-300 text-sm font-medium mt-0.5">Comisión del <span className="text-white font-black">{property.sharePct}%</span></div>
                          </div>
                      </div>
                      <div className="text-right">
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Tus Honorarios</span>
                          <span className="text-3xl font-black text-white tracking-tighter">
                              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(((Number(property.price || 0) * Number(property.commissionPct || 3)) / 100) * (Number(property.sharePct || 0) / 100))}
                          </span>
                      </div>
                  </div>
              </div>
          ) : (
             /* LA TARJETA DE SU AGENCIA CLÁSICA (Si no hay propiedad destacada) */
             <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>
                <div className="flex items-start gap-5 relative z-10">
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
          )}
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