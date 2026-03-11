"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Star, MapPin, Trash2, Plus, Search, Loader2, CalendarClock, Clock4, Pencil, X, UploadCloud } from 'lucide-react';

import { getTop10CampaignsAction, createTop10CampaignAction, updateTop10CampaignAction, deleteTop10CampaignAction } from '@/app/actions-top10'; 
import { uploadLocalImageAction } from '@/app/actions-zones'; // Reutilizamos el subidor del Geo Sniper

export default function AdminTop10Panel() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [specialLogoUrl, setSpecialLogoUrl] = useState<string | null>(null);
  const [specialMainImageUrl, setSpecialMainImageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingType, setUploadingType] = useState<'LOGO' | 'CASA' | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    propertyRef: "", 
    targetCity: "", 
    durationDays: "7" 
  });

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    const res = await getTop10CampaignsAction();
    if (res.success && res.data) setCampaigns(res.data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const calculateTimeLeft = (expiresAt: string | Date | null) => {
    if (!expiresAt) return null; 
    const end = new Date(expiresAt);
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return "Expirado";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // 🔥 SUBIDA DE IMÁGENES
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
      } else { alert(res?.error || "Error de subida"); }
    } catch (error) { alert("🚨 Error de subida."); } 
    finally { setIsUploading(false); setUploadingType(null); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  // 🔥 ENVÍO CON FECHA ABSOLUTA MACHACADORA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.propertyRef || !form.targetCity) return alert("Faltan datos obligatorios");
    setLoading(true);
    
    const targetDays = parseInt(String(form.durationDays), 10) || 0;
    const absoluteDeathDate = new Date(now.getTime() + targetDays * 24 * 60 * 60 * 1000);

    let res;
    if (editingId) {
        res = await updateTop10CampaignAction(editingId, { 
            targetCity: form.targetCity,
            expiresAt: absoluteDeathDate, // Machaca la fecha
            customLogo: specialLogoUrl,
            customImage: specialMainImageUrl
        });
    } else {
        res = await createTop10CampaignAction({ 
            propertyRef: form.propertyRef, 
            targetCity: form.targetCity,
            durationDays: targetDays,
            customLogo: specialLogoUrl,
            customImage: specialMainImageUrl
        });
    }

    if (res.success) {
        alert(editingId ? "✅ Top 10 Actualizado y Renovado." : "✅ Propiedad elevada al Top 10.");
        resetForm();
        loadData();
    } else { alert("❌ Error: " + res.error); }
    setLoading(false);
  };

  const handleEdit = (camp: any) => {
    setEditingId(camp.id);
    let currentDays = 0;
    if (camp.expiresAt) {
        const diff = new Date(camp.expiresAt).getTime() - new Date().getTime();
        currentDays = diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
    }
    setForm({ 
        propertyRef: camp.property?.refCode || "", 
        targetCity: camp.targetCity || "", 
        durationDays: currentDays > 0 ? String(currentDays) : ""
    });
    setSpecialLogoUrl(camp.customLogo || null);
    setSpecialMainImageUrl(camp.customImage || null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Bajar esta propiedad del Top 10? Perderá la etiqueta dorada instantáneamente.")) return;
    setLoading(true);
    const res = await deleteTop10CampaignAction(id);
    if (res.success) loadData(); else alert("❌ Error al destituir.");
    setLoading(false);
  };

  const resetForm = () => {
      setEditingId(null);
      setForm({ propertyRef: "", targetCity: "", durationDays: "7" });
      setSpecialLogoUrl(null);
      setSpecialMainImageUrl(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in text-slate-800">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg, image/png, image/webp" />

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-amber-100 p-2 rounded-xl text-amber-600"><Star size={32} className="fill-amber-500" /></div>
        <div>
            <h1 className="text-2xl font-black tracking-tight text-amber-900">Comando Top 10</h1>
            <p className="text-sm font-bold text-amber-600 uppercase tracking-widest">Elevación Manual de Activos Estrella</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PANEL DE LANZAMIENTO Y EDICIÓN */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[24px] shadow-[0_10px_40px_rgba(245,158,11,0.1)] border border-amber-100 h-fit relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-500"></div>
          
          <div className="flex items-center justify-between mb-4 mt-2">
            <h2 className="text-lg font-black flex items-center gap-2 text-amber-900">
              {editingId ? <Pencil size={18} className="text-amber-600"/> : <Plus size={18} className="text-amber-600"/>} 
              {editingId ? 'Reprogramar Activo' : 'Coronar Nuevo Activo'}
            </h2>
            {editingId && <button onClick={resetForm} className="text-slate-400 hover:text-red-500 bg-slate-100 p-1 rounded-md"><X size={16}/></button>}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Referencia del Inmueble</label>
              <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" disabled={!!editingId} value={form.propertyRef} onChange={e => setForm({...form, propertyRef: e.target.value})} className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm font-bold outline-none transition-all ${editingId ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-slate-50 text-slate-800 border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500'}`} placeholder="Ej: SF-B2A0ZM" required />
              </div>
            </div>

            <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Ciudad / Zona Objetivo</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={form.targetCity} onChange={e => setForm({...form, targetCity: e.target.value})} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" placeholder="Ej: Madrid, Marbella..." required />
                </div>
            </div>

            {/* BOTONES UPLOAD CUSTOM */}
            <div className="grid grid-cols-2 gap-2 pt-1">
                <div onClick={() => !isUploading && handleTriggerUpload('LOGO')} className={`cursor-pointer rounded-xl border ${specialLogoUrl ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50/50'} p-2 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors`}>
                    <span className="block text-[9px] font-bold uppercase text-slate-600">Logo Custom</span>
                    {specialLogoUrl ? <img src={specialLogoUrl} className="w-6 h-6 mt-1 rounded-full object-cover border border-amber-200" alt="Logo" /> : <UploadCloud size={14} className="text-gray-400 mt-1"/>}
                </div>
                <div onClick={() => !isUploading && handleTriggerUpload('CASA')} className={`cursor-pointer rounded-xl border ${specialMainImageUrl ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50/50'} p-2 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors`}>
                    <span className="block text-[9px] font-bold uppercase text-slate-600">Foto Custom</span>
                    {specialMainImageUrl ? <img src={specialMainImageUrl} className="w-6 h-6 mt-1 rounded object-cover border border-amber-200" alt="Casa" /> : <UploadCloud size={14} className="text-gray-400 mt-1"/>}
                </div>
            </div>

            {/* RELOJ */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-inner mt-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-1.5 flex items-center gap-1.5">
                  <CalendarClock size={12}/> {editingId ? 'Nueva Duración (Días)' : 'Días en el Olimpo'}
              </label>
              <div className="flex gap-2.5">
                <input 
                    type="number" min={editingId ? 0 : 1} max={365} 
                    value={form.durationDays} 
                    onChange={e => {
                        let val = e.target.value;
                        if (val.length > 1 && val.startsWith('0')) val = val.replace(/^0+/, '');
                        setForm({...form, durationDays: val});
                    }}
                    className="w-full px-3 py-2 bg-black border border-slate-700 rounded-lg text-lg font-mono font-black text-amber-400 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500" 
                    placeholder="Ej: 7" required 
                />
                <span className="flex items-center text-xs font-bold text-amber-500 bg-slate-800 px-3 rounded-lg">DÍAS</span>
              </div>
            </div>

            <button type="submit" disabled={loading || isUploading} className={`w-full text-white font-black tracking-widest uppercase text-xs py-3.5 rounded-xl transition-all shadow-lg mt-2 ${editingId ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30' : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/30'}`}>
              {loading ? 'Operando...' : editingId ? 'Actualizar y Renovar' : 'Fijar en Top 10'}
            </button>
          </form>
        </div>

        {/* LISTA DE ACTIVOS TOP 10 */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 overflow-hidden">
          <h2 className="text-lg font-black mb-4 flex items-center gap-2"><Star size={18} className="text-amber-500"/> Activos Coronados Actualmente</h2>
          
          {loading ? <p className="text-sm font-bold text-slate-400 flex items-center gap-2"><Loader2 size={16} className="animate-spin"/> Escaneando radar...</p> : (
            <div className="space-y-3 relative">
              {campaigns.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Star size={32} className="mx-auto text-slate-300 mb-2"/>
                      <p className="text-sm font-bold text-slate-500">No hay ningún activo en el Top 10.</p>
                  </div>
              ) : campaigns.map((camp) => {
                const timeLeft = calculateTimeLeft(camp.expiresAt);
                const isExpirado = timeLeft === "Expirado";

                return (
                    <div key={camp.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${editingId === camp.id ? 'border-indigo-300 bg-indigo-50/50' : isExpirado ? 'border-red-200 bg-red-50/50' : 'border-amber-200 bg-gradient-to-r from-amber-50/50 to-white shadow-sm'}`}>
                      <div className="flex items-center gap-4 min-w-0">
                        
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shrink-0 border border-slate-800 shadow-md relative overflow-hidden">
                            {camp.customImage ? (
                                <img src={camp.customImage} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="bg"/>
                            ) : null}
                            <Star size={20} className={`fill-amber-400 text-amber-400 relative z-10 ${isExpirado ? 'opacity-50 grayscale' : ''}`} />
                            {!isExpirado && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white z-20"></div>}
                        </div>                        
                        
                        <div className="min-w-0 truncate">
                          <h4 className="font-black text-slate-900 leading-tight flex items-center gap-2 truncate text-sm">
                            {camp.property?.title || "Inmueble Desconocido"}
                            {(camp.customLogo || camp.customImage) && <span className="bg-indigo-100 text-indigo-600 text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest shrink-0">CUSTOM</span>}
                          </h4>
                          
                          <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                  REF: {camp.property?.refCode || "N/A"}
                              </span>
                              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                                  <MapPin size={10}/> {camp.targetCity}
                              </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center">
                        <div className={`flex items-center gap-1.5 px-3 py-1 font-bold text-xs rounded-full border shadow-sm ${isExpirado ? 'bg-red-100 text-red-700 border-red-200 animate-pulse' : 'bg-slate-900 text-amber-400 border-slate-800'}`}>
                           {isExpirado ? (
                               <>⚠️ CADUCADO</>
                           ) : (
                               <><Clock4 size={14} className="text-amber-500/80" /> {timeLeft}</>
                           )}
                        </div>

                        <div className="flex gap-1.5">
                            <button onClick={() => handleEdit(camp)} className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all shadow-sm"><Pencil size={16} /></button>
                            <button onClick={() => handleDelete(camp.id)} className="w-9 h-9 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm"><Trash2 size={16} /></button>
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