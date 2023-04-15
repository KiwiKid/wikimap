import { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { type Map } from 'leaflet'
import { type LatLngExpression } from 'leaflet';
import { Place } from '@prisma/client';

interface GeoData {
    lat: number;
    lng: number;
  }

export function ChangeView({ coords }:{ coords: LatLngExpression }) {
  const mapp:Map = useMap();
  mapp.setView(coords, 12);
  return null;
}

export interface MapViewProps {
  places:Place[]
}
const WELLINGTON_CENTER:[number,number] = [-41.2927734753598, 174.77461204625592]

export default function MapView({places}:MapViewProps) {

  return (
    <MapContainer center={WELLINGTON_CENTER} zoom={12} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {places.map((point) => (
        <Marker key={point.id} position={[point.lat, point.lng]}>
          <Popup>{point.wiki_url}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
