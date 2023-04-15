import 'leaflet/dist/leaflet.css';
import { Icon, LatLng, LatLngLiteral } from 'leaflet';
import { useState } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import { api } from '~/utils/api';
import iconFile from 'src/styles/bang.png'
import locIconFile from 'src/styles/loc.png'
import { PlaceType } from '@prisma/client';

const customIcon = new Icon({
  iconUrl: iconFile.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const locIcon = new Icon({
  iconUrl: locIconFile.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});


export default function DebugMarkers() {

  const [isLoading, setIsLoading] = useState(true)

  const processLatLng = api.latLng.process.useMutation({
    onSuccess: (newPlaces) => {
      newPlaces.forEach((np) => {
        getPlaceType.mutate({ "wiki_id": np.wiki_id, "type": 'oldLegend'})
      })
    },
    onError: (data) => console.error('Failed to latLng.process'+data.message),
  });

  const createLatLng = api.latLng.createLatLng.useMutation({
    onSuccess: (data) =>  {
      // await existingMarkers.refetch()
      processLatLng.mutate({ id: data.id})

      setIsLoading(false)
    },
    onError: (data) => console.log('Woah, failed'+data.message),
    onMutate: () => {
      setIsLoading(true)
    }
  });
  
    const map = useMapEvents({
        click: (e) => {
          if(e.latlng){
            const { lat, lng } = e.latlng;
            const newPoint = new LatLng(lat, lng);
            // L.marker([lat, lng], { icon }).addTo(map);
            createLatLng.mutate({ lat: newPoint.lat, lng: newPoint.lng})
          }else{
            console.error('e.latlng is nulll')
          }
        }
    });

    const bounds = map.getBounds()
    const topLeft = bounds.getNorthWest()
    const bottomRight = bounds.getSouthEast()
    const existingMarkers = api.latLng.getInside.useQuery({
      topLeftLat: topLeft.lat,
      topLeftLng: topLeft.lng,
      bottomRightLat: bottomRight.lat,
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
      refetchInterval: 100000
    })

    const [generations, setGenerations] = useState<PlaceType[]|null>();


    const getPlaceType = api.placeType.request.useMutation({
      onSuccess: (data) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        setGenerations(generations?.concat(data));
      },
      onError: (data) => console.error('Failed to placeType.request'+data.message)
    });

    const onProcess = (pointId:string) => {
        processLatLng.mutate({ id: pointId})
    }

    const onGenerate = (wiki_id: string) => {
      const res = getPlaceType.mutate({ "wiki_id": wiki_id, "type": 'oldLegend'})

      console.log(res);
    }

  return (
    <>
      {isLoading && <div style={{zIndex: 999999}}>Loading...</div>}
      {existingMarkers?.data 
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
      : null}
       {existingPlaces?.data 
      && existingPlaces?.data?.length > 0 
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ? existingPlaces.data.map((m) => <Marker key={`${m.place.id}`} position={[m.place.lat, m.place.lng]} icon={locIcon}>
          <Popup>
          <details><summary>{m.place.wiki_url}</summary>{m.place.summary}</details>
          <button 
            className="px-4 py-3 bg-blue-600 rounded-md text-white outline-none focus:ring-4 shadow-lg transform active:scale-x-75 transition-transform mx-5 flex" 
            onClick={() => onGenerate(m.place.wiki_id)}>generate</button>
            <img src={`${m.place.main_image_url}`} alt={m.place.wiki_url}/>
            {m.placeTypes.map((g) => <div key={g.title}><h1 className="text-2xl font-bold">{g.title}</h1>{g.content}</div>)}
          </Popup>
        </Marker>) 
      : null}
    </>
  );
}