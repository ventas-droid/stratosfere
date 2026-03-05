"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, X, FileSignature, CheckCircle, Zap, Download, Send, Loader2, Inbox, Clock, FileText, Database } from "lucide-react";
// 👇 IMPORTANTE: Ajuste esta ruta si sus actions están en otra carpeta
import { getInboxDocumentsAction, markDocumentsAsReadAction } from "@/app/actions-documents";

export default function StratosAIConsole({ isOpen, onClose, aiResponse, onDeploy, incomingFile, onClearFile, activeUserKey, onUnreadAlert, currentUser }: any) {
// 🎯 BLINDAJE ANTI-FANTASMAS: Obligamos al radar a recordar siempre el email actual
    const currentUserEmailRef = React.useRef(currentUser?.email);
    React.useEffect(() => {
        currentUserEmailRef.current = currentUser?.email;
    }, [currentUser?.email]);

    const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isFileReady, setIsFileReady] = useState(false); 
  const [fileName, setFileName] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  
  // Estados para el envío
  const [refInput, setRefInput] = useState("");
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [aiStatus, setAiStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');

  // 🔥 ESTADOS REALES PARA LA BANDEJA DROPDOC FLASH 🔥
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [inboxDocs, setInboxDocs] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const activeFile = incomingFile || localFile; 

  const targetText = isProcessingFile 
    ? "Analizando y asegurando documento..." 
    : isFileReady && !activeFile
      ? `Documento preparado para envío.` 
      : (aiResponse ? aiResponse : "Stratos AI. ¿En qué puedo ayudarle hoy?");

  // 1. CARGA DE DOCUMENTOS REALES DESDE LA BASE DE DATOS
  const fetchDocuments = async (isSilent = false) => {
    if (!activeUserKey || activeUserKey === 'anon') return;
    
    // Solo mostramos el icono de carga si NO es un barrido automático en silencio
    if (!isSilent) setIsLoadingDocs(true);
    
    try {
      // 🎯 Leemos siempre el email de la memoria blindada
      const safeEmail = currentUserEmailRef.current || currentUser?.email;
      const result = await getInboxDocumentsAction(activeUserKey, safeEmail);
      
      if (result.success && result.data) {
        setInboxDocs(result.data);
        const unread = result.data.filter((doc: any) => !doc.isRead && doc.ownerId === activeUserKey).length;
        setUnreadCount(unread);
        
        if (onUnreadAlert && unread > 0) {
            onUnreadAlert(true);
        }
      }
    } catch (error) {
      console.error("Error al sincronizar DropDoc Flash:", error);
    } finally {
      if (!isSilent) setIsLoadingDocs(false);
    }
  };

  // 🎯 VIGILANCIA EN 2º PLANO: Busca novedades cada 10 segundos
  useEffect(() => {
    // 1. El primer disparo es normal (para que cargue al abrir la app)
    fetchDocuments(false);
    
    // 2. Los disparos siguientes son "silenciosos" (true) para que la pantalla no salte
    const interval = setInterval(() => {
      fetchDocuments(true);
    }, 10000); 
    
    return () => clearInterval(interval);
  }, [activeUserKey]);

  // Manejador para abrir la bandeja y marcar como leído
  const handleOpenInbox = async () => {
    setIsInboxOpen(true);
    if (unreadCount > 0 && activeUserKey) {
      setUnreadCount(0); // Actualizamos la UI inmediatamente para mejor experiencia
      await markDocumentsAsReadAction(activeUserKey); // Confirmamos en base de datos
      // Refrescamos la lista silenciosamente
      fetchDocuments();
    }
  };

  // Utilidad para formatear fechas de forma elegante
  const formatDocDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    let currentIndex = 0;
    setDisplayedText("");
    const typingInterval = setInterval(() => {
      setDisplayedText(targetText.slice(0, currentIndex + 1));
      currentIndex++;
      if (currentIndex >= targetText.length) clearInterval(typingInterval);
    }, 20);
    return () => clearInterval(typingInterval);
  }, [targetText]);

  const preventDefaults = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragOver = (e: React.DragEvent) => { preventDefaults(e); if (!isDragging) setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { preventDefaults(e); setIsDragging(false); };

  const handleDrop = (e: React.DragEvent) => {
    preventDefaults(e);
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
      processIncomingFile(files[0]);
    }
  };

  const processIncomingFile = (file: File) => {
    setIsProcessingFile(true);
    setTimeout(() => {
      setIsProcessingFile(false);
      setIsFileReady(true); 
      setLocalFile(file); 
      setTimeout(() => setIsFileReady(false), 2500);
    }, 1200);
  };

  const handleSendToServer = async () => {
    if (!refInput.trim() || !activeFile) return;
    setIsTransmitting(true);
    
    let success = true;
    if (onDeploy) success = await onDeploy(activeFile, refInput);

    if (!success) {
        setIsTransmitting(false);
        return; 
    }
    
    setIsTransmitting(false);
    setLocalFile(null); 
    if(onClearFile) onClearFile(); 
    setAiStatus('PROCESSING');
    
    setTimeout(() => {
        setAiStatus('SUCCESS'); 
        setTimeout(() => {
            setAiStatus('IDLE');
            setRefInput("");
            // Refrescamos los documentos por si el usuario se ha enviado un documento a su propia referencia
            fetchDocuments(true); // 👈 ¡AQUÍ ESTÁ EL CAMBIO QUIRÚRGICO (true)!
        }, 2500); 
    }, 1000);
  };

  if (!isOpen) return null;

  const isOrbActive = isProcessingFile || aiStatus !== 'IDLE';

  return (
    <>
      {/* 🚀 EL MODAL OS DE RECEPCIÓN (Datos Reales) */}
      {isInboxOpen && (
        <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4 pointer-events-auto">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer transition-opacity duration-300" onClick={() => setIsInboxOpen(false)}></div>
            
            <div className="relative w-full max-w-2xl bg-[#0a0a0c]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up cursor-default">
                
                {/* Cabecera del Modal */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <Inbox size={20} />
                        </div>
                        <div>
                            <h2 className="text-white font-semibold text-lg tracking-tight">DropDoc Flash®</h2>
                            <p className="text-xs text-white/50">Bandeja de recepción segura en la nube</p>
                        </div>
                    </div>
                    <button onClick={() => setIsInboxOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer">
                        <X size={16} />
                    </button>
                </div>

                {/* Lista de Documentos Reales */}
                <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3 custom-scrollbar">
                    {isLoadingDocs ? (
                        <div className="flex flex-col items-center justify-center py-12 text-white/40">
                            <Loader2 size={24} className="animate-spin mb-3" />
                            <p className="text-sm">Sincronizando expedientes...</p>
                        </div>
                    ) : inboxDocs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-white/40">
                            <Database size={32} className="mb-3 opacity-20" />
                            <p className="text-sm">No hay documentos en su bandeja de entrada.</p>
                        </div>
                    ) : (
                      inboxDocs.map(doc => {
                            // 🧠 LÓGICA DE IDENTIFICACIÓN
                            const isSentByMe = currentUser && doc.senderEmail === currentUser.email;
                            const isReceived = doc.ownerId === activeUserKey;
                            const isSelfNote = isSentByMe && isReceived; 

                            return (
                                <div key={doc.id} className={`group bg-white/5 border ${doc.isRead || isSentByMe ? 'border-white/5' : 'border-blue-500/30 bg-blue-500/5'} hover:border-blue-500/50 rounded-2xl p-4 flex flex-col gap-3 transition-all`}>
                                    
                                    {/* FILA SUPERIOR: Icono, Nombre, Etiquetas */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${isSentByMe ? 'bg-black/50 border-blue-500/20 text-blue-400' : 'bg-black/50 border-emerald-500/20 text-emerald-400'}`}>
                                                <FileText size={24} strokeWidth={1.5} />
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className={`text-sm truncate ${!doc.isRead && !isSentByMe ? 'font-bold text-white' : 'font-medium text-white/90'}`}>
                                                        {doc.fileName}
                                                    </h4>
                                                    {!doc.isRead && !isSentByMe && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>}
                                                </div>

                                            {/* ETIQUETAS VISUALES */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {isSentByMe ? (
                                                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold uppercase tracking-wider">Enviado</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">Recibido</span>
                                                    )}
                                                    {/* 👇 AQUÍ ESTÁ LA ETIQUETA DE REFERENCIA RECUPERADA 👇 */}
                                                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 font-mono text-white/60 text-[10px]">Ref: {doc.propertyRef}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botón de descarga real apuntando a Vercel Blob */}
                                        <a 
                                            href={doc.fileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 hover:border-transparent text-blue-400 hover:text-white flex items-center justify-center transition-all shadow-sm cursor-pointer"
                                        >
                                            <Download size={18} />
                                        </a>
                                    </div>

                                  {/* FILA INFERIOR: Remitente, Destinatario y Fecha */}
                                    <div className="flex flex-col gap-2 mt-1 pt-3 border-t border-white/5 text-[11px] text-white/50">
                                        
                                        {/* 1. QUIÉN LO ENVÍA (Y LA FECHA) */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 truncate">
                                                {isSentByMe ? (
                                                    <span className="truncate flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50 shrink-0"></span>
                                                        <span>Enviado por: <span className="text-white/90 font-medium">{doc.senderName || currentUser?.name || currentUser?.companyName || 'Mi Perfil'}</span> <span className="opacity-50 hidden sm:inline">({doc.senderEmail || currentUser?.email})</span></span>
                                                    </span>
                                                ) : (
                                                    <span className="truncate flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 shrink-0"></span>
                                                        <span>De: <span className="text-white/90 font-medium">{doc.senderName || 'Usuario Oculto'}</span> <span className="opacity-50 hidden sm:inline">({doc.senderEmail})</span></span>
                                                    </span>
                                                )}
                                            </div>
                                            <span className="flex items-center gap-1 shrink-0"><Clock size={12} /> {formatDocDate(doc.createdAt)}</span>
                                        </div>

                                        {/* 2. A QUIÉN SE LE HA ENVIADO (Solo visible en los documentos enviados) */}
                                        {isSentByMe && (
                                            <div className="flex items-center gap-1.5 truncate">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 shrink-0"></span>
                                                <span>Para: <span className="text-white/90 font-medium">{doc.receiverName || 'Usuario de la plataforma'}</span> <span className="opacity-50 hidden sm:inline">({doc.receiverEmail || 'Email no disponible'})</span></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
      )}

      {/* 🚀 LA TORRE DE PANELES */}
      <div className={`fixed bottom-40 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-[20000] flex flex-col transition-all duration-300 ${isInboxOpen ? 'opacity-0 pointer-events-none scale-95 blur-sm' : 'opacity-100 pointer-events-none scale-100 blur-0'} gap-3`}>

        {/* --- 1. CÁPSULA INBOX (Notificaciones Reales) --- */}
        <div 
            onClick={handleOpenInbox}
            className="pointer-events-auto mx-auto w-auto group bg-[#0a0a0c]/85 backdrop-blur-2xl border border-white/10 rounded-full py-2.5 px-6 flex items-center gap-4 cursor-pointer hover:bg-black hover:border-white/20 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
        >
            <div className="relative flex items-center justify-center text-white/60 group-hover:text-blue-400 transition-colors">
                <Inbox size={16} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.9)]"></span>
                )}
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-white/90 tracking-wide">DropDoc Flash®</span>
                {unreadCount > 0 && (
                    <span className="text-[10px] text-blue-300 font-mono bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                        {unreadCount} Novedades
                    </span>
                )}
            </div>
        </div>

        {/* --- 2. CÁPSULA CENTRAL: ÁREA DE ARRASTRE --- */}
        <div
          onDragEnter={preventDefaults}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`pointer-events-auto relative overflow-hidden rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center justify-center p-6 cursor-pointer group min-h-[140px]
            ${isDragging 
              ? 'border-blue-500 bg-blue-50/40 backdrop-blur-3xl scale-[1.02] shadow-[0_0_40px_rgba(59,130,246,0.3)]' 
              : isFileReady
                ? 'border-emerald-500 bg-emerald-50/40 backdrop-blur-3xl shadow-[0_0_40px_rgba(16,185,129,0.3)]'
                : 'border-blue-500/30 bg-white/25 backdrop-blur-3xl hover:bg-white/35 hover:border-blue-400/60 shadow-[0_15px_40px_rgba(0,0,0,0.15)]'
            }
          `}
        >
          <div className={`flex flex-col items-center transition-all duration-500 ease-in-out py-1
              ${isProcessingFile && !isFileReady ? 'scale-95 opacity-50 blur-sm' : 'scale-100 opacity-100 blur-0'}
            `}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 shadow-sm
              ${isDragging ? 'bg-blue-500 text-white shadow-inner scale-110' : 
                isFileReady ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-110' : 
                'bg-white/60 text-blue-600 group-hover:bg-white/80 group-hover:scale-105'}
            `}>
              {isFileReady ? <CheckCircle size={24} /> : isDragging ? <Download size={24} /> : <FileSignature size={24} />}
            </div>
            <h3 className={`text-sm font-semibold tracking-wide text-center transition-colors duration-300
              ${isFileReady ? 'text-emerald-700' : isDragging ? 'text-blue-700' : 'text-slate-800'}
            `}>
              {isFileReady ? 'Documento preparado' : isProcessingFile ? 'Procesando documento...' : isDragging ? 'Suelte el archivo aquí' : 'Arrastre un documento (PDF)'}
            </h3>
          </div>
        </div>

        {/* --- 3. CÁPSULA INFERIOR: CONSOLA IA --- */}
        <div className="pointer-events-auto animate-fade-in rounded-[2rem] p-7 bg-[#0a0a0c]/95 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgb(0,0,0,0.4)]">
          <div className="flex justify-between items-center mb-5 text-white/90">
              <span className="text-xs font-semibold tracking-widest flex items-center gap-2 text-white/70">
                  <Sparkles size={14} className="text-blue-400"/> STRATOS AI
              </span>
              <button onClick={onClose} className="hover:text-red-400 transition-colors p-1.5 text-white/40 hover:bg-white/10 rounded-full cursor-pointer">
                <X size={16}/>
              </button>
          </div>

          <div className="flex flex-col items-center justify-center text-center gap-4 relative min-h-[7rem]">
              
              {!activeFile ? (
                <>
                  <div className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-700 ${isOrbActive ? 'border-emerald-500/30 scale-110' : 'border-blue-400/20'}`}>
                      <div className={`w-6 h-6 rounded-full blur-md transition-all duration-700 ${isOrbActive ? 'bg-emerald-400/80' : 'bg-blue-500/60'}`}></div>
                  </div>
                  
                  <div className="h-4 flex items-center justify-center mt-1">
                      {aiStatus === 'PROCESSING' && (
                          <p className="text-blue-400 text-sm tracking-wide font-medium flex items-center gap-2 animate-pulse">
                              <Loader2 size={14} className="animate-spin" />
                              Finalizando proceso...
                          </p>
                      )}
                      
                      {aiStatus === 'SUCCESS' && (
                          <p className="text-emerald-400 text-sm tracking-wide font-medium flex items-center gap-2 animate-fade-in">
                              <CheckCircle size={15} /> Enviado correctamente
                          </p>
                      )}

                      {aiStatus === 'IDLE' && (
                          <p className="text-white/80 text-sm tracking-wide font-normal">
                              {displayedText}
                              <span className="animate-pulse text-blue-400 ml-1 font-light">|</span>
                          </p>
                      )}
                  </div>
                </>
              ) : (
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 animate-slide-in-up">
                   <div className="flex items-center gap-4 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${isTransmitting ? 'bg-blue-500/20' : 'bg-white/10'}`}>
                          {isTransmitting ? <Loader2 size={18} className="text-blue-400 animate-spin" /> : <FileSignature size={18} className="text-white/70" />}
                      </div>
                      <div className="text-left flex-1 overflow-hidden">
                          <p className={`text-sm font-medium truncate transition-colors ${isTransmitting ? 'text-blue-300' : 'text-white/90'}`}>
                              {isTransmitting ? 'Enviando documento...' : activeFile.name}
                          </p>
                          <p className="text-[11px] text-white/50 mt-0.5">
                              {isTransmitting ? 'Conectando con el servidor' : 'Documento listo para asignar'}
                          </p>
                      </div>
                   </div>

                   <div className="flex gap-2 w-full items-center">
                      <input 
                          type="text" 
                          value={refInput}
                          onChange={(e) => setRefInput(e.target.value)}
                          disabled={isTransmitting}
                          placeholder="Referencia (Ej: SF-123)" 
                          className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-400 focus:bg-white/5 outline-none placeholder:text-white/30 disabled:opacity-50 transition-all"
                      />
                      
                      <button 
                          onClick={() => {
                              const url = URL.createObjectURL(activeFile);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = activeFile.name;
                              a.click();
                              URL.revokeObjectURL(url);
                          }}
                          disabled={isTransmitting}
                          title="Descargar copia local"
                          className="bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white p-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                      >
                          <Download size={18} />
                      </button>

                      <button 
                          onClick={handleSendToServer}
                          disabled={isTransmitting || !refInput.trim()}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
                              isTransmitting 
                              ? 'bg-blue-600/80 text-white cursor-wait' 
                              : !refInput.trim() 
                                  ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md hover:shadow-blue-500/25'
                          }`}
                      >
                          {isTransmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          {isTransmitting ? 'Enviando...' : 'Enviar'}
                      </button>
                   </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
}