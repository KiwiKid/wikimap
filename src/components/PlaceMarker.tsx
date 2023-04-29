import { MapContainer, Marker, TileLayer, useMap, useMapEvents, Popup, MarkerProps } from 'react-leaflet';
import { Ref, useEffect, useRef, useState } from "react";
import { DivIcon, Icon, Marker as MakerType, marker  } from 'leaflet';
import { wikiInfo, type MappedPage } from "~/utils/mapWikiPage";
import locIconFile from 'src/styles/book-closed.png'
import bookOpenRed from 'src/styles/book-open-red.png'
import bookOpen from 'src/styles/book-open.png'
import loadingIconFile from 'src/styles/loading.png'
import ideaIconFile from 'src/styles/idea.png'
//import LoadingIconFile from 'src/styles/loading-2.gif'
import errorIconFile from 'src/styles/error.png'
import { useMutation  } from '@tanstack/react-query';

import { api } from '~/utils/api'
import { PlaceType, type Place } from "@prisma/client";

const locIcon = new Icon({
    iconUrl: locIconFile.src,
    iconSize: [40, 50],
    iconAnchor: [20, 41],
  });

  const bookOpenRedIcon = new Icon({
    iconUrl: bookOpenRed.src,
    iconSize: [35, 48],
    iconAnchor: [0, 41],
  })

  const bookOpenIcon = new Icon({
    iconUrl: bookOpen.src,
    iconSize: [35, 48],
    iconAnchor: [12, 41],
  })


  const loadingIcon = new Icon({
    iconUrl: ideaIconFile.src,
    iconSize: [50, 50],
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
import { setFoundLocation } from '~/utils/getFoundLocations';
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
  }
  
interface PlaceMarkerProps {
    place:Place
    // updateRenderedPlaces:(newPlace:PlaceResult[]) => void;
    onPlaceTypeLoaded:(newPlace:PlaceResult) => void;
    promptType:string
    isThisUserFound:boolean
}

export default function PlaceMarker(props:PlaceMarkerProps) {

    const {onPlaceTypeLoaded, place, promptType, isThisUserFound} = props;
    const [startLoadingTime, setStartLoadingTime] = useState<Date|null>(null)
    const [loadedStory, setLoadedStory] = useState<string|null>(null)
    const loadButtonRef = useRef<HTMLButtonElement>(null);
    const loadContentRef = useRef<HTMLDivElement>(null);

    const [hasLoadedStory, setHasLoadedStory] = useState<boolean>(false)
    const contentRef = useRef<HTMLDivElement>(null);
   
   
    const setExistingScrollPosition = (pos:number) => {
        window.localStorage.setItem(`${place.id}`, pos.toString())
    }

    const existingScrollPosition = window.localStorage.getItem(`${place.id}`)

    const [placeType, setPlaceType] = useState<PublicPlaceType | 'none' | null>(null);

    const convertToDots = (num:number) =>
            Array.from({ length: num }, () => '.').join('');
  
            const updateLoading = (dotCount:number, startLoadingTime:Date) => {
                const currentTime = new Date();
                const diff = currentTime.getTime() - startLoadingTime.getTime();
                if(loadButtonRef.current){
                    let extraMessage = ''
                    if( diff > 50*1000){
                        extraMessage = `I'm impressed your still waiting`
                    }else if(diff > 40*1000){
                        extraMessage = `This is taking ages`
                    }else if(diff > 33*1000){
                        extraMessage = 'Oh no! Thats too long'
                    }else if(diff > 4*1000){
                        if(loadContentRef.current){
                            loadContentRef.current.textContent = '(you can close this and come back to it)'
                        }
                    }

                    loadButtonRef.current.textContent = `(${(diff/1000).toFixed(0)}) Imaginering${convertToDots(dotCount)}\r\n${extraMessage}`
                    loadButtonRef.current.disabled = true
                    loadButtonRef.current.style.backgroundColor = 'gray'
                }
            }


  
    useEffect(() => {

        let dotCount = 0
        

        if(startLoadingTime){
            // Run it first time straight away
            if(!hasLoadedStory){
                setHasLoadedStory(true)
                updateLoading(dotCount++, startLoadingTime)
            }
            

            const intervalId = setInterval(() => {
                updateLoading(dotCount++, startLoadingTime)
                if(dotCount > 3){
                    dotCount = 0;
                }
            }, 1000);
        
            return () => {
                clearInterval(intervalId);
            };
                        
        }else{
            if(placeMarkerRef && placeMarkerRef.current){
                placeMarkerRef.current.closePopup();
            }
        }
    }, [startLoadingTime]);

    const placeMarkerRef = useRef<MakerType<MarkerProps>>(null);

    const getInitIcon = () => {
        if(place && !place.summary) {
            return errorIcon
        }
        if(place.status == 'empty'){
            return locIcon
        }

        if(isThisUserFound){
            return bookOpenRedIcon
        }
        if(place.summary == 'populated'){
            return bookOpenIcon
        }

        return locIcon
    }

    // const [icon, setIcon] = useState(getInitIcon())

    const setIcon = (icon:DivIcon) => {
        if(placeMarkerRef && placeMarkerRef.current){
            placeMarkerRef.current?.setIcon(icon)
        }
    }

    const refreshMarker = api.placeType.getSingle.useQuery({
        placeId: place.id
    },{
        enabled: false,

        onSuccess: (placeResult:PlaceResult) => {
            console.log('refreshMarker onSuccess ')
            console.log(placeResult.placeTypes)

            if(placeResult.placeTypes.length > 0 && placeResult.placeTypes[0] !== undefined){
                setPlaceType(placeResult.placeTypes[0])
            }else{
                setPlaceType('none')
            }

            //onPlaceTypeLoaded(placeResult)
            
            //updateRenderedPlaces(placeResult)
          //  placeMarkerRef.current?.setIcon(locIcon)
        },
        onError: () => {
            console.error('Could not refresh marker')
        }
    })

    useEffect(() => {
        if(placeType != 'none' && placeType == null){
            refreshMarker.refetch().catch((err) => {
                console.error('Could not refreshMarker', err)
            })   
        }else if(placeType != 'none'){
            if(isThisUserFound){
                placeMarkerRef.current?.setIcon(bookOpenRedIcon)
            }else{
                placeMarkerRef.current?.setIcon(bookOpenIcon)
            }
            
        }
        if(existingScrollPosition){
            contentRef.current?.scrollTo({
                top: +existingScrollPosition
            })
        }
    }, [placeType, refreshMarker])


  const saveStory = api.placeType.saveStory.useMutation({
    onSuccess: (newPlace) => {
        console.log('saveStory onSuccess')

      if(!!newPlace){
        setIcon(loadingIcon)
        refreshMarker.refetch().catch((err) => {
            console.error('Could not refreshMarker', err)
        })
            
     //   onPlaceSuccess(newPlace);
      }else{
     //   onFailure(lat, lng);  

        setIcon(errorIcon)

      }
    },
    onError: (err) => {
      console.error(err)
   //   onFailure(lat, lng);
    }
  })


    // If we don't have a placeType for this place yet, create one
    // TODO: add check for promptType and old record

    const requestStory = () => {
        setIcon(loadingIcon)
        try{
          //  console.log('requestStorys')
            //console.log(markerRef)
            if(!startLoadingTime){
               // markerRef.current?.setPopupContent("Loading...")

               console.log('setIcon(loadingIcon)')

               // markerRef.current?.setIcon()
                setStartLoadingTime(new Date())
                getStory(place.wiki_id, place.wiki_url, place.summary, promptType)
                .then((s) => {
                    console.log('GET STORY FINISHED')
                    console.log(s)

                    if(s?.wiki_id && s?.content){
                    //    if(markerRef && markerRef.current){
                         //   markerRef.current?.setPopupContent(s.data.content)
                           // markerRef.current?.setIcon(redIcon)
                   //     }
                      //  setIcon(redIcon)
                        // setLoadedStory(s.content)
                        saveStory.mutate({
                            wiki_id: place.wiki_id
                            , title: s.title || ''
                            , content: s.content
                            , promptType: promptType
                            , status: 'complete'
                        })
                        setIcon(getInitIcon())
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
        console.log('loadPlace')
        evt.preventDefault();
        console.log('loadPlace')
       // setIsLoadingStory(true)
        console.log('loadPlace1')
       // placeMarkerRef.current?
        requestStory()
       // setIsLoadingStory(false)
        console.log('loadPlace2')
        //placeMarkerRef.current?.closePopup()
    }

    if(placeType === 'none' || placeType == null){
        if(place){
            return (
                <Marker ref={placeMarkerRef} key={`${place.id} ${place.wiki_url}`} position={[place.lat, place.lng]} icon={(locIcon)}>
                    <Popup key={`${place.id}`} className='flex text-center align-middle'>
                    <button className="float-right bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded" onClick={() => placeMarkerRef.current?.closePopup()}>{'Close'}</button>

                <div>
                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                    {/* @ts-ignore */}
                    
                </div>
                <div>
                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                    {/* @ts-ignore */}
                    
                    <div className='text-lg'>{place?.info?.name}</div>
                    <div>{place.summary.substring(0, 150).replace('SUMMARY:', '')}...</div>
                    <div className='align-middle items-center'>

                        <button ref={loadButtonRef} className="w-3/5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded" onClick={loadPlace}>{`Imagine a Story about here`}</button>

                    </div>
                    <div className='font-bold py-2 px-4 rounded'>[Estimate: 30 seconds]</div>
                    <div ref={loadContentRef}></div>
                </div>
            </Popup>
        </Marker>)
        }else{
            return (<div>placeType with No place?</div>)
        }
    }

    return (<Marker ref={placeMarkerRef} key={`${place.id} ${place.wiki_url}`} position={[place.lat, place.lng]} icon={getInitIcon()}>
        {startLoadingTime ? <Counter startDate={startLoadingTime} /> : null}
        {<Popup maxHeight={500} className='bg-brown-100 rounded-lg p-4 whitespace-break-spaces'>
                <img className='rounded-lg mr-2' src={`${place.main_image_url}`} alt={place.wiki_url}/>
            {<div key={placeType.id}>
                {placeType.title && <h1 className="text-xl font-bold underline text-center p-2">{placeType.title}</h1>}
<div ref={contentRef} onScroll={() => setExistingScrollPosition(+(contentRef.current?.scrollTop || 0))} className="font-ltor text-sm flex">

                {placeType.content}
                {/*<button 
            className="px-4 py-3 bg-blue-600 rounded-md text-white outline-none focus:ring-4 shadow-lg transform active:scale-x-75 transition-transform mx-5 flex"
onClick={() => requestStory()}>request story</button>*/}
                {/*<button 
            className="px-4 py-3 bg-blue-600 rounded-md text-white outline-none focus:ring-4 shadow-lg transform active:scale-x-75 transition-transform mx-5 flex"
        onClick={() => onDeletePlaceType(g.id)}>[delete]</button>*/}
                
                </div></div>}
            [Generated with AI @ wikimap.vercel.app]
            <details>{place.id}<summary></summary>{JSON.stringify(place.summary)}</details>
        </Popup>}
        

    </Marker>)
}