'use client';

import React, { useEffect, useState, useRef } from 'react';

interface HzBrazilMapProps {
  stateData: Record<string, number>;
}

export function HzBrazilMap({ stateData }: HzBrazilMapProps) {
  const [geoJson, setGeoJson] = useState<any>(null);
  
  // Controlo de Interatividade (Pan & Zoom)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Tooltip
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; name: string; sigla: string; count: number }>({
    visible: false, x: 0, y: 0, name: '', sigla: '', count: 0
  });

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson')
      .then(res => res.json())
      .then(data => setGeoJson(data))
      .catch(err => console.error("Erro malha:", err));
  }, []);

  if (!geoJson) return <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest animate-pulse">A Renderizar Malha Geográfica...</div>;

  const maxUsers = Math.max(...Object.values(stateData), 1);
  const totalUsers = Object.values(stateData).reduce((a, b) => a + b, 0);

  const getFillColor = (sigla: string) => {
    const count = stateData[sigla] || 0;
    if (count === 0) return '#FAFAFA';
    const intensity = 0.2 + (count / maxUsers) * 0.8;
    return `rgba(182, 25, 46, ${intensity})`;
  };

  // Conversão Nativa: Usa coordenadas brutas e deixa o SVG viewBox fazer a magia do enquadramento
  const createPath = (coordinates: any[][][], type: string) => {
    let pathString = '';
    const polys = type === 'Polygon' ? [coordinates] : coordinates;
    polys.forEach((poly: any) => {
      poly.forEach((ring: any) => {
        ring.forEach((coord: number[], i: number) => {
          const x = coord[0]; // Longitude
          const y = -coord[1]; // Inverte a Latitude (o Y do SVG cresce para baixo)
          pathString += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
        });
        pathString += 'Z ';
      });
    });
    return pathString;
  };

  // Eventos de Rato (Arrastar e Largar)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTransform({ ...transform, x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoom = (direction: 1 | -1) => {
    setTransform(prev => ({ ...prev, scale: Math.max(0.5, Math.min(prev.scale + direction * 0.3, 4)) }));
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-white cursor-grab active:cursor-grabbing group select-none flex items-center justify-center p-4"
      ref={containerRef}
      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
    >
      {/* Tooltip Dinâmica */}
      {tooltip.visible && (
        <div 
          className="absolute z-50 bg-black text-white px-4 py-3 rounded-[8px] shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-[120%] transition-opacity duration-150"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#A0A0A0] mb-1">{tooltip.name} ({tooltip.sigla})</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black leading-none">{tooltip.count}</span>
            <span className="text-[9px] font-medium text-[#A0A0A0] uppercase mb-0.5 pb-0.5">Identidades</span>
          </div>
          {totalUsers > 0 && <div className="mt-2 text-[9px] font-bold text-[#B6192E] uppercase tracking-widest">
            {((tooltip.count / totalUsers) * 100).toFixed(1)}% do Ecossistema
          </div>}
        </div>
      )}

      {/* Controlos de Zoom Minimalistas */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1 bg-white border border-[#F2F2F2] rounded-[8px] shadow-sm p-1">
        <button onClick={() => handleZoom(1)} className="w-6 h-6 flex items-center justify-center text-black hover:bg-[#F2F2F2] rounded text-lg font-bold transition-colors">+</button>
        <div className="w-full h-[1px] bg-[#F2F2F2]"></div>
        <button onClick={() => handleZoom(-1)} className="w-6 h-6 flex items-center justify-center text-black hover:bg-[#F2F2F2] rounded text-lg font-bold transition-colors">-</button>
        <div className="w-full h-[1px] bg-[#F2F2F2]"></div>
        <button onClick={() => setTransform({x:0, y:0, scale:1})} className="w-6 h-6 flex items-center justify-center text-[#A0A0A0] hover:bg-[#F2F2F2] hover:text-black rounded text-[8px] font-black uppercase transition-colors">■</button>
      </div>

      {/* A Mágica do viewBox: 
        As extremidades do Brasil variam de -74 a -34 na Longitude (Largura)
        E de -5 a 34 na Latitude (Altura, com Y invertido).
        O viewBox abaixo abraça perfeitamente essas coordenadas sem cortar nada! 
      */}
      <svg 
        viewBox="-75 -6 42 42" 
        className="w-full h-full max-h-[400px] transition-transform duration-75 ease-out drop-shadow-sm"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
      >
        {geoJson.features.map((feature: any) => {
          const sigla = feature.properties.sigla;
          const count = stateData[sigla] || 0;
          return (
            <path
              key={sigla}
              d={createPath(feature.geometry.coordinates, feature.geometry.type)}
              fill={getFillColor(sigla)}
              stroke="#FFFFFF"
              // A espessura da fronteira afina dinamicamente quando fazemos zoom para manter o visual elegante
              strokeWidth={0.08 / transform.scale}
              className="transition-colors duration-200 hover:fill-black cursor-pointer"
              onMouseEnter={(e) => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) setTooltip({ visible: true, x: e.clientX - rect.left, y: e.clientY - rect.top, name: feature.properties.name, sigla, count });
              }}
              onMouseMove={(e) => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) setTooltip(p => ({ ...p, x: e.clientX - rect.left, y: e.clientY - rect.top }));
              }}
              onMouseLeave={() => setTooltip(p => ({ ...p, visible: false }))}
            />
          );
        })}
      </svg>
    </div>
  );
}