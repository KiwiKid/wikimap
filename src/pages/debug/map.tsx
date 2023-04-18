import { NextPage } from "next"
import dynamic from "next/dynamic";
import { useState } from "react";
import MapDrawerContainer from "~/components/MapDrawerContainer";
import { api } from "~/utils/api";


const DebugMapWithNoSSR = dynamic(() => import('../../components/DebugMapView'), {
    ssr: false,
    loading: () => <div>Loading....</div>,
  });


const DebugMap:NextPage = () => {

  const [deleteCode, setDeleteCode] = useState<string>()

  const resetAll = api.utils.resetAll.useMutation()

  const onDelete = (event:React.MouseEvent<HTMLButtonElement>) => {
      const value = (event.currentTarget as HTMLButtonElement).value;
      resetAll.mutate({ secretDeleteCode: value})
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setDeleteCode(event.target.value);
  };

  return (<>
    <DebugMapWithNoSSR promptType="oldLegend"/>
      <MapDrawerContainer visiblePlaces={[]}>
      <>
        <input
          type="text"
          value={deleteCode}
          onChange={handleInputChange}
          placeholder="Enter code here..."
        />
        <button onClick={onDelete}>Reset</button>
      </>
      </MapDrawerContainer>
    </>)
}

export default DebugMap