import { LatLngToProcess } from "@prisma/client";
import { type NextPage } from "next"
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NavBar from "~/components/NavBar";
import { type RouterOutputs, api } from "~/utils/api";
export const defaultTopLeft:[number,number] = [-34.389994, 166.388708]
export const defaultBottomRight:[number,number] = [-34.389994, 166.388708]

export const RADIUS = 1000;
export function getPointsSquare(page?:number, length?:number, p1?: [number, number], p2?: [number, number], sideLength?: number): [number, number][] {
    if(!p1 || p1.length != 2){
        p1 = [-34.389994, 166.388708]
    }
    if(!p2 || p2.length != 2){
        p2 = [-46.628059, 179.925272]
    }

    if(typeof page != 'number'){
        page = 0;
    }

    if(typeof length != 'number'){
        length = 100;
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
    
    return points.slice(page * length, (page+1)*length );
}


const InitLatLng:NextPage = () => {

    // Get the query parameter from the URL
    const router = useRouter();
    console.log(router.query)
    const { page, length, p1x, p1y, p2x, p2y} = router.query;
    const [initResult, setInitResult] = useState<LatLngToProcess[]|null>(null)

    const pageNum = parseInt(typeof page == 'string' ? page : '0')
    const lengthNum = parseInt(typeof length == 'string' ? length :'50')

    const p1xNum = typeof p1x == 'string' ? parseInt(p1x) : defaultTopLeft[0]
    const p1yNum = typeof p1y == 'string' ? parseInt(p1y) : defaultTopLeft[1]
    const p2xNum = typeof p2x == 'string' ? parseInt(p2x) : defaultBottomRight[0]
    const p2yNum = typeof p2y == 'string' ? parseInt(p2y) : defaultTopLeft[1]

    let lookupSquare:[[number,number], [number,number]] = [defaultTopLeft, defaultBottomRight]
    if(p1xNum && p1yNum && p2xNum && p2yNum){
        lookupSquare = [[p1xNum, p1yNum], [p2xNum, p2xNum]]
    }

    const [points, setPoints] = useState(getPointsSquare(pageNum, lengthNum, lookupSquare[0], lookupSquare[0]))

    console.log({pageNum, lengthNum})
    useEffect(() => {
        setPoints(getPointsSquare(pageNum, lengthNum))
    }, [pageNum, lengthNum])

    // Run a batch of seeds
    const { refetch  } = api.latLng.initSeedLatLng.useQuery({ page: pageNum, length: lengthNum}, {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        enabled: false
    })

    // const existing = api.latLng.getAll({ page: page, length: length})


    const handleClick = () => {
        void (async () => {
            console.log('handleClick:refetch')
            const { data, isError, error} = await refetch();
            if(!isError && typeof data != 'undefined' && !!data){
                console.log('handleClick:refetch:setInitResult(')
                setInitResult(data)
            }else{
                console.error('Failed to init', {error})
            }
        })();
    }



    return <div>
       <NavBar/>
        {pageNum >= 0 && <Link href={`/debug/init-latlng?page=${pageNum-1}&length=${lengthNum}`}>
            ««« Previous
        </Link>}
        <button className="btn btn-blue" onClick={(evt) => handleClick()}>Save in db</button>
        <Link href={`/debug/init-latlng?page=${pageNum+1}&length=${lengthNum}`}>
            Next »»»
        </Link>
        <table>
        <thead>
            <tr>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Status</th>
            </tr>
        </thead>
        <tbody>
            
            {points.map((item, index) => {
                const matches = initResult?.filter((r) => r.lat == item[0] && r.lng == item[1])
            

                if(!matches || matches.length != 1){
                    return (<tr key={index}>
                            <td>{item[0]}</td>
                            <td>{item[1]}</td>
                            <td >pending {matches?.length}</td>
                    </tr>)
                }

                const match = matches[0]

                return (<tr key={index}>
                <td>{item[0]}</td>
                <td>{item[1]}</td>
                {match && <td>{`${match.id} ${match.status}`}</td>}
                </tr>)
            })}
        </tbody>
        </table>
    </div>
}

export default InitLatLng