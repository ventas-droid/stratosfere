"use client";
import React, { useState, useRef } from "react";
import { Video, Globe, FileText, ShieldCheck, UploadCloud, Loader2, X, Trash2, Eye } from "lucide-react";
// ✅ Importamos la utilidad de subida que ya usa para las fotos
import { uploadToCloudinary } from '@/app/utils/upload';

export default function StepAgencyExtras({ formData, setFormData }: any) {
  
  // Estados de carga para los spinners individuales
  const [uploadingNote, setUploadingNote] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);

  // Referencias a los inputs ocultos
  const noteInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  // Helper para actualizar datos
  const handleChange = (field: string, val: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: val }));
  };

  // 🔥 LA MAGIA: Subida de PDFs a Cloudinary
  const handlePdfUpload = async (e: any, field: string, setLoading: (v: boolean) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
        // 1. Usamos su dron de carga existente
        const secureUrl = await uploadToCloudinary(file);
        
        if (secureUrl) {
            handleChange(field, secureUrl);
        } else {
            alert("Error al subir el documento. Inténtelo de nuevo.");
        }
    } catch (error) {
        console.error("Error subida PDF:", error);
        alert("Error de conexión con la nube.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* SECCIÓN 1: MULTIMEDIA PRO (Videos y Tours siguen siendo enlaces URL externos normalmente) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <Video size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Multimedia de Cine</h3>
            <p className="text-xs text-slate-500">Enlaces a YouTube, Vimeo o Matterport.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {/* VÍDEO */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    <Video size={12}/> Enlace de Vídeo (YouTube/Vimeo)
                </label>
                <input 
                    type="url" 
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.videoUrl || ""}
                    onChange={(e) => handleChange("videoUrl", e.target.value)}
                    className="w-full bg-transparent outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-300"
                />
            </div>

            {/* TOUR 3D */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    <Globe size={12}/> Tour Virtual (Matterport/3D)
                </label>
                <input 
                    type="url" 
                    placeholder="https://my.matterport.com/show/..."
                    value={formData.tourUrl || ""}
                    onChange={(e) => handleChange("tourUrl", e.target.value)}
                    className="w-full bg-transparent outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-300"
                />
            </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* SECCIÓN 2: DOCUMENTACIÓN LEGAL (AHORA CON SUBIDA DE FICHEROS REAL) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Documentación Legal</h3>
            <p className="text-xs text-slate-500">Sube los PDFs oficiales. El sistema verificará la subida.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
            
            {/* === UPLOAD 1: NOTA SIMPLE === */}
            <div className={`rounded-2xl p-4 border-2 transition-all ${formData.simpleNoteUrl ? "bg-emerald-50 border-emerald-200" : "bg-white border-dashed border-slate-200 hover:border-emerald-400"}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.simpleNoteUrl ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                            {uploadingNote ? <Loader2 size={18} className="animate-spin"/> : <FileText size={18}/>}
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-wide text-slate-700">Nota Simple</p>
                            <p className="text-[10px] text-slate-400">
                                {formData.simpleNoteUrl ? "Documento cargado correctamente" : "Formato PDF requerido"}
                            </p>
                        </div>
                    </div>

                    {formData.simpleNoteUrl ? (
                        <div className="flex gap-2">
                            <a href={formData.simpleNoteUrl} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50" title="Ver Documento">
                                <Eye size={16}/>
                            </a>
                            <button onClick={() => handleChange("simpleNoteUrl", "")} className="p-2 bg-white rounded-lg border border-red-200 text-red-500 hover:bg-red-50" title="Eliminar">
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => noteInputRef.current?.click()}
                            disabled={uploadingNote}
                            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black disabled:opacity-50 flex items-center gap-2"
                        >
                            <UploadCloud size={14}/> {uploadingNote ? "Subiendo..." : "Subir PDF"}
                        </button>
                    )}
                </div>
                {/* Input oculto Nota Simple */}
                <input 
                    type="file" 
                    ref={noteInputRef} 
                    className="hidden" 
                    accept="application/pdf"
                    onChange={(e) => handlePdfUpload(e, "simpleNoteUrl", setUploadingNote)}
                />
            </div>

            {/* === UPLOAD 2: CERTIFICADO ENERGÉTICO === */}
            <div className={`rounded-2xl p-4 border-2 transition-all ${formData.energyCertUrl ? "bg-emerald-50 border-emerald-200" : "bg-white border-dashed border-slate-200 hover:border-emerald-400"}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.energyCertUrl ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                            {uploadingCert ? <Loader2 size={18} className="animate-spin"/> : <FileText size={18}/>}
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-wide text-slate-700">Certificado Energético</p>
                            <p className="text-[10px] text-slate-400">
                                {formData.energyCertUrl ? "Documento cargado correctamente" : "Formato PDF requerido"}
                            </p>
                        </div>
                    </div>

                    {formData.energyCertUrl ? (
                        <div className="flex gap-2">
                            <a href={formData.energyCertUrl} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50" title="Ver Documento">
                                <Eye size={16}/>
                            </a>
                            <button onClick={() => handleChange("energyCertUrl", "")} className="p-2 bg-white rounded-lg border border-red-200 text-red-500 hover:bg-red-50" title="Eliminar">
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => certInputRef.current?.click()}
                            disabled={uploadingCert}
                            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black disabled:opacity-50 flex items-center gap-2"
                        >
                            <UploadCloud size={14}/> {uploadingCert ? "Subiendo..." : "Subir PDF"}
                        </button>
                    )}
                </div>
                {/* Input oculto Certificado */}
                <input 
                    type="file" 
                    ref={certInputRef} 
                    className="hidden" 
                    accept="application/pdf"
                    onChange={(e) => handlePdfUpload(e, "energyCertUrl", setUploadingCert)}
                />
            </div>

        </div>
      </div>
    </div>
  );
}