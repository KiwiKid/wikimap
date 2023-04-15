import { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { type Map } from 'leaflet'
import { type LatLngExpression } from 'leaflet';
import DebugMarkers from './DebugMarkers';

export function ChangeView({ coords }:{ coords: LatLngExpression }) {
  const mapp:Map = useMap();
  mapp.setView(coords, 12);
  return null;
}

const WELLINGTON_CENTER:[number,number] = [-41.2927734753598, 174.77461204625592];

export default function DebugMapView():React.ReactElement {
  return (
    <MapContainer center={WELLINGTON_CENTER} zoom={12} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DebugMarkers/>
    </MapContainer>
  );
}
