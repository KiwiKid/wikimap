import { Place } from "@prisma/client";
import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import NavBar from "~/components/NavBar";
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
    const { isFetched, data, isError, error } = api.place.getAll.useQuery({ page: pageNum, length: lengthNum })

    const handleClick = (evt:React.MouseEvent<HTMLButtonElement>) => {
        console.log('handleClick:refetch')
        const elm = evt.target as HTMLButtonElement;

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
        return <div><NavBar/>{error.message} {JSON.stringify(error)}</div>
    }
    
    return (data ? <div>
                {pageNum > 0 && <Link href={`/debug/place?page=${pageNum-1}&length=${lengthNum}`}>
            ««« Previous
        </Link>}
        <button className="btn btn-blue" onClick={(evt) => handleClick(evt)}>Save in db</button>
        <Link href={`/debug/place?page=${pageNum+1}&length=${lengthNum}`}>
            Next »»»
        </Link>
        <NavBar/>
        {data?.map((d) => {
            const match = processResults?.filter((pr) => pr.id === d.id);

            return (
                <div key={d.id}>
                    <div className="flex flex-wrap -mx-2">
                        <div className="w-full sm:w-1/4 px-2">
                        {d.id}
                        </div>
                        <div className="w-full sm:w-1/4 px-2">
                        {d.lat}
                        </div>
                        <div className="w-full sm:w-1/4 px-2">
                        {d.lng}
                        </div>
                        <div className="w-full sm:w-1/4 px-2">
                        </div>
                    </div>
                    <div className="flex flex-wrap">
                        {match ? (
                        match.map((m) => (
                            <div key={m.id} className="w-full p-2">
                            {m.wiki_url}
                            </div>
                        ))
                        ) : d.status != 'no-matches' ? (
                        <button value={d.id} onClick={handleClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Run-It
                        </button>
                        ) : 'Done'}
                    </div>
                </div>
            );
            })}
    {/*data?.map((d) => {
        const match = processResults?.filter((pr) => pr.id === d.id);
        return (
          <tr key={d.id}>
            <div>
              {d.id}
              {d.lat}
              {d.lng}
              {d.status}
            </div>
            <div>
              {match ? (
                match.map((m) => (
                  <div key={m.id}>{`${m.wiki_url} ${m.generatedTitle ?? ''}`}</div>
                ))
              ) : (
                <button value={d.id} onClick={handleClick}>
                  Run-It
                </button>
              )}
            </div>
          </div>
        );
      })*/}</div> : <div>no data</div>)
}


export default InitSeedLatLng