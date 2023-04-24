import 'leaflet/dist/leaflet.css';
import L, { Icon, LatLng, Map as LMap } from 'leaflet';
import { useCallback, useEffect, useState } from 'react';
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

interface MapPosition {
  topLeftLat:number
  topLeftLng:number
  bottomRightLat:number
  bottomRightLng:number
}

const loadingCircleSizeMeters = 1000;

const getLoadPoints = (map:LMap) => {
  const bounds = map.getBounds()
    const topLeft = bounds.getNorthWest()
    const bottomRight = bounds.getSouthEast()
  return {
    topLeftLat: topLeft.lat,
    topLeftLng: topLeft.lng,
    bottomRightLat: bottomRight.lat,
    bottomRightLng: bottomRight.lng,
  }
}

interface Dictionary {
  [key: string]: PlaceResult
}

export default function PlaceMarkers({setVisiblePlaces, promptType}:DebugMarkersProps) {

    const [loadingAreas, setIsLoadingAreas] = useState<Loading[]>([])
    const [renderedPlaces, setRenderedPlaces] = useState(new Map<string,PlaceResult>());
    
    const map = useMapEvents({
      click: (e) => {
        console.log('useMapEvents - click')
        console.log(e.sourceTarget)
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
        try{

          console.log('CLICK-zoomend')

        const handler = setTimeout(() => {
          setDelayedMapPosition(getLoadPoints(map))
        }, 400)
        return () => {
          clearTimeout(handler);
        };
      }catch(err){
        console.error(err)
      }
      },
      dragend: (e) => {
        console.log('CLICK-dragend')

        try{

          const handler = setTimeout(() => {
            setDelayedMapPosition(getLoadPoints(map))
          }, 400)
          return () => {
            clearTimeout(handler);
          };
        }catch(err){
          console.error(err)
        }
      }
    });



    const bounds = map.getBounds()
    const topLeft = bounds.getNorthWest()
    const bottomRight = bounds.getSouthEast()

    const [delayedMapPosition, setDelayedMapPosition] = useState<MapPosition>(getLoadPoints(map));

    const updateRenderedPlaces = (placeResults:PlaceResult[]) => {
      placeResults.forEach((pl) => {
        const existingMarker = renderedPlaces.get(pl.place.id)
        if(!existingMarker || (existingMarker?.placeTypes?.length !== pl.placeTypes.length)){
          renderedPlaces.set(pl.place.id, pl)
        }else{
          // TODO: if we are really far away, unload the object?
        }
      })
    }

    const existingPlaces = api.placeType.getInside.useQuery({
      topLeftLat: topLeft.lat,
      topLeftLng: topLeft.lng,
      bottomRightLat: bottomRight.lat,
      bottomRightLng: bottomRight.lng,
    },{
      cacheTime: Infinity,
      refetchInterval: 20000,
      
      onSuccess: (data) => {
        console.log('existingPlaces')
        console.log(data)
        updateRenderedPlaces(data)
        //if(setVisiblePlaces){
          //setVisiblePlaces(existingPlaces && existingPlaces.data ? existingPlaces.data : [])
       // }
      },
      onError: (err) => {
        console.error('Could not get existing places')
        console.error(err)
      }
    })

    useEffect(() => {
      existingPlaces.refetch().catch((err) => {
        console.error(err)
      })
    }, [delayedMapPosition])

    const removePoint = (lat:number,lng:number) => {
      try{
        setIsLoadingAreas(loadingAreas.filter((la) => la.lat == lat && la.lng == lng))
      }catch(err){
        console.error('failed set loading error ')
      }
      
    }

    const onPageNames = useCallback((lat:number, lng: number, pageNames:string[]) => {
      // Change circle to "found" loading
      console.log('page found')
    }, [])

    const onPlaceSuccess = useCallback((wikiPlace:Place) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
      console.log(`new page ${wikiPlace?.summary}`)
     // setPlaces(places.concat(wikiPlace))
    }, [])

    const onFailure = useCallback((lat:number, lng:number) => {
      console.error(`onFailure lng:'+${lat}+'lng: '+${lng}`)
      removePoint(lat, lng)
    }, [])
    
    const onFinished = useCallback((lat:number, lng:number) => {
      console.error(`onFinished lng:'+${lat}+'lng: '+${lng}`)

      removePoint(lat, lng)
    }, [])


return (<div>  
            {loadingAreas?.length > 0 ? loadingAreas.map((la) => <LoadingCircle 
                key={`${la.lat}_${la.lng}`} 
                lat={la.lat} 
                lng={la.lng} 
                onPageNames={onPageNames} 
                onFailure={onFailure}
                onPlaceSuccess={onPlaceSuccess}
                onFinished={onFinished}
            />) : null}
            {renderedPlaces && Array.from(renderedPlaces).map((ep) => <PlaceMarker 
            key={`${ep[1].place.wiki_id}`}  
            place={ep[1].place} 
            placeTypes={ep[1].placeTypes} 
            updateRenderedPlaces={updateRenderedPlaces}
            />)}
            {/*existingPlaces.isError || !existingPlaces.data ? <div>Error {JSON.stringify(existingPlaces?.data)}</div>            
              : !existingPlaces.isFetched ? <div>Loading..</div> 
            : <div>{existingPlaces.data.map((ep) => <PlaceMarker key={`${ep.place.wiki_id}`}  place={ep.place} placeTypes={ep.placeTypes} />)}</div>
            */}
        </div>
    )
            }