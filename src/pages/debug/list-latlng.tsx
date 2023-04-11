import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
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
    
    if(!isFetched){
        return <div>loading..</div>
    }

    if(isError){
        return <div>{error.message} {JSON.stringify(error)}</div>
    }
    
    return <div>
        <div>{page} ({length})</div>
        {data?.map((d) => <div key={d.id}>{d.id}{d.lat}{d.lng}{d.status}</div>)}
    </div>
}


export default ListLatLng