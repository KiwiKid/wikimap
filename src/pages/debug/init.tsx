import { type NextPage } from "next"
import { useState } from "react";
import { RouterOutputs, api } from "~/utils/api";

export const RADIUS = 1000;
export function getPointsSquare(p1?: [number, number], p2?: [number, number], sideLength?: number): [number, number][] {
    if(!p1 || p1.length != 2){
        p1 = [-34.389994, 166.388708]
    }
    if(!p2 || p2.length != 2){
        p2 = [-46.628059, 179.925272]
    }

    if(!sideLength || sideLength == 0){
        sideLength = RADIUS
    }
    // Calculate latitude and longitude step sizes
    const [lat1, lng1] = p1;
    const [lat2, lng2] = p2;
    const latStep = (lat2 - lat1) / (sideLength / 2);
    const lngStep = (lng2 - lng1) / (sideLength / 2);
    
    // Generate list of points
    const points: [number, number][] = [];
    for (let i = 0; i < sideLength / 2; i++) {
        for (let j = 0; j < sideLength / 2; j++) {
            const lat = lat1 + i * latStep;
            const lng = lng1 + j * lngStep;
            points.push([lat, lng]);
        }
    }
    
    return points;
}


const InitSeedLatLng:NextPage = () => {

    // Get the query parameter from the URL
    /*const { lat, lng } = router.query;

    if(!lat || typeof lng !== 'string'){
        return <div>a query param id is required</div>
    }*/
    const toCreate = getPointsSquare();

    const { refetch, isFetched, data, isError, error } = api.latLng.initSeedLatLng.useQuery(undefined, {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        enabled: false
    })

    const [initResult, setInitResult] = useState<RouterOutputs["latLng"]["initSeedLatLng"]>()
    const handleClick = () => {
        console.log('handleClick')
        void (async () => {
            console.log('handleClick:refetch')
            const { data, isError, error} = await refetch();
            if(!isError && typeof data != 'undefined'){
                console.log('handleClick:refetch:setInitResult(')
                setInitResult(data)
            }else{
                console.error('Failed to init', {error})
            }
            
        })();
    }

    return <div>
        <button className="btn btn-blue" onClick={handleClick}>Save in db</button>
        <div>{JSON.stringify(initResult, undefined, 4)}</div>
        <div>{isError ? JSON.stringify(error, undefined, 4) : null}</div>
        <div>{isFetched ? JSON.stringify(data, undefined, 4) : null}</div>
        <div>{JSON.stringify(toCreate, undefined,4)}</div>
    </div>
}

export default InitSeedLatLng