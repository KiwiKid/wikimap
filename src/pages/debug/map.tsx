import { NextPage } from "next"
import dynamic from "next/dynamic";
import MapDrawerContainer from "~/components/MapDrawerContainer";


const DebugMapWithNoSSR = dynamic(() => import('../../components/DebugMapView'), {
    ssr: false,
    loading: () => <div>Loading....</div>,
  });


const DebugMap:NextPage = () => {
    return <>
    <DebugMapWithNoSSR />
    <MapDrawerContainer>
      <>Woah</>
      </MapDrawerContainer>
</>
}

export default DebugMap