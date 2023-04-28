import { Place, Prisma } from "@prisma/client"
import { PlaceResult } from "./PlaceMarker"
import { useState } from "react";

interface PlaceRowProps {
    place:Place
}

const PlaceRow = (props: PlaceRowProps) => {
    const { place } = props;

    const [expanded, setExpanded] = useState(false)

    return (
        <div>
            <div onClick={() => setExpanded(!expanded)}>
                <div>{place.wiki_url}</div>
                <div>{place.id}</div>
                <div>{place.main_image_url}</div>
                <div>{place.status}</div>
                <div>{place.wiki_id}</div>
            </div>
            {expanded && <div>
                    <div key={place.id} className="flex flex-row justify-between items-center py-2">
                    <h2 className="text-xl font-bold mb-4">Place Types</h2>
                    {/*placeTypes.map(({ title, content }, index) => (
                        <div key={index}>
                            <h3 className="text-lg font-bold mb-2">{title}</h3>
                            <p>{content}</p>
                        </div>
                    ))*/}
                </div>
                <div className="bg-gray-100 p-4 rounded-md">
                        <h2 className="text-xl font-bold mb-4">Summary</h2>
                        <p>{place.summary}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-md">
                    <h2 className="text-xl font-bold mb-4">Info</h2>
                    <pre>{place.info ? JSON.stringify(place.info, undefined, 4) : null}</pre>
                </div>
            </div>}
        </div>
    )
}
export default PlaceRow;