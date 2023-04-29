import { api, type RouterOutputs } from '~/utils/api';
import MapDrawer from '../pages/MapDrawer';
import { type Place } from "@prisma/client";
import { type PublicPlaceType } from './PlaceMarker'
import PlaceTable from './PlaceTable';
import DeleteButton from './DeleteButton';
export interface PlaceResult {
  place: Place, 
  placeTypes: PublicPlaceType[]
}
interface MapDrawerContainerProps {
  renderedPlaces:Place[]
}

const MapDrawerContainer = ({renderedPlaces}:MapDrawerContainerProps) => {

  return (<MapDrawer header={<>{renderedPlaces.length}</>}>
        <PlaceTable places={renderedPlaces || []}/>
         <DeleteButton/>
        </MapDrawer>
    )

}

export default MapDrawerContainer