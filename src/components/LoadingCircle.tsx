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
interface LoadingCircleProps {
  lat:number
  , lng:number
  , onPageNames:((lat:number, lng: number, pageNames:string[])=>void)
  , onFailure:((lat:number, lng: number)=>void)
  , onPlaceSuccess:((wikiPlace:Place)=>void)
  , onFinished:((lat:number, lng:number)=>void)
}

export default function LoadingCircle({
   lat
  , lng
  , onPageNames
  , onFailure
  , onPlaceSuccess
  , onFinished
}:LoadingCircleProps) {

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
    }
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const getPageNames = api.latLng.getPageNames.useMutation({
    onSuccess: (res:WikiSearchResult) => {
      res.pageNames.forEach((pn) => {
        processPageName.mutate({
          pageName: pn
        })
      })
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


    return (<Circle
        key={`${lat}_${lng}`} 
        center={[lat, lng]} 
        radius={RADIUS}
    />)
}