import 'leaflet/dist/leaflet.css';
import L, { Icon, LatLng } from 'leaflet';
import { useState } from 'react';
import { Circle, Marker, Popup, useMapEvents } from 'react-leaflet';
import { api } from '~/utils/api';
import iconFile from 'src/styles/bang.png'
import loadingIconFile from 'src/styles/loading.gif'
import locIconFile from 'src/styles/loc.png'
import { Place, PlaceType } from '@prisma/client';

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

export interface PlaceResult {
  place: Place, 
  placeTypes: PublicPlaceType[]
}
interface DebugMarkersProps {
  setVisiblePlaces?:React.Dispatch<React.SetStateAction<PlaceResult[]>>
  promptType:string
}

export default function DebugMarkers({setVisiblePlaces, promptType}:DebugMarkersProps) {

  const [loadingAreas, setIsLoadingAreas] = useState<Loading[]>([])
/*
  const processLatLng = api.latLng.process.useMutation()
  {
    onSuccess: (processResults) => {
      processResults.places.forEach((np) => {
        getPlaceTypeStory.mutate({ "wiki_id": np.wiki_id, "promptType": promptType})
      })
        // ALERT - NO places found
      setIsLoadingAreas(loadingAreas.filter((la) => la.lat == processResults.lat && la.lng == processResults.lng))
    },
    onError: (data) => console.error('Failed to latLng.process here ', {res: data}),
  });

  const createLatLng = api.latLng.createLatLng.useMutation({
    onSuccess: (data) =>  {
      processLatLng.mutate({ id: data.id})
    },
    onError: (data) => {
      // Bit of a hack, we don't know which failed
      setIsLoadingAreas([]);
      console.log('Woah, failed'+data.message)
    }
  });
  
    const map = useMapEvents({
        click: (e) => {
          if(e.latlng){
            console.log('CLICK')
            const { lat, lng } = e.latlng;
            const newPoint = new LatLng(lat, lng);
            // L.marker([lat, lng], { icon }).addTo(map);
            createLatLng.mutate({ lat: newPoint.lat, lng: newPoint.lng})
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
   /* const existingMarkers = api.latLng.getInside.useQuery({
      topLeftLat: topLeft.lat,
      topLeftLng: topLeft.lng,
      bottomRightLat: b{ottomRight.lat,
      bottomRightLng: bottomRight.lng
    },{
      cacheTime: Infinity
    })

    const existingPlaces = api.placeType.getInside.useQuery({
      topLeftLat: topLeft.lat,
      topLeftLng: topLeft.lng,
      bottomRightLat: bottomRight.lat,
      bottomRightLng: bottomRight.lng
    },{
      cacheTime: Infinity,
      refetchInterval: 10000,
      onSuccess: () => {
        if(setVisiblePlaces){
          setVisiblePlaces(existingPlaces && existingPlaces.data ? existingPlaces.data : [])
        }
      }
    })
*/
    const [generations, setGenerations] = useState<PlaceType[]|null>();


    const getPlaceTypeStory = api.placeType.getAndPopulateStory.useMutation({
      onSuccess: (data) => {
        if(data){
          setGenerations(generations?.concat([data.placeType]));
          setIsLoadingAreas(loadingAreas.filter((la) => la.lat == data.lat && la.lng == data.lng))
        }
        
      },
      onError: (data) => console.error('Failed to placeType.request', { data })
    });

    const deletePlaceType = api.placeType.delete.useMutation({
      onSuccess: (data) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        setGenerations(generations?.filter((g) => g.id !== data.id));
      },
      onError: (data) => console.error('Failed to placeType.request'+data.message)
    });

    const onDeletePlaceType = (placeTypeId:string) => {
      deletePlaceType.mutate({ id: placeTypeId})
  }
    
    const onGenerate = (wiki_id: string) => {
      getPlaceTypeStory.mutate({ "wiki_id": wiki_id, "promptType": promptType}, {
        staleTime: Infinity,
        cacheTime: Infinity,
        retry: false
      })

      //console.log(res);
    }

    const loadingCircleSizeMeters = 1000;


  return (
    <><style>
      {`

      `}
    </style>
      {/*existingMarkers?.data 
      && existingMarkers?.data?.length > 0 
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ? existingMarkers.data.map((m) => <Marker key={`${m.id}`} position={[m.lat, m.lng]} icon={customIcon}>
          <Popup >{m.status} {m.lat}, {m.lng} {existingMarkers?.data?.length}
          <button 
            className="px-4 py-3 bg-blue-600 rounded-md text-white outline-none focus:ring-4 shadow-lg transform active:scale-x-75 transition-transform mx-5 flex" 
            onClick={() => onProcess(m.id)}>Get Places</button>

          {isLoading && <div style={{zIndex: 999999}}>Loading...</div>}
          </Popup>
        </Marker>) 
  : null*/}
  {loadingAreas.map((la) => <Circle
        key={`${la.lat}_${la.lng}`} 
        center={[la.lat, la.lng]} 
        radius={loadingCircleSizeMeters}
      />)}
       {/*existingPlaces?.data 
      && existingPlaces?.data?.length > 0 
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ? existingPlaces.data.map((m) => <Marker key={`${m.place.id}`} position={[m.place.lat, m.place.lng]} icon={locIcon}>
          <Popup minWidth={400} maxHeight={400} className='bg-brown-100 rounded-lg p-4 whitespace-break-spaces'>
            <button 
              className="px-4 py-3 bg-blue-600 rounded-md text-white outline-none focus:ring-4 shadow-lg transform active:scale-x-75 transition-transform mx-5 flex" 
              onClick={() => onGenerate(m.place.wiki_id)}>generate</button>
              
              <img className='rounded-lg' src={`${m.place.main_image_url}`} alt={m.place.wiki_url}/>
              {m.placeTypes.map((g) => <div key={g.title} className="font-ltor text-sm">
                    <h1 className="max-h-24 text-1xl font-bold underline ">{g.title} ({loadingAreas.length})</h1>
                    {g.content}
                    <button 
              className="px-4 py-3 bg-blue-600 rounded-md text-white outline-none focus:ring-4 shadow-lg transform active:scale-x-75 transition-transform mx-5 flex"
              onClick={() => onDeletePlaceType(g.id)}>[delete]</button>
                    
              </div>)}
              [Generated with AI]
              <details><summary>{m.place.wiki_url}</summary>{m.place.summary}</details>
          </Popup>
          
        </Marker>) 
  : null*/}
    </>
  );
}