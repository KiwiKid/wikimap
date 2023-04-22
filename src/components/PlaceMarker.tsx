import { MapContainer, Marker, TileLayer, useMap, useMapEvents, Popup } from 'react-leaflet';
import { useEffect, useState } from "react";
import { Icon  } from 'leaflet';
import { type MappedPage } from "~/utils/mapWikiPage";
import locIconFile from 'src/styles/loc.png'
import { api } from '~/utils/api'
import { type Place } from '@prisma/client'

const locIcon = new Icon({
    iconUrl: locIconFile.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

import WikiJS from 'wikijs'
import { type RouterOutputs } from '~/utils/api'
const RADIUS = 1000;

interface PublicPlaceType {
    id: string
    title: string
    content: string
    type: string
    wiki_id: string
}


export interface PlaceResult {
    place: Place, 
    placeTypes: PublicPlaceType[]
  }

export default function PlaceMarker({place, placeTypes}:PlaceResult) {

    const [hasRun, setHasRun] = useState<boolean>(false)

    const getAndPopulateStory = api.placeType.getAndPopulateStory.useMutation({
        onSuccess: (newPlace) => {
            if(!!newPlace){
                console.log(newPlace)
              //  onPlaceSuccess(newPlace);
            }else{
              //  onFailure(lat, lng);  
            }
        },
        onError: (err) => {
            console.error(err)
           // onFailure(lat, lng);
        }
    })

    const populate = (wiki_id:string) => {
        if(!getAndPopulateStory.isLoading 
        && !getAndPopulateStory.isError
        && !getAndPopulateStory?.data 
        && !hasRun
        ){
        setHasRun(true)
            getAndPopulateStory.mutate({ wiki_id: wiki_id, promptType: 'oldLegend'},
            {
                staleTime: Infinity,
                cacheTime: Infinity,
                retry: false
            })
        }
    }

    if(!place){
        return (<div>No place?</div>)
    }

    return (<Marker key={`${place.id} ${place.wiki_url}`} position={[place.lat, place.lng]} icon={locIcon}>
        <Popup minWidth={400} maxHeight={400} className='bg-brown-100 rounded-lg p-4 whitespace-break-spaces'>
       <button 
            className="px-4 py-3 bg-blue-600 rounded-md text-white outline-none focus:ring-4 shadow-lg transform active:scale-x-75 transition-transform mx-5 flex" 
            onClick={() => populate(place.wiki_id)}>generate</button>

            <img className='rounded-lg' src={`${place.main_image_url}`} alt={place.wiki_url}/>
            {placeTypes.map((g) => <div key={g.title} className="font-ltor text-sm">
                <h1 className="max-h-24 text-1xl font-bold underline ">{g.title}</h1>
                {g.content}
                {/*<button 
            className="px-4 py-3 bg-blue-600 rounded-md text-white outline-none focus:ring-4 shadow-lg transform active:scale-x-75 transition-transform mx-5 flex"
        onClick={() => onDeletePlaceType(g.id)}>[delete]</button>*/}
                
</div>)}
            [Generated with AI]
            <details>{place.id}<summary></summary>{JSON.stringify(place.summary)}</details>
        </Popup>

    </Marker>)
}