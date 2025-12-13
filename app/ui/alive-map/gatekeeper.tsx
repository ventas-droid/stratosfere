// @ts-nocheck
"use client";
import React, { useState } from 'react';

// Colores definidos aquí mismo para no depender de importaciones externas
const CORPORATE_BLUE = "#1d4ed8";
const TEXT_COLOR = "#d4d4d8";

const Gatekeeper = ({ onUnlock, t, sound }) => {
    const [status, setStatus] = useState('LOCKED'); 
    
    const handleAccess = () => { 
        if (sound) sound.playBoot(); 
        setStatus('GRANTED'); 
        setTimeout(() => { onUnlock(); }, 2000); 
    };

    return (
        <div 
            style={{
                // ESTO ES LO QUE ARREGLA EL PROBLEMA SIN CAMBIAR CONFIGURACIONES
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#050505',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 1s ease-out',
                opacity: status === 'GRANTED' ? 0 : 1,
                pointerEvents: status === 'GRANTED' ? 'none' : 'auto'
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: '4rem', userSelect: 'none' }}>
                <h1 style={{ fontSize: '4rem', fontWeight: 300, letterSpacing: '0.2em', color: TEXT_COLOR, marginBottom: '1rem', fontFamily: 'sans-serif' }}>
                    STRATOS<span style={{ fontWeight: 'bold', color: CORPORATE_BLUE }}>FERE</span>
                </h1>
                <div style={{ height: '1px', width: '100px', background: 'rgba(255,255,255,0.2)', margin: '0 auto' }}></div>
            </div>

            <div style={{ height: '6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> 
                {status === 'LOCKED' && (
                    <button 
                        onClick={handleAccess} 
                        onMouseEnter={() => sound?.playHover()}
                        style={{
                            padding: '12px 40px',
                            backgroundColor: 'white',
                            color: 'black',
                            borderRadius: '9999px',
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            letterSpacing: '0.1em',
                            cursor: 'pointer',
                            border: 'none',
                            boxShadow: '0 0 20px rgba(255,255,255,0.3)',
                            transition: 'transform 0.3s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {t?.gatekeeper?.btn || "ACCESO"}
                    </button>
                )}
                {status === 'GRANTED' && (
                    <div style={{ color: '#34d399', fontFamily: 'monospace', letterSpacing: '0.1em', animation: 'pulse 1s infinite', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '8px 16px', borderRadius: '4px', backgroundColor: 'rgba(52, 211, 153, 0.1)' }}>
                        {t?.gatekeeper?.access || "ACCESO CONCEDIDO"}
                    </div>
                )}
            </div>
            
            <div style={{ position: 'absolute', bottom: '2rem', fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', letterSpacing: '0.2em' }}>
                SECURE CONNECTION V.2.0
            </div>
        </div>
    );
};

export default Gatekeeper;


