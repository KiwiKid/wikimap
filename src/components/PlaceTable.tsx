import React from "react";
import { PlaceResult } from "./PlaceMarker";

interface Props {
  placeResults:PlaceResult[]
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-row justify-between items-center py-2">
    <div className="text-gray-600">{label}:</div>
    <div className="text-gray-900">{value}</div>
  </div>
);

const PlaceTable = ({ placeResults }: Props) => {

  return (
    <div className="flex flex-col gap-4 whitespace-break-spaces">
      {placeResults.map(({ place, placeTypes }) => (
        <div key={place.id} className="bg-gray-100 p-4 rounded-md">
          <Row label="Wiki URL" value={place.wiki_url} />
          <Row label="Latitude" value={place.lat.toString()} />
          <Row label="Longitude" value={place.lng.toString()} />
          <Row label="Status" value={status} />
          <Row label="Wiki Id" value={place.wiki_id} />
          <Row label="Main Image Url" value={place.main_image_url} />
          




          <div className="bg-gray-100 p-4 rounded-md">
            <h2 className="text-xl font-bold mb-4">Place Types</h2>
            {placeTypes.map(({ title, content }, index) => (
              <div key={index}>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p>{content}</p>
              </div>
            ))}
          </div>
          <div className="bg-gray-100 p-4 rounded-md">
            <h2 className="text-xl font-bold mb-4">Summary</h2>
            <p>{place.summary}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-md">
            <h2 className="text-xl font-bold mb-4">Info</h2>
            <p>{JSON.stringify(place.info, undefined, 4)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlaceTable;