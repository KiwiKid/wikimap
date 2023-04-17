import { NextPage } from "next"
import dynamic from "next/dynamic";
import { useState } from "react";
import { PlaceResult } from "~/components/DebugMarkers";
import MapDrawerContainer from "~/components/MapDrawerContainer";

const Map = dynamic(() => import('../components/MapView'), {
    ssr: false,
    loading: () => <div>Loading....</div>,
  });

const DebugMap:NextPage = () => {
    const [visiblePlaces, setVisiblePlaces] = useState<PlaceResult[]>([])
    return <>
    <Map setVisiblePlaces={setVisiblePlaces}/>
    <MapDrawerContainer visiblePlaces={visiblePlaces}>
      <>Woah</>
    </MapDrawerContainer>
</>
}

export function getStaticPaths() {
  return {
    paths: [
      { 
        params: {
        promptType: 'oldLegend',
      }
    }],
    fallback: false,
  };
}


export default DebugMap