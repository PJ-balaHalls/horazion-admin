'use client';

import React, { useEffect, useState } from 'react';
// Importação dinâmica para evitar erros de SSR (Window is not defined) no Next.js
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Configuração do ícone personalizado (o Leaflet perde o caminho padrão do ícone no Next.js)
const createCustomIcon = () => {
  const L = require('leaflet');
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #000000; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

// Precisamos carregar o MapContainer dinamicamente porque o Leaflet manipula a DOM diretamente
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

interface HzGeoMapProps {
  markers?: { id: string; lat: number; lng: number; label?: string }[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function HzGeoMap({ markers = [], center = { lat: 20, lng: 0 }, zoom = 2 }: HzGeoMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [icon, setIcon] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    setIcon(createCustomIcon());
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-[#FAFAFA] flex items-center justify-center border border-[#F2F2F2]">
        <div className="w-6 h-6 border-2 border-[#F2F2F2] border-t-[#000000] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative z-0">
      {/* A classe grayscale-map aplica um filtro CSS para tirar a saturação do OpenStreetMap,
        deixando-o com aparência mais técnica e alinhada ao Clean White.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        .grayscale-map .leaflet-layer {
          filter: grayscale(100%) opacity(70%);
        }
        .leaflet-container {
          background-color: #FAFAFA !important;
          font-family: var(--font-inter) !important;
        }
        .leaflet-control-zoom {
          border: 1px solid #F2F2F2 !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
        }
        .leaflet-control-zoom a {
          color: #000000 !important;
          background-color: #FFFFFF !important;
        }
        .leaflet-control-attribution {
          display: none; /* Mantendo a interface limpa no painel admin */
        }
      `}} />

      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="w-full h-full grayscale-map z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {markers.map((marker) => (
           icon && <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={icon} />
        ))}
      </MapContainer>
    </div>
  );
}