// path: lib/ui/alive-map/ui-panels/audio.ts

// ----------------------------------------------------------------------
// MOTOR DE AUDIO "CUPERTINO MONO" (V3 - ANTI-OVERLAP)
// ----------------------------------------------------------------------
// Sistema Monofónico: Solo permite 1 sonido a la vez. El nuevo mata al viejo.

let audioCtx: AudioContext | null = null;
let lastSoundTime = 0;

// VARIABLES GLOBALES PARA CONTROLAR EL SONIDO ACTIVO (EL KILL SWITCH)
let activeOsc: OscillatorNode | null = null;
let activeGain: GainNode | null = null;

export const playSynthSound = (type: 'click' | 'soft' | 'open' | 'success' | 'error' | 'toggle' | string) => {
    if (typeof window === 'undefined') return;

    try {
        const now = Date.now();
        
        // 1. DEBOUNCE (Evita disparos en el mismo milisegundo)
        // Si intentan sonar dos cosas a la vez, ignoramos la segunda.
        if (now - lastSoundTime < 30) return; 
        lastSoundTime = now;

        // 2. INICIALIZAR CONTEXTO
        if (!audioCtx) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) audioCtx = new AudioContext();
        }
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        if (!audioCtx) return;

        // ----------------------------------------------------------
        // 🔥 3. KILL SWITCH (MATAR SONIDO ANTERIOR)
        // Esto es lo que evita que se acumulen ruidos molestos.
        // ----------------------------------------------------------
        if (activeOsc) {
            try {
                // Bajamos volumen a 0 instantáneamente
                activeGain?.gain.cancelScheduledValues(audioCtx.currentTime);
                activeGain?.gain.setValueAtTime(activeGain.gain.value, audioCtx.currentTime);
                activeGain?.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.01);
                
                // Detenemos el oscilador antiguo
                activeOsc.stop(audioCtx.currentTime + 0.01);
            } catch (e) { /* Ignorar errores de parada */ }
        }
        // ----------------------------------------------------------

        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        // Guardamos las referencias globales para poder matarlas luego
        activeOsc = osc;
        activeGain = gain;

        // Filtro suave (LowPass) para quitar estridencias metálicas
        const filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 1200;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        // 4. PERFILES DE SONIDO (Limpios, Cortos y Graves)
        switch (type) {
            case 'click':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, t); // Más grave (antes 800)
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.03, t + 0.01); 
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
                osc.start(t);
                osc.stop(t + 0.1);
                break;

            case 'toggle': // CORAZÓN / SWITCH (Sonido "Burbuja")
                osc.type = 'sine';
                osc.frequency.setValueAtTime(350, t);
                osc.frequency.linearRampToValueAtTime(550, t + 0.1);
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.04, t + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                osc.start(t);
                osc.stop(t + 0.15);
                break;

            case 'soft': // Hover (Casi imperceptible)
                osc.type = 'sine';
                osc.frequency.setValueAtTime(220, t);
                gain.gain.setValueAtTime(0.015, t); 
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
                osc.start(t);
                osc.stop(t + 0.05);
                break;

            case 'open': // Abrir paneles (Aire suave, no zumbido)
                osc.type = 'sine'; 
                osc.frequency.setValueAtTime(150, t);
                osc.frequency.linearRampToValueAtTime(250, t + 0.2);
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.04, t + 0.1);
                gain.gain.linearRampToValueAtTime(0, t + 0.3);
                osc.start(t);
                osc.stop(t + 0.3);
                break;

            case 'success': // Guardar favorito (Acorde elegante)
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, t); 
                osc.frequency.setValueAtTime(659.25, t + 0.1); 
                gain.gain.setValueAtTime(0.03, t);
                gain.gain.linearRampToValueAtTime(0.05, t + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
                osc.start(t);
                osc.stop(t + 0.4);
                break;
                
            default: // Error o desconocido
                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, t);
                gain.gain.setValueAtTime(0.03, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                osc.start(t);
                osc.stop(t + 0.15);
                break;
        }

    } catch (e) { console.warn(e); }
};

