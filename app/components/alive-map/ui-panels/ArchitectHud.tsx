// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from 'react';
// 🔥 1. ICONOS COMPLETOS (Añadidos Camera, Sparkles, ArrowLeft, etc. para que nada falle)
import { 
  Building2, X, UploadCloud, CheckCircle2, ArrowRight, ArrowLeft, 
  MapPin, Ruler, Zap, Phone, ShieldCheck, Euro, Home, Map as MapIcon,
  Sparkles, FileText, Camera
} from 'lucide-react';

// 🔥 2. IMPORTAMOS LA LEY (DICCIONARIO)
import { PROPERTY_TYPES } from './property-types'; 

export default function ArchitectHud({ onCloseMode }: any) {
  
  // PASOS DEL WIZARD (RUTA ACTUALIZADA)
  // 1. LOCATION: Mapa y Dirección
  // 2. BASICS: Tipo, Planta, Puerta
  // 3. SPECS: M2, Habitaciones, Baños, Estado
  // 4. DESCRIPTION: Título y Narrativa (NUEVO)
  // 5. ENERGY: Certificado, Equipamiento
  // 6. MEDIA: Fotos
  // 7. PRICE: Precio
  // 8. VERIFY: Teléfono y SMS
  // 9. SUCCESS: Fin

  const [step, setStep] = useState('LOCATION');
  const [isClosing, setIsClosing] = useState(false);
  const [subStepVerify, setSubStepVerify] = useState('PHONE'); // PHONE | CODE
  const [loading, setLoading] = useState(false);

  // 📦 MEMORIA DEL FORMULARIO (TODOS LOS CAMPOS BLINDADOS)
  const [formData, setFormData] = useState({
    // --- LOCATION ---
    address: '',
    
    // --- BASICS ---
    type: PROPERTY_TYPES.PISO, // Por defecto usamos la constante
    floor: '',
    door: '',
    elevator: false, // Booleano para los botones Sí/No

    // --- SPECS ---
    mBuilt: '',
    mUseful: '',
    rooms: 2,
    baths: 1,
    state: 'Buen estado',
    exterior: true,

    // --- DESCRIPTION (NUEVOS) ---
    title: '',        
    description: '',  

    // --- ENERGY ---
    energyRating: 'E', 

    // --- MEDIA ---
    photos: [] as string[], // 🔥 Vital para el paso de fotos

    // --- PRICE ---
    price: '',
    communityFees: '',

    // --- VERIFY ---
    phone: '',
    phoneCode: '' // 🔥 Confirmado: Variable lista para el SMS
  });

  // HELPER PARA ACTUALIZAR DATOS
  const updateData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
 // CIERRE SUAVE Y ENVÍO DE DATOS
  const handleClose = (success = false) => {
    setIsClosing(true);
    
    setTimeout(() => { 
        if (onCloseMode) {
            // 🔥 Si hay éxito, enviamos los datos (formData) al Jefe.
            // Si cierra con la X, enviamos null.
            const payload = success ? formData : null;
            onCloseMode(success, payload); 
        }
    }, 300);
  };

  // BARRA DE PROGRESO
  const getProgress = () => {
    // 👇 AÑADA 'DESCRIPTION' AQUÍ EN MEDIO:
    const steps = ['LOCATION', 'BASICS', 'SPECS', 'DESCRIPTION', 'ENERGY', 'MEDIA', 'PRICE', 'VERIFY', 'SUCCESS'];
    const index = steps.indexOf(step);
    return ((index + 1) / steps.length) * 100;
  };

  // --- 1. LOCALIZACIÓN ---
  const StepLocation = () => {
    const [mapConfirmed, setMapConfirmed] = useState(false);

    const handleMapClick = () => {
        if (!formData.address) updateData('address', 'Calle Velázquez 45, Madrid');
        setMapConfirmed(true);
    };

    // Lógica para saber si podemos avanzar
    const canContinue = !!formData.address || mapConfirmed;

    return (
        <div className="h-full flex flex-col animate-fade-in-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Dónde está el inmueble?</h2>
            <p className="text-gray-500 mb-6 text-sm">Geolocalización exacta para valoración.</p>
            
            <div className="flex-1 space-y-6">
                <div className="relative">
                    <MapPin className={`absolute left-4 top-4 ${mapConfirmed ? 'text-green-500' : 'text-gray-400'}`} size={20}/>
                    <input 
                        autoFocus
                        value={formData.address}
                        onChange={e => { updateData('address', e.target.value); setMapConfirmed(false); }}
                        className={`w-full pl-12 p-4 bg-gray-50 rounded-xl border outline-none font-medium text-gray-900 transition-all ${mapConfirmed ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200 focus:border-blue-500'}`}
                        placeholder="Dirección exacta (Calle, Número...)"
                    />
                </div>
                
                {/* MAPA INTERACTIVO */}
                <div 
                    onClick={handleMapClick}
                    className={`rounded-2xl h-48 flex items-center justify-center border overflow-hidden relative group cursor-pointer transition-all ${mapConfirmed ? 'border-green-500 ring-2 ring-green-200' : 'border-blue-100 hover:border-blue-300'}`}
                >
                    <div className="absolute inset-0 bg-[url('https://docs.mapbox.com/mapbox-gl-js/assets/streets-v11.jpg')] bg-cover opacity-60 group-hover:opacity-80 transition-all"></div>
                    <div className={`relative z-10 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold transition-all transform duration-300 ${mapConfirmed ? 'bg-green-600 text-white scale-110' : 'bg-white text-blue-600 group-hover:scale-105'}`}>
                        {mapConfirmed ? <><CheckCircle2 size={16}/> Ubicación Confirmada</> : <><MapIcon size={16}/> Confirmar ubicación</>}
                    </div>
                </div>
            </div>

            {/* 🔥 EL ARREGLO ESTÁ AQUI ABAJO: style={{ backgroundColor: '#000' }} */}
            <button 
                onClick={() => setStep('BASICS')} 
                disabled={!canContinue} 
                className="w-full py-4 text-white font-bold rounded-2xl shadow-lg mt-6 flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: canContinue ? '#000000' : '#cccccc' }} 
            >
                Continuar
            </button>
        </div>
    );
  };



// --- 3. DIMENSIONES Y ESTADO (CORREGIDO: NAVEGACIÓN A DESCRIPCIÓN) ---
  const StepSpecs = () => {
    
    // HELPER: Poner puntos de miles (1000 -> 1.000)
    const formatNumber = (val: any) => {
        if (!val) return '';
        const raw = val.toString().replace(/\D/g, ''); // Solo números
        return raw.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Puntos
    };

    // 1. ESTADO LOCAL: Controla el input visualmente
    const [localM2, setLocalM2] = useState(formData.mBuilt ? formatNumber(formData.mBuilt) : '');

    // 2. HANDLER VISUAL
    const handleLocalChange = (e: any) => {
        const raw = e.target.value.replace(/\D/g, ''); 
        setLocalM2(formatNumber(raw)); 
    };

    // 3. HANDLER DE GUARDADO (onBlur)
    const saveM2 = () => {
        const cleanValue = localM2.replace(/\./g, ''); 
        if (cleanValue !== formData.mBuilt) {
            updateData('mBuilt', cleanValue);
        }
    };

    return (
        <div className="h-full flex flex-col animate-fade-in-right">
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ color: '#000' }}>Dimensiones y Estado</h2>
        
        <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
            
            {/* METROS */}
            <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3" style={{ color: '#333' }}>Superficie Construida (m²)</label>
                <div className="relative group">
                    <input 
                            type="text" 
                            inputMode="numeric" 
                            autoComplete="off"
                            className="w-full p-4 pr-12 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 outline-none font-medium text-gray-900 transition-all"
                            style={{ color: '#000' }}
                            placeholder="Ej: 100" 
                            value={localM2} 
                            onChange={handleLocalChange}
                            onBlur={saveM2}
                        />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none select-none">m²</span>
                </div>
            </div>

            {/* HABITACIONES Y BAÑOS */}
            <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3" style={{ color: '#333' }}>Habitaciones</label>
                        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-300">
                            <button onClick={() => updateData('rooms', Math.max(0, Number(formData.rooms || 0) - 1))} className="w-10 h-10 bg-white rounded-lg shadow-sm font-bold text-gray-900 hover:bg-gray-100 border border-gray-200">-</button>
                            <span className="flex-1 text-center font-bold text-xl text-black">{formData.rooms}</span>
                            <button onClick={() => updateData('rooms', Number(formData.rooms || 0) + 1)} className="w-10 h-10 bg-white rounded-lg shadow-sm font-bold text-blue-600 hover:bg-blue-50 border border-gray-200">+</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3" style={{ color: '#333' }}>Baños</label>
                        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-300">
                            <button onClick={() => updateData('baths', Math.max(0, Number(formData.baths || 0) - 1))} className="w-10 h-10 bg-white rounded-lg shadow-sm font-bold text-gray-900 hover:bg-gray-100 border border-gray-200">-</button>
                            <span className="flex-1 text-center font-bold text-xl text-black">{formData.baths}</span>
                            <button onClick={() => updateData('baths', Number(formData.baths || 0) + 1)} className="w-10 h-10 bg-white rounded-lg shadow-sm font-bold text-blue-600 hover:bg-blue-50 border border-gray-200">+</button>
                        </div>
                    </div>
            </div>

            {/* ESTADO */}
            <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3" style={{ color: '#333' }}>Estado de conservación</label>
                <div className="grid grid-cols-3 gap-3">
                    {['Obra nueva', 'Buen estado', 'A reformar'].map(s => (
                        <button 
                                key={s} 
                                onClick={() => updateData('state', s)} 
                                className={`py-3 px-2 border rounded-xl text-xs font-bold transition-all ${
                                    formData.state === s 
                                    ? 'border-blue-600 bg-blue-600 text-white shadow-md' 
                                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                }`}
                            >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* ORIENTACIÓN */}
                <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3" style={{ color: '#333' }}>Orientación</label>
                <div className="flex gap-4">
                    <button 
                            onClick={() => updateData('exterior', true)} 
                            className={`flex-1 py-3 border rounded-xl text-sm font-bold transition-all ${
                                formData.exterior 
                                ? 'border-blue-600 bg-blue-600 text-white shadow-md' 
                                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                        >
                            Exterior
                        </button>
                    <button 
                            onClick={() => updateData('exterior', false)} 
                            className={`flex-1 py-3 border rounded-xl text-sm font-bold transition-all ${
                                !formData.exterior 
                                ? 'border-blue-600 bg-blue-600 text-white shadow-md' 
                                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                        >
                            Interior
                        </button>
                </div>
            </div>
        </div>

        {/* NAVEGACIÓN */}
        <div className="mt-6 flex gap-4 pt-4 border-t border-gray-100">
                <button onClick={() => setStep('BASICS')} className="p-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95">
                    <ArrowLeft size={24}/>
                </button>
                <button 
                    onClick={() => {
                        saveM2(); 
                        // 🔥 AQUÍ ESTABA EL ERROR: AHORA SÍ VAMOS A 'DESCRIPTION'
                        setStep('DESCRIPTION'); 
                    }} 
                    className="w-full py-4 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: '#000' }}
                >
                    Siguiente
                </button>
        </div>
        </div>
    );
  };

  
  // --- 4. CERTIFICADO ENERGÉTICO (ARREGLADO: LÓGICA DE COLOR INTEGRADA) ---
  const StepEnergy = () => {
    
    // INTEGRADO AQUÍ PARA EVITAR ERRORES DE "NOT DEFINED"
    const getEnergyColor = (rating) => {
        const colors = {
            'A': 'bg-green-600 border-green-600 text-white',
            'B': 'bg-green-500 border-green-500 text-white',
            'C': 'bg-green-400 border-green-400 text-white',
            'D': 'bg-yellow-400 border-yellow-400 text-white',
            'E': 'bg-orange-400 border-orange-400 text-white',
            'F': 'bg-orange-500 border-orange-500 text-white',
            'G': 'bg-red-600 border-red-600 text-white'
        };
        return colors[rating] || '';
    };

    return (
        <div className="h-full flex flex-col animate-fade-in-right">
        <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ color: '#000' }}>Certificado Energético</h2>
        <p className="text-gray-500 mb-6 text-sm flex items-center gap-2">
                <ShieldCheck size={14} className="text-green-600"/> Obligatorio por ley
        </p>
        
        <div className="flex-1 flex flex-col justify-center">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-4" style={{ color: '#333' }}>
                    Calificación de consumo
                </label>
                
                <div className="grid grid-cols-4 gap-3 mb-8">
                    {['A','B','C','D','E','F','G'].map(rating => (
                        <button 
                            key={rating} 
                            onClick={() => updateData('energyRating', rating)}
                            className={`py-4 rounded-xl font-black text-xl border transition-all ${
                                formData.energyRating === rating 
                                ? getEnergyColor(rating) // Usamos la función interna
                                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            {rating}
                        </button>
                    ))}
                </div>

                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-3 items-start">
                    <div className="mt-1 min-w-[20px]"><Zap size={18} className="text-orange-500"/></div>
                    <p className="text-xs text-orange-800 leading-relaxed font-medium">
                        Si aún no dispones del certificado, puedes continuar, pero será necesario para publicar el anuncio definitivo.
                    </p>
                </div>
                
                <button 
                    onClick={() => updateData('energyRating', 'TRAMITE')} 
                    className={`mt-6 text-sm font-bold underline text-center transition-colors ${formData.energyRating === 'TRAMITE' ? 'text-blue-700' : 'text-blue-600'}`}
                >
                    {formData.energyRating === 'TRAMITE' ? 'Seleccionado: Está en trámite' : 'No lo tengo: Está en trámite'}
                </button>
        </div>

        {/* NAVEGACIÓN */}
        <div className="nav-buttons mt-6 flex gap-4 pt-4 border-t border-gray-100">
                <button onClick={() => setStep('SPECS')} className="p-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95">
                    <ArrowLeft/>
                </button>
                <button 
                    onClick={() => setStep('MEDIA')} 
                    disabled={!formData.energyRating} 
                    className="w-full py-4 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-100 disabled:cursor-not-allowed"
                    style={{ backgroundColor: formData.energyRating ? '#000000' : '#cccccc' }}
                >
                    Continuar
                </button>
        </div>
        </div>
    );
  };
 // --- 5. FOTOS Y MEDIA (CORREGIDO: ALTO CONTRASTE Y LAYOUT) ---
  const StepMedia = () => (
    <div className="h-full flex flex-col animate-fade-in-right">
       <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ color: '#000' }}>Fotos y Planos</h2>
       
       {/* ZONA DE CARGA PRINCIPAL */}
       <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-3xl hover:border-blue-600 hover:bg-blue-50 transition-all cursor-pointer group p-8 bg-gray-50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-md border border-gray-200 group-hover:scale-110 transition-transform">
                <UploadCloud size={32} className="text-blue-600"/>
            </div>
            <p className="text-xl font-bold mb-2 text-black">Añadir fotos y vídeos</p>
            <p className="text-sm font-medium text-gray-600 text-center max-w-xs">
                Arrastra aquí o haz clic. <br/>
                <span className="text-xs text-gray-500">Formato horizontal recomendado.</span>
            </p>
       </div>
       
       {/* TIRA DE MINIATURAS (Ahora son 4 y visibles) */}
       <div className="mt-6">
            <p className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">Galería (0/10)</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map(i => (
                    <div 
                        key={i} 
                        className="w-24 h-24 bg-white rounded-xl flex-shrink-0 border-2 border-dashed border-gray-300 flex items-center justify-center"
                    >
                        <span className="text-gray-300 font-bold text-xl">+</span>
                    </div>
                ))}
            </div>
       </div>

       {/* NAVEGACIÓN (Reparada: Visible) */}
       <div className="nav-buttons mt-4 flex gap-4 pt-4 border-t border-gray-100">
            <button 
                onClick={() => setStep('ENERGY')} 
                className="p-4 bg-gray-100 text-gray-900 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95 border border-gray-200"
            >
                <ArrowLeft/>
            </button>
            <button 
                onClick={() => setStep('PRICE')} 
                className="w-full py-4 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: '#000' }}
            >
                Siguiente
            </button>
       </div>
    </div>
  );
 // --- 6. PRECIO (CORREGIDO: SIN FLECHAS MOLESTAS Y SIN SALTOS) ---
  const StepPrice = () => {
    
    // 1. ESTADOS INTERNOS (Memoria temporal para fluidez total)
    // Inicializamos con el valor guardado (si existe) formateado
    const [localPrice, setLocalPrice] = useState(formData.price ? formatCurrency(formData.price) : '');
    const [localCommunity, setLocalCommunity] = useState(formData.communityFees || '');

    // Helper: Formato de miles (1000 -> 1.000)
    function formatCurrency(value: string) {
        if (!value) return '';
        const raw = value.toString().replace(/\D/g, ''); // Solo números
        return raw.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Puntos
    }

    // Helper: Limpiar puntos para guardar (1.000 -> 1000)
    function cleanCurrency(value: string) {
        return value.replace(/\./g, '');
    }

    // HANDLER PRECIO: Puntos automáticos y cero saltos
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let raw = e.target.value.replace(/\D/g, '');
        // Quitar ceros a la izquierda
        if (raw.length > 1 && raw.startsWith('0')) raw = raw.replace(/^0+/, '');
        setLocalPrice(formatCurrency(raw));
    };

    // HANDLER COMUNIDAD: Sin flechas, solo números
    const handleCommunityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, ''); // Bloquea letras
        setLocalCommunity(raw);
    };

    // Sincronización final al salir del paso
    const syncData = () => {
        const cleanP = cleanCurrency(localPrice);
        if (cleanP !== formData.price) updateData('price', cleanP);
        if (localCommunity !== formData.communityFees) updateData('communityFees', localCommunity);
    };

    return (
        <div className="h-full flex flex-col animate-fade-in-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ color: '#000' }}>Precio del inmueble</h2>
            
            <div className="flex-1 space-y-8">
                    
                    {/* INPUT 1: PRECIO DE VENTA */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3" style={{ color: '#333' }}>
                            Precio de venta
                        </label>
                        <div className="relative">
                            <input 
                                type="text"
                                inputMode="numeric"
                                className="w-full pl-6 pr-12 py-6 bg-gray-50 rounded-2xl border border-gray-300 focus:border-blue-500 outline-none font-bold text-4xl tracking-tight transition-all placeholder:text-gray-300" 
                                style={{ color: '#000' }}
                                placeholder="0" 
                                value={localPrice}           
                                onChange={handlePriceChange} 
                                onBlur={syncData}            
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-2xl">€</span>
                        </div>
                    </div>

                    {/* INPUT 2: GASTOS DE COMUNIDAD (LIMPIO) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3" style={{ color: '#333' }}>
                            Gastos de comunidad (Mensual)
                        </label>
                        <div className="relative">
                            <input 
                                type="text"          /* CAMBIADO A TEXTO: ADIÓS FLECHAS */
                                inputMode="numeric"  /* TECLADO NUMÉRICO EN MÓVIL */
                                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 outline-none font-medium text-xl transition-all"
                                style={{ color: '#000' }}
                                placeholder="0" 
                                value={localCommunity}           
                                onChange={handleCommunityChange} 
                                onBlur={syncData}                
                            />
                            <span className="absolute right-4 top-4 text-gray-500 font-bold text-sm">€ / mes</span>
                        </div>
                    </div>
            </div>

            {/* NAVEGACIÓN */}
            <div className="nav-buttons mt-6 flex gap-4 pt-4 border-t border-gray-100">
                    <button 
                        onClick={() => { syncData(); setStep('MEDIA'); }} 
                        className="p-4 bg-gray-100 text-gray-900 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95 border border-gray-200"
                    >
                        <ArrowLeft/>
                    </button>
                    <button 
                        onClick={() => { syncData(); setStep('VERIFY'); }} 
                        disabled={!localPrice || localPrice === '0'} 
                        className="w-full py-4 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-100 disabled:cursor-not-allowed"
                        style={{ backgroundColor: (localPrice && localPrice !== '0') ? '#000000' : '#cccccc' }}
                    >
                        Continuar
                    </button>
            </div>
        </div>
    );
  };
 // --- 7. VERIFICACIÓN TELÉFONO (CORREGIDO: MEMORIA INTERNA FLUIDA) ---
  const StepVerify = () => {
    
    // 1. ESTADOS LOCALES (Para escribir fluido sin atascos)
    const [localPhone, setLocalPhone] = useState(formData.phone || '');
    const [localCode, setLocalCode] = useState(formData.phoneCode || '');

    // HANDLER TELÉFONO: Solo actualiza la vista local
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, ''); // Solo números
        setLocalPhone(raw);
    };

    // HANDLER CÓDIGO: Solo actualiza la vista local y detecta el final
    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        setLocalCode(raw);
        
        // Si completa los 4 dígitos, guardamos y lanzamos
        if (raw.length === 4) {
            updateData('phoneCode', raw); // Guardado real
            setLoading(true);
            setTimeout(() => { setLoading(false); setStep('SUCCESS'); }, 2000);
        }
    };

    // ACCIÓN ENVIAR SMS: Guarda el teléfono real y avanza
    const handleSendSms = () => {
        updateData('phone', localPhone); // Guardado real ahora sí
        setLoading(true); 
        setTimeout(() => { setLoading(false); setSubStepVerify('CODE'); }, 1500);
    };

    return (
        <div className="h-full flex flex-col animate-fade-in-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ color: '#000' }}>Validación de seguridad</h2>
            <p className="text-gray-500 mb-8 text-sm">Para publicar, necesitamos verificar que eres humano.</p>
        
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            {subStepVerify === 'PHONE' ? (
                // --- FASE 1: INTRODUCIR TELÉFONO ---
                <>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3" style={{ color: '#333' }}>
                        Tu teléfono móvil
                    </label>
                    <div className="flex gap-3 mb-6">
                        <div className="bg-gray-100 rounded-2xl px-4 flex items-center font-bold text-gray-600 border border-gray-300">
                            +34
                        </div>
                        <input 
                            type="text" 
                            inputMode="numeric"
                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-300 focus:border-blue-500 outline-none font-bold text-xl tracking-widest text-gray-900 transition-all placeholder:text-gray-300"
                            style={{ color: '#000' }} 
                            placeholder="600 000 000"
                            value={localPhone}           // Leemos de memoria local
                            onChange={handlePhoneChange} // Escribimos en memoria local
                        />
                    </div>
                    <button 
                        onClick={handleSendSms}
                        // Habilitamos el botón basado en lo que ves (localPhone)
                        disabled={localPhone.length < 9 || loading}
                        className="w-full py-4 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#000000' }}
                    >
                        {loading ? 'Enviando SMS...' : 'Enviar Código'}
                    </button>
                </>
            ) : (
                // --- FASE 2: INTRODUCIR CÓDIGO ---
                <>
                    <div className="text-center mb-8">
                        <p className="text-sm text-gray-600 font-medium">Hemos enviado un código SMS al</p>
                        <p className="font-black text-xl text-black mt-1 tracking-wider">{localPhone}</p>
                        <button onClick={() => setSubStepVerify('PHONE')} className="text-sm text-blue-600 font-bold underline mt-2 hover:text-blue-800">
                            Corregir número
                        </button>
                    </div>
                    
                    <label className="block text-xs font-bold text-center text-gray-500 uppercase tracking-widest mb-4">
                        Código de verificación
                    </label>
                    
                    <input 
                        type="text"
                        inputMode="numeric"
                        className="w-full text-center text-5xl font-black tracking-[0.5em] py-4 border-b-4 border-gray-200 focus:border-black outline-none mb-8 bg-transparent transition-all"
                        style={{ color: '#000' }}
                        placeholder="0000"
                        maxLength={4}
                        value={localCode}           // Leemos de memoria local
                        onChange={handleCodeChange} // Escribimos en memoria local
                    />
                    <p className="text-xs text-center text-gray-400 font-medium">
                        ¿No llega? <span className="text-black font-bold cursor-pointer underline">Reenviar en 30s</span>
                    </p>
                </>
            )}
            </div>

            {/* BOTÓN ATRÁS */}
            {subStepVerify === 'PHONE' && (
                <div className="nav-buttons mt-6 pt-4 border-t border-gray-100">
                    <button 
                        onClick={() => {
                            updateData('phone', localPhone); // Guardamos antes de salir por si acaso
                            setStep('PRICE');
                        }} 
                        className="p-4 bg-gray-100 text-gray-900 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95 border border-gray-200"
                    >
                        <ArrowLeft/>
                    </button>
                </div>
            )}
        </div>
    );
  };
  // --- 8. ÉXITO (CORREGIDO: BOTÓN NEGRO VISIBLE) ---
  const StepSuccess = () => (
    <div className="h-full flex flex-col items-center justify-center animate-fade-in-up text-center p-6">
        {/* ICONO */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce-small border border-green-200">
            <CheckCircle2 size={48} className="text-green-600" />
        </div>
        
        {/* TITULO Y TEXTO */}
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight" style={{ color: '#000' }}>
            ¡Propiedad Publicada!
        </h2>
        <p className="text-gray-500 mb-10 max-w-xs mx-auto text-lg font-medium leading-relaxed">
            Tu anuncio ha sido verificado y ya aparece disponible en el mapa Stratos.
        </p>
        
        {/* BOTÓN REPARADO (FONDO NEGRO) */}
        <button 
            onClick={() => handleClose(true)} 
            className="px-12 py-5 text-white font-bold rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#000000' }}
        >
            Ir al Mapa
        </button>
    </div>
  );

  // --- RENDERIZADO PRINCIPAL ---
  return (
    // Quitamos 'bg-black/40' y 'backdrop-blur' del contenedor padre para manejarlo nosotros
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-500 ${isClosing ? 'opacity-0' : 'opacity-100'} pointer-events-auto`}>
        
        {/* --- CAPA 1: EL FONDO STRATOSFERE --- */}
        {/* Gradiente sutil: Blanco -> Gris Platino -> Azul Cielo Pálido */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#fdfbfb] via-[#ebedee] to-[#dbeafe]"></div>
        
        {/* --- CAPA 2: DIFUMINADO DE CRISTAL --- */}
        {/* Esto suaviza el mapa que pueda haber detrás (si se transparentase algo) */}
        <div className="absolute inset-0 backdrop-blur-md opacity-60"></div>

        {/* --- CAPA 3: LA TARJETA DEL CUESTIONARIO --- */}
        {/* Importante: Añadimos 'relative' y 'z-10' para que flote ENCIMA del fondo nuevo */}
        <div className={`relative z-10 bg-white rounded-[32px] shadow-2xl w-full max-w-lg h-[750px] flex flex-col overflow-hidden transform transition-all duration-500 ${isClosing ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'}`}>
            
            {/* CABECERA (Barra de Progreso) */}
            {step !== 'SUCCESS' && (
                <div className="px-8 pt-8 pb-4 border-b border-gray-100 bg-white z-10">
                    <div className="flex justify-between items-center mb-4">
                         <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">
                            Paso {Math.round(getProgress() / 12.5)} de 8
                         </span>
                         <button onClick={() => handleClose(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                            <X size={20} className="text-gray-400"/>
                         </button>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${getProgress()}%` }}></div>
                    </div>
                </div>
            )}

          {/* CUERPO DEL WIZARD (ACTUALIZADO PARA USAR COMPONENTES EXTERNOS) */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
                {step === 'LOCATION' && <StepLocation />}
                
                {/* 🔥 AHORA PASAMOS PROPS PORQUE ESTÁN FUERA */}
                {step === 'BASICS' && <StepBasics formData={formData} updateData={updateData} setStep={setStep} />}
                
                {step === 'SPECS' && <StepSpecs />}
                
                {/* 🔥 AHORA PASAMOS PROPS PORQUE ESTÁN FUERA */}
                {step === 'DESCRIPTION' && <StepDescription formData={formData} updateData={updateData} setStep={setStep} />}
                
                {step === 'ENERGY' && <StepEnergy />}
                {step === 'MEDIA' && <StepMedia />}
                {step === 'PRICE' && <StepPrice />}
                {step === 'VERIFY' && <StepVerify />}
                {step === 'SUCCESS' && <StepSuccess />}
            </div>
        </div>

        {/* ESTILOS INYECTADOS */}
        <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { bg: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 20px; }
            
            .label-form { @apply block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3; }
            .input-form { @apply w-full p-4 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 outline-none font-medium text-gray-900 transition-all; }
            
            .btn-primary { @apply py-4 bg-black text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed; }
            .btn-secondary { @apply p-4 bg-gray-100 text-gray-900 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95 border border-gray-200; }
            .btn-select { @apply py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all; }
            .btn-select.active { @apply border-blue-600 bg-blue-600 text-white shadow-md; }
            .nav-buttons { @apply mt-8 flex gap-4 pt-4 border-t border-gray-50; }
        `}</style>
    </div>
  );
}

// ============================================================================
// 🧱 COMPONENTES EXTERNOS (BLINDADOS CONTRA REINICIOS)
// Pegar esto al final del archivo, fuera de la función principal.
// ============================================================================

// --- PASO 2: CARACTERÍSTICAS (SCROLL FIJO) ---
const StepBasics = ({ formData, updateData, setStep }: any) => {
    // Memoria local para la puerta (Input Buffer)
    const [localDoor, setLocalDoor] = React.useState(formData.door || '');
    const saveDoor = () => { if (localDoor !== formData.door) updateData('door', localDoor); };

    return (
        <div className="h-full flex flex-col animate-fade-in-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Características</h2>
            
            {/* Contenedor con min-height-0 para estabilidad del flex */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 space-y-6">
                
                {/* LISTA DE TIPOS (EL SCROLL YA NO SALTARÁ) */}
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Tipo de inmueble</label>
                    <div className="grid grid-cols-2 gap-3 pb-2">
                        {Object.values(PROPERTY_TYPES).map((t: any) => (
                            <button 
                                key={t} 
                                type="button" 
                                onClick={(e) => {
                                    e.preventDefault(); // Mantiene posición
                                    updateData('type', t);
                                }} 
                                className={`py-3 border rounded-xl text-xs font-bold transition-all w-full text-center truncate px-2 ${
                                    formData.type === t 
                                    ? 'border-blue-600 bg-blue-600 text-white shadow-md transform scale-[1.02]' 
                                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PLANTA Y PUERTA */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Planta</label>
                        <select className="w-full p-4 bg-gray-50 rounded-xl border border-gray-300 outline-none font-medium text-gray-900" value={formData.floor} onChange={e => updateData('floor', e.target.value)}>
                            <option value="">Selecciona</option>
                            <option value="Bajo">Bajo</option>
                            {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}ª Planta</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Puerta</label>
                        <input 
                            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-300 outline-none font-medium text-gray-900" 
                            placeholder="Ej: 2B" 
                            value={localDoor} 
                            onChange={(e) => setLocalDoor(e.target.value)} 
                            onBlur={saveDoor}
                        />
                    </div>
                </div>

                {/* ASCENSOR */}
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">¿Tiene ascensor?</label>
                    <div className="flex gap-4">
                        <button onClick={() => updateData('elevator', true)} className={`flex-1 py-3 border rounded-xl text-sm font-bold ${formData.elevator ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}>Sí</button>
                        <button onClick={() => updateData('elevator', false)} className={`flex-1 py-3 border rounded-xl text-sm font-bold ${!formData.elevator ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}>No</button>
                    </div>
                </div>
                
                <div className="h-8"></div>
            </div>

            {/* NAVEGACIÓN */}
            <div className="mt-4 flex gap-4 pt-4 border-t border-gray-100 bg-white z-10">
                <button onClick={() => setStep('LOCATION')} className="p-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200"><ArrowLeft size={24}/></button>
                <button onClick={() => { saveDoor(); setStep('SPECS'); }} className="w-full py-4 text-white font-bold rounded-2xl shadow-lg bg-black hover:opacity-90">Siguiente</button>
            </div>
        </div>
    );
};

// --- PASO 4: DESCRIPCIÓN (ESCRITURA FLUIDA) ---
const StepDescription = ({ formData, updateData, setStep }: any) => {
    // Buffer local para que no se corte la escritura
    const [localTitle, setLocalTitle] = React.useState(formData.title || '');
    const [localDesc, setLocalDesc] = React.useState(formData.description || '');

    const saveTitle = () => { if(localTitle !== formData.title) updateData('title', localTitle); };
    const saveDesc = () => { if(localDesc !== formData.description) updateData('description', localDesc); };

    return (
        <div className="h-full flex flex-col animate-fade-in-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Véndelo con palabras</h2>
            <p className="text-gray-500 mb-6 text-sm">Describe tu activo para que la IA lo indexe mejor.</p>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {/* TITULAR */}
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Titular</label>
                    <input 
                        type="text" 
                        placeholder="Ej: Ático luminoso..."
                        className="w-full p-4 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 outline-none font-medium text-gray-900 transition-all"
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        onBlur={saveTitle}
                    />
                </div>

                {/* DESCRIPCIÓN */}
                <div className="flex-1">
                     <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Descripción</label>
                     <textarea 
                        rows={8}
                        placeholder="Detalles clave..."
                        className="w-full p-4 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 outline-none font-medium text-gray-900 resize-none leading-relaxed"
                        value={localDesc}
                        onChange={(e) => setLocalDesc(e.target.value)}
                        onBlur={saveDesc}
                     />
                </div>
            </div>

            <div className="mt-6 flex gap-4 pt-4 border-t border-gray-100">
                <button onClick={() => setStep('SPECS')} className="p-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200"><ArrowLeft size={24} /></button>
                <button 
                    onClick={() => { saveTitle(); saveDesc(); setStep('ENERGY'); }} 
                    disabled={!localTitle && !localDesc}
                    className="w-full py-4 text-white font-bold rounded-2xl shadow-lg bg-black hover:opacity-90 disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
};

