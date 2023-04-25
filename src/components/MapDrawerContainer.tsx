import { type RouterOutputs } from '~/utils/api';
import MapDrawer from '../pages/MapDrawer';
import { type Place } from "@prisma/client";
import { type PublicPlaceType } from './PlaceMarker'
import PlaceTable from './PlaceTable';
export interface PlaceResult {
  place: Place, 
  placeTypes: PublicPlaceType[]
}
interface MapDrawerContainerProps {
  children:React.ReactElement
  renderedPlaces:PlaceResult[]
}

const MapDrawerContainer = ({children, renderedPlaces}:MapDrawerContainerProps) => {
  return (<MapDrawer header={<>{renderedPlaces.length}</>}>
    {children} 
        <PlaceTable placeResults={renderedPlaces}/>
          
        </MapDrawer>
    )

}

export default MapDrawerContainer