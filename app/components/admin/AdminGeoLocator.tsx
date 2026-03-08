"use client";
import React, { useState, useEffect, useRef } from 'react';
import { getAdminZoneCampaignsAction, createZoneCampaignAction, updateZoneCampaignAction, deleteZoneCampaignAction, uploadLocalImageAction } from '@/app/actions-zones';
import { Crown, MapPin, Trash2, Plus, Building2, Home, UploadCloud, X, Layout, Pencil, Loader2, CalendarClock, Clock4, TimerReset, Eye, Flame, Crosshair, Navigation, Search, CheckCircle2 } from 'lucide-react';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw';

export default function AdminGeoLocator() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [now, setNow] = useState(new Date());

  const [editingId, setEditingId] = useState<string | null>(null);
  const [specialLogoUrl, setSpecialLogoUrl] = useState<string | null>(null);
  const [specialMainImageUrl, setSpecialMainImageUrl] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    postalCode: "", agencyId: "", propertyRef: "", subtitle: "", customBio: "",
    durationDays: "15", // 🔥 STRING PARA EVITAR CEROS FANTASMAS
    latitude: "", 
    longitude: "" 
  });

  const [geoSearch, setGeoSearch] = useState("");
  const [isSearchingGeo, setIsSearchingGeo] = useState(false);
  const [geoResult, setGeoResult] = useState<{lat: number, lng: number, address: string} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingType, setUploadingType] = useState<'LOGO' | 'CASA' | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    const res = await getAdminZoneCampaignsAction();
    if (res.success && res.data) setCampaigns(res.data);
    setLoading(false);
  };

  useEffect(() => { 
    loadData(); 
    const savedForm = sessionStorage.getItem('sniper_form_data');
    if (savedForm) {
        const parsed = JSON.parse(savedForm);
        setForm({
            postalCode: parsed.postalCode || "",
            agencyId: parsed.agencyId || "",
            propertyRef: parsed.propertyRef || "", 
            subtitle: parsed.subtitle || "",
            customBio: parsed.customBio || "",
            durationDays: parsed.durationDays !== undefined ? String(parsed.durationDays) : "15",
            latitude: parsed.latitude || "",
            longitude: parsed.longitude || ""
        });
    }
    const savedLogo = sessionStorage.getItem('sniper_form_logo');
    if (savedLogo) setSpecialLogoUrl(savedLogo);
    const savedImage = sessionStorage.getItem('sniper_form_image');
    if (savedImage) setSpecialMainImageUrl(savedImage);
    const savedEditId = sessionStorage.getItem('sniper_editing_id');
    if (savedEditId) setEditingId(savedEditId);

    setIsHydrated(true); 
  }, []);

  useEffect(() => { if (isHydrated) sessionStorage.setItem('sniper_form_data', JSON.stringify(form)); }, [form, isHydrated]);
  useEffect(() => { if (isHydrated) specialLogoUrl ? sessionStorage.setItem('sniper_form_logo', specialLogoUrl) : sessionStorage.removeItem('sniper_form_logo'); }, [specialLogoUrl, isHydrated]);
  useEffect(() => { if (isHydrated) specialMainImageUrl ? sessionStorage.setItem('sniper_form_image', specialMainImageUrl) : sessionStorage.removeItem('sniper_form_image'); }, [specialMainImageUrl, isHydrated]);
  useEffect(() => { if (isHydrated) editingId ? sessionStorage.setItem('sniper_editing_id', editingId) : sessionStorage.removeItem('sniper_editing_id'); }, [editingId, isHydrated]);

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

  const handleTriggerUpload = (type: 'LOGO' | 'CASA') => {
    setUploadingType(type);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingType) return;

    const MAX_SIZE_MB = 20; 
    const sizeEnMB = file.size / (1024 * 1024);

    if (sizeEnMB > MAX_SIZE_MB) {
        alert(`⚠️ ARCHIVO DEMASIADO PESADO: La imagen pesa ${sizeEnMB.toFixed(2)} MB. El límite máximo permitido es de ${MAX_SIZE_MB} MB.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setUploadingType(null);
        return; 
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadLocalImageAction(formData, uploadingType);
      
      if (res.success && res.url) {
          if (uploadingType === 'LOGO') setSpecialLogoUrl(res.url);
          if (uploadingType === 'CASA') setSpecialMainImageUrl(res.url);
      } else { alert(res?.error || "Error de subida"); }
    } catch (error) { alert("🚨 Error crítico de subida."); } 
    finally { setIsUploading(false); setUploadingType(null); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleSearchGeo = async () => {
      if (!geoSearch) return;
      setIsSearchingGeo(true);
      try {
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(geoSearch)}.json?access_token=${MAPBOX_TOKEN}&country=es&limit=1`;
          const res = await fetch(url);
          const data = await res.json();
          
          if (data.features && data.features.length > 0) {
              const [lng, lat] = data.features[0].center;
              const placeName = data.features[0].place_name;
              setGeoResult({ lat, lng, address: placeName });
          } else {
              alert("❌ Satélite: No se encontraron coordenadas para esta dirección.");
              setGeoResult(null);
          }
      } catch (e) {
          alert("🚨 Error de conexión con el satélite Mapbox.");
      }
      setIsSearchingGeo(false);
  };

  // 🔥 ENVÍO CON MOTOR MATEMÁTICO ABSOLUTO Y RAYO MCQUEEN
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.postalCode || !form.agencyId || !form.propertyRef) return alert("Faltan datos obligatorios");
    setLoading(true);
    
    const { durationDays, latitude, longitude, ...restOfForm } = form;
    const targetDays = parseInt(String(durationDays), 10) || 0;
    
    // 🔥 FECHA DE MUERTE EXACTA
    const absoluteDeathDate = new Date(now.getTime() + targetDays * 24 * 60 * 60 * 1000);

    const latNum = latitude ? parseFloat(String(latitude).replace(',', '.')) : undefined;
    const lngNum = longitude ? parseFloat(String(longitude).replace(',', '.')) : undefined;

    let res: any; // 🛡️ BLINDAJE TYPESCRIPT: Evita que la app colapse al compilar
    if (editingId) {
        res = await updateZoneCampaignAction(editingId, { 
            ...restOfForm, 
            campaignLogo: specialLogoUrl, 
            campaignMainImage: specialMainImageUrl, 
            expiresAt: absoluteDeathDate, // 💥 MACHACA LA FECHA
            durationToAdd: 0,             // Bloquea la suma 
            latitude: latNum, 
            longitude: lngNum
        });
    } else {
        res = await createZoneCampaignAction({ 
            ...restOfForm, 
            durationDays: targetDays, 
            campaignLogo: specialLogoUrl, 
            campaignMainImage: specialMainImageUrl 
        });
        if (res.success && res.data?.id && (latNum !== undefined || lngNum !== undefined)) {
            await updateZoneCampaignAction(res.data.id, { latitude: latNum, longitude: lngNum });
        }
    }

    if (res.success) {
      alert(editingId ? "✅ Campaña Geolocalizada Actualizada" : "✅ Campaña Geolocalizada Desplegada");
      
      // 🏎️💨 LAS BENGALAS DE RAYO MCQUEEN AL MAPA
      if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('reload-vip-agencies'));
          window.dispatchEvent(new CustomEvent('force-map-refresh'));
      }

      resetForm();
      loadData();
    } else { alert(res?.error || "Error"); }
    setLoading(false);
  };

  // 🔥 EDICIÓN Y CÁLCULO DE DÍAS
  const handleEdit = (camp: any) => {
    setEditingId(camp.id);
    
    let currentDays = 0;
    if (camp.expiresAt) {
        const diff = new Date(camp.expiresAt).getTime() - new Date().getTime();
        currentDays = diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
    }

    setForm({ 
        postalCode: camp.postalCode || "", 
        agencyId: camp.agencyId || "", 
        propertyRef: camp.property?.refCode || "", 
        subtitle: camp.subtitle || "", 
        customBio: camp.customBio || "",
        durationDays: currentDays > 0 ? String(currentDays) : "", // 🔥 STRING LIMPIO
        latitude: camp.latitude ? String(camp.latitude) : "", 
        longitude: camp.longitude ? String(camp.longitude) : ""
    });
    setSpecialLogoUrl(camp.campaignLogo || null);
    setSpecialMainImageUrl(camp.campaignMainImage || null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Liberar esta zona?")) return;
    setLoading(true);
    const res = await deleteZoneCampaignAction(id);
    if (res.success) {
        // 🏎️💨 BENGALA DE BORRADO INSTANTÁNEO
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('reload-vip-agencies'));
        }
        loadData();
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ postalCode: "", agencyId: "", propertyRef: "", subtitle: "", customBio: "", durationDays: "15", latitude: "", longitude: "" });
    setSpecialLogoUrl(null);
    setSpecialMainImageUrl(null);
    setGeoResult(null);
    setGeoSearch("");
    sessionStorage.removeItem('sniper_form_data');
    sessionStorage.removeItem('sniper_form_logo');
    sessionStorage.removeItem('sniper_form_image');
    sessionStorage.removeItem('sniper_editing_id');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in text-slate-800">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg, image/png, image/webp" />

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><Crosshair size={32} /></div>
        <div>
            <h1 className="text-2xl font-black tracking-tight text-emerald-900">Geo Sniper VIP</h1>
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Fijación de Coordenadas de Agencia</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-[24px] shadow-[0_10px_40px_rgba(16,185,129,0.1)] border border-emerald-100 h-fit relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          
          <div className="flex items-center justify-between mb-4 mt-2">
              <h2 className="text-lg font-black flex items-center gap-2 text-emerald-900">
                {editingId ? <Pencil size={18} className="text-emerald-600"/> : <Crosshair size={18} className="text-emerald-600"/>}
                {editingId ? 'Reprogramar Misil' : 'Fijar Nuevo Objetivo'}
              </h2>
              {editingId && <button onClick={resetForm} className="text-slate-400 hover:text-red-500 bg-slate-100 p-1 rounded-md"><X size={16}/></button>}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">CP Objetivo</label>
                    <input type="text" value={form.postalCode} onChange={e => setForm({...form, postalCode: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" placeholder="Ej: 29604" required />
                </div>
                <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">ID Agencia</label>
                    <input type="text" value={form.agencyId} onChange={e => setForm({...form, agencyId: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" placeholder="Ej: cmxyz..." required />
                </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-indigo-600 mb-1">Ref Activo Estrella</label>
              <input type="text" value={form.propertyRef} onChange={e => setForm({...form, propertyRef: e.target.value})} className="w-full px-3 py-2 bg-indigo-50/50 border border-indigo-200 rounded-lg text-xs font-bold" placeholder="Ej: SF-B2A0ZM" required />
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mt-2 shadow-inner">
                <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-1.5">
                    <Search size={14}/> Radar Localizador (Asistente)
                </label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={geoSearch} 
                        onChange={e => setGeoSearch(e.target.value)} 
                        className="w-full px-3 py-2 bg-black border border-slate-700 rounded-lg text-xs font-medium text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500" 
                        placeholder="Ej: Avenida Cumbres 13, 29692" 
                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleSearchGeo(); } }}
                    />
                    <button 
                        type="button" 
                        onClick={handleSearchGeo}
                        disabled={isSearchingGeo || !geoSearch}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50"
                    >
                        {isSearchingGeo ? <Loader2 size={16} className="animate-spin"/> : 'Buscar'}
                    </button>
                </div>
                
                {geoResult && (
                    <div className="mt-3 p-3 bg-emerald-900/40 border border-emerald-500/30 rounded-lg flex flex-col gap-2 animate-fade-in">
                        <p className="text-[10px] text-emerald-300/80 leading-tight">📍 {geoResult.address}</p>
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] font-mono font-bold text-emerald-400">{geoResult.lat.toFixed(5)}, {geoResult.lng.toFixed(5)}</span>
                            <button 
                                type="button"
                                onClick={() => {
                                    setForm({...form, latitude: String(geoResult.lat), longitude: String(geoResult.lng)});
                                    setGeoResult(null);
                                    setGeoSearch("");
                                }}
                                className="bg-emerald-500 text-black hover:bg-emerald-400 px-3 py-1.5 rounded flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-transform hover:scale-105"
                            >
                                <CheckCircle2 size={12}/> Aplicar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 mt-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-3 flex items-center gap-1.5"><Navigation size={14}/> Coordenadas Finales</label>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <span className="text-[9px] font-bold text-emerald-600 uppercase">Latitud</span>
                        <input type="text" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} className="w-full px-2 py-2 mt-1 bg-white border border-emerald-200 rounded-lg text-sm font-mono focus:ring-1 focus:ring-emerald-500" placeholder="Ej: 36.5161" />
                    </div>
                    <div>
                        <span className="text-[9px] font-bold text-emerald-600 uppercase">Longitud</span>
                        <input type="text" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} className="w-full px-2 py-2 mt-1 bg-white border border-emerald-200 rounded-lg text-sm font-mono focus:ring-1 focus:ring-emerald-500" placeholder="Ej: -4.8824" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
                <div onClick={() => !isUploading && handleTriggerUpload('LOGO')} className={`cursor-pointer rounded-xl border ${specialLogoUrl ? 'border-amber-100 bg-amber-50' : 'border-gray-100 bg-gray-50/50'} p-2 flex flex-col items-center justify-center text-center group`}>
                    <span className="block text-[9px] font-bold uppercase text-slate-600">Logo Cust.</span>
                    {specialLogoUrl ? <img src={specialLogoUrl} className="w-6 h-6 mt-1 rounded-full object-cover" alt="Logo" /> : <UploadCloud size={14} className="text-gray-400 mt-1"/>}
                </div>
                <div onClick={() => !isUploading && handleTriggerUpload('CASA')} className={`cursor-pointer rounded-xl border ${specialMainImageUrl ? 'border-indigo-100 bg-indigo-50' : 'border-gray-100 bg-gray-50/50'} p-2 flex flex-col items-center justify-center text-center group`}>
                    <span className="block text-[9px] font-bold uppercase text-slate-600">Casa Cust.</span>
                    {specialMainImageUrl ? <img src={specialMainImageUrl} className="w-6 h-6 mt-1 rounded object-cover" alt="Casa" /> : <UploadCloud size={14} className="text-gray-400 mt-1"/>}
                </div>
            </div>

            {/* 🔥 GÉNERADOR DE TIEMPO CON ESCUDO ANTI-CEROS 🔥 */}
            <div className="bg-[#1C1C1E] p-4 rounded-xl border border-[#3A3A3C] shadow-inner mt-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1.5 flex items-center gap-1.5">
                  <CalendarClock size={12}/> {editingId ? 'Nueva Duración (Días desde hoy)' : 'Días de Campaña'}
              </label>
              <div className="flex gap-2.5">
                <input 
                    type="number" 
                    min={editingId ? 0 : 1}
                    max={365} 
                    value={form.durationDays} 
                    onChange={e => {
                        let val = e.target.value;
                        // 🔥 Escudo anti-ceros ("030" -> "30")
                        if (val.length > 1 && val.startsWith('0')) {
                            val = val.replace(/^0+/, '');
                        }
                        setForm({...form, durationDays: val});
                    }}
                    className="w-full px-3 py-2 bg-black border border-[#3A3A3C] rounded-lg text-lg font-mono font-black text-emerald-300 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                    placeholder="Ej: 30" 
                    required 
                />
                <span className="flex items-center text-xs font-bold text-emerald-500 bg-[#3A3A3C] px-3 rounded-lg">DÍAS</span>
              </div>
            </div>

            <button type="submit" disabled={loading || isUploading} className={`w-full text-white font-black tracking-widest uppercase text-xs py-3.5 rounded-xl transition-all shadow-lg mt-2 ${editingId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              {loading ? 'Operando...' : editingId ? 'Actualizar Coordenadas y Tiempo' : 'Clavar Pin en el Mapa'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 overflow-hidden">
          <h2 className="text-lg font-black mb-4 flex items-center gap-2"><MapPin size={18}/> Zonas Activas en el Mapa</h2>
          {loading ? <p className="text-sm font-bold text-slate-400">Cargando mapa estratégico...</p> : (
            <div className="space-y-3 relative">
              {campaigns.map((camp) => {
                const timeLeft = calculateTimeLeft(camp.expiresAt);
                const isExpirado = timeLeft === "Expirado";
                const hasExactCoords = camp.latitude && camp.longitude;

                return (
                    <div key={camp.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${editingId === camp.id ? 'border-emerald-300 bg-emerald-50/50' : isExpirado ? 'border-red-200 bg-red-50/50' : 'border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md'}`}>
                      <div className="flex items-center gap-4 min-w-0">
                        
                        <div className="flex items-center gap-1.5 h-12 px-4 bg-gradient-to-br from-emerald-200 via-emerald-100 to-emerald-300 border border-emerald-300/60 rounded-[14px] shadow-[0_2px_10px_rgba(16,185,129,0.15)] shrink-0 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <MapPin size={16} className="text-emerald-700/80 drop-shadow-sm relative z-10" />
                            <span className="font-black text-emerald-950 text-sm tracking-widest relative z-10">{camp.postalCode}</span>
                        </div>                        
                        
                        <div className="min-w-0 truncate">
                          <h4 className="font-black text-slate-900 leading-tight flex items-center gap-2 truncate">
                            {camp.agency?.companyName || camp.agency?.name || "Agencia"}
                            {(camp.campaignLogo || camp.campaignMainImage) && <span className="bg-indigo-100 text-indigo-600 text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest shrink-0">CUSTOM</span>}
                          </h4>
                          
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 truncate">REF ESTRELLA: {camp.property?.refCode || "Sin Ref"}</p>
                          
                          <div className="flex items-center gap-2 mt-2">
                              {hasExactCoords ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-200">
                                      <Crosshair size={10} /> Precisión Exacta
                                  </span>
                              ) : (
                                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-slate-200">
                                      Centro del C.P.
                                  </span>
                              )}

                              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100 text-[9px] font-black uppercase tracking-widest">
                                  <Eye size={12} className="text-blue-500" /> {camp.clicks || 0}
                              </span>
                              <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md border border-orange-100 text-[9px] font-black uppercase tracking-widest">
                                  <Flame size={12} className="text-orange-500" /> {camp.leads || 0}
                              </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center">
                        <div className={`flex items-center gap-1.5 px-3 py-1 font-bold text-xs rounded-full border shadow-sm ${timeLeft ? isExpirado ? 'bg-red-100 text-red-700 border-red-200 animate-pulse' : 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                           {timeLeft ? (
                               isExpirado ? (
                                   <>⚠️ EXPIRADO</>
                               ) : (
                                   <><Clock4 size={14} className="text-amber-500" /> {timeLeft}</>
                               )
                           ) : (
                               <><TimerReset size={14} className="text-slate-400" /> Vitalicia</>
                           )}
                        </div>

                        <div className="flex gap-1.5">
                            <button onClick={() => handleEdit(camp)} className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all shadow-sm" title="Ajustar Coordenadas"><Pencil size={16} /></button>
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