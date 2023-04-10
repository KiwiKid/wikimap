import { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { type Map } from 'leaflet'
import { type LatLngExpression } from 'leaflet';

interface GeoData {
    lat: number;
    lng: number;
  }

export function ChangeView({ coords }:{ coords: LatLngExpression }) {
  const mapp:Map = useMap();
  mapp.setView(coords, 12);
  return null;
}

export default function MapView() {
    const [geoData, setGeoData] = useState<GeoData>({ lat: 64.536634, lng: 16.779852 });

    const center: LatLngExpression = [geoData.lat, geoData.lng];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call

  return (
    <MapContainer center={center} zoom={12} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ChangeView coords={center} />
    </MapContainer>
  );
}
