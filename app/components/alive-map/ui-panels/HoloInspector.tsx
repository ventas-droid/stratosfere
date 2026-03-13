"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  FileText,
  Play,
  Sparkles,
  ScanSearch,
  Eye,
  Orbit,
  Waves,
  Shield,
  GalleryHorizontal,
} from "lucide-react";

export default function HoloInspector({
  isOpen,
  prop,
  images = [],
  onClose,
  soundEnabled,
  playSynthSound,
}: any) {
  const [idx, setIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [showChrome, setShowChrome] = useState(true);
  const [showVisionFx, setShowVisionFx] = useState(true);
  const [showOrbitalFx, setShowOrbitalFx] = useState(true);
  const [showThumbs, setShowThumbs] = useState(true);
  const [ultraMode, setUltraMode] = useState(true);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [prevSrc, setPrevSrc] = useState<string | null>(null);
  const [showPrevLayer, setShowPrevLayer] = useState(false);

  const hidePrevTimer = useRef<any>(null);

  useEffect(() => {
      setMounted(true);
      if (typeof window !== "undefined") {
          setReducedMotion(
              window.matchMedia("(prefers-reduced-motion: reduce)").matches
          );
      }
      
      // 🔥 LIMPIEZA TÁCTICA: Evita fugas de memoria si se cierra rápido
      return () => {
          if (hidePrevTimer.current) clearTimeout(hidePrevTimer.current);
      };
  }, []);

  useEffect(() => {
      if (!isOpen) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
          document.body.style.overflow = prev;
      };
  }, [isOpen]);

  useEffect(() => {
      setIsZooming(false);
      setIsLoaded(false);

      if (isOpen) {
          const timer = setTimeout(() => setIsZooming(true), 50);
          return () => clearTimeout(timer);
      }
  }, [isOpen, idx]);

  useEffect(() => {
      if (isOpen) setIdx(0);
  }, [isOpen]);

  const safeProp = prop ?? {};

  const normalizeMedia = (item: any): string | null => {
      if (!item) return null;
      if (typeof item === "string") return item;
      if (typeof item === "object") {
          return item.url || item.src || item.secure_url || item.file || null;
      }
      return null;
  };

  const gallerySource = images && images.length > 0 ? images : safeProp.images || [];
  const rawAlbum = gallerySource.length > 0 ? gallerySource : [safeProp.img].filter(Boolean);

  const unique = Array.from(
      new Set(rawAlbum.map(normalizeMedia).filter(Boolean))
  ) as string[];

const stats = useMemo(() => {
  return unique.reduce((acc, src) => {
    if (src.match(/\.(mp4|mov|webm|mkv)$/i) || src.includes("/video/upload")) acc.videos++;
    else if (src.match(/\.pdf$/i) || src.includes(".pdf")) acc.pdfs++;
    else acc.photos++;
    return acc;
  }, { photos: 0, videos: 0, pdfs: 0 });
}, [unique]);

  const current = unique[idx] || unique[0] || null;
  const hasMultiplePhotos = unique.length > 1;

  const isVideo = current
      ? !!(
          String(current).match(/\.(mp4|mov|webm|mkv)$/i) ||
          String(current).includes("/video/upload")
      )
      : false;

  const isPdf = current
      ? !!(
          String(current).match(/\.pdf$/i) || String(current).includes(".pdf")
      )
      : false;

  const formatPrice = (value: any) => {
      if (value === null || value === undefined || value === "") return null;

      if (typeof value === "string") {
          const hasEuro = value.includes("€");
          const digits = value.replace(/[^\d]/g, "");
          if (!digits) return value;
          const formatted = Number(digits).toLocaleString("es-ES");
          return hasEuro ? `${formatted} €` : `${formatted} €`;
      }

      const num = Number(value);
      if (Number.isNaN(num)) return null;
      return `${num.toLocaleString("es-ES")} €`;
  };

  const titleText = safeProp.title || "Activo Stratosfere";
  const locationText = safeProp.location || safeProp.address || "UBICACIÓN CONFIDENCIAL";

  const dataChips = useMemo(() => {
      const chips: string[] = [];

      if (safeProp?.type) chips.push(String(safeProp.type).toUpperCase());

      const formattedPrice = formatPrice(safeProp?.price ?? safeProp?.priceValue);
      if (formattedPrice) chips.push(formattedPrice);

      if (safeProp?.mBuilt || safeProp?.m2) {
          chips.push(`${safeProp.mBuilt || safeProp.m2} M²`);
      }

      if (safeProp?.rooms) chips.push(`${safeProp.rooms} HAB`);
      if (safeProp?.baths) chips.push(`${safeProp.baths} BAÑOS`);

      return chips.slice(0, 4);
  }, [safeProp]);

  useEffect(() => {
      if (!isOpen || unique.length <= 1) return;

      const nextIdx = (idx + 1) % unique.length;
      const prevIdx = (idx - 1 + unique.length) % unique.length;

      const preloadImages = [unique[nextIdx], unique[prevIdx]];
      preloadImages.forEach((src) => {
          if (
              typeof src === "string" &&
              !src.match(/\.(mp4|mov|webm|mkv|pdf)$/i) &&
              !src.includes("/video/upload")
          ) {
              const img = new Image();
              img.src = src;
          }
      });
  }, [isOpen, idx, unique]);

  useEffect(() => {
      if (!isOpen) return;

      const onKey = (e: KeyboardEvent) => {
          if (e.key === "Escape") onClose?.();
          if (e.key === "ArrowLeft") nav(-1);
          if (e.key === "ArrowRight") nav(1);
          if (e.key.toLowerCase() === "h") setShowChrome((v) => !v);
      };

      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, idx, onClose, unique.length]);

const nav = (dir: number) => {
      if (!unique.length) return;

      if (soundEnabled && playSynthSound) playSynthSound("click");

      if (current && !isVideo && !isPdf) {
          setPrevSrc(String(current));
          setShowPrevLayer(true);
          clearTimeout(hidePrevTimer.current);
          hidePrevTimer.current = setTimeout(() => {
              setShowPrevLayer(false);
          }, 400); 
      }

      setIdx((p) => (p + dir + unique.length) % unique.length);
      setIsZooming(false);
      
      // 🚀 NITRO: Respuesta inmediata al cambiar de foto
      setTimeout(() => setIsZooming(true), 50);
  };

  if (!mounted || !isOpen || !prop || unique.length === 0 || !current) return null;

  const ui = (
      // 💎 CONTENEDOR RAIZ (VACUNA SAFARI: bg sólido en vez de backdrop-blur)
      <div
          className="fixed inset-0 z-[999999] bg-zinc-950/95 animate-fade-in flex flex-col items-center justify-center overflow-hidden"
          onClick={onClose}
      >
          {/* Capa de refracción de cristal global (Brillo diagonal) */}
          <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(105deg,rgba(255,255,255,0.05)_0%,transparent_30%,transparent_70%,rgba(255,255,255,0.02)_100%)]" />
          
          {/* Sombra de viñeta para dar profundidad a la pantalla */}
          <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />
         
      {/* FONDOS (Visuales puros) - VISIÓN ORBITAL OPTIMIZADA */}
{showOrbitalFx && showChrome && (
    <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        {current && !isVideo && !isPdf ? (
            <img 
                src={String(current)} 
                // 🛠️ FIX TÁCTICO: Bajamos blur a 64px, quitamos pulse, bajamos opacidad para dar profundidad
                className="absolute min-w-[110vw] min-h-[110vh] object-cover blur-[64px] opacity-25 saturate-150 transform-gpu" 
                style={{ 
                    WebkitBackfaceVisibility: 'hidden',
                    backfaceVisibility: 'hidden',
                    perspective: 1000 
                }} 
                alt="ambilight-shield" 
            />
        ) : (
            <div 
                className="absolute w-[90vw] h-[80vh] bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/20 to-blue-500/20 blur-[80px] transform-gpu" 
                style={{ willChange: 'transform' }}
            />
        )}
    </div>
)}
          {/* EFECTO STUDIO HDR (Mejora Fotográfica Premium) */}
          {ultraMode && showChrome && (
              <div className="pointer-events-none absolute inset-0 z-[25]">
                  {/* 1. Filtro de Contraste y Saturación (Realza los colores) */}
                  <div className="absolute inset-0 backdrop-contrast-125 backdrop-saturate-150" />
                  
                  {/* 2. Viñeta Cinematográfica (Oscurece bordes elegantemente) */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)] mix-blend-multiply" />
                  
                  {/* 3. Fuga de luz volumétrica (Lens Flare suave) */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.15)_0%,transparent_50%)] mix-blend-overlay" />
              </div>
          )}

          <div className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(circle_at_center,transparent_36%,rgba(0,0,0,0.16)_100%)]" />

          {/* BOTÓN DE CIERRE (X) - BLINDADO */}
          <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="absolute top-6 right-6 z-[60000] w-12 h-12 rounded-full bg-white/75 hover:bg-white text-black flex items-center justify-center transition-all cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-white/70 backdrop-blur-xl group active:scale-90"
          >
              <X size={22} className="group-hover:rotate-90 transition-transform duration-500 ease-out" />
          </button>

          {/* ATAJO DE TECLADO (HELPER) */}
          <div className="absolute top-6 left-6 z-[50000] hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-black/28 backdrop-blur-xl border border-white/10 text-white/90 text-[10px] font-bold tracking-[0.24em] uppercase">
              <Shield size={12} />
              H · HUD
          </div>

          {/* CONTENEDOR PRINCIPAL: Blindado con transform-gpu para Safari */}
          <div
              className="relative w-full h-full flex items-center justify-center p-0 md:p-6 z-10 transform-gpu"
              style={{ WebkitTransform: 'translateZ(0)' }}
              onClick={(e) => e.stopPropagation()}
          >
              {/* CAJA DE LA PROPIEDAD */}
              <div className="relative w-full max-w-[95vw] h-[85vh] rounded-[32px] overflow-hidden shadow-[0_35px_120px_rgba(0,0,0,0.24)] bg-black border border-white/10 flex items-center justify-center">
                  
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-32 z-20 bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
                  <div className="pointer-events-none absolute inset-0 z-20 ring-1 ring-white/10 rounded-[32px]" />
                  
                  {/* Carga visual inicial */}
                  {!isLoaded && !isPdf && (
                      <div className="absolute inset-0 z-10 bg-black">
                          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.03] via-white/[0.06] to-white/[0.03]" />
                          <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white text-[10px] font-bold tracking-[0.22em] uppercase">
                                  <ScanSearch size={14} className="animate-pulse" />
                                  Cargando...
                              </div>
                          </div>
                      </div>
                  )}

                  {/* ⚡ TRANSICIÓN CROSSFADE PURA TAILWIND */}
                  {prevSrc && !isVideo && !isPdf && (
                      <img
                          src={prevSrc}
                          alt="prev-media"
                          className={`absolute inset-0 w-full h-full object-cover z-[9] transition-opacity duration-500 ease-out transform-gpu ${showPrevLayer ? 'opacity-100' : 'opacity-0'}`}
                      />
                  )}

                  {/* RENDER MEDIA */}
                  {isVideo ? (
                      <div className="w-full h-full bg-black flex items-center justify-center relative z-10">
                          <video key={String(current)} src={String(current)} className="w-full h-full object-contain" controls autoPlay playsInline loop onLoadedData={() => setIsLoaded(true)} />
                      </div>
                  ) : isPdf ? (
                      <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center relative z-10 group p-4 md:p-8">
                          <img
                              src={String(current).replace(/\.pdf$/i, ".jpg")}
                              alt="Vista previa"
                              className="relative z-10 h-full w-auto object-contain shadow-[0_30px_80px_rgba(0,0,0,0.18)] rounded-2xl bg-white border border-black/5"
                              onLoad={() => setIsLoaded(true)}
                              onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  e.currentTarget.nextElementSibling?.classList.remove("hidden");
                                  setIsLoaded(true);
                              }}
                          />
                          <div className="hidden absolute inset-0 z-10 flex flex-col items-center justify-center">
                              <FileText size={64} className="text-slate-300 mb-4" />
                              <p className="text-slate-400 font-bold">Vista previa no disponible</p>
                          </div>
                          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors pointer-events-none">
                              <a
                                  href={String(current).replace("/upload/", "/upload/fl_attachment/")}
                                  download
                                  onClick={(e) => e.stopPropagation()}
                                  className="pointer-events-auto px-8 py-4 bg-black text-white rounded-full text-sm font-bold shadow-2xl hover:scale-105 transition-transform flex items-center gap-3 opacity-95 hover:opacity-100"
                              >
                                  <FileText size={20} className="text-red-400" />
                                  DESCARGAR PDF
                              </a>
                          </div>
                      </div>
                  ) : (
                      <img
                          key={String(current)}
                          src={String(current)}
                          alt="Detalle Activo"
                          onLoad={() => setIsLoaded(true)}
                          className={`w-full h-full object-cover bg-gray-50 relative z-10 transition-transform ease-out will-change-transform transform-gpu ${reducedMotion ? "duration-700" : "duration-[5200ms]"} ${isZooming ? "scale-[1.04]" : "scale-100"}`}
                      />
                  )}

                  {/* OVERLAYS EFECTOS */}
                  {showChrome && showVisionFx && (
                      <>
                          <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.22)_100%)]" />
                          <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(to_top,rgba(0,0,0,0.42),transparent_28%,transparent_72%,rgba(0,0,0,0.24))]" />
                      </>
                  )}

                  {/* 💧 MARCA DE AGUA TODOTERRENO (Visible en luz y oscuridad) */}
                  <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center select-none">
                      <p className="text-white/30 text-4xl md:text-6xl font-black tracking-tighter drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                          Stratosfere OS
                      </p>
                  </div>

                  {/* 🎛️ MENÚ DE CONTROLES (HUD SUPERIOR) */}
                  <div className="absolute top-4 left-4 right-4 z-40 flex items-start justify-between gap-4 pointer-events-none">
                      <div className="flex items-center gap-2 flex-wrap pointer-events-auto">
                          
                          {/* ESTE BOTÓN NUNCA DESAPARECE, CONTROLA AL RESTO */}
                          <button
                              onClick={(e) => { e.stopPropagation(); setShowChrome((v) => !v); }}
                              className={`px-4 py-2 rounded-full backdrop-blur-xl border text-[10px] font-bold tracking-[0.24em] uppercase shadow-[0_10px_40px_rgba(0,0,0,0.18)] flex items-center gap-2 transition-all ${showChrome ? "bg-white/12 border-white/15 text-white" : "bg-black/50 border-black/50 text-white/50 hover:bg-white/10 hover:text-white"}`}
                          >
                              <Sparkles size={12} />
                              SIN TEXTOS
                          </button>

                          {/* EL RESTO DE BOTONES SÍ DESAPARECE SI CHROME ES FALSO */}
                          {showChrome && (
                              <>
                                  <button
                                      onClick={(e) => { e.stopPropagation(); setShowVisionFx((v) => !v); }}
                                      className={`px-4 py-2 rounded-full backdrop-blur-xl border text-[10px] font-bold tracking-[0.24em] uppercase flex items-center gap-2 transition-all ${showVisionFx ? "bg-black/35 border-white/10 text-white" : "bg-white/8 border-white/10 text-white/60"}`}
                                  >
                                      <Eye size={12} /> VISIÓN
                                  </button>

                                  <button
                                      onClick={(e) => { e.stopPropagation(); setShowOrbitalFx((v) => !v); }}
                                      className={`px-4 py-2 rounded-full backdrop-blur-xl border text-[10px] font-bold tracking-[0.24em] uppercase flex items-center gap-2 transition-all ${showOrbitalFx ? "bg-cyan-400/14 border-cyan-200/10 text-cyan-100" : "bg-white/8 border-white/10 text-white/60"}`}
                                  >
                                      <Orbit size={12} /> VISIÓN ORBITAL
                                  </button>

                                  <button
                                      onClick={(e) => { e.stopPropagation(); setShowThumbs((v) => !v); }}
                                      className={`hidden md:flex px-4 py-2 rounded-full backdrop-blur-xl border text-[10px] font-bold tracking-[0.24em] uppercase items-center gap-2 transition-all ${showThumbs ? "bg-fuchsia-500/14 border-fuchsia-200/10 text-fuchsia-100" : "bg-white/8 border-white/10 text-white/60"}`}
                                  >
                                      <GalleryHorizontal size={12} /> SF MEDIA
                                  </button>

                                  <button
                                      onClick={(e) => { e.stopPropagation(); setUltraMode((v) => !v); }}
                                      className={`hidden md:flex px-4 py-2 rounded-full backdrop-blur-xl border text-[10px] font-bold tracking-[0.24em] uppercase items-center gap-2 transition-all ${ultraMode ? "bg-white/10 border-white/10 text-white" : "bg-white/8 border-white/10 text-white/60"}`}
                                  >
                                      <Sparkles size={12} /> STUDIO HDR                                 
                                  </button>

                                  {/* 💎 LA GUINDA: CONTADOR DE CRISTAL ZAFIRO */}
                                  {hasMultiplePhotos && (
                                      <div className="relative px-5 py-2 rounded-full bg-white/10 backdrop-blur-2xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_3px_rgba(255,255,255,0.7)] flex items-center justify-center overflow-hidden">
                                          {/* Reflejo de luz interno (Efecto cristal pulido) */}
                                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 pointer-events-none"></div>
                                          
                                          <span className="relative z-10 text-white text-[11px] font-bold tracking-[0.3em] drop-shadow-md flex items-center gap-2.5">
                                              {/* Mini LED de estado táctico */}
                                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)] animate-pulse"></span>
                                              
                                              <span>{idx + 1} <span className="text-white/40 font-light mx-0.5">/</span> {unique.length}</span>
                                          </span>
                                      </div>
                                  )}
                              </>
                          )}
                      </div>
                  </div>

                {/* 💎 FLECHAS DE NAVEGACIÓN (CRISTAL ESMERILADO) */}
                  {hasMultiplePhotos && (
                      <>
                          <button
                              onClick={(e) => { e.stopPropagation(); nav(-1); }}
                              className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.3)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-30 cursor-pointer group"
                          >
                              <ChevronLeft size={30} strokeWidth={1.5} className="drop-shadow-md transition-transform duration-300 group-hover:-translate-x-0.5" />
                          </button>
                          
                          <button
                              onClick={(e) => { e.stopPropagation(); nav(1); }}
                              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.3)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-30 cursor-pointer group"
                          >
                              <ChevronRight size={30} strokeWidth={1.5} className="drop-shadow-md transition-transform duration-300 group-hover:translate-x-0.5" />
                          </button>
                      </>
                  )}

                  {/* MINIATURAS (THUMBNAILS) BLINDADAS */}
                  {showChrome && showThumbs && hasMultiplePhotos && (
                      <div className="absolute bottom-6 right-6 z-40 max-w-[44vw] hidden md:flex items-center gap-2 px-3 py-3 rounded-[22px] bg-black/28 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.22)] pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                          {unique.slice(0, 8).map((src, thumbIdx) => {
                              const thumbIsVideo = src.match(/\.(mp4|mov|webm|mkv)$/i) || src.includes("/video/upload");
                              const thumbIsPdf = src.match(/\.pdf$/i) || src.includes(".pdf");
                              const previewSrc = thumbIsPdf ? src.replace(/\.pdf$/i, ".jpg") : src;

                              return (
                                  <button
                                      key={`${src}-${thumbIdx}`}
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          if (soundEnabled && playSynthSound) playSynthSound("click");
                                          if (current && !isVideo && !isPdf) {
                                              setPrevSrc(String(current));
                                              setShowPrevLayer(true);
                                              clearTimeout(hidePrevTimer.current);
                                              hidePrevTimer.current = setTimeout(() => setShowPrevLayer(false), 400);
                                          }
                                          setIdx(thumbIdx);
                                      }}
                                      className={`relative w-14 h-14 rounded-2xl overflow-hidden border transition-all cursor-pointer ${thumbIdx === idx ? "border-fuchsia-400 shadow-[0_0_0_1px_rgba(217,70,239,0.35)] scale-105" : "border-white/10 hover:border-white/30"}`}
                                  >
                                      {thumbIsVideo ? (
                                          <div className="w-full h-full bg-black flex items-center justify-center"><Play size={14} className="text-white" /></div>
                                      ) : thumbIsPdf ? (
                                          <div className="w-full h-full bg-slate-200 flex items-center justify-center"><FileText size={14} className="text-slate-700" /></div>
                                      ) : (
                                          <img src={previewSrc} alt={`thumb-${thumbIdx}`} className="w-full h-full object-cover" />
                                      )}
                                      {thumbIdx === idx && <div className="absolute inset-0 ring-1 ring-fuchsia-300/60 rounded-2xl" />}
                                  </button>
                              );
                          })}
                      </div>
                  )}

                  {/* INFO INFERIOR */}
                  {showChrome && (
                      <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 z-40 pointer-events-none">
                          <div className="inline-flex max-w-[92%] md:max-w-3xl flex-col gap-4 rounded-[28px] bg-black/28 backdrop-blur-2xl border border-white/12 px-5 py-5 md:px-6 md:py-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                              <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold tracking-[0.28em] uppercase">
                                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
                                  VISIÓN INMERSIVA
                              </div>
                              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-md">
                                  {titleText}
                              </h1>
                              <div className="flex items-center gap-3 flex-wrap">
                                  <div className="p-2 bg-white/12 text-white rounded-full backdrop-blur-md border border-white/10">
                                      <MapPin size={14} fill="currentColor" />
                                  </div>
                                  <span className="text-sm md:text-base font-bold uppercase tracking-[0.18em] text-white/95 bg-white/8 px-3 py-2 rounded-xl backdrop-blur-md border border-white/10">
                                      {locationText}
                                  </span>
                              </div>
                              {dataChips.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-2 pt-1">
                                      {dataChips.map((chip, chipIdx) => (
                                          <div key={`${chip}-${chipIdx}`} className="px-3 py-2 rounded-full bg-white/8 border border-white/10 text-white/90 text-[10px] font-bold tracking-[0.18em] uppercase backdrop-blur-xl">
                                              {chip}
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      </div>
                  )}

              </div>
          </div>
      </div>
  );

  return createPortal(ui, document.body);
}