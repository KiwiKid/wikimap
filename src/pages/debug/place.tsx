import { Place } from "@prisma/client";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { api } from "~/utils/api";

const InitSeedLatLng:NextPage = () => {

    // Get the query parameter from the URL
    const router = useRouter();
    console.log(router.query)
    const { page, length } = router.query;

    const pageNum = parseInt(typeof page == 'string' ? page : '0')
    const lengthNum = parseInt(typeof length == 'string' ? length :'50')

    const [processResults, setProcessResults] = useState<Place[]|null>();


    // Run a batch of seeds
    const { isFetched, data, isError, error } = api.latLng.getAll.useQuery({ page:pageNum, length: lengthNum })
    const mutation = api.latLng.process.useMutation()

    const handleClick = (evt:React.MouseEvent<HTMLButtonElement>) => {
        console.log('handleClick:refetch')
        const elm = evt.target as HTMLButtonElement;

         mutation.mutate({ id: elm.value})
        if(!isError && typeof data != 'undefined' && !data){
            console.log('handleClick:refetch:setInitResult(')
            setProcessResults(processResults?.concat(data))
        }else{
            console.error('Failed to init', {error})
        }
    };

    if(!isFetched){
        return <div>loading..</div>
    }

    if(isError){
        return <div>{error.message} {JSON.stringify(error)}</div>
    }
    
    return (data?.map((d) => {
        const match = processResults?.filter((pr) => pr.id === d.id);
        return (
          <div key={d.id}>
            <div>
              {d.id}
              {d.lat}
              {d.lng}
              {d.status}
            </div>
            <div>
              {match ? (
                match.map((m) => (
                  <div key={m.id}>{`${m.wikiUrl} ${m.generatedTitle ?? ''}`}</div>
                ))
              ) : (
                <button value={d.id} onClick={handleClick}>
                  Run-It
                </button>
              )}
            </div>
          </div>
        );
      }))
}


export default InitSeedLatLng