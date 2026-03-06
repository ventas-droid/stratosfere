"use client";
import React, { useState, useEffect, useRef } from 'react';
import { getAdminZoneCampaignsAction, createZoneCampaignAction, updateZoneCampaignAction, deleteZoneCampaignAction, uploadLocalImageAction } from '@/app/actions-zones';
// 🔥 Añadimos Eye (Clics) y Flame (Leads) a las importaciones
import { Crown, MapPin, Trash2, Plus, Building2, Home, UploadCloud, X, Layout, Pencil, Loader2, CalendarClock, Clock4, TimerReset, Eye, Flame } from 'lucide-react';

export default function AdminZoneManager() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [now, setNow] = useState(new Date()); // 🔥 TEMPORIZADOR MAESTRO

  const [editingId, setEditingId] = useState<string | null>(null);
  const [specialLogoUrl, setSpecialLogoUrl] = useState<string | null>(null);
  const [specialMainImageUrl, setSpecialMainImageUrl] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    postalCode: "", agencyId: "", propertyRef: "", subtitle: "", customBio: "",
    durationDays: 15 // 🔥 DEFAULT DURACIÓN PARA NUEVAS
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingType, setUploadingType] = useState<'LOGO' | 'CASA' | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // EFECTO: TEMPORIZADOR MAESTRO (ACTUALIZA CADA SEGUNDO)
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // EFECTO: HIDRATACIÓN DE MEMORIA (sessionStorage)
  useEffect(() => {
    const savedForm = sessionStorage.getItem('vanguard_form_data');
    if (savedForm) {
        const parsed = JSON.parse(savedForm);
        setForm({
            postalCode: parsed.postalCode || "",
            agencyId: parsed.agencyId || "",
            propertyRef: parsed.propertyRef || "", 
            subtitle: parsed.subtitle || "",
            customBio: parsed.customBio || "",
            durationDays: parsed.durationDays || 15
        });
    }
    const savedLogo = sessionStorage.getItem('vanguard_form_logo');
    if (savedLogo) setSpecialLogoUrl(savedLogo);
    const savedImage = sessionStorage.getItem('vanguard_form_image');
    if (savedImage) setSpecialMainImageUrl(savedImage);
    const savedEditId = sessionStorage.getItem('vanguard_editing_id');
    if (savedEditId) setEditingId(savedEditId);
    setIsHydrated(true);
  }, []);

  // EFECTO: GUARDADO AUTOMÁTICO DE MEMORIA
  useEffect(() => { if (isHydrated) sessionStorage.setItem('vanguard_form_data', JSON.stringify(form)); }, [form, isHydrated]);
  useEffect(() => { if (isHydrated) specialLogoUrl ? sessionStorage.setItem('vanguard_form_logo', specialLogoUrl) : sessionStorage.removeItem('vanguard_form_logo'); }, [specialLogoUrl, isHydrated]);
  useEffect(() => { if (isHydrated) specialMainImageUrl ? sessionStorage.setItem('vanguard_form_image', specialMainImageUrl) : sessionStorage.removeItem('vanguard_form_image'); }, [specialMainImageUrl, isHydrated]);
  useEffect(() => { if (isHydrated) editingId ? sessionStorage.setItem('vanguard_editing_id', editingId) : sessionStorage.removeItem('vanguard_editing_id'); }, [editingId, isHydrated]);

  const loadData = async () => {
    setLoading(true);
    const res = await getAdminZoneCampaignsAction();
    if (res.success && res.data) setCampaigns(res.data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // CÁLCULO DE CUENTA REGRESIVA
  const calculateTimeLeft = (expiresAt: string | Date | null) => {
    if (!expiresAt) return null; // Vitalicia
    const end = new Date(expiresAt);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Expirado"; // Debería anularse

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // SUBIDA DE IMÁGENES
  const handleTriggerUpload = (type: 'LOGO' | 'CASA') => {
    setUploadingType(type);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingType) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadLocalImageAction(formData, uploadingType);
      if (res.success && res.url) {
          if (uploadingType === 'LOGO') setSpecialLogoUrl(res.url);
          if (uploadingType === 'CASA') setSpecialMainImageUrl(res.url);
      } else { alert(res?.error || "Error"); }
    } catch (error) { alert("🚨 Error de subida."); }
    finally { setIsUploading(false); setUploadingType(null); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  // ENVÍO DE FORMULARIO (Desplegar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.postalCode || !form.agencyId || !form.propertyRef) return alert("Faltan datos obligatorios");
    setLoading(true);
    const { durationDays, ...restOfForm } = form; // Separamos duración para manejar update vs create
    let res;
    if (editingId) {
        // Al actualizar, durationDays es "durationToAdd"
        res = await updateZoneCampaignAction(editingId, { ...restOfForm, campaignLogo: specialLogoUrl, campaignMainImage: specialMainImageUrl, durationToAdd: durationDays });
    } else {
        // Al crear, durationDays es la duración inicial
        res = await createZoneCampaignAction({ ...form, campaignLogo: specialLogoUrl, campaignMainImage: specialMainImageUrl });
    }
    if (res.success) {
      alert(editingId ? "✅ Tiempo extendido y campaña actualizada" : "✅ Campaña desplegada con éxito");
      resetForm();
      loadData();
    } else { alert(res?.error || "Error"); }
    setLoading(false);
  };

  // ENTRAR EN MODO EDICIÓN (Cargar datos)
  const handleEdit = (camp: any) => {
    setEditingId(camp.id);
    setForm({ 
        postalCode: camp.postalCode || "", 
        agencyId: camp.agencyId || "", 
        propertyRef: camp.property?.refCode || "", 
        subtitle: camp.subtitle || "", 
        customBio: camp.customBio || "",
        durationDays: 0 // 🔥 RESET DURACIÓN PARA EDICIÓN: El usuario escribe cuántos días AÑADIR.
    });
    setSpecialLogoUrl(camp.campaignLogo || null);
    setSpecialMainImageUrl(camp.campaignMainImage || null);
  };

  // ELIMINAR ZONA
  const handleDelete = async (id: string) => {
    if (!confirm("¿Liberar esta zona?")) return;
    setLoading(true);
    const res = await deleteZoneCampaignAction(id);
    if (res.success) loadData();
    setLoading(false);
  };

  // RESETEAR FORMULARIO
  const resetForm = () => {
    setEditingId(null);
    setForm({ postalCode: "", agencyId: "", propertyRef: "", subtitle: "", customBio: "", durationDays: 15 });
    setSpecialLogoUrl(null);
    setSpecialMainImageUrl(null);
    sessionStorage.removeItem('vanguard_form_data');
    sessionStorage.removeItem('vanguard_form_logo');
    sessionStorage.removeItem('vanguard_form_image');
    sessionStorage.removeItem('vanguard_editing_id');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in text-slate-800 pointer-events-auto">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg, image/png, image/webp" />

      <div className="flex items-center gap-3 mb-6">
        <Crown size={32} className="text-amber-500" />
        <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Vanguard Market Network</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Control de Dominio de Zonas (B2B)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* =============================================================== */}
        {/* 🔥 FORMULARIO: ASIGNAR ZONA */}
        {/* =============================================================== */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 h-fit">
          <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black flex items-center gap-2">
                {editingId ? <Pencil size={18} className="text-indigo-600"/> : <Plus size={18}/>}
                {editingId ? 'Editar y Extender Tiempo' : 'Asignar Nueva Zona'}
              </h2>
              {editingId && <button onClick={resetForm} className="text-slate-400 hover:text-red-500 bg-slate-100 p-1 rounded-md"><X size={16}/></button>}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Código Postal (El Objetivo)</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                <input type="text" value={form.postalCode || ""} onChange={e => setForm({...form, postalCode: e.target.value})} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" placeholder="Ej: 29604" required />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">ID de la Agencia</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-3 text-slate-400" />
                <input type="text" value={form.agencyId || ""} onChange={e => setForm({...form, agencyId: e.target.value})} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" placeholder="Ej: cmxyz..." required />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-1">Referencia del Activo Estrella</label>
              <div className="relative">
                <Home size={16} className="absolute left-3 top-3 text-indigo-400" />
                <input type="text" value={form.propertyRef || ""} onChange={e => setForm({...form, propertyRef: e.target.value})} className="w-full pl-10 pr-3 py-2.5 bg-indigo-50/50 border border-indigo-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500" placeholder="Ej: SF-B2A0ZM" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
                <div onClick={() => !isUploading && handleTriggerUpload('LOGO')} className={`cursor-pointer rounded-xl border ${specialLogoUrl ? 'border-amber-100 bg-amber-50' : 'border-gray-100 bg-gray-50/50'} p-3 flex flex-col items-center justify-center text-center group transition-all hover:bg-amber-50 hover:border-amber-100 ${isUploading && uploadingType === 'LOGO' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Crown size={18} className={`${specialLogoUrl ? 'text-amber-500' : 'text-gray-400'}`}/>
                    <span className="block text-[10px] font-bold uppercase text-slate-600 mt-1.5">Logo Especial</span>
                    {isUploading && uploadingType === 'LOGO' ? <Loader2 size={14} className="animate-spin text-amber-500 mt-1" /> : specialLogoUrl ? <div className="w-8 h-8 mt-1 rounded-full border border-gray-100 bg-white p-0.5"><img src={specialLogoUrl} className="w-full h-full rounded-full object-cover" alt="Logo" /></div> : <UploadCloud size={14} className="text-gray-300 mt-1 transition-transform group-hover:scale-110"/>}
                </div>
                <div onClick={() => !isUploading && handleTriggerUpload('CASA')} className={`cursor-pointer rounded-xl border ${specialMainImageUrl ? 'border-indigo-100 bg-indigo-50' : 'border-gray-100 bg-gray-50/50'} p-3 flex flex-col items-center justify-center text-center group transition-all hover:bg-indigo-50 hover:border-indigo-100 ${isUploading && uploadingType === 'CASA' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Layout size={18} className={`${specialMainImageUrl ? 'text-indigo-500' : 'text-gray-400'}`}/>
                    <span className="block text-[10px] font-bold uppercase text-slate-600 mt-1.5">Casa Especial</span>
                    {isUploading && uploadingType === 'CASA' ? <Loader2 size={14} className="animate-spin text-indigo-500 mt-1" /> : specialMainImageUrl ? <div className="w-8 h-8 mt-1 rounded border border-gray-100 bg-white p-0.5"><img src={specialMainImageUrl} className="w-full h-full rounded object-cover" alt="Casa" /></div> : <UploadCloud size={14} className="text-gray-300 mt-1 transition-transform group-hover:scale-110"/>}
                </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 pt-1">Subtítulo Comercial (Opcional)</label>
              <input type="text" value={form.subtitle || ""} onChange={e => setForm({...form, subtitle: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" placeholder="Ej: TU AGENTE DE CONFIANZA" />
            </div>

            {/* 🔥 GÉNERADOR DE TIEMPO */}
            <div className="bg-[#1C1C1E] p-4 rounded-xl border border-[#3A3A3C] shadow-inner">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-1.5 flex items-center gap-1.5">
                  <CalendarClock size={12}/> {editingId ? 'Días adicionales de Campaña' : 'Duración de la Campaña (Días)'}
              </label>
              <div className="flex gap-2.5">
                <input 
                    type="number" 
                    min={editingId ? 0 : 1}
                    max={365} 
                    value={form.durationDays} 
                    onChange={e => setForm({...form, durationDays: parseInt(e.target.value) || 0})} 
                    className="w-full px-3 py-2 bg-black border border-[#3A3A3C] rounded-lg text-lg font-mono font-black text-amber-300 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500" 
                    placeholder="Ej: 30" 
                    required 
                />
                <span className="flex items-center text-xs font-bold text-amber-500 bg-[#3A3A3C] px-3 rounded-lg">DÍAS</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1.5 leading-tight font-medium">El dominio de zona no es eterno, General. Al clicar Desplegar, el temporizador comenzará su cuenta regresiva fatal.</p>
            </div>

            <button type="submit" disabled={loading || isUploading} className={`w-full text-white font-black tracking-widest uppercase text-xs py-3.5 rounded-xl transition-all shadow-lg mt-2 disabled:opacity-50 ${editingId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-black'}`}>
              {loading ? <span className="flex items-center gap-2 justify-center"><Loader2 size={16} className="animate-spin" /> Operando Satélite...</span> : editingId ? 'Actualizar y Reiniciar Tiempo' : 'Desplegar Campaña'}
            </button>
          </form>
        </div>

        {/* =============================================================== */}
        {/* 🔥 LISTADO: ZONAS CONQUISTADAS */}
        {/* =============================================================== */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 overflow-hidden">
          <h2 className="text-lg font-black mb-4 flex items-center gap-2"><MapPin size={18}/> Zonas Conquistadas</h2>
          {loading ? <p className="text-sm font-bold text-slate-400">Escaneando satélite...</p> : campaigns.length === 0 ? <p className="text-sm font-bold text-slate-400 py-10 text-center">No hay agencias dominando zonas en este momento.</p> : (
            <div className="space-y-3 relative">
              
              {campaigns.map((camp) => {
                const timeLeft = calculateTimeLeft(camp.expiresAt);
                const isExpirado = timeLeft === "Expirado";

                return (
                    <div key={camp.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${editingId === camp.id ? 'border-indigo-300 bg-indigo-50/50' : isExpirado ? 'border-red-200 bg-red-50/50' : 'border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md'}`}>
                      <div className="flex items-center gap-4 min-w-0">
<div className="flex items-center gap-1.5 h-12 px-4 bg-gradient-to-br from-amber-200 via-amber-100 to-amber-300 border border-amber-300/60 rounded-[14px] shadow-[0_2px_10px_rgba(245,158,11,0.15)] shrink-0 relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    <MapPin size={16} className="text-amber-700/80 drop-shadow-sm relative z-10" />
    <span className="font-black text-amber-950 text-sm tracking-widest relative z-10">{camp.postalCode}</span>
</div>                        <div className="min-w-0 truncate">
                          <h4 className="font-black text-slate-900 leading-tight flex items-center gap-2 truncate">
                            {camp.agency?.companyName || camp.agency?.name || "Agencia Desconocida"}
                            {(camp.campaignLogo || camp.campaignMainImage) && <span className="bg-indigo-100 text-indigo-600 text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest shrink-0">CUSTOM</span>}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 truncate">REF ESTRELLA: {camp.property?.refCode || "Sin Ref"}</p>
                          
                          {/* 🔥 LAS ESTADÍSTICAS DE GUERRA INYECTADAS AQUÍ 🔥 */}
                          <div className="flex items-center gap-2 mt-2">
                              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100 text-[9px] font-black uppercase tracking-widest">
                                  <Eye size={12} className="text-blue-500" /> {camp.clicks || 0} Clics
                              </span>
                              <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md border border-orange-100 text-[9px] font-black uppercase tracking-widest">
                                  <Flame size={12} className="text-orange-500" /> {camp.leads || 0} Leads
                              </span>
                          </div>

                        </div>
                      </div>

                      <div className="flex gap-2 items-center">
                        <div className={`flex items-center gap-1.5 px-3 py-1 font-bold text-xs rounded-full border shadow-sm ${timeLeft ? isExpirado ? 'bg-red-100 text-red-700 border-red-200 animate-pulse' : 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                           {timeLeft ? (
                               isExpirado ? (
                                   <>⚠️ EXPIRADO (Anular)</>
                               ) : (
                                   <><Clock4 size={14} className="text-amber-500" /> {timeLeft}</>
                               )
                           ) : (
                               <><TimerReset size={14} className="text-slate-400" /> Vitalicia</>
                           )}
                        </div>

                        <div className="flex gap-1.5">
                            <button onClick={() => handleEdit(camp)} disabled={loading} className={`w-9 h-9 rounded-full transition-all shadow-sm ${editingId === camp.id ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white'} flex items-center justify-center`} title="Editar Campaña y Extender Tiempo"><Pencil size={16} /></button>
                            <button onClick={() => handleDelete(camp.id)} disabled={loading} className="w-9 h-9 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm" title="Liberar esta Zona (Anular Campaña)"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}