'use client';

import React from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

const horizonMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#545454" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#e5e7eb" }] }
];

interface HzGeoMapProps {
  markers?: { id: string; lat: number; lng: number; label?: string }[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function HzGeoMap({ markers = [], center = { lat: -23.5505, lng: -46.6333 }, zoom = 4 }: HzGeoMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Blindagem Arquitetural: Se não houver chave ou ela for um placeholder, não tentamos renderizar a API do Google
  if (!apiKey || apiKey.length < 10 || apiKey === 'sua_chave_aqui') {
    return (
      <div className="w-full h-full bg-[#FAFAFA] border border-[#F2F2F2] flex flex-col items-center justify-center p-6 text-center">
        <svg className="w-6 h-6 text-[#545454] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-[10px] text-[#545454] font-bold uppercase tracking-widest">HZ-API_001: Mapa Indisponível</span>
        <span className="text-xs text-[#545454] mt-1">Configure a chave do Google Maps no .env</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#FAFAFA]">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          disableDefaultUI={true}
          styles={horizonMapStyle}
          mapId="HORIZION_MAP_ID"
        >
          {markers.map((marker) => (
            <AdvancedMarker key={marker.id} position={{ lat: marker.lat, lng: marker.lng }}>
              <div className="w-3 h-3 bg-[#000000] rounded-full border border-white shadow-sm" />
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}