import { MapContainer, Marker, TileLayer, useMap, useMapEvents, Popup, MarkerProps } from 'react-leaflet';
import { Ref, useEffect, useRef, useState } from "react";
import { Icon, Marker as MakerType, marker  } from 'leaflet';
import { type MappedPage } from "~/utils/mapWikiPage";
import locIconFile from 'src/styles/loc.png'
import redIconFile from 'src/styles/bang.png'
import loadingIconFile from 'src/styles/loading.png'
import errorIconFile from 'src/styles/error.png'
import { useMutation  } from '@tanstack/react-query';

import { api } from '~/utils/api'
import { type Place } from "@prisma/client";

const locIcon = new Icon({
    iconUrl: locIconFile.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const redIcon = new Icon({
    iconUrl: redIconFile.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  })


  const loadingIcon = new Icon({
    iconUrl: loadingIconFile.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });


  const errorIcon = new Icon({
    iconUrl: errorIconFile.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });


import WikiJS from 'wikijs'
import { type RouterOutputs } from '~/utils/api'
import { getStory } from '~/utils/getStory';
import Counter from './Counter';
const RADIUS = 1000;

export interface PublicPlaceType {
    id: string
    title: string
    content: string
    type: string
    wiki_id: string
}


export interface PlaceResult {
    place: Place, 
    placeTypes: PublicPlaceType[]
    updateRenderedPlaces:(newPlace:PlaceResult[]) => void;
  }
  


export default function PlaceMarker(props:PlaceResult) {

    const {place, placeTypes, updateRenderedPlaces} = props;
    const promptType = 'oldLegend'
    const [startLoadingTime, setStartLoadingTime] = useState<Date|null>(null)
    const [loadedStory, setLoadedStory] = useState<string|null>(null)
    const loadButtonRef = useRef<HTMLButtonElement>(null);


    const [timeDiff, setTimeDiff] = useState(0);
    useEffect(() => {
        if(startLoadingTime){

            const intervalId = setInterval(() => {
                const currentTime = new Date();
                const diff = currentTime.getTime() - startLoadingTime.getTime();
                if(loadButtonRef.current){
                    let dots = '.'
                    if(diff % 3 == 0){
                        dots = '...'
                    }else if(diff % 2 == 0){
                        dots = '..'
                    }
                    loadButtonRef.current.textContent = `Imaginering${dots} ${(diff/1000).toFixed(0)}`
                    loadButtonRef.current.disabled = true
                    loadButtonRef.current.style.backgroundColor = 'gray'
                }
            }, 1000);
        
            return () => {
                clearInterval(intervalId);
            };
                        
        }
    }, [startLoadingTime]);

    const placeMarkerRef = useRef<MakerType<MarkerProps>>(null);

    const getInitIcon = () => {
        if(place && !place.summary) {
            console.log('setIcon(getInitIcon - errorIcon)')
            return errorIcon
        }
        if(place.summary && placeTypes.length == 0){
            console.log('setIcon(getInitIcon - locIcon)')
            return locIcon
        }

        if(place.summary && placeTypes.length > 0){
            console.log('setIcon(getInitIcon - redIcon)')
            return redIcon
        }
    }

    const [icon, setIcon] = useState(getInitIcon())

    const refreshMarker = api.placeType.getSingle.useQuery({
        placeId: place.id
    },{
        enabled: false,
        onSuccess: (placeResult:PlaceResult) => {
            updateRenderedPlaces([placeResult])
        },
        onError: () => {
            console.error('Could not refresh marker')
        }
    })


  const saveStory = api.placeType.saveStory.useMutation({
    onSuccess: (newPlace) => {
      if(!!newPlace){
        setIcon(loadingIcon)
        console.log('setIcon(redIcon)')
        refreshMarker.refetch().catch((err) => {
            console.error('Could not refreshMarker', err)
        })
            
     //   onPlaceSuccess(newPlace);
      }else{
     //   onFailure(lat, lng);  
     console.log('setIcon(errorIcon)')

        setIcon(errorIcon)

      }
    },
    onError: (err) => {
      console.error(err)
   //   onFailure(lat, lng);
    }
  })
/*
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
    })*/
    /*
    const { refetch, data, isLoading, isError } = api.placeType.getSingle.useQuery({
        placeId: place.id
    },{
        cacheTime: Infinity,
        refetchInterval: 20000,
        retry: false,
    /*   initialData: {
            place,
            placeTypes
        }
    })*/


    // If we don't have a placeType for this place yet, create one
    // TODO: add check for promptType and old record

    const requestStory = () => {
        try{
          //  console.log('requestStorys')
            //console.log(markerRef)
            if(!startLoadingTime){
               // markerRef.current?.setPopupContent("Loading...")

               console.log('setIcon(loadingIcon)')

                setIcon(loadingIcon)
               // markerRef.current?.setIcon()
                setStartLoadingTime(new Date())
                getStory(place.wiki_id, place.wiki_url, place.summary, promptType)
                .then((s) => {
                    console.log('GET STORY FINISHED')
                    console.log(s)

                    if(s?.data){
                    //    if(markerRef && markerRef.current){
                         //   markerRef.current?.setPopupContent(s.data.content)
                           // markerRef.current?.setIcon(redIcon)
                   //     }
                        console.log('setIcon(redIcon)')
                        setIcon(redIcon)
                        setLoadedStory(s.data.content)
                        saveStory.mutate({
                            wiki_id: place.wiki_id
                            , title: s.data.title
                            , content: s.data.content
                            , type: promptType
                            , status: 'complete'
                        })
                    }else{
                        console.error('GET STORY FAILED', {s})
                 //       if(markerRef && markerRef.current){
                    console.log('setIcon(errorIcon)')

                            setIcon(errorIcon)

                          //  markerRef.current?.setIcon(errorIcon)
                 //       }
                        
                    }
                    setStartLoadingTime(null)

                }).catch((err) => {
                    console.error('Could got get story', {err: JSON.stringify(err)})
                    setStartLoadingTime(null)
                })
            }
        }catch(err){
            console.error(err)
        }
    }
/*
    useEffect(() => {
        if(!hasStory && data && data.place.wiki_id && data.placeTypes.length == 0 && !isError){
            getStory(place.wiki_id, place.wiki_url, place.summary, promptType).then(function() {
                refetch().catch((err) =>{
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    console.error('Could not refetch single', {err})
                })
            }).catch((err) => {
                console.error(err)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                console.error('Could not get story', {err})
            })
    
        }
    }, [])
  */  
    if(!place){
        return (<div>No place?</div>)
    }

    const loadPlace = (evt:React.MouseEvent<HTMLElement>) => {
        evt.preventDefault();
        console.log('loadPlace')
       // setIsLoadingStory(true)
        console.log('loadPlace1')
       // placeMarkerRef.current?
        requestStory()
       // setIsLoadingStory(false)
        console.log('loadPlace2')

    }

    return (<Marker ref={placeMarkerRef} key={`${place.id} ${place.wiki_url}`} position={[place.lat, place.lng]} icon={icon}>
        {startLoadingTime ? <Counter startDate={startLoadingTime} /> : null}
        {place.summary && placeTypes.length == 0 ? <Popup key={`${place.id}`} className='flex'>
            <button ref={loadButtonRef} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={loadPlace}>{'Load this place'}</button>
        </Popup> :
        <Popup minWidth={400} maxHeight={400} className='bg-brown-100 rounded-lg p-4 whitespace-break-spaces'>
                <img className='rounded-lg w-64 h-64 mr-2' src={`${place.main_image_url}`} alt={place.wiki_url}/>
            {placeTypes.map((g) => <div key={g.id} className="font-ltor text-sm flex">
                {/*<h1 className="max-h-24 font-bold underline ">{g.title}</h1>*/}

                {placeTypes.length == 0 && loadedStory ? loadedStory : g.content}
                {/*<button 
            className="px-4 py-3 bg-blue-600 rounded-md text-white outline-none focus:ring-4 shadow-lg transform active:scale-x-75 transition-transform mx-5 flex"
        onClick={() => requestStory()}>request story</button>}
                {/*<button 
            className="px-4 py-3 bg-blue-600 rounded-md text-white outline-none focus:ring-4 shadow-lg transform active:scale-x-75 transition-transform mx-5 flex"
        onClick={() => onDeletePlaceType(g.id)}>[delete]</button>*/}
                
</div>)}
            [Generated with AI]
            <details>{place.id}<summary></summary>{JSON.stringify(place.summary)}</details>
        </Popup>}

    </Marker>)
}