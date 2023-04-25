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

interface DebugMarkersProps {
  setRenderedPlaces:React.Dispatch<React.SetStateAction<PlaceResult[]>>
  renderedPlaces:PlaceResult[]
  promptType:string
}
export default function PlaceMarkers({setRenderedPlaces, renderedPlaces, promptType}:DebugMarkersProps) {

    const [loadingAreas, setIsLoadingAreas] = useState<Loading[]>([])
    

    const [renderedPlaceIds, setRenderedPlaceIds] = useState<Map<string, number>>(
      renderedPlaces.reduce((map, rp) => map.set(rp.place.id, rp.placeTypes?.length), new Map())
    )
      
    
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

    const LOADING_NEARBY_BUFFER = 0
    const updateRenderedPlaces = (placeResults:PlaceResult[]) => {
      const onScreen = placeResults.filter((pl) => {
        return pl.place.lat < topLeft.lat+LOADING_NEARBY_BUFFER && pl.place.lat > bottomRight.lat-LOADING_NEARBY_BUFFER &&
        pl.place.lng > topLeft.lng-LOADING_NEARBY_BUFFER && pl.place.lng < bottomRight.lng-LOADING_NEARBY_BUFFER
      })

      const offScreen = placeResults.filter((pl) => onScreen.includes((pl)))


      setRenderedPlaces(onScreen)

      setRenderedPlaceIds(onScreen.reduce((map, rp) => map.set(rp.place.id, rp.placeTypes?.length), new Map()))

     /* placeResults.forEach((pl) => {
        const existingMarker = renderedPlaceIds.get(pl.place.id)

          if((
      //  (existingMarker == null)
          )){
            console.log('updateRenderedPlacespoint on screen')
           
              renderedPlaceIds.set(pl.place.id, pl.placeTypes.length)
              console.log(`updateRenderedPlaces\n\nAdded ${pl.place.id}`)
              setRenderedPlaces(renderedPlaces.concat(pl))
          }else{
            console.log(`updateRenderedPlaces\n\Removed ${pl.place.id}`)
            setRenderedPlaces(renderedPlaces.filter((rp) => rp.place.id == rp.place.id))
            renderedPlaceIds.delete(pl.place.id);
            setRenderedPlaceIds(renderedPlaceIds)

            // TODO: if we are really far away, unload the object?
          }
        })*/
    }
    const existingPlaces = api.placeType.getInside.useQuery({
      topLeftLat: topLeft.lat,
      topLeftLng: topLeft.lng,
      bottomRightLat: bottomRight.lat,
      bottomRightLng: bottomRight.lng,
    },{
      cacheTime: Infinity,     
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
      existingPlaces.refetch().catch((err) => {
        console.error(err)
      })
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
            {renderedPlaces && renderedPlaces.map((ep) => <PlaceMarker 
            key={`${ep.place.wiki_id}`}  
            placeResult={ep}
            updateRenderedPlaces={updateRenderedPlaces}
            />)}
            {/*existingPlaces.isError || !existingPlaces.data ? <div>Error {JSON.stringify(existingPlaces?.data)}</div>            
              : !existingPlaces.isFetched ? <div>Loading..</div> 
            : <div>{existingPlaces.data.map((ep) => <PlaceMarker key={`${ep.place.wiki_id}`}  place={ep.place} placeTypes={ep.placeTypes} />)}</div>
            */}
        </div>
    )
            }