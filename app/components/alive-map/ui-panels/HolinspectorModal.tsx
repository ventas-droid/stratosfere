"use client";

import React from "react";
import { X, Briefcase, MapPin, Link as LinkIcon, Check, Copy, ExternalLink } from "lucide-react";

interface HolinspectorModalProps {
    property: any;
    onClose: () => void;
    generatedLink: string;
    copiedId: string | null;
    handleCopyLink: (text: string, id: string) => void;
    formatMoney: (amount: any) => string;
}

export default function HolinspectorModal({
    property,
    onClose,
    generatedLink,
    copiedId,
    handleCopyLink,
    formatMoney
}: HolinspectorModalProps) {
    if (!property) return null;

    // Calculamos si tiene imágenes o usamos un placeholder
    const imagesList = property.images && property.images.length > 0 
        ? property.images 
        : [property.image || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80"];

    return (
        <div className="fixed inset-0 z-[90000] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
            
            <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <h2 className="font-black text-lg text-slate-900 uppercase tracking-tight">
                            INSPECTOR DE PROPIEDAD <span className="text-blue-600">HOLINSPECTOR</span>
                        </h2>
                        <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-slate-200 hidden sm:inline-block">
                            REF: {property.refCode || "S/R"}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {property.agencyName && (
                            <div className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg">
                                <Briefcase size={12} className="text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{property.agencyName}</span>
                            </div>
                        )}
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                            <X size={18} className="text-slate-600"/>
                        </button>
                    </div>
                </div>

                {/* BODY SCROLLABLE */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-slate-50">
                    
                    {/* GALERÍA DE IMÁGENES (GRILLA MÚLTIPLE) */}
                    <div className="mb-6 sm:mb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 h-48 sm:h-64">
                            {imagesList.slice(0, 3).map((img: string, i: number) => (
                                <div key={i} className="relative rounded-2xl overflow-hidden shadow-sm group bg-slate-200">
                                    <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={`Vista ${i+1}`} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <span className="text-white text-[10px] font-bold uppercase tracking-widest">Vista Ampliada</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Fila inferior de miniaturas (hasta 5) */}
                        {imagesList.length > 3 && (
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 h-24 sm:h-32">
                                {imagesList.slice(3, 8).map((img: string, i: number) => (
                                    <div key={i} className="relative rounded-xl overflow-hidden shadow-sm group bg-slate-200">
                                        <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={`Miniatura ${i+1}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* GRID DE INFORMACIÓN */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
                        
                        {/* COLUMNA 1: PLANO / MAPA */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Distribución (Plano)</h3>
                            <div className="aspect-square bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center p-4 relative overflow-hidden group cursor-pointer hover:bg-blue-50 transition-colors">
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/blueprint.png')]"></div>
                                <MapPin size={40} className="text-blue-300 group-hover:text-blue-500 transition-colors relative z-10 mb-3" />
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest relative z-10 group-hover:text-blue-600 text-center">Abrir Vista<br/>Satélite / Planos</span>
                            </div>
                        </div>

                        {/* COLUMNA 2: SPECS & AMENITIES */}
                        <div className="flex flex-col gap-6">
                            <div>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Especificaciones (Specs)</h3>
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-1.5">
                                        <span className="text-slate-500 font-medium">Construido</span>
                                        <span className="font-bold text-slate-900">{property.mBuilt || property.m2 || 0} m²</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-1.5">
                                        <span className="text-slate-500 font-medium">Habitaciones</span>
                                        <span className="font-bold text-slate-900">{property.rooms || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-1.5">
                                        <span className="text-slate-500 font-medium">Baños</span>
                                        <span className="font-bold text-slate-900">{property.baths || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-1.5">
                                        <span className="text-slate-500 font-medium">Estado</span>
                                        <span className="font-bold text-slate-900">{property.state || "Buen estado"}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Amenities</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['pool', 'garage', 'garden', 'terrace', 'ac', 'heating'].filter(k => property[k]).length > 0 ? (
                                        ['pool', 'garage', 'garden', 'terrace', 'ac', 'heating'].filter(k => property[k]).map((key, i) => {
                                            const labels: any = { pool: "Piscina", garage: "Garaje", garden: "Jardín", terrace: "Terraza", ac: "Aire Acond.", heating: "Calefacción" };
                                            return (
                                                <span key={i} className="bg-slate-100 text-slate-600 text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider border border-slate-200">
                                                    {labels[key]}
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span className="text-xs text-slate-400 font-medium">Sin amenities registradas.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA 3: DESCRIPCIÓN & FINANZAS */}
                        <div className="flex flex-col gap-6">
                            <div>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Holographic 3D Tour</h3>
                                <button 
                                    className={`w-full py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all shadow-sm ${property.tourUrl ? 'bg-slate-900 text-white hover:bg-black shadow-slate-900/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                    onClick={() => property.tourUrl && window.open(property.tourUrl, '_blank')}
                                >
                                    {property.tourUrl ? "Iniciar Inspección Virtual" : "Tour No Disponible"}
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col min-h-[100px]">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 mb-2 shrink-0">Descripción</h3>
                                <div className="text-xs text-slate-600 leading-relaxed font-medium overflow-y-auto custom-scrollbar pr-2 flex-1">
                                    {property.description || `Exclusiva propiedad en ${property.city}. Una oportunidad única en el mercado actual gestionada por ${property.agencyName}. Contacte para más detalles sobre las condiciones de venta.`}
                                </div>
                            </div>

                            <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-100 shrink-0">
                                <div className="flex justify-between items-end mb-2 border-b border-blue-100/50 pb-2">
                                    <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Precio Inversor:</span>
                                    <span className="text-lg font-black text-blue-900">{formatMoney(property.price)}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Comisión ({property.b2b?.sharePct || 50}%):</span>
                                    <span className="text-xl font-black text-emerald-600">{formatMoney(property.commission)}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="p-4 sm:p-6 bg-white border-t border-slate-100 shrink-0 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
                    <div className="w-full sm:flex-1 flex gap-2">
                        <div className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[10px] sm:text-xs text-slate-500 font-mono truncate select-all cursor-text flex items-center">
                            <LinkIcon size={14} className="mr-2 text-slate-400 shrink-0"/>
                            {generatedLink || "Generando enlace B2B..."}
                        </div>
                        <button 
                            onClick={() => handleCopyLink(generatedLink, "link-main")}
                            className={`px-4 sm:px-6 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shrink-0 ${copiedId === "link-main" ? "bg-emerald-500 text-white" : "bg-amber-400 text-amber-950 hover:bg-amber-500 shadow-md shadow-amber-400/20"}`}
                        >
                            {copiedId === "link-main" ? <Check size={16}/> : "Copiar"}
                        </button>
                    </div>

                    <button 
                        onClick={() => window.open(generatedLink, '_blank')} 
                        className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-black text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 shrink-0"
                    >
                        Testear Landing <ExternalLink size={14}/>
                    </button>
                </div>
            </div>
        </div>
    );
}