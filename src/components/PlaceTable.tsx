import React from "react";
import { PlaceResult } from "./PlaceMarker";
import PlaceRow from "./PlaceRow";
import { Place } from "@prisma/client";

interface Props {
  places:Place[]
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-row justify-between items-center py-2">
    <div className="text-gray-600">{label}:</div>
    <div className="text-gray-900">{value}</div>
  </div>
);

const PlaceTable = ({ places }: Props) => {

  return (
    <div className="flex flex-col gap-4 whitespace-break-spaces">
      {places.map((place) => <PlaceRow key={`${place.id}`} place={place} />)}
    </div>
  );
};

export default PlaceTable;