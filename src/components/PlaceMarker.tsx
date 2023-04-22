import { MapContainer, Marker, TileLayer, useMap, useMapEvents, Popup } from 'react-leaflet';
import { useEffect, useState } from "react";
import { Icon  } from 'leaflet';
import { type MappedPage } from "~/utils/mapWikiPage";
import locIconFile from 'src/styles/loc.png'

const locIcon = new Icon({
    iconUrl: locIconFile.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

import WikiJS from 'wikijs'
const RADIUS = 1000;

interface PlaceMarker {
    mappedPlace:MappedPage
}

export default function PlaceMarker({mappedPlace}:PlaceMarker) {


    return (<Marker key={`${mappedPlace.id} ${mappedPlace.url}`} position={[mappedPlace.lat, mappedPlace.lng]} icon={locIcon}>
        <Popup minWidth={400} maxHeight={400} className='bg-brown-100 rounded-lg p-4 whitespace-break-spaces'>
       {/*<button 
            className="px-4 py-3 bg-blue-600 rounded-md text-white outline-none focus:ring-4 shadow-lg transform active:scale-x-75 transition-transform mx-5 flex" 
            onClick={() => onGenerate(mappedPlace.wiki_id)}>generate</button>

            <img className='rounded-lg' src={`${mappedPlace.main_image_url}`} alt={mappedPlace.wiki_url}/>*/}
            {/*mappedPlaceTypes.map((g) => <div key={g.title} className="font-ltor text-sm">
                <h1 className="max-h-24 text-1xl font-bold underline ">{g.title} ({loadingAreas.length})</h1>
                {g.content}
                <button 
            className="px-4 py-3 bg-blue-600 rounded-md text-white outline-none focus:ring-4 shadow-lg transform active:scale-x-75 transition-transform mx-5 flex"
            onClick={() => onDeletePlaceType(g.id)}>[delete]</button>
                
</div>)
            [Generated with AI]*/}
            <details><summary></summary>{mappedPlace.summary}</details>
        </Popup>

    </Marker>)
}