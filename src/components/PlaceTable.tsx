import React from "react";
import { PlaceResult } from "./PlaceMarker";
import PlaceRow from "./PlaceRow";

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
      {placeResults.map((placeResult) => <PlaceRow key={`${placeResult.place.id}_${placeResult.placeTypes.length}`} placeResult={placeResult}/>)}
    </div>
  );
};

export default PlaceTable;