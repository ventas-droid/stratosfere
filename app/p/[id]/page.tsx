import React from 'react';
import { getPublicPropertyDetailsAction } from '@/app/actions-public';
import { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import { MapPin, BedDouble, Bath, Ruler, Home, BadgeCheck } from 'lucide-react';
import PublicContactForm from './PublicContactForm'; // 🔥 IMPORTAMOS EL FORMULARIO

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params, searchParams }: { params: Promise<any>, searchParams: Promise<any> }): Promise<Metadata> {
    const resolvedParams = await params;
    const res = await getPublicPropertyDetailsAction(resolvedParams.id);
    if (!res.success || !res.data) return { title: 'Propiedad no encontrada | Stratosfere' };

    const p = res.data;
    return {
        title: `${p.title} en ${p.city} | Stratosfere`,
        description: p.description?.substring(0, 160) || `Espectacular propiedad en ${p.city}. Precio: ${p.formattedPrice}. Contacta para más detalles.`,
        openGraph: { images: p.images[0] ? [p.images[0]] : [] },
    };
}

export default async function PublicPropertyPage({ params, searchParams }: { params: Promise<any>, searchParams: Promise<any> }) {
    const resolvedParams = await params;
    const resolvedSearch = await searchParams;
    
    const propertyId = resolvedParams.id;
    const ambassadorRef = resolvedSearch.ref;

    // ❌ AQUÍ ESTABA EL ERROR. LO HEMOS ELIMINADO. 
    // Ahora usamos el <script> más abajo para guardar la cookie sin molestar al servidor.

    const response = await getPublicPropertyDetailsAction(propertyId);

    if (!response.success || !response.data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Propiedad no disponible</h1>
                    <p className="text-slate-500 mb-6">Es posible que haya sido vendida o retirada del mercado.</p>
                    <Link href="/" className="px-6 py-3 bg-black text-white rounded-full font-bold text-sm">Volver al inicio</Link>
                </div>
            </div>
        );
    }

    const p = response.data;
    const responsible = p.responsible;
    const defaultMsg = `Hola, me interesa la propiedad REF: ${p.refCode || 'S/R'} y me gustaría recibir más información.`;

    return (
        <main className="h-screen overflow-y-auto bg-white selection:bg-blue-100 selection:text-blue-900 font-sans pb-20 relative">
            
            {/* 🔥 TÁCTICA DE INFILTRACIÓN: Script silencioso para guardar la cookie desde el navegador en lugar del servidor */}
            {ambassadorRef && (
                <script dangerouslySetInnerHTML={{ __html: `document.cookie = "stratos_ref=${ambassadorRef}; path=/; max-age=2592000; SameSite=Lax;";` }} />
            )}

            {/* 🔥 CABECERA CON EL LOGO STRATOSFERE OS 🔥 */}
            <header className="absolute top-0 left-0 w-full p-6 md:px-12 z-50 flex justify-between items-center">
                <div className="text-white text-3xl font-black tracking-tighter drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                    Stratosfere OS<span className="text-emerald-400">.</span>
                </div>
                <Link href="/?login=true" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg">
                    Acceso Clientes
                </Link>
            </header>
            
            {/* --- HERO SECTION --- */}
            <div className="h-[60vh] md:h-[75vh] relative bg-slate-900 overflow-hidden shrink-0">
                 <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover opacity-80 scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                 
                 <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white z-10 max-w-5xl mx-auto">
                     <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-90">
                        <span className="bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">REF: {p.refCode}</span>
                        {p.city && <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-md"><MapPin size={12}/> {p.city}</span>}
                     </div>
                     <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-tight drop-shadow-lg">{p.title}</h1>
                     <p className="text-3xl md:text-5xl font-black text-emerald-400 drop-shadow-md">{p.formattedPrice}</p>
                 </div>
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
<div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-5 gap-10 relative shrink-0">                
                {/* Columna Izquierda (Detalles) */}
<div className="lg:col-span-3 space-y-12">                    
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                        {p.mBuilt > 0 && (
                            <div className="flex flex-col gap-2 p-4 bg-white rounded-2xl shadow-sm border border-slate-50">
                                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500"><Ruler size={18}/></div>
                                <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Superficie</p><p className="text-xl font-black text-slate-900">{p.mBuilt} m²</p></div>
                            </div>
                        )}
                        {p.rooms > 0 && (
                             <div className="flex flex-col gap-2 p-4 bg-white rounded-2xl shadow-sm border border-slate-50">
                                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500"><BedDouble size={18}/></div>
                                <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dormitorios</p><p className="text-xl font-black text-slate-900">{p.rooms}</p></div>
                            </div>
                        )}
                         {p.baths > 0 && (
                             <div className="flex flex-col gap-2 p-4 bg-white rounded-2xl shadow-sm border border-slate-50">
                                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500"><Bath size={18}/></div>
                                <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Baños</p><p className="text-xl font-black text-slate-900">{p.baths}</p></div>
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                            <Home className="text-indigo-500"/> Sobre esta propiedad
                        </h2>
                        <div className="text-slate-600 font-medium leading-relaxed space-y-4 text-lg">
                            {p.description ? p.description.split('\n').map((paragraph: string, idx: number) => (
                                paragraph.trim() && <p key={idx}>{paragraph}</p>
                            )) : <p className="italic text-slate-400">Sin descripción detallada disponible.</p>}
                        </div>
                    </div>

                    {p.images.length > 1 && (
                        <div className="grid grid-cols-2 gap-4">
                            {p.images.slice(1, 3).map((imgUrl: string, i: number) => (
                                <div key={i} className="aspect-video rounded-3xl overflow-hidden shadow-md">
                                    <img src={imgUrl} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Detalle" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Columna Derecha (CONTACTO INSTANTÁNEO) */}
<div className="lg:col-span-2 lg:sticky lg:top-10 h-fit space-y-6">                 
       <div className="p-6 rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                        
                        <div className="flex flex-col items-center text-center mb-2">
                             <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-slate-50 shadow-sm mb-3 relative bg-slate-100">
                                <img src={responsible.avatar} alt={responsible.name} className="w-full h-full object-cover" />
                                {responsible.isAgency && <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white"><BadgeCheck size={12}/></div>}
                             </div>
                             <h3 className="text-xl font-black text-slate-900 leading-tight">{responsible.name}</h3>
                             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mt-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> RESPUESTA RÁPIDA</p>
                        </div>

                        {/* 🔥 EL FORMULARIO CLONADO SE INYECTA AQUÍ 🔥 */}
                        <PublicContactForm propertyId={propertyId} defaultMessage={defaultMsg} />
                        
                    </div>
                </div>
            </div>
        </main>
    );
}