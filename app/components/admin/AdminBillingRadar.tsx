"use client";
import React, { useState, useEffect } from 'react';
import { FileText, Send, Loader2, Download, Search, Euro, Link as LinkIcon, Building2, QrCode, CalendarClock } from 'lucide-react';
import { fetchAgencyForBillingAction, createTacticalInvoiceAction } from '@/app/actions-billing';
// 🚀 LIBRERÍAS DE MUNICIÓN (Asegúrese de haber hecho npm install html2canvas jspdf)
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// 🚨 ATENCIÓN: Verifique que esta ruta coincide con su archivo real.
import { handleRealDeployment } from '@/app/components/alive-map/ui-panels/deploymentService'; 

export default function AdminBillingRadar() {
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Generador de IDs aleatorios
  const generateNewId = () => `INV-${Math.floor(Math.random() * 1000000)}`;
  const [invoiceId, setInvoiceId] = useState("");

  const [form, setForm] = useState({
    agencyId: "",
    propertyRef: "",
    serviceType: "TOP10",
    amount: "150",
    mollieLink: "",
    durationDays: "30" 
  });

  const [agencyData, setAgencyData] = useState({
    name: "NOMBRE DE LA AGENCIA",
    address: "DIRECCIÓN NO ESPECIFICADA",
    cif: "CIF / NIF",
    email: "email@agencia.com"
  });

  const [dateStr, setDateStr] = useState("");

  // 🔥 1. MEMORIA RAM Y FECHA
  useEffect(() => {
    const today = new Date();
    setDateStr(today.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }));

    const saved = sessionStorage.getItem('billing_radar_data');
    if (saved) {
        const parsed = JSON.parse(saved);
        setForm(parsed.form);
        setAgencyData(parsed.agencyData);
        setInvoiceId(parsed.invoiceId || generateNewId());
    } else {
        setInvoiceId(generateNewId());
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
        sessionStorage.setItem('billing_radar_data', JSON.stringify({ form, agencyData, invoiceId }));
    }
  }, [form, agencyData, invoiceId, isHydrated]);

  // 🔥 2. BÚSQUEDA REAL EN BASE DE DATOS
  const handleSearchAgency = async (overrideId?: string | React.MouseEvent) => {
      const targetId = typeof overrideId === 'string' ? overrideId : form.agencyId;
      if(!targetId || targetId.length < 5) return;
      
      setLoading(true);
      try {
          const res = await fetchAgencyForBillingAction(targetId);
          
          if(res?.success && res?.data) {
              setAgencyData({
                  name: res.data.name || "Agencia VIP",
                  address: res.data.address || "Dirección no especificada",
                  cif: res.data.cif || "CIF / NIF",
                  email: res.data.email || "Sin email"
              });
          } else {
              setAgencyData({
                  name: "⚠️ AGENCIA NO ENCONTRADA",
                  address: "Verifique que el ID introducido sea correcto",
                  cif: "---",
                  email: "---"
              });
          }
      } catch (e) {
          console.error("Error buscando agencia:", e);
      }
      setLoading(false);
  };

  // 🔥 AUTOCARGADOR INTELIGENTE
  useEffect(() => {
      if (!form.agencyId || form.agencyId.length < 8) return; 
      const delayDebounceFn = setTimeout(() => {
          handleSearchAgency(form.agencyId);
      }, 800); 
      return () => clearTimeout(delayDebounceFn);
  }, [form.agencyId]);

  const getServiceCode = () => {
      switch(form.serviceType) {
          case 'TOP10': return 'T10-CMD';
          case 'SNIPER': return 'GEO-SNP';
          case 'VANGUARD': return 'VAN-VIP';
          case 'FIRE': return 'NAN-FIR';
          default: return 'STR-SRV';
      }
  };

  const getServiceName = () => {
      switch(form.serviceType) {
          case 'TOP10': return 'COMANDO TOP 10';
          case 'SNIPER': return 'GEO SNIPER VIP';
          case 'VANGUARD': return 'MARKET NETWORK VIP';
          case 'FIRE': return 'INYECCIÓN NANO FUEGO';
          default: return 'SERVICIO STRATOSFERE';
      }
  };

  // 🔥 3. IMPRESIÓN (PDF LOCAL)
  const handleDownloadPDF = () => {
      window.print(); 
  };

 // 🔥 4. DISPARO REAL POR LA RED INTERNA Y GUARDADO EN BD
  const handleDisparar = async () => {
      if (!form.mollieLink) return alert("⚠️ Faltan coordenadas: Añada el enlace de pago de Mollie/Stripe antes de disparar.");
      
      setLoading(true); 

      try {
          const element = document.getElementById("tactical-label");
          if (!element) throw new Error("No se encontró el objetivo visual.");

          const canvas = await html2canvas(element, { scale: 2, useCORS: true });
          const imgData = canvas.toDataURL("image/png");

          const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

          const pdfBlob = pdf.output("blob");
          const pdfFile = new File([pdfBlob], `Albaran_Tactico_${invoiceId}.pdf`, { type: "application/pdf" });

          const stratosAdmin = { 
              name: "Stratosfere OS", 
              companyName: "Stratosfere Tech",
              email: "info@stratosfere.com" 
          };
          const isSuccess = await handleRealDeployment(pdfFile, form.propertyRef, stratosAdmin);

          if (isSuccess) {
              // 🔥 NUEVO: GUARDAR EN CAJA FUERTE (Base de Datos)
              await createTacticalInvoiceAction({
                  invoiceNumber: invoiceId,
                  agencyId: form.agencyId,
                  agencyName: agencyData.name,
                  targetRef: form.propertyRef,
                  serviceType: getServiceName(),
                  amount: Number(form.amount),
                  mollieLink: form.mollieLink
              });

              alert(`🚀 IMPACTO CONFIRMADO: Albarán ${invoiceId} enviado al cliente y registrado en Finanzas.`);
              setInvoiceId(generateNewId());
              setForm({ ...form, mollieLink: "" }); 
          } else {
              alert("❌ INTERCEPTADO: El servidor rechazó el misil. Revise la consola.");
          }

      } catch (error) {
          console.error("🚨 Fallo crítico:", error);
          alert("🚨 Hubo un error al generar el PDF táctico.");
      }
      
      setLoading(false);
  };

  const qrUrl = form.mollieLink ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(form.mollieLink)}` : null;

  if (!isHydrated) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-800">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-900 p-2 rounded-xl text-white"><FileText size={32} /></div>
        <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Albaranes Tácticos</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Generador Logístico de Cobros (Mollie / Transferencia)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CONTROLES */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 h-fit space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 border-b border-slate-100 pb-2 mb-4 flex justify-between">
                <span>Datos del Despliegue</span>
                <span className="text-blue-600">ID: {invoiceId}</span>
            </h2>
            
            <div className="space-y-3">
                <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">ID Agencia Objetivo</label>
                    <div className="flex gap-2">
                        <input type="text" value={form.agencyId} onChange={e => setForm({...form, agencyId: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" placeholder="Ej: cmxyz..." />
                        <button onClick={handleSearchAgency} className="bg-slate-900 text-white px-3 rounded-lg hover:bg-blue-600 transition-colors">{loading ? <Loader2 size={14} className="animate-spin"/> : <Search size={14}/>}</button>
                    </div>
                </div>

                <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Referencia del Activo (Opcional)</label>
                    <input type="text" value={form.propertyRef} onChange={e => setForm({...form, propertyRef: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" placeholder="Ej: SF-B2A0ZM" />
                </div>

                <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Tipo de Servicio / Munición</label>
                    <select value={form.serviceType} onChange={e => setForm({...form, serviceType: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="TOP10">Comando Top 10</option>
                        <option value="SNIPER">Geo Sniper VIP (Coordenadas)</option>
                        <option value="VANGUARD">Vanguard VIP (Dominio Zona)</option>
                        <option value="FIRE">Inyección NanoCard Fuego</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Importe (€)</label>
                        <div className="relative">
                            <Euro size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-black text-slate-800" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Días Servicio</label>
                        <div className="relative">
                            <CalendarClock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="number" value={form.durationDays} onChange={e => setForm({...form, durationDays: e.target.value})} className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-black text-slate-800" placeholder="Ej: 30" />
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-blue-600 mb-1">Enlace de Pago (Mollie / Stripe)</label>
                    <div className="relative">
                        <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                        <input type="text" value={form.mollieLink} onChange={e => setForm({...form, mollieLink: e.target.value})} className="w-full pl-8 pr-3 py-2 bg-blue-50/50 border border-blue-200 rounded-lg text-xs font-medium text-blue-800 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://use.mollie.com/..." />
                    </div>
                    <p className="text-[8px] text-slate-400 mt-1 font-medium leading-tight">Al pegar el enlace se generará automáticamente el Código QR en la etiqueta.</p>
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-slate-100">
                <button onClick={handleDownloadPDF} className="w-full bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md">
                    <Download size={14} /> Descargar PDF
                </button>
                <button onClick={handleDisparar} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md">
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} 
                    {loading ? "ARMANDO MISIL..." : "DISPARAR POR DROPDOC"}
                </button>
            </div>
        </div>

        {/* ETIQUETA */}
        <div className="lg:col-span-8 flex items-center justify-center bg-gray-200/50 rounded-[24px] p-8 border border-gray-300 overflow-x-auto shadow-inner printable-area">
            
        <div id="tactical-label" className="bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-[800px] font-sans text-black border-[3px] border-black relative shrink-0">
                
                <div className="w-full h-12 flex justify-between gap-1 mb-4 opacity-80">
                    {[...Array(60)].map((_, i) => (
                        <div key={i} className="bg-black h-full" style={{ width: `${Math.random() * 4 + 1}px` }}></div>
                    ))}
                </div>

                <div className="grid grid-cols-12 border-2 border-black">
                    <div className="col-span-8 flex flex-col border-r-2 border-black">
                        
                        {/* SENDER CON SVG PARA EVITAR ROTACIÓN ROTA */}
                        <div className="border-b-2 border-black flex">
                            <div className="w-8 flex items-center justify-center p-2">
                               <svg viewBox="0 0 10 60" className="w-full h-full">
                                    <text x="-60" y="8" transform="rotate(-90)" fill="black" fontSize="8" fontWeight="bold" letterSpacing="2" fontFamily="monospace">SENDER</text>
                               </svg>
                            </div>
                            <div className="p-3 flex flex-col justify-center border-l-2 border-black flex-1">
                                <h3 className="font-black text-xl tracking-tighter uppercase leading-none mb-1">Stratosfere OS.</h3>
                                <p className="text-[9px] font-bold uppercase leading-tight">SF URBAN, S.L.</p>
                                <p className="text-[9px] font-bold uppercase leading-tight">Avenida de las Cumbres, Marbella</p>
                                <p className="text-[9px] font-bold uppercase leading-tight mt-1">VAT: ES-B12345678</p>
                            </div>
                        </div>

                        {/* RECEIVER CON SVG PARA EVITAR ROTACIÓN ROTA */}
                        <div className="flex bg-gray-50 flex-1">
                            <div className="w-8 flex items-center justify-center p-2">
                               <svg viewBox="0 0 10 70" className="w-full h-full">
                                    <text x="-70" y="8" transform="rotate(-90)" fill="black" fontSize="8" fontWeight="bold" letterSpacing="2" fontFamily="monospace">RECEIVER</text>
                               </svg>
                            </div>
                            <div className="p-3 flex flex-col justify-center border-l-2 border-black flex-1">
                                <h2 className="font-black text-2xl uppercase leading-none mb-1">{agencyData.name}</h2>
                                <p className="text-[10px] font-bold uppercase mb-1">{agencyData.cif}</p>
                                <p className="text-[10px] font-bold uppercase leading-tight max-w-[80%]">{agencyData.address}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-span-4 flex flex-col bg-black text-white">
                        <div className="p-3 border-b-2 border-white text-center flex-1 flex flex-col justify-center">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Order Reference</span>
                            <span className="text-xl font-black tracking-widest font-mono text-white mt-1">{invoiceId}</span>
                        </div>
                        <div className="p-3 border-b-2 border-white text-center flex-1 flex flex-col justify-center">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Service Code</span>
                            <span className="text-2xl font-black tracking-widest text-white mt-1">{getServiceCode()}</span>
                        </div>
                        <div className="p-3 text-center flex items-center justify-center bg-white text-black font-black text-xl tracking-tighter">
                            ES / {form.serviceType.substring(0,3).toUpperCase()}
                        </div>
                    </div>
                </div>

               <div className="border-x-2 border-b-2 border-black p-6 text-center flex flex-col items-center justify-center relative">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Autorización de Despliegue</span>
                    
                    {/* 🎯 AJUSTE: Le damos mb-6 (margen) y pb-2 (padding) para proteger el texto */}
                    <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none mb-6 pb-2">{getServiceName()}</h1>
                    
                    {/* 🎯 AJUSTE: Añadimos mt-2 para alejar la línea físicamente del texto de arriba */}
                    <div className="flex items-center justify-center gap-4 border-t-2 border-black border-dashed pt-4 mt-2 w-3/4">
                        {form.durationDays && <p className="text-base font-bold uppercase text-blue-600 m-0 leading-none">{form.durationDays} DÍAS</p>}
                        {form.propertyRef && <p className="text-base font-bold uppercase m-0 leading-none">TARGET: {form.propertyRef}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-12 border-x-2 border-b-2 border-black">
                    <div className="col-span-8 flex flex-col border-r-2 border-black">
                        <div className="grid grid-cols-2 border-b-2 border-black">
                            <div className="p-3 border-r-2 border-black flex flex-col justify-center">
                                <span className="text-[8px] font-bold uppercase text-gray-500 mb-1">Date</span>
                                <span className="font-bold text-sm uppercase">{dateStr}</span>
                            </div>
                            <div className="p-3 bg-black text-white flex flex-col justify-center">
                                <span className="text-[8px] font-bold uppercase text-gray-400 mb-1">Total Amount (EUR)</span>
                                <span className="font-black text-xl text-white">{form.amount},00 €</span>
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-center">
                            <span className="text-[9px] font-black uppercase tracking-widest block mb-1">Transferencia Bancaria IBAN</span>
                            <span className="font-mono text-sm font-bold block mb-2">ES00 1234 5678 9012 3456 7890</span>
                            <span className="text-[9px] font-bold uppercase text-gray-500 block">Concepto: SF SERVICES - {invoiceId}</span>
                        </div>
                    </div>
                    <div className="col-span-4 p-4 flex flex-col items-center justify-center bg-gray-50">
                        {qrUrl ? (
                            <img src={qrUrl} alt="QR Code" className="w-24 h-24 object-contain mix-blend-multiply" />
                        ) : (
                            <div className="w-24 h-24 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 flex-col gap-2">
                                <QrCode size={24} />
                            </div>
                        )}
                        <span className="text-[8px] font-black uppercase tracking-widest mt-2 flex items-center gap-1"><Euro size={10}/> SCAN TO PAY</span>
                    </div>
                </div>

             {/* TEXTO VERTICAL LATERAL */}
                <div className="absolute top-0 left-2 h-full flex items-center justify-center">
                    <span className="absolute -rotate-90 whitespace-nowrap text-[8px] font-mono text-gray-400 tracking-[0.3em] uppercase origin-center">STRATOSFERE BILLING PROTOCOL // {invoiceId} // AUTHORIZED ONLY</span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4 portrait; margin: 1cm; }
                    body { background-color: white !important; margin: 0; padding: 0; }
                    body * { visibility: hidden; }
                    .printable-area, .printable-area * { visibility: visible !important; }
                    
                    .printable-area { 
                        position: absolute !important; 
                        top: 0 !important; 
                        left: 0 !important; 
                        width: 100% !important; 
                        margin: 0 !important;
                        padding: 0 !important;
                        border: none !important;
                        background: transparent !important;
                        box-shadow: none !important;
                        display: block !important; 
                        transform: none !important;
                    }
                    
                    .printable-area > div {
                        margin: 0 auto !important; 
                        transform: scale(0.95) !important;
                        transform-origin: top center !important; 
                    }

                    * { 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important; 
                        color-adjust: exact !important; 
                    }
                }
            `}} />
        </div>
      </div>
    </div>
  );
}