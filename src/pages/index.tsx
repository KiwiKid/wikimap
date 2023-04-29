import { type GetStaticPropsContext, type GetStaticPropsResult, type NextPage } from "next"
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { type ParsedUrlQuery } from "querystring";
import { useState } from "react";
import { type PlaceResult } from "~/components/PlaceMarkers";
import MapDrawerContainer from "~/components/MapDrawerContainer";
import { Place } from "@prisma/client";
import ToggleBar from "~/components/ToggleBar";

const Map = dynamic(() => import('../components/MapView'), {
    ssr: false,
    loading: () => <div>Loading....</div>,
  });

  const DMapDrawerContainer = dynamic(() => import('../components/MapDrawerContainer'), {
    ssr: false,
    loading: () => <div>Loading</div>,
  })


  export type PageMode = 'browse'| 'newLocationSearch'
const MapPage:NextPage = () => {
   // const [visiblePlaces, setVisiblePlaces] = useState<PlaceResult[]>([])
   const [renderedPlaces, setRenderedPlaces] = useState<Place[]>([]);
   const [pageMode, setPageMode] = useState<PageMode>('browse')

    const router = useRouter();


    return <div>
    <ToggleBar pageMode={pageMode} onToggle={() => setPageMode(pageMode == 'browse' ? 'newLocationSearch' : 'browse')}/>
    <Map setRenderedPlaces={setRenderedPlaces} renderedPlaces={renderedPlaces} pageMode={pageMode}/>
    {router?.query?.showDrawer && <DMapDrawerContainer renderedPlaces={renderedPlaces}/>}
</div>
}

export default MapPage