// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { getPropertyByIdAction, getActiveManagementAction, incrementStatsAction } from "@/app/actions";
import { 
    X, Heart, Phone, Sparkles, User, ShieldCheck, Briefcase, Star, Home, Maximize2, ArrowUp,
    Car, Trees, Waves, Sun, Box, Thermometer, Camera, Globe, Plane, Hammer, Ruler, Handshake, Coins,
    TrendingUp, Share2, Mail, FileCheck, Activity, MessageCircle, Sofa, Droplets, Paintbrush, Truck, 
    Bed, Bath, Copy, Check, Building2, Eye, ChevronDown, FileDown
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PropertyFlyer } from '../../pdf/PropertyFlyer';
import AgencyExtrasViewer from "./AgencyExtrasViewer";
import OpenHouseOverlay from "./OpenHouseOverlay";
import GuestList from "./GuestList";

const ICON_MAP: Record<string, any> = { 'pool': Waves, 'piscina': Waves, 'garage': Car, 'garaje': Car, 'parking': Car, 'garden': Trees, 'jardin': Trees, 'jardín': Trees, 'elevator': ArrowUp, 'ascensor': ArrowUp, 'terrace': Sun, 'terraza': Sun, 'storage': Box, 'trastero': Box, 'ac': Thermometer, 'aire': Thermometer, 'calefaccion': Thermometer, 'heating': Thermometer, 'security': ShieldCheck, 'seguridad': ShieldCheck, 'alarma': ShieldCheck, 'foto': Camera, 'video': Globe, 'drone': Plane, 'tour3d': Box, 'render': Hammer, 'plano': Ruler, 'plano_2d': Ruler, 'destacado': TrendingUp, 'ads': Share2, 'email': Mail, 'certificado': FileCheck, 'tasacion': Activity, 'homestaging': Sofa, 'limpieza': Droplets, 'pintura': Paintbrush, 'mudanza': Truck, 'abogado': Briefcase, 'exterior': Eye, 'interior': Home, 'furnished': Sofa, 'amueblado': Sofa, 'wardrobes': Box, 'armarios': Box };
const PHYSICAL_KEYWORDS = [ 'pool', 'piscina', 'garage', 'garaje', 'parking', 'garden', 'jardin', 'jardín', 'terrace', 'terraza', 'storage', 'trastero', 'ac', 'aire', 'security', 'seguridad', 'elevator', 'ascensor', 'lift', 'heating', 'calefaccion', 'furnished', 'amueblado' ];

export default function AgencyDetailsPanel({ selectedProp: initialProp, onClose, onToggleFavorite, favorites = [], onOpenInspector, agencyData: initialAgencyData, currentUser }: any) {
    const [selectedProp, setSelectedProp] = useState(initialProp);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showOpenHouse, setShowOpenHouse] = useState(true); 
    const [showB2BModal, setShowB2BModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedRef, setCopiedRef] = useState(false);
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    // ESTADO DE IDENTIDAD HÍBRIDO (Carga inmediata)
    // Prioridad inicial: 1. Agencia inyectada -> 2. Usuario de la propiedad -> 3. Usuario actual (si es suyo)
    const [activeOwner, setActiveOwner] = useState(() => {
        if (initialAgencyData) return initialAgencyData;
        if (initialProp?.user) return initialProp.user;
        if (currentUser && initialProp?.userId === currentUser.id) return currentUser;
        return {};
    });

    const [campaignData, setCampaignData] = useState<any>(null);

    // --- SENSORES ---
    useEffect(() => { if (selectedProp?.id) incrementStatsAction(selectedProp.id, 'view'); }, [selectedProp?.id]);
    const handleMainPhotoClick = () => { if (selectedProp?.id) incrementStatsAction(selectedProp.id, 'photo'); if (onOpenInspector) onOpenInspector(); };

    // --- PROTOCOLO DE AUTO-REPARACIÓN (SILENCIOSO) ---
    useEffect(() => {
        const verifyRealData = async () => {
            if (selectedProp?.id) {
                try {
                    const realData = await getPropertyByIdAction(selectedProp.id);
                    if (realData) {
                        setSelectedProp((prev: any) => ({ ...prev, ...realData, type: realData.type || prev.type }));
                        
                        // LÓGICA DE IDENTIDAD MEJORADA (Sin spinner)
                        let newOwner = {};
                        
                        // 1. Si hay campaña B2B activa, la agencia gestora MANDA
                        const mgmtRes = await getActiveManagementAction(selectedProp.id);
                        if (mgmtRes?.success && mgmtRes?.data?.agency) {
                            setCampaignData(mgmtRes.data);
                            newOwner = mgmtRes.data.agency;
                        } 
                        // 2. Si no, usamos el dueño real de la BD
                        else if (realData.user) {
                            newOwner = realData.user;
                        }
                        // 3. Si no viene dueño pero soy yo (Stock), me pongo yo
                        else if (currentUser && realData.userId === currentUser.id) {
                            newOwner = currentUser;
                        }

                        // Actualizamos solo si hay datos nuevos reales
                        if (Object.keys(newOwner).length > 0) {
                            setActiveOwner((prev: any) => ({ ...prev, ...newOwner }));
                        }
                    }
                } catch (error) { console.error("Error reparando datos:", error); }
            }
        };
        verifyRealData();
    }, [selectedProp?.id, currentUser]);

    // --- VUELO AUTOMÁTICO ---
    useEffect(() => {
        const lat = Number(selectedProp?.location?.lat || selectedProp?.lat);
        const lng = Number(selectedProp?.location?.lng || selectedProp?.lng);
        if (lat && lng && !isNaN(lat) && lat !== 0) {
            window.dispatchEvent(new CustomEvent("fly-to-location", { detail: { latitude: lat, longitude: lng, duration: 1.5 } }));
        }
    }, [selectedProp?.id, selectedProp?.lat]);

    // Helpers
    const copyRefCode = async () => { const ref = String(selectedProp?.refCode || ""); if (!ref) return; try { await navigator.clipboard.writeText(ref); } catch {} setCopiedRef(true); setTimeout(() => setCopiedRef(false), 2000); };
    const copyPhone = () => { navigator.clipboard.writeText(activeOwner.mobile || activeOwner.phone || ""); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    // DATOS DE DISPLAY
    const name = activeOwner.companyName || activeOwner.name || "Agencia";
    const roleLabel = (String(activeOwner.role).toUpperCase().includes('AGEN') || activeOwner.licenseType === 'PRO') ? "AGENCIA CERTIFICADA" : "PARTICULAR VERIFICADO";
    const avatar = activeOwner.companyLogo || activeOwner.avatar || activeOwner.image || null; // 🔥 Mapeo triple para asegurar foto
    const cover = activeOwner.coverImage || activeOwner.cover || null;
    
    // --- RENDER ---
    if (!selectedProp) return null;

    // ... (El resto del renderizado es idéntico, asegurando usar 'activeOwner' y 'avatar') ...
    // Para abreviar, uso la lógica de mapeo de iconos y renderizado estándar
    // ...
    
    // [AQUÍ IRÍA EL RESTO DEL JSX QUE YA TIENE, PERO USANDO LAS VARIABLES ARRIBA DEFINIDAS]
    // Voy a pegarle el JSX completo para evitar errores de corte.
    
    const allTags = new Set<string>();
    if (selectedProp?.selectedServices) { let s = selectedProp.selectedServices; (Array.isArray(s) ? s : String(s).split(',')).forEach(x => allTags.add(String(x).toLowerCase().trim())); }
    ['garage', 'pool', 'garden', 'terrace', 'elevator', 'ascensor', 'storage', 'ac', 'heating', 'furnished'].forEach(k => { if (selectedProp?.[k] === true || selectedProp?.[k] === 1) allTags.add(String(k).toLowerCase()); });
    const physicalItems: any[] = []; 
    allTags.forEach(tag => { if (!tag || ['elevator', 'ascensor'].includes(tag)) return; if (PHYSICAL_KEYWORDS.includes(tag)) physicalItems.push({ id: tag, label: (tag.charAt(0).toUpperCase() + tag.slice(1)), icon: ICON_MAP[tag] || Star }); });
    const hasElevator = allTags.has('elevator') || allTags.has('ascensor') || selectedProp?.elevator === true;
    const img = selectedProp?.img || (selectedProp?.images && selectedProp.images[0]) || "/placeholder.jpg";
    const m2 = Number(selectedProp?.mBuilt || selectedProp?.m2 || 0);
    const isFavorite = (favorites || []).some((f: any) => String(f?.id) === String(selectedProp?.id));
    const getEnergyColor = (l: string) => ({ A: "bg-green-600", B: "bg-green-500", C: "bg-green-400", D: "bg-yellow-400", E: "bg-yellow-500", F: "bg-orange-500", G: "bg-red-600" }[String(l).toUpperCase()] || "bg-gray-400");
    const cleanDescription = selectedProp?.description ? selectedProp.description.replace(/<[^>]+>/g, '') : null;

    // B2B Logic
    const sharePercent = Number(campaignData?.terms?.sharePct || selectedProp?.commissionSharePct || 0);
    const canSeeCommission = sharePercent > 0 && (String(currentUser?.role).toUpperCase().includes('AGEN') || String(currentUser?.role) === 'ADMIN');
    const numericPrice = Number(String(selectedProp?.price || "0").replace(/[^0-9]/g, ""));
    const formattedEarnings = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(numericPrice * (sharePercent / 100));

    return (
        <div className="fixed inset-y-0 left-0 w-full md:w-[480px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-left">
            <div className="absolute inset-0 bg-[#E5E5EA]/95 backdrop-blur-3xl shadow-2xl border-r border-white/20"></div>
            <div className="relative z-10 flex flex-col h-full text-slate-900">
                <div className="relative shrink-0 z-20 h-72 overflow-hidden bg-gray-100">
                    <div className="absolute inset-0">
                        {cover ? <img src={cover} className="w-full h-full object-cover" alt="Fondo" /> : <div className="w-full h-full bg-slate-200" />}
                    </div>
                    <div className="relative z-10 px-8 pt-12 pb-8 flex flex-col justify-between h-full">
                         <div className="flex justify-between items-start">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-2xl border border-white/50 rotate-1">
                                    {avatar ? <img src={avatar} className="w-full h-full rounded-xl object-cover bg-white" alt="Logo" /> : <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center"><User size={40} className="text-slate-300"/></div>}
                                </div>
                                <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white px-2 py-1 rounded-full border-[3px] border-white shadow-lg flex items-center gap-1"><ShieldCheck size={12} strokeWidth={3} /><span className="text-[9px] font-black uppercase tracking-widest">Verificado</span></div>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white cursor-pointer"><X size={20} /></button>
                         </div>
                         <div>
                            <h2 className="text-3xl font-black text-white leading-none mb-2 tracking-tight drop-shadow-md">{name}</h2>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg"><Briefcase size={12}/> {roleLabel}</span>
                            </div>
                         </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide pb-40 bg-[#F5F5F7]">
                    <div className="relative aspect-video w-full bg-gray-200 rounded-[24px] overflow-hidden shadow-lg border-4 border-white group">
                        <img src={img} onClick={handleMainPhotoClick} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer" alt="Propiedad" />
                        <div onClick={handleMainPhotoClick} className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"><Sparkles size={14}/> ABRIR FOTOS</div></div>
                    </div>

                    <div>
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 inline-block shadow-blue-200 shadow-sm">{selectedProp?.type || "INMUEBLE"}</span>
                      <h1 className="text-2xl font-black text-slate-900 leading-tight mb-1">{selectedProp?.title || "Sin Título"}</h1>
                      <div onClick={copyRefCode} className="text-[12px] text-slate-500 mb-2 flex items-center gap-2 cursor-pointer hover:text-slate-700 select-none"><span>Ref:</span><span className="font-mono text-slate-700">{selectedProp?.refCode}</span>{copiedRef ? <Check size={14} /> : <Copy size={14} />}</div>
                      <p className="text-3xl font-black text-slate-900 tracking-tight">{new Intl.NumberFormat("es-ES").format(Number(String(selectedProp?.price || 0).replace(/[^0-9]/g, "")))} €</p>
                    </div>

                    <div className="flex justify-between gap-2">
                        <div className="flex-1 bg-white p-2.5 rounded-2xl text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center"><span className="text-[8px] text-slate-400 font-bold uppercase mb-0.5">Hab.</span><div className="font-black text-base flex items-center gap-1"><Bed size={14}/> {selectedProp?.rooms || 0}</div></div>
                        <div className="flex-1 bg-white p-2.5 rounded-2xl text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center"><span className="text-[8px] text-slate-400 font-bold uppercase mb-0.5">Baños</span><div className="font-black text-base flex items-center gap-1"><Bath size={14}/> {selectedProp?.baths || 0}</div></div>
                        <div className="flex-1 bg-white p-2.5 rounded-2xl text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center"><span className="text-[8px] text-slate-400 font-bold uppercase mb-0.5">M²</span><div className="font-black text-base flex items-center gap-1"><Maximize2 size={14}/> {m2}</div></div>
                    </div>

                    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-white">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-gray-100 pb-2"><Home size={12} className="text-blue-500"/> Ficha Técnica</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span className="text-[8px] text-slate-400 font-bold uppercase block">Tipología</span><span className="font-bold text-xs text-slate-800">{selectedProp?.type || "Piso"}</span></div>
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span className="text-[8px] text-slate-400 font-bold uppercase block">Ascensor</span><span className={`font-bold text-xs ${hasElevator ? 'text-green-600' : 'text-slate-400'}`}>{hasElevator ? 'SÍ TIENE' : 'NO TIENE'}</span></div>
                            {physicalItems.map((item) => ( <div key={item.id} className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 flex justify-between items-center"><div><span className="text-[8px] text-blue-400 font-bold uppercase block">Incluido</span><span className="font-bold text-xs text-blue-900">{item.label}</span></div><item.icon size={14} className="text-blue-500"/></div> ))}
                        </div>
                    </div>

                   <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white transition-all duration-300">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Descripción</span>
                        <div className="relative"><p className={`text-slate-600 text-xs leading-relaxed whitespace-pre-line font-medium ${!isDescExpanded ? 'line-clamp-4' : ''}`}>{cleanDescription || "Sin descripción."}</p>{!isDescExpanded && cleanDescription && cleanDescription.length > 200 && <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent"></div>}</div>
                        {cleanDescription && cleanDescription.length > 200 && <button onClick={() => setIsDescExpanded(!isDescExpanded)} className="mt-3 text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:text-blue-800 transition-colors">{isDescExpanded ? (<>Leer menos <ArrowUp size={12}/></>) : (<>Leer descripción completa <ChevronDown size={12}/></>)}</button>}
                   </div>

                   <div className="mt-4"><AgencyExtrasViewer property={selectedProp} /></div>

                   {/* MÉTRICAS (VISIBLES SIEMPRE SI ERES AGENCIA/DUEÑO) */}
                   {(currentUser?.id === selectedProp?.userId || String(currentUser?.role).toUpperCase().includes('AGEN')) && (
                    <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white mt-3 animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-4"><Activity size={16} className="text-blue-600"/><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Métricas de Rendimiento</h3></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400"><Eye size={20}/></div><div><p className="text-2xl font-black text-slate-900 leading-none">{selectedProp?.views || 0}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vistas Ficha</p></div></div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400"><Camera size={20}/></div><div><p className="text-2xl font-black text-slate-900 leading-none">{selectedProp?.photoViews || 0}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vistas Fotos</p></div></div>
                             <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-rose-400"><Heart size={20} className="fill-current"/></div><div><p className="text-2xl font-black text-slate-900 leading-none">{selectedProp?.favoritedBy?.length || 0}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Guardado</p></div></div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-blue-400"><Share2 size={20}/></div><div><p className="text-2xl font-black text-slate-900 leading-none">{selectedProp?.shareCount || 0}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Compartido</p></div></div>
                        </div>
                    </div>
                   )}

                   <div className="h-32 w-full shrink-0"></div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-5 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex gap-3 z-20 relative">
                  {canSeeCommission && <button onClick={() => setShowB2BModal(true)} className="w-14 h-14 bg-gradient-to-br from-amber-200 to-yellow-400 text-yellow-900 rounded-[20px] border border-yellow-300 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 animate-pulse-slow z-50 relative"><Handshake size={24} strokeWidth={2.5} /></button>}
                  <button onClick={() => setShowContactModal(true)} className="flex-1 h-14 bg-[#1c1c1e] text-white rounded-[20px] font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 uppercase tracking-wider text-xs"><Phone size={18} /> Contactar Agente</button>
                  {currentUser && <PDFDownloadLink document={<PropertyFlyer property={selectedProp} agent={activeOwner} />} fileName={`Ficha_${selectedProp.refCode || 'Stratos'}.pdf`} className="w-14 h-14 bg-white rounded-[20px] border border-slate-200 flex items-center justify-center shadow-sm hover:text-blue-600 hover:bg-blue-50 active:scale-90">{({ loading }) => ( loading ? <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div> : <FileDown size={22} /> )}</PDFDownloadLink>}
                  <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("open-chat-signal", { detail: { propertyId: String(selectedProp?.id || ""), toUserId: String(activeOwner.id || "") } })); }} className="w-14 h-14 bg-white rounded-[20px] border border-slate-200 flex items-center justify-center shadow-sm hover:text-blue-600 hover:bg-blue-50"><MessageCircle size={22} /></button>
                  <button onClick={() => onToggleFavorite && onToggleFavorite({ ...selectedProp, isFav: !isFavorite })} className={`w-14 h-14 bg-white rounded-[20px] border border-slate-200 flex items-center justify-center shadow-sm ${isFavorite ? "text-red-500 bg-red-50 border-red-100" : "text-slate-400 hover:text-red-500"}`}><Heart size={24} fill={isFavorite ? "currentColor" : "none"} /></button>
                </div>

                {showContactModal && (
                    <div className="absolute inset-0 z-50 flex flex-col justify-end animate-fade-in bg-black/60 backdrop-blur-sm">
                        <div onClick={() => setShowContactModal(false)} className="absolute inset-0 cursor-pointer"></div>
                        <div className="relative bg-[#F5F5F7] rounded-t-[32px] overflow-hidden shadow-2xl animate-slide-up mx-2 mb-2 pb-6 ring-1 ring-white/20">
                            <div className="relative h-36 bg-gray-100 flex items-end p-6 gap-4">
                                <div className="absolute inset-0">{cover ? <img src={cover} className="w-full h-full object-cover opacity-90" alt="Fondo" /> : <div className="w-full h-full bg-slate-200" />}</div>
                                <div className="relative z-10 w-20 h-20 rounded-2xl bg-white p-1 shadow-xl border border-white/20 mb-1">{avatar ? <img src={avatar} className="w-full h-full rounded-xl object-cover" alt="Avatar" /> : <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center"><User className="text-slate-300" size={32}/></div>}</div>
                                <div className="relative z-10 mb-2 flex-1 min-w-0"><h3 className="text-white font-black text-2xl leading-none mb-1 drop-shadow-md truncate">{name}</h3><p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-full w-fit border border-emerald-500/30 backdrop-blur-md"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> En línea</p></div>
                                <button onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white z-20 bg-black/20 hover:bg-black/50 p-2 rounded-full backdrop-blur-md transition-all"><X size={18}/></button>
                            </div>
                            <div className="px-6 pt-6 space-y-3">
                                <div onClick={copyPhone} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors active:scale-95 group"><div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center border border-[#C8E6C9] group-hover:scale-110 transition-transform"><Phone size={22} strokeWidth={2.5} /></div><div className="flex-1"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Teléfono / WhatsApp</p><p className="text-xl font-black text-slate-900 tracking-tight">{activeOwner.mobile || activeOwner.phone || "No disponible"}</p></div></div>
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 group"><div className="w-12 h-12 rounded-2xl bg-[#E3F2FD] text-[#1565C0] flex items-center justify-center border border-[#BBDEFB] group-hover:scale-110 transition-transform"><Mail size={22} strokeWidth={2.5} /></div><div className="flex-1 overflow-hidden"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Corporativo</p><p className="text-sm font-black text-slate-900 truncate">{activeOwner.email || "No disponible"}</p></div></div>
                                <button onClick={() => setShowContactModal(false)} className="w-full py-4 bg-[#1c1c1e] text-white font-bold rounded-2xl uppercase tracking-[0.2em] text-xs mt-2 shadow-xl hover:bg-black transition-all active:scale-95">Cerrar Ficha</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}