import { type GetStaticPropsContext, type GetStaticPropsResult, type NextPage } from "next"
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { type ParsedUrlQuery } from "querystring";
import { useState } from "react";
import { type PlaceResult } from "~/components/PlaceMarkers";
import MapDrawerContainer from "~/components/MapDrawerContainer";

const Map = dynamic(() => import('../components/MapView'), {
    ssr: false,
    loading: () => <div>Loading....</div>,
  });

const MapPage:NextPage<PageProps> = ({promptType}:PageProps) => {
    const [visiblePlaces, setVisiblePlaces] = useState<PlaceResult[]>([])

    const router = useRouter();
    if (router.isFallback) {
      return <div>Loading...{promptType}</div>;
    }

    return <>
    <Map setVisiblePlaces={setVisiblePlaces} promptType={promptType}/>
    <MapDrawerContainer visiblePlaces={visiblePlaces}>
      <>{promptType}</>
    </MapDrawerContainer>
</>
}

interface PagePropsIn extends ParsedUrlQuery {
  promptType:string
}

interface PageProps {
  promptType:string
}

export function getStaticProps(
  context:GetStaticPropsContext<PagePropsIn>
): Promise<GetStaticPropsResult<PageProps>> {
  // The params will have a 'promptType',
  const promptType:string = typeof context.params?.promptType !== 'string' ? 'oldLegend' : context.params?.promptType
  return Promise.resolve({
    props: {
      promptType: promptType
    }
  })
}

export function getStaticPaths() {
  return {
    paths: [
      { 
        params: {
          promptType: 'oldLegend',
        }
      },
      {
        params: {
          promptType: 'wizard'
        }
      }
      ],
    fallback: true,
  };
}


export default MapPage