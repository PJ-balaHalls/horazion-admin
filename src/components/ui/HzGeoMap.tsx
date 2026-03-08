'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const createCustomIcon = () => {
  const L = require('leaflet');
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #000000; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });

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
      <div className="w-full h-full bg-white flex items-center justify-center border border-[#F2F2F2]">
        <div className="w-6 h-6 border-2 border-[#F2F2F2] border-t-[#000000] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Lógica de Foco: Se houver um marcador de usuário, foca nele com zoom alto
  const mapCenter = markers.length > 0 ? [markers[0].lat, markers[0].lng] : [center.lat, center.lng];
  const mapZoom = markers.length > 0 ? 12 : zoom;

  return (
    <div className="w-full h-full relative z-0 bg-white">
      <style dangerouslySetInnerHTML={{__html: `
        .grayscale-map .leaflet-layer { filter: grayscale(100%) opacity(80%); }
        .leaflet-container { background-color: #FFFFFF !important; font-family: var(--font-inter) !important; }
        .leaflet-control-zoom { border: 1px solid #F2F2F2 !important; box-shadow: none !important; border-radius: 0 !important; }
        .leaflet-control-zoom a { color: #000000 !important; background-color: #FFFFFF !important; border-bottom: 1px solid #F2F2F2 !important; }
        .leaflet-control-attribution { display: none; }
      `}} />

      <MapContainer 
        center={mapCenter as any} 
        zoom={mapZoom} 
        scrollWheelZoom={false}
        className="w-full h-full grayscale-map z-0"
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        {markers.map((marker) => (
           icon && <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={icon} />
        ))}
      </MapContainer>
    </div>
  );
}