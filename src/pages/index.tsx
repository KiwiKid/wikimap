import { type GetStaticPropsContext, type GetStaticPropsResult, type NextPage } from "next"
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { type ParsedUrlQuery } from "querystring";
import { useState } from "react";
import { type PlaceResult } from "~/components/PlaceMarkers";
import MapDrawerContainer from "~/components/MapDrawerContainer";
import { Place } from "@prisma/client";

const Map = dynamic(() => import('../components/MapView'), {
    ssr: false,
    loading: () => <div>Loading....</div>,
  });

  const DMapDrawerContainer = dynamic(() => import('../components/MapDrawerContainer'), {
    ssr: false,
    loading: () => <div>Loading</div>,
  })

const MapPage:NextPage = () => {
   // const [visiblePlaces, setVisiblePlaces] = useState<PlaceResult[]>([])
   const [renderedPlaces, setRenderedPlaces] = useState<Place[]>([]);


    const router = useRouter();


    return <div>
    <Map setRenderedPlaces={setRenderedPlaces} renderedPlaces={renderedPlaces}/>
    {router?.query?.showDrawer && <DMapDrawerContainer renderedPlaces={renderedPlaces}/>}
</div>
}

export default MapPage