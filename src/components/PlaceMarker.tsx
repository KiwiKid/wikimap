import { MapContainer, Marker, TileLayer, useMap, useMapEvents, Popup, MarkerProps } from 'react-leaflet';
import { Ref, useEffect, useRef, useState } from "react";
import { Icon, Marker as MakerType, marker  } from 'leaflet';
import { type MappedPage } from "~/utils/mapWikiPage";
import locIconFile from 'src/styles/loc.png'
import redIconFile from 'src/styles/bang.png'
import loadingIconFile from 'src/styles/loading.png'
import errorIconFile from 'src/styles/error.png'


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
  


export default function PlaceMarker(props:PlaceResult) {

    const {place, placeTypes} = props;
    const promptType = 'oldLegend'



    const [isLoadingStory, setIsLoadingStory] = useState(false)
    const [loadedStory, setLoadedStory] = useState<string>("")



    const placeMarkerRef = useRef<MakerType<MarkerProps>>(null);

    const getIcon = () => {
        if(place && !place.summary) {
            return errorIcon
        }
        if(place.summary && placeTypes.length == 0){
            return locIcon
        }

        if(place.summary && placeTypes.length > 0){
            return redIcon
        }
    }

    const [icon, setIcon] = useState(getIcon())


  const saveStory = api.placeType.saveStory.useMutation({
    onSuccess: (newPlace) => {
      if(!!newPlace){
     //   onPlaceSuccess(newPlace);
      }else{
     //   onFailure(lat, lng);  
      }
      console.log(' api.placeType.saveStory')
      console.log(newPlace)
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
            if(!isLoadingStory){
               // markerRef.current?.setPopupContent("Loading...")
                setIcon(loadingIcon)
               // markerRef.current?.setIcon()
                setIsLoadingStory(true)
                getStory(place.wiki_id, place.wiki_url, place.summary, promptType)
                .then((s) => {
                    //if(markerRef && markerRef.current){
                        setIcon(locIcon)
                    //    markerRef.current?.setIcon(locIcon)
                   // }
                    console.log('GET STORY FINISHED')
                    console.log(s)

                    if(s?.data){
                    //    if(markerRef && markerRef.current){
                         //   markerRef.current?.setPopupContent(s.data.content)
                           // markerRef.current?.setIcon(redIcon)
                   //     }

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
                            setIcon(errorIcon)

                          //  markerRef.current?.setIcon(errorIcon)
                 //       }
                        
                    }
                    
                }).catch((err) => {
                    console.error('Could got get story', {err: JSON.stringify(err)})
                }).finally(() =>{
                    setIsLoadingStory(false)
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
        setIsLoadingStory(true)
        console.log('loadPlace1')

        requestStory()
        setIsLoadingStory(false)
        console.log('loadPlace2')

    }

    return (<Marker ref={placeMarkerRef} key={`${place.id} ${place.wiki_url}`} position={[place.lat, place.lng]} icon={icon}>
        {place.summary && placeTypes.length == 0 ? 
        <Popup key={`${place.id}`}>
            {}
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={loadPlace}>Load this place</button>
            {isLoadingStory ? 'loading' : JSON.stringify(place.info)}
            {JSON.stringify(isLoadingStory)}
        </Popup>
        : <Popup minWidth={400} maxHeight={400} className='bg-brown-100 rounded-lg p-4 whitespace-break-spaces'>

            <img className='rounded-lg' src={`${place.main_image_url}`} alt={place.wiki_url}/>
            {placeTypes.map((g) => <div key={g.id} className="font-ltor text-sm">
                <h1 className="max-h-24 font-bold underline ">{g.title}</h1>
                {g.content}
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