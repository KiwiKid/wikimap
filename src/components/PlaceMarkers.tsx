import 'leaflet/dist/leaflet.css';
import { Icon, LatLng, Map as LMap } from 'leaflet';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import { api } from '~/utils/api';
import iconFile from 'src/styles/bang.png';
import loadingIconFile from 'src/styles/loading.gif';
import locIconFile from 'src/styles/loc.png';
import { type Place } from '@prisma/client';
import PlaceMarker from './PlaceMarker';
import LoadingCircle from './LoadingCircle';
import { FoundLocations, getFoundLocations } from '~/utils/getFoundLocations';
import { PageMode } from '~/pages';

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
  [key: string]: Place
}

interface DebugMarkersProps {
  setRenderedPlaces:React.Dispatch<React.SetStateAction<Place[]>>
  renderedPlaces:Place[]
  promptType:string
  openPlaceId:string | null
  pageMode:PageMode
}



export default function PlaceMarkers({setRenderedPlaces, renderedPlaces, promptType, pageMode, openPlaceId}:DebugMarkersProps) {

    const [loadingAreas, setIsLoadingAreas] = useState<Loading[]>([])
    const [isAnyLoading, setAnyLoading] = useState<boolean>(true)

    const [renderedPlaceIds, setRenderedPlaceIds] = useState<Map<string, number>>(
      renderedPlaces.reduce((map, place) => map.set(place.id, place.status), new Map())
    )
    const [loadededTypePlaceIds, setLoadedTypePlaceIds] = useState<string[]>([]);
      
    const foundLocations = getFoundLocations();

    const map = useMapEvents({
      click: (e) => {
        if(e.latlng && e.latlng !== undefined){
          if(pageMode !== 'newLocationSearch'){
            console.error('new location search is off')
            return;
          }
            const { lat, lng } = e.latlng;
            const newPoint = new LatLng(lat, lng);
          //  map.closePopup()
            // L.marker([lat, lng], { icon }).addTo(map);
            setIsLoadingAreas(loadingAreas.concat(newPoint))
        }else{
            console.error('e.latlng is nulll')
        }
      },
      zoomend: (e) => {
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

    const buffer = 1

    const onPlaceTypeUpdateTimer = useRef<NodeJS.Timeout | null>(null);

    const onPlaceTypeLoaded = useCallback((placeResult:PlaceResult) => {
      if (onPlaceTypeUpdateTimer.current) {
        clearTimeout(onPlaceTypeUpdateTimer.current);
      }
      onPlaceTypeUpdateTimer.current = setTimeout(() => {
          if(!!placeResult){
       //     setLoadedTypePlaceIds(loadededTypePlaceIds?.concat(placeResult.place.id));
          }
    }, 500);
      //setRenderedPlaces(renderedPlaces.concat(placeResult))
    }, [])

    const updateRenderedPlaces = (rawPlaces:Place[]) => {
      console.log('updateRenderedPlaces'+JSON.stringify(rawPlaces))
      const onScreen = rawPlaces.filter((place:Place) => {
        return place.lat < (topLeft.lat + buffer) && place.lat > (bottomRight.lat - buffer) &&
        place.lng > (topLeft.lng - buffer) && place.lng < (bottomRight.lng + buffer)
      })

      // const offScreen = placeResults.filter((pl) => onScreen.includes((pl)))

     // const toLoad = onScreen.filter((s) => !loadededTypePlaceIds?.includes(s.id))

      setRenderedPlaces(onScreen)

   //   setRenderedPlaceIds(onScreen.reduce((map, rp) => map.set(rp.place.id, rp.placeTypes?.length), new Map()))

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
      promptType: promptType,
      ignoreIds: loadededTypePlaceIds,
      
    },{
      staleTime: 1000,
      cacheTime: Infinity,
      onSuccess: (data) => {
        console.log('loadededTypePlaceIds')
        console.log(loadededTypePlaceIds)

        console.log('existingPlaces')
        console.log(data)
        updateRenderedPlaces(data.places)
        const center = map.getCenter()

        // Only override the open param when we are scrolling the map
        if(window.location.search.indexOf('open') == -1){
          history.pushState({}, '', `?lat=${center.lat.toFixed(4)}&lng=${center.lng.toFixed(4)}`);
        }
        
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
      //existingPlaces.refetch().catch((err) => {
     //   console.error(err)
    //  })
    }, [delayedMapPosition])

    const removePoint = useCallback((lat:number,lng:number) => {
      console.log('removePoint')
      try{
        setIsLoadingAreas(loadingAreas.filter((la) => la.lat == lat && la.lng == lng))
      }catch(err){
        console.error('failed set loading error ')
      }
    }, [setIsLoadingAreas])

    const onPageNames = useCallback((lat:number, lng: number, pageNames:string[]) => {
      // Change circle to "found" loading
      //existingPlaces.refetch().catch((err) => {
      //  console.error(err)
      //})
    }, [])

    const onPlaceSuccess = useCallback((wikiPlace:Place) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
      console.log(`new page ${wikiPlace?.wiki_url}`)
    }, [])
    
    const onFailure = useCallback((lat:number, lng:number) => {
      console.error(`onFailure lng:'+${lat}+'lng: '+${lng}`)
      //removePoint(lat, lng)
    }, [removePoint])
    
    const onAllFinished = useCallback((lat:number, lng:number) => {
      console.log(`onFinished lng:'+${lat}+'lng: '+${lng}`)

      removePoint(lat, lng)
      existingPlaces.refetch().catch((err) => {
        console.error(err)
      })
    }, [removePoint])


return (<div>  
            {loadingAreas?.length > 0 ? loadingAreas.map((la) => <LoadingCircle 
                key={`${la.lat}_${la.lng}`} 
                lat={la.lat} 
                lng={la.lng} 
                onPageNames={onPageNames} 
                onFailure={onFailure}
                onPlaceSuccess={onPlaceSuccess}
                onAllFinished={onAllFinished}
            />) : null}
            {renderedPlaces && renderedPlaces.map((ep) => <PlaceMarker 
              key={`${ep.wiki_id}`}
              isThisUserFound={foundLocations.map((fl) => fl.placeId).includes((ep.id))}
              place={ep}
              promptType={promptType}
              isDefaultOpen={ep.id === openPlaceId}
            // updateRenderedPlaces={updateRenderedPlaces}
              onPlaceTypeLoaded={onPlaceTypeLoaded}
            />)}
            {/*existingPlaces.isError || !existingPlaces.data ? <div>Error {JSON.stringify(existingPlaces?.data)}</div>            
              : !existingPlaces.isFetched ? <div>Loading..</div> 
            : <div>{existingPlaces.data.map((ep) => <PlaceMarker key={`${ep.place.wiki_id}`}  place={ep.place} placeTypes={ep.placeTypes} />)}</div>
            */}
        </div>
    )
            }