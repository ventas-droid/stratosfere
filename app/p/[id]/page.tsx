"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPropertyByIdAction, getActiveManagementAction, incrementStatsAction, submitLeadAction } from "@/app/actions";
import { Loader2, Phone, Mail, ShieldCheck, Check, MapPin, Maximize2, Bed, Bath, User, Briefcase, Camera, Send, Eye, Heart, Share2, Activity, Home, Building2, ArrowUp, FileDown, Calendar } from "lucide-react";
import { toast, Toaster } from "sonner";
import { PDFDownloadLink } from '@react-pdf/renderer';
import AgencyExtrasViewer from "../../components/alive-map/ui-panels/AgencyExtrasViewer";

// IMPORTAMOS SU ARSENAL TÁCTICO (Asegúrese de que las rutas sean correctas)
import { PropertyFlyer } from "../../components/pdf/PropertyFlyer";
import HoloInspector from "../../components/alive-map/ui-panels/HoloInspector";
import OpenHouseOverlay from "../../components/alive-map/ui-panels/OpenHouseOverlay";

export default function PremiumPublicPropertyPage() {
    const params = useParams();
    const propertyId = params?.id as string;

    const [prop, setProp] = useState<any>(null);
    const [owner, setOwner] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Controles de Interfaz
    const [showHolo, setShowHolo] = useState(false);
    const [showOpenHouse, setShowOpenHouse] = useState(false);
    const [sending, setSending] = useState(false);
    const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', message: '' });

    useEffect(() => {
        if (!propertyId) return;

        const loadData = async () => {
            try {
                const res = await getPropertyByIdAction(propertyId);
                if (res?.success && res?.data) {
                    setProp(res.data);
                    incrementStatsAction(res.data.id, 'view');

                    const mgmt = await getActiveManagementAction(res.data.id);
                    if (mgmt?.success && mgmt?.data?.agency) {
                        setOwner(mgmt.data.agency);
                    } else {
                        setOwner(res.data.user || res.data.ownerSnapshot || {});
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [propertyId]);

    const handleSendLead = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        const res = await submitLeadAction({
            propertyId: prop.id,
            name: leadForm.name,
            email: leadForm.email,
            phone: leadForm.phone,
            message: leadForm.message || `Hola, solicito información sobre la REF: ${prop.refCode}`,
            source: "PUBLIC_LINK"
        });
        setSending(false);

        if (res.success) {
            toast.success("Mensaje Enviado", { description: "Nos pondremos en contacto con usted a la brevedad." });
            setLeadForm({ name: '', email: '', phone: '', message: '' });
        } else {
            toast.error("Error al enviar", { description: "Inténtelo de nuevo." });
        }
    };

    if (loading || !prop) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <Loader2 className="text-blue-600 animate-spin mb-4" size={40} />
                <p className="text-slate-400 font-black tracking-widest uppercase text-xs animate-pulse">Cargando Expediente...</p>
            </div>
        );
    }

    const img = prop.img || (prop.images && prop.images[0]) || "/placeholder.jpg";
    const avatar = owner?.companyLogo || owner?.avatar || null;
    const isAgency = String(owner?.role || "").toUpperCase().includes("AGEN");
    const priceFormatted = new Intl.NumberFormat("es-ES").format(Number(String(prop.price).replace(/\D/g, '')));

   return (
        <div className="h-[100dvh] w-full overflow-y-auto custom-scrollbar bg-[#F5F5F7] font-sans selection:bg-blue-500 selection:text-white pb-20">
            <Toaster position="bottom-center" richColors />

            {/* 1. CABECERA CINEMÁTICA CON BOTÓN HOLOINSPECTOR */}
            <div className="relative w-full h-[50vh] bg-slate-900 group cursor-pointer" onClick={() => setShowHolo(true)}>
                <img src={img} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000" alt="Propiedad" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#F5F5F7] via-transparent to-black/50" />
                
                {/* Branding Superior */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
                    <div className="text-white text-2xl font-black tracking-tighter drop-shadow-md">
                        Stratosfere OS<span className="text-blue-500">.</span>
                    </div>
                </div>

                {/* Botón Central HoloInspector */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full text-slate-900 font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                        <Camera size={16} className="text-blue-600"/> Ver Galería 3D
                    </div>
                </div>
            </div>

            {/* 2. CONTENIDO PRINCIPAL */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-20 relative z-20">
                
                {/* Título y Precio */}
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                            {prop.type || "Inmueble"}
                        </span>
                        <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                            REF: {prop.refCode}
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-2 tracking-tight">
                        {prop.title}
                    </h1>
                    <div className="flex items-center gap-1.5 text-slate-500 mb-6 mt-2">
                        <MapPin size={18} className="text-indigo-500" />
                        <span className="text-sm font-bold uppercase tracking-wide">{prop.city || prop.address || "Ubicación Privada"}</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter">
                            {priceFormatted} <span className="text-2xl text-slate-400 font-bold align-top">€</span>
                        </p>
                    </div>
                </div>

                {/* Grid Doble: Detalles + Métricas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    
                    {/* INFO BÁSICA */}
                    <div className="lg:col-span-2 grid grid-cols-3 gap-3">
                        <div className="bg-white p-5 rounded-3xl text-center shadow-sm border border-slate-100">
                            <Bed size={24} className="text-slate-400 mx-auto mb-2"/>
                            <p className="font-black text-xl text-slate-900">{prop.rooms || 0}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Habitaciones</p>
                        </div>
                        <div className="bg-white p-5 rounded-3xl text-center shadow-sm border border-slate-100">
                            <Bath size={24} className="text-slate-400 mx-auto mb-2"/>
                            <p className="font-black text-xl text-slate-900">{prop.baths || 0}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Baños</p>
                        </div>
                        <div className="bg-white p-5 rounded-3xl text-center shadow-sm border border-slate-100">
                            <Maximize2 size={24} className="text-slate-400 mx-auto mb-2"/>
                            <p className="font-black text-xl text-slate-900">{prop.mBuilt || prop.m2 || 0}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metros M²</p>
                        </div>
                    </div>

                    {/* MÉTRICAS (Efecto de Deseabilidad) */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
                            <Activity size={16} className="text-blue-600"/>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Interés del Mercado</h3>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2 text-slate-600"><Eye size={16} className="text-slate-400"/> <span className="text-xs font-bold uppercase">Visitas</span></div>
                            <span className="font-black text-slate-900">{prop.views || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-slate-600"><Heart size={16} className="text-rose-400 fill-rose-100"/> <span className="text-xs font-bold uppercase">Guardados</span></div>
                            <span className="font-black text-slate-900">{prop.favoritedBy?.length || 0}</span>
                        </div>
                    </div>
                </div>

               {/* 🔥 BLOQUE OPEN HOUSE DE LUJO (Idéntico a AgencyDetails) 🔥 */}
                <div className="mb-6">
                    <AgencyExtrasViewer
                        property={prop}
                        onOpenHouseClick={() => setShowOpenHouse(true)}
                    />
                </div>

                {/* FICHA TÉCNICA (Características) */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-50 pb-3">
                        <Home size={14} className="text-blue-500"/> Ficha Técnica Completa
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {prop.elevator && <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2"><ArrowUp size={16} className="text-slate-400"/><span className="text-xs font-bold text-slate-700">Ascensor</span></div>}
                        {prop.pool && <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-2"><Activity size={16} className="text-blue-500"/><span className="text-xs font-bold text-blue-900">Piscina</span></div>}
                        {prop.garage && <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2"><Activity size={16} className="text-slate-400"/><span className="text-xs font-bold text-slate-700">Garaje</span></div>}
                        {prop.terrace && <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2"><Activity size={16} className="text-slate-400"/><span className="text-xs font-bold text-slate-700">Terraza</span></div>}
                        {prop.garden && <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex items-center gap-2"><Activity size={16} className="text-green-500"/><span className="text-xs font-bold text-green-900">Jardín</span></div>}
                        {prop.communityFees > 0 && <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2"><Building2 size={16} className="text-slate-400"/><span className="text-xs font-bold text-slate-700">Comunidad: {prop.communityFees}€</span></div>}
                    </div>
                </div>

                {/* DESCRIPCIÓN */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-50 pb-3">Descripción de la Propiedad</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                        {prop.description || "Exclusiva propiedad disponible. Solicite información para conocer todos los detalles."}
                    </p>
                </div>

                {/* ZONA DE CONTACTO Y DESCARGAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    
                    {/* Tarjeta del Agente */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-inner mb-4 flex items-center justify-center">
                            {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="Agente"/> : <User size={32} className="text-slate-400"/>}
                        </div>
                        <h2 className="text-lg font-black text-slate-900 leading-tight mb-1">{owner?.companyName || owner?.name || "Agencia Exclusiva"}</h2>
                        <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider mb-6">
                            {isAgency ? "Agencia Certificada" : "Particular Verificado"}
                        </p>
                        
                        {/* Botón Descarga PDF */}
                        <div className="w-full">
                            <PDFDownloadLink document={<PropertyFlyer property={prop} agent={owner} />} fileName={`Ficha_${prop.refCode || 'Stratos'}.pdf`} className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                                {({ loading }) => ( loading ? <Loader2 className="animate-spin" size={18} /> : <><FileDown size={18}/> Descargar Dossier PDF</> )}
                            </PDFDownloadLink>
                        </div>
                    </div>

                 {/* Formulario de Contacto */}
                    <div id="lead-contact-form" className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 scroll-mt-20">
                        <h3 className="text-lg font-black text-slate-900 mb-1">Solicitar Visita</h3>
                        <p className="text-xs text-slate-500 font-medium mb-5">Le contactaremos inmediatamente.</p>
                        
                        <form onSubmit={handleSendLead} className="space-y-3">
                            <input className="w-full p-3.5 bg-slate-50 rounded-xl text-sm font-bold text-slate-900 border border-slate-200 focus:border-blue-500 outline-none" placeholder="Nombre Completo" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} required />
                            <input type="email" className="w-full p-3.5 bg-slate-50 rounded-xl text-sm font-bold text-slate-900 border border-slate-200 focus:border-blue-500 outline-none" placeholder="Email" value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} required />
                            <input type="tel" className="w-full p-3.5 bg-slate-50 rounded-xl text-sm font-bold text-slate-900 border border-slate-200 focus:border-blue-500 outline-none" placeholder="Teléfono" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} required />
                            <button type="submit" disabled={sending} className="w-full py-4 bg-[#1c1c1e] hover:bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all mt-2">
                                {sending ? <Loader2 className="animate-spin" size={16}/> : <Send size={16}/>} {sending ? "Enviando..." : "Enviar Solicitud"}
                            </button>
                        </form>
                    </div>
                </div>

            </div>

            {/* MODALES TÁCTICOS */}
            <HoloInspector prop={prop} isOpen={showHolo} onClose={() => setShowHolo(false)} />
            
        {showOpenHouse && (
                <OpenHouseOverlay 
                    property={{ ...prop, openHouse: prop.openHouse || prop.open_house_data }} 
                    onClose={() => setShowOpenHouse(false)} 
                    isOrganizer={false} 
                    isGuest={true} 
                />
            )}
        </div>
    );
}