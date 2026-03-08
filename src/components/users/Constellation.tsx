'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { StellarRole } from '@/types/horizion';

interface OrbitingStar {
  id: StellarRole;
  label: string;
  role: string;
  orbitRadius: number;
  orbitSpeed: number;
  orbitTilt: number;
  orbitPhase: number;
  size: number;
}

const CATALOG: OrbitingStar[] = [
  { id: 'sirius',     label: 'Sirius',     role: 'Diretor',      orbitRadius: 118, orbitSpeed:  0.20, orbitTilt:  0.42, orbitPhase: 0.0,  size: 0.52 },
  { id: 'rigel',      label: 'Rigel',      role: 'Gerente',      orbitRadius:  90, orbitSpeed: -0.28, orbitTilt: -0.58, orbitPhase: 1.3,  size: 0.42 },
  { id: 'betelgeuse', label: 'Betelgeuse', role: 'Coordenador', orbitRadius: 142, orbitSpeed:  0.16, orbitTilt:  0.68, orbitPhase: 2.6,  size: 0.48 },
  { id: 'altair',     label: 'Altair',     role: 'Analista',    orbitRadius: 102, orbitSpeed: -0.24, orbitTilt: -0.35, orbitPhase: 4.2,  size: 0.38 },
  { id: 'polaris',    label: 'Polaris',    role: 'Colaborador', orbitRadius: 128, orbitSpeed:  0.18, orbitTilt:  0.52, orbitPhase: 5.4,  size: 0.36 },
];

const RED = '#B6192E';

export function Constellation({ currentRole }: { currentRole: StellarRole }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const dragRef = useRef({ on: false, lx: 0, ly: 0, ry: -0.25, rx: 0.22 });
  const SIZE = 460;
  const CX = SIZE / 2;
  const CY = SIZE / 2;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const t0 = performance.now();

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const ry = dragRef.current.ry + t * 0.038;
      const rx = dragRef.current.rx;

      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Renderização simplificada para performance SPA
      CATALOG.forEach(star => {
        const angle = star.orbitPhase + t * star.orbitSpeed;
        const x = CX + Math.cos(angle + ry) * star.orbitRadius;
        const y = CY + Math.sin(angle + rx) * star.orbitRadius * Math.cos(star.orbitTilt);
        
        ctx.beginPath();
        ctx.arc(x, y, star.size * 5, 0, Math.PI * 2);
        ctx.fillStyle = star.id === currentRole ? RED : 'rgba(0,0,0,0.1)';
        ctx.fill();
        
        ctx.font = "8px 'Courier New'";
        ctx.fillText(star.label.toUpperCase(), x + 8, y + 2);
      });

      // Core
      ctx.fillStyle = RED;
      ctx.font = "bold 10px 'Courier New'";
      ctx.textAlign = "center";
      ctx.fillText("HORAZION CORE", CX, CY);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [currentRole]);

  return (
    <div className="bg-horazion-white border border-horazion-light rounded-hz p-4 flex flex-col items-center">
      <h3 className="text-[10px] font-bold text-horazion-red uppercase tracking-[0.3em] mb-4">Mapa Estelar de Acesso</h3>
      <canvas ref={canvasRef} width={SIZE} height={SIZE} className="w-full max-w-[300px] cursor-move" />
      <div className="mt-4 text-[9px] font-bold text-horazion-gray uppercase tracking-widest">Sua Posição: {currentRole.toUpperCase()}</div>
    </div>
  );
}