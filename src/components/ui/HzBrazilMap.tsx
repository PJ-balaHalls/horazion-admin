'use client';

import React, { useEffect, useState } from 'react';

interface HzBrazilMapProps {
  stateData: Record<string, number>; // Ex: { 'SP': 10, 'RJ': 5 }
}

export function HzBrazilMap({ stateData }: HzBrazilMapProps) {
  const [geoJson, setGeoJson] = useState<any>(null);

  useEffect(() => {
    // Busca a malha geográfica oficial do Brasil (Open Source)
    fetch('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson')
      .then(res => res.json())
      .then(data => setGeoJson(data))
      .catch(err => console.error("Erro ao carregar malha do Brasil", err));
  }, []);

  if (!geoJson) {
    return <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest animate-pulse">A Renderizar Malha Geográfica...</div>;
  }

  // Descobre qual é o estado com mais utilizadores para criar a escala (Heatmap)
  const maxUsers = Math.max(...Object.values(stateData), 1);

  // Calcula a cor com base na intensidade (Paleta Horazion: #B6192E)
  const getFillColor = (stateSigla: string) => {
    const count = stateData[stateSigla] || 0;
    if (count === 0) return '#FAFAFA'; // Vazio
    const intensity = 0.2 + (count / maxUsers) * 0.8; // Escala de 20% a 100% de opacidade
    return `rgba(182, 25, 46, ${intensity})`; // Vermelho Horazion com opacidade dinâmica
  };

  // Função simples para converter Coordenadas em SVG Path (Projeção Mercator simplificada)
  const createPath = (coordinates: any[][][], type: string) => {
    const scale = 12; // Ajuste de zoom
    const offsetX = 850; // Centralização X
    const offsetY = 150; // Centralização Y

    const project = (coord: number[]) => [coord[0] * scale + offsetX, -coord[1] * scale + offsetY];

    let pathString = '';
    const polys = type === 'Polygon' ? [coordinates] : coordinates;

    polys.forEach((poly: any) => {
      poly.forEach((ring: any) => {
        ring.forEach((coord: number[], i: number) => {
          const [x, y] = project(coord);
          pathString += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
        });
        pathString += 'Z ';
      });
    });
    return pathString;
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center bg-white">
      <svg viewBox="0 0 450 450" className="w-full h-full max-h-[300px] drop-shadow-sm">
        {geoJson.features.map((feature: any) => {
          const sigla = feature.properties.sigla;
          const count = stateData[sigla] || 0;
          return (
            <path
              key={sigla}
              d={createPath(feature.geometry.coordinates, feature.geometry.type)}
              fill={getFillColor(sigla)}
              stroke="#FFFFFF"
              strokeWidth="1"
              className="transition-all duration-300 hover:stroke-black hover:stroke-[2px] cursor-crosshair group"
            >
              <title>{feature.properties.name} - {count} Identidades</title>
            </path>
          );
        })}
      </svg>
    </div>
  );
}