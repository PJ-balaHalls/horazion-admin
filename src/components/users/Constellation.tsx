'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

type StellarRole = 'user' | 'sirius' | 'rigel' | 'betelgeuse' | 'altair' | 'polaris';
interface Vec3 { x: number; y: number; z: number; }
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

const ROLE_INFO: Record<StellarRole, { label: string; role: string }> = {
  user:       { label: 'Sol',        role: 'Usuário'      },
  sirius:     { label: 'Sirius',     role: 'Diretor'      },
  rigel:      { label: 'Rigel',      role: 'Gerente'      },
  betelgeuse: { label: 'Betelgeuse', role: 'Coordenador'  },
  altair:     { label: 'Altair',     role: 'Analista'      },
  polaris:    { label: 'Polaris',    role: 'Colaborador'  },
};

const RED = '#B6192E';

// ── Funções de Desenho e Matemática 3D ─────────────────────────────────────────

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number, color: string, alpha: number) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.bezierCurveTo( 0.5, -4,  3.5, -0.5, 12,  0);
  ctx.bezierCurveTo( 3.5,  0.5, 0.5,  4,  0,  12);
  ctx.bezierCurveTo(-0.5,  4, -3.5,  0.5, -12, 0);
  ctx.bezierCurveTo(-3.5, -0.5, -0.5, -4,  0, -12);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function orbitPos(r: number, angle: number, tilt: number): Vec3 {
  return { x: r * Math.cos(angle), y: r * Math.sin(angle) * Math.cos(tilt), z: r * Math.sin(angle) * Math.sin(tilt) };
}

function rotateVec(v: Vec3, ry: number, rx: number): Vec3 {
  const x1 = v.x * Math.cos(ry) - v.z * Math.sin(ry);
  const z1 = v.x * Math.sin(ry) + v.z * Math.cos(ry);
  const y2 = v.y * Math.cos(rx) - z1 * Math.sin(rx);
  const z2 = v.y * Math.sin(rx) + z1 * Math.cos(rx);
  return { x: x1, y: y2, z: z2 };
}

function project(v: Vec3, cx: number, cy: number, fov = 370) {
  const z = v.z + fov;
  const sc = fov / Math.max(z, 1);
  return { sx: cx + v.x * sc, sy: cy + v.y * sc, sc };
}

// ── Componente Principal ──────────────────────────────────────────────────────

export function Constellation({ currentRole }: { currentRole: StellarRole }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const hovRef = useRef<StellarRole | null>(null);
  const dragRef = useRef({ on: false, lx: 0, ly: 0, ry: -0.25, rx: 0.22 });
  const [hovered, setHovered] = useState<StellarRole | null>(null);

  const SIZE = 460;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const FOV = 370;

  const onMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (SIZE / rect.width);
    const my = (e.clientY - rect.top) * (SIZE / rect.height);

    if (dragRef.current.on) {
      const dx = e.clientX - dragRef.current.lx;
      const dy = e.clientY - dragRef.current.ly;
      dragRef.current.ry += dx * 0.005;
      dragRef.current.rx = Math.max(-0.8, Math.min(0.8, dragRef.current.rx + dy * 0.005));
      dragRef.current.lx = e.clientX;
      dragRef.current.ly = e.clientY;
      return;
    }

    const pts = (canvasRef.current as any).__pts ?? [];
    let found: StellarRole | null = null;
    for (const p of pts) {
      if (Math.hypot(mx - p.sx, my - p.sy) < 24) { found = p.id; break; }
    }
    if (found !== hovRef.current) { hovRef.current = found; setHovered(found); }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const t0 = performance.now();

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const fade = Math.min(1, t / 1.6);
      const ry = dragRef.current.ry + t * 0.038;
      const rx = dragRef.current.rx;

      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Órbitas
      CATALOG.forEach(star => {
        const isH = hovRef.current === star.id;
        ctx.save();
        ctx.setLineDash([2, 8]);
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = isH ? `rgba(182,25,46,0.3)` : 'rgba(0,0,0,0.05)';
        ctx.beginPath();
        for (let i = 0; i <= 60; i++) {
          const a = (i / 60) * Math.PI * 2;
          const rot = rotateVec(orbitPos(star.orbitRadius, a, star.orbitTilt), ry, rx);
          const { sx, sy } = project(rot, CX, CY, FOV);
          i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.restore();
      });

      // Projeção de Estrelas
      const pts = CATALOG.map(star => {
        const a = star.orbitPhase + t * star.orbitSpeed;
        const rot = rotateVec(orbitPos(star.orbitRadius, a, star.orbitTilt), ry, rx);
        return { ...project(rot, CX, CY, FOV), id: star.id, sz: rot.z, star };
      });
      pts.sort((a, b) => a.sz - b.sz);
      (canvas as any).__pts = pts.map(p => ({ id: p.id, sx: p.sx, sy: p.sy }));

      // Conectores e Estrelas
      pts.forEach(({ id, sx, sy, sc, star }) => {
        const isH = hovRef.current === id;
        const isUser = id === currentRole;
        const s = star.size * sc * (isH || isUser ? 1.5 : 1.0);
        const color = isH || isUser ? RED : `rgba(0,0,0,0.15)`;
        const alpha = fade * (isH || isUser ? 1 : 0.4);

        if (isH || isUser) {
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([2, 4]);
          ctx.strokeStyle = `rgba(182,25,46,0.2)`;
          ctx.moveTo(CX, CY);
          ctx.lineTo(sx, sy);
          ctx.stroke();
          ctx.restore();
        }

        drawStar(ctx, sx, sy, s, t * 0.5, color, alpha);
      });

      // Centro: HORAZION CORE
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = `800 10px 'Inter', sans-serif`;
      ctx.fillStyle = RED;
      ctx.fillText('HORAZION', CX, CY - 2);
      ctx.font = `700 7px 'Inter', sans-serif`;
      ctx.fillStyle = '#000';
      ctx.fillText('CORE', CX, CY + 8);
      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [currentRole]);

  return (
    <div className="bg-horazion-white border border-horazion-light rounded-hz p-6 shadow-sm overflow-hidden relative">
      <div className="flex justify-between items-start mb-2">
        <div className="text-[9px] font-bold text-horazion-red uppercase tracking-widest">Constelação SOS</div>
        <div className="text-[8px] font-bold text-horazion-gray/40 uppercase tracking-widest">3D Realtime</div>
      </div>
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="w-full aspect-square cursor-grab active:cursor-grabbing"
        onMouseMove={onMove}
        onMouseDown={(e) => { dragRef.current = { ...dragRef.current, on: true, lx: e.clientX, ly: e.clientY }; }}
        onMouseUp={() => { dragRef.current.on = false; }}
        onMouseLeave={() => { dragRef.current.on = false; }}
      />
      <div className="mt-4 flex flex-wrap gap-4 border-t border-horazion-light pt-4">
        {CATALOG.map(s => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${s.id === currentRole ? 'bg-horazion-red animate-pulse' : 'bg-horazion-light'}`}></div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-horazion-gray">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}