import 'leaflet/dist/leaflet.css';
import { Icon, LatLng, LatLngLiteral } from 'leaflet';
import { useState } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import { api } from '~/utils/api';
import iconFile from 'src/styles/bang.png'
import locIconFile from 'src/styles/loc.png'

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

  const createLatLng = api.latLng.createLatLng.useMutation({
    onSuccess: async () =>  {
      await existingMarkers.refetch()
      setIsLoading(false)
    },
    onError: (data) => console.log('Woah, failed'+data.message),
    onMutate: () => {
      setIsLoading(true)
    }
  });

  interface Result {
    title:string,
    wiki_id:string
  }
  
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

    const existingPlaces = api.place.getInside.useQuery({
      topLeftLat: topLeft.lat,
      topLeftLng: topLeft.lng,
      bottomRightLat: bottomRight.lat,
      bottomRightLng: bottomRight.lng
    },{
      cacheTime: Infinity
    })

    const [generations, setGenerations] = useState<Result[]>([]);

    const process = api.latLng.process.useMutation({
      onSuccess: async () => {
        await existingPlaces.refetch()
      },
      onError: (data) => console.error('Failed to latLng.process'+data.message)
    });

    const getPlaceType = api.placeType.request.useMutation({
      onSuccess: (data) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        setGenerations(generations?.concat({ title: data.title, wiki_id: data.wiki_id}));
      },
      onError: (data) => console.error('Failed to placeType.request'+data.message)
    });

    const onProcess = (pointId:string) => {
        process.mutate({ id: pointId})
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
      ? existingPlaces.data.map((m) => <Marker key={`${m.id}`} position={[m.lat, m.lng]} icon={locIcon}>
          <Popup>{JSON.stringify(m)}
          <button 
            className="px-4 py-3 bg-blue-600 rounded-md text-white outline-none focus:ring-4 shadow-lg transform active:scale-x-75 transition-transform mx-5 flex" 
            onClick={() => onGenerate(m.wiki_id)}>generate</button>
            {generations.filter((g) => g.wiki_id == m.wiki_id).map((g) => <div key={g.title}>{g.title}</div>)}
            <a href={m.main_image_url}/>
          </Popup>
        </Marker>) 
      : null}
    </>
  );
}