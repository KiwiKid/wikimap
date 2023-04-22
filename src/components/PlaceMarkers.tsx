import 'leaflet/dist/leaflet.css';
import L, { Icon, LatLng } from 'leaflet';
import { useState } from 'react';
import { Circle, Marker, Popup, useMapEvents } from 'react-leaflet';
import { api } from '~/utils/api';
import iconFile from 'src/styles/bang.png'
import loadingIconFile from 'src/styles/loading.gif'
import locIconFile from 'src/styles/loc.png'
import { type Place, PlaceType } from '@prisma/client';
import PlaceMarker  from './PlaceMarker'
import LoadingCircle from './LoadingCircle'
import { type MappedPage } from '~/utils/mapWikiPage'

const customIcon = new Icon({
  iconUrl: iconFile.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});


const loadingIcon = new Icon({
  iconUrl: loadingIconFile.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const locIcon = new Icon({
  iconUrl: locIconFile.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Loading {
  lat: number
  lng: number
}

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
interface DebugMarkersProps {
  setVisiblePlaces?:React.Dispatch<React.SetStateAction<PlaceResult[]>>
  promptType:string
}

const loadingCircleSizeMeters = 1000;

export default function PlaceMarkers({setVisiblePlaces, promptType}:DebugMarkersProps) {

    const [loadingAreas, setIsLoadingAreas] = useState<Loading[]>([])
    const [places, setPlaces] = useState<MappedPage[]>([])

    const map = useMapEvents({
        click: (e) => {
        if(e.latlng){
            console.log('CLICK')
            const { lat, lng } = e.latlng;
            const newPoint = new LatLng(lat, lng);
            // L.marker([lat, lng], { icon }).addTo(map);
            setIsLoadingAreas(loadingAreas.concat(newPoint))
            console.log('CLICK-newlatlng')
        }else{
            console.error('e.latlng is nulll')
        }
        }
    });

    const removePoint = (lat:number,lng:number) => {
      setIsLoadingAreas(loadingAreas.filter((la) => la.lat == lat && la.lng == lng))
    }

    const onPageNames = (lat:number, lng: number, pageNames:string[]) => {
      // Change circle to "found" loading
      console.log('page found')
    }

    const onPlaceSuccess = (page:MappedPage) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
      console.log(`new page ${page?.summary}`)
      setPlaces(places.concat(page))
    }

    const onFailure = (lat:number, lng:number) => {
      console.error(`Failed lng:'+${lat}+'lng: '+${lng}`)
    }
    
    const onFinished = (lat:number, lng:number) => {
      removePoint(lat, lng)
    }


return (<>  
            {loadingAreas?.length > 0 ? loadingAreas.map((la) => <><LoadingCircle 
                key={`${la.lat}_${la.lng}`} 
                lat={la.lat} 
                lng={la.lng} 
                onPageNames={onPageNames} 
                onFailure={onFailure}
                onPlaceSuccess={onPlaceSuccess}
                onFinished={onFinished}
            /></>) : null}
            {places?.length > 0 ? places.map((p) => <PlaceMarker key={`${p.lat} ${p.lng}`} mappedPlace={p}/>) : null}
        </>
    )
            }