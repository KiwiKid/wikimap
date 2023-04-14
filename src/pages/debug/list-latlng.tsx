import { type NextPage } from "next";
import { useRouter } from "next/router";
import NavBar from "~/components/NavBar";
import { api } from "~/utils/api";

const ListLatLng:NextPage = () => {

    // Get the query parameter from the URL
    const router = useRouter();
    console.log(router.query)
    const { page, length } = router.query;

    const pageNum = parseInt(typeof page == 'string' ? page : '0')
    const lengthNum = parseInt(typeof length == 'string' ? length :'50')


    // Run a batch of seeds
    const { isFetched, data, isError, error } = api.latLng.getAll.useQuery({ page:pageNum, length: lengthNum })
    

    const mutation = api.latLng.process.useMutation();

    const onProcess = (event:React.MouseEvent<HTMLButtonElement>) => {
        const value = (event.currentTarget as HTMLButtonElement).value;
        mutation.mutate({ id: value})
    }

    if(!isFetched){
        return <div>loading..</div>
    }

    if(isError){
        return <div>{error.message} {JSON.stringify(error)}</div>
    }
    
    return <div>
        <NavBar/>
        <div>{page} ({length})</div>
        {data?.map((d) => 
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
                        {d.status}
                        </div>
                        <div className="w-full sm:w-1/4 px-2">
                            <button onClick={onProcess} value={d.id}>Get Places</button>
                        </div>
                    </div>
                   {/* <div className="flex flex-wrap">
                        {match ? (
                        match.map((m) => (
                            <div key={m.id} className="w-full p-2">
                            {`${m.wiki_url} ${m.generatedTitle ?? ''}`}
                            </div>
                        ))
                        ) : d.status != 'no-matches' ? (
                        <button value={d.id} onClick={handleClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Run-It
                        </button>
                        ) : 'Done'}
                        </div>*/}
                </div>
            )}
    </div>
}


export default ListLatLng