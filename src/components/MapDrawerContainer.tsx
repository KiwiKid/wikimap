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
  children:React.ReactElement
  renderedPlaces:Place[]
}

const MapDrawerContainer = ({children, renderedPlaces}:MapDrawerContainerProps) => {

  return (<MapDrawer header={<>{renderedPlaces.length}</>}>
    {children} 
        <PlaceTable places={renderedPlaces || []}/>
         <DeleteButton/>
        </MapDrawer>
    )

}

export default MapDrawerContainer