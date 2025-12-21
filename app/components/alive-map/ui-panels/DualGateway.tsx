// path: lib/ui/alive-map/ui-panels/DualGateway.tsx
"use client";
import React, { useEffect, useRef } from 'react';
import { Radar as RadarIcon, Building as BuildingIcon } from 'lucide-react';

export default function DualGateway({ onSelectMode }: { onSelectMode: (mode: string) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let w: number, h: number, particles: any[] = [];
        const particleCount = 100;
        const connectionDistance = 100;
        const mouse = { x: -9999, y: -9999, radius: 150 }; // Inicializado lejos

        const resize = () => { 
            w = canvas.width = window.innerWidth; 
            h = canvas.height = window.innerHeight; 
        };
        
        class Particle {
            x: number; y: number; vx: number; vy: number; size: number;
            constructor() { 
                this.x = Math.random() * w; 
                this.y = Math.random() * h; 
                this.vx = Math.random() * 0.5 - 0.25; 
                this.vy = Math.random() * 0.5 - 0.25; 
                this.size = Math.random() * 1.5 + 0.5; 
            }
            update() { 
                this.x += this.vx; 
                this.y += this.vy; 
                if (this.x < 0 || this.x > w) this.vx *= -1; 
                if (this.y < 0 || this.y > h) this.vy *= -1; 

                // Interacción ratón
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.x -= Math.cos(angle) * force * 2;
                    this.y -= Math.sin(angle) * force * 2;
                }
            }
            draw() { 
                if(!ctx) return;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; 
                ctx.beginPath(); 
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); 
                ctx.fill(); 
            }
        }

        const connectParticles = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    if (distance < connectionDistance) {
                        const opacity = 1 - distance / connectionDistance;
                        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.2})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const init = () => { particles = []; for (let i = 0; i < particleCount; i++) particles.push(new Particle()); };
        const animate = () => { 
            ctx.clearRect(0, 0, w, h); 
            particles.forEach(p => { p.update(); p.draw(); }); 
            connectParticles();
            requestAnimationFrame(animate); 
        };
        
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        resize(); init(); animate();
        
        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#020412]">
            <canvas ref={canvasRef} className="absolute inset-0 z-0" />
            <div className="relative z-10 flex flex-col items-center justify-center p-4 w-full max-w-6xl">
                <h1 className="text-4xl md:text-6xl font-thin text-white tracking-[0.3em] text-center mb-16 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">SELECCIONA TU CAMINO</h1>
                <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch w-full z-10">
                    {/* EXPLORER CARD */}
                    <div onClick={() => onSelectMode('EXPLORER')} className="group cursor-pointer glass-panel p-12 rounded-[2.5rem] border border-blue-500/70 hover:border-cyan-400 bg-blue-950/50 backdrop-blur-xl text-center transition-all duration-500 hover:scale-[1.02] shadow-[0_0_40px_rgba(37,99,235,0.35)] relative overflow-hidden h-[450px] flex flex-col justify-center items-center w-full md:w-1/2">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-blue-900/40 opacity-100 mix-blend-screen"></div>
                        <div className="relative z-10 transform group-hover:-translate-y-3 transition-transform duration-500 ease-out">
                            <div className="w-24 h-24 bg-blue-900/40 rounded-full flex items-center justify-center mb-8 border-2 border-blue-400/80 shadow-[0_0_30px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_70px_rgba(59,130,246,1)] transition-all"><RadarIcon className="w-10 h-10 text-blue-300 group-hover:text-white" /></div>
                            <h2 className="text-3xl font-light text-blue-100 tracking-[0.2em] mb-4">EXPLORADOR</h2>
                            <p className="text-xs text-blue-300 font-mono tracking-[0.3em]">BUSCO OPORTUNIDADES</p>
                        </div>
                    </div>
                    {/* ARCHITECT CARD */}
                    <div onClick={() => onSelectMode('ARCHITECT')} className="group cursor-pointer glass-panel p-12 rounded-[2.5rem] border border-amber-500/70 hover:border-orange-400 bg-amber-950/50 backdrop-blur-xl text-center transition-all duration-500 hover:scale-[1.02] shadow-[0_0_40px_rgba(217,119,6,0.35)] relative overflow-hidden h-[450px] flex flex-col justify-center items-center w-full md:w-1/2">
                        <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-transparent to-amber-900/40 opacity-100 mix-blend-screen"></div>
                        <div className="relative z-10 transform group-hover:-translate-y-3 transition-transform duration-500 ease-out">
                            <div className="w-24 h-24 bg-amber-900/40 rounded-full flex items-center justify-center mb-8 border-2 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.5)] group-hover:shadow-[0_0_70px_rgba(245,158,11,1)] transition-all"><BuildingIcon className="w-10 h-10 text-amber-300 group-hover:text-white" /></div>
                            <h2 className="text-3xl font-light text-amber-100 tracking-[0.2em] mb-4">ARQUITECTO</h2>
                            <p className="text-xs text-amber-300 font-mono tracking-[0.3em]">GESTIONAR MI ACTIVO</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

