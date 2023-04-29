import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { type Map as LMap } from 'leaflet'
import { type LatLngExpression } from 'leaflet';
import { Place } from '@prisma/client';
import { useRouter } from 'next/router'
import PlaceMarkers from './PlaceMarkers'
import { Dispatch, SetStateAction } from 'react';
import useWindowSize from '~/utils/useWindowSize';

export function ChangeView({ coords }:{ coords: LatLngExpression }) {
  const mapp:LMap = useMap();
  mapp.setView(coords, 12);
  return null;
}

export interface MapViewProps {
  setRenderedPlaces:Dispatch<SetStateAction<Place[]>>
  renderedPlaces:Place[]
}
const WELLINGTON_CENTER:[number,number] = [-41.2927734753598, 174.77461204625592]

export default function MapView({setRenderedPlaces, renderedPlaces}:MapViewProps) {

  const router = useRouter()
  const { lat, lng } = router.query;

  const startingCenter = !lat || !lng 
    ? WELLINGTON_CENTER
    : [+lat, +lng] as [number, number]

  const [width, windowHeight] = useWindowSize();

  const promptType = process.env.REACT_APP_PROMPT_TYPE || 'oldLegend'
    
  return (
    <MapContainer center={startingCenter} zoom={15} style={{ height: '100vh' }}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <PlaceMarkers setRenderedPlaces={setRenderedPlaces} renderedPlaces={renderedPlaces} promptType={promptType}/>
    </MapContainer>
  );
}
