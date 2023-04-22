import 'leaflet/dist/leaflet.css';
import L, { Icon, LatLng } from 'leaflet';
import { useState } from 'react';
import { Circle, Marker, Popup, useMapEvents } from 'react-leaflet';
import { api } from '~/utils/api';
import iconFile from 'src/styles/bang.png'
import loadingIconFile from 'src/styles/loading.gif'
import locIconFile from 'src/styles/loc.png'
import { type Place, type PlaceType } from '@prisma/client';
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
      },
      zoomend: (e) => {
        void (async () => {
          await existingPlaces.refetch()
        })()
      },
      dragend: (e) => {
        void (async () => {
          await existingPlaces.refetch()
        })()
      }
    });

    const bounds = map.getBounds()
    const topLeft = bounds.getNorthWest()
    const bottomRight = bounds.getSouthEast()
    
    const existingPlaces = api.placeType.getInside.useQuery({
      topLeftLat: topLeft.lat,
      topLeftLng: topLeft.lng,
      bottomRightLat: bottomRight.lat,
      bottomRightLng: bottomRight.lng
    },{
      cacheTime: Infinity,
      refetchInterval: 20000,
      onSuccess: (data) => {
        console.log('existingPlaces')
        console.log(data)
        //if(setVisiblePlaces){
          //setVisiblePlaces(existingPlaces && existingPlaces.data ? existingPlaces.data : [])
       // }
      }
    })

    const removePoint = (lat:number,lng:number) => {
      setIsLoadingAreas(loadingAreas.filter((la) => la.lat == lat && la.lng == lng))
    }

    const onPageNames = (lat:number, lng: number, pageNames:string[]) => {
      // Change circle to "found" loading
      console.log('page found')
    }

    const onPlaceSuccess = (wikiPlace:Place) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
      console.log(`new page ${wikiPlace?.summary}`)
     // setPlaces(places.concat(wikiPlace))
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

            {existingPlaces.isError && existingPlaces.data ? <div>Error {JSON.stringify(existingPlaces.data)}</div>            : !existingPlaces.isFetched ? <div>Loading</div> 
            : <div>{existingPlaces.data.map((ep) => <>{ep}</>)}</div>
          }
        </>
    )
            }