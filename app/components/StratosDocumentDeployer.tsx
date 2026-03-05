"use client";

import React, { useState } from "react";
import { UploadCloud, FileSignature, CheckCircle, Zap } from "lucide-react";

export default function StratosDocumentDeployer({ onDeploy, playSynthSound }: any) {
  // Estados Tácticos del Radar
  const [isDragging, setIsDragging] = useState(false);
  const [isAbsorbing, setIsAbsorbing] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [fileName, setFileName] = useState("");

  // Prevención por defecto para que el navegador no abra el PDF a lo bruto
  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
    preventDefaults(e);
    if (!isDragging) {
      if (soundEnabled(playSynthSound)) playSynthSound('hover'); // Sonido opcional
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    preventDefaults(e);
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    preventDefaults(e);
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      executeDeployment(file);
    }
  };

  const soundEnabled = (fn: any) => typeof fn === 'function';

  // SECUENCIA DE ABSORCIÓN CINEMÁTICA
  const executeDeployment = (file: File) => {
    if (soundEnabled(playSynthSound)) playSynthSound('click');
    
    // 1. Iniciamos la animación de "traspasar el cristal"
    setIsAbsorbing(true);

    // 2. Simulamos el tiempo de viaje por el túnel cuántico (1.5 segundos)
    setTimeout(() => {
      setIsAbsorbing(false);
      setIsSent(true);
      if (soundEnabled(playSynthSound)) playSynthSound('boot');

      // 🔥 AQUÍ ES DONDE CONECTAREMOS LA API DE SIGNATURIT O DOCUSIGN 🔥
      if (onDeploy) onDeploy(file);

      // 3. Reseteamos el panel tras 3 segundos para el próximo documento
      setTimeout(() => {
        setIsSent(false);
        setFileName("");
      }, 3000);
    }, 1500);
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4">
      <div
        onDragEnter={preventDefaults}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-3xl border transition-all duration-500 flex flex-col items-center justify-center p-8 min-h-[220px] cursor-pointer group
          ${isDragging 
            ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.3)] backdrop-blur-md scale-105' 
            : 'border-white/20 bg-white/5 backdrop-blur-2xl hover:bg-white/10 hover:border-white/40 shadow-2xl'
          }
          ${isSent ? 'border-blue-400 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : ''}
        `}
      >
        {/* EFECTO ESCÁNER: Una línea de luz que baja cuando arrastramos el archivo */}
        {isDragging && (
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,1)] animate-scan opacity-70"></div>
        )}

        {/* ESTADO 1: ÉXITO (Enviado a firmar) */}
        {isSent ? (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 shadow-inner">
              <CheckCircle size={32} className="text-blue-400" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest text-center">Despliegue Exitoso</h3>
            <p className="text-[10px] text-blue-200 mt-2 font-mono text-center px-4">El documento ha sido enviado al canal seguro del cliente.</p>
          </div>
        ) : (
          /* ESTADO 2: ESPERANDO O ABSORBIENDO */
          <div 
            // 🔥 LA MAGIA DE LA ABSORCIÓN ESTÁ EN ESTE className 🔥
            className={`flex flex-col items-center transition-all duration-1000 ease-in-out
              ${isAbsorbing ? 'scale-50 translate-y-16 opacity-0 blur-xl' : 'scale-100 translate-y-0 opacity-100 blur-0'}
            `}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-500
              ${isDragging ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-400/50 rotate-6' : 'bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white'}
            `}>
              {isDragging ? <Zap size={28} /> : <FileSignature size={28} />}
            </div>
            
            <h3 className={`text-sm font-black uppercase tracking-widest text-center transition-colors duration-500
              ${isDragging ? 'text-emerald-400' : 'text-white/90'}
            `}>
              {isAbsorbing ? 'Cifrando y Enviando...' : isDragging ? 'Suelte para Desplegar' : 'Dropcard Flash'}
            </h3>
            
            <p className="text-[10px] text-white/50 mt-2 font-mono text-center px-4">
              {fileName ? fileName : 'Arrastre su PDF aquí o haga clic para iniciar el protocolo de firma.'}
            </p>
          </div>
        )}
      </div>
      
      {/* Estilos para la animación de escáner (Añada esto a su globals.css si no funciona la animación en línea) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(220px); }
        }
        .animate-scan {
          animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}} />
    </div>
  );
}