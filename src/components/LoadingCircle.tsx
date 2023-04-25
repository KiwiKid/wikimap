import { MapContainer, Marker, TileLayer, Circle, useMapEvents, Popup } from 'react-leaflet';
import { useEffect, useState } from "react";
import { type MappedPage } from "~/utils/mapWikiPage";
import { api } from "../utils/api"
import WikiJS from 'wikijs'
import { type Place } from "@prisma/client";
const RADIUS = 1000;


interface WikiSearchResult {
  lat: number,
  lng: number,
  pageNames: string[]
}

type CircleState = 'ready-to-gen'|'loading'|'loading-story'
interface LoadingCircleProps {
  lat:number
  , lng:number
  , onPageNames:((lat:number, lng: number, pageNames:string[])=>void)
  , onFailure:((lat:number, lng: number)=>void)
  , onPlaceSuccess:((wikiPlace:Place)=>void)
  , onFinished:((lat:number, lng:number)=>void)
}

const getStatusPathOptions = (circleStatus:CircleState) => {
  switch(circleStatus){
    case 'loading': 
    return {
      color: 'red',
      fillColor: 'red',
      fillOpacity: 0.2,
    };
    // TODO: should not display...
    case 'ready-to-gen': {
      return {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.2,
      };
    }
    default:
    case 'loading-story': {
      return {
        color: 'yellow',
        fillColor: 'yellow',
        fillOpacity: 0.2,
      };
    }
  }
}

export default function LoadingCircle({
   lat
  , lng
  , onPageNames
  , onFailure
  , onPlaceSuccess
  , onFinished
}:LoadingCircleProps) {

  const [circleState, setCircleState] = useState<CircleState>('loading')
  const [pageFoundCount, setPageFoundCount] = useState(0)

  const [pageProcessCount, setPageProcessCount] = useState(0)

  const processPageName = api.placeType.processPageName.useMutation({
    onSuccess: (newPlace) => {
      if(!!newPlace){
        onPlaceSuccess(newPlace);
      }else{
        onFailure(lat, lng);  
      }
    },
    onError: (err) => {
      console.error(err)
      onFailure(lat, lng);
    },
    onSettled: () => {
      setPageProcessCount(pageProcessCount+1)
      if(pageFoundCount === pageProcessCount){
        onFinished(lat, lng)
      }
    }
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const getPageNames = api.latLng.getPageNames.useMutation({
    onSuccess: (res:WikiSearchResult) => {
      onPageNames(lat, lng, res.pageNames)
      setCircleState('loading-story')
      setPageFoundCount(res.pageNames.length || 0)
      res.pageNames.forEach((pn) => {
        processPageName.mutate({
          pageName: pn
        })

      })
      setCircleState('ready-to-gen')
    },
    onError: (err) => {
      onFailure(lat, lng)
      console.error(err)
    }
  })
  
 /* {
    onSuccess: (processResults) => {
      processResults.pageNames.forEach((np:string) => {
        getWikiInfo.mutate({ "placeName": np })
      })
        // ALERT - NO places found
     // setIsLoadingAreas(loadingAreas.filter((la) => la.lat == processResults.lat && la.lng == processResults.lng))
    },
    onError: (data) => console.error('Failed to latLng.process here ', {res: data})
  });*/

    useEffect(() => {
        getPageNames.mutate({ lat, lng})
    }, [lat, lng])


 //   if(circleState == 'ready-to-gen'){
 //     return null;
 //   }
    return (<Circle
        key={`${lat}_${lng}`} 
        center={[lat, lng]}
        pathOptions={getStatusPathOptions(circleState)}
        radius={RADIUS}
    />)
}