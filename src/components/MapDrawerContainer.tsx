import { type RouterOutputs } from '~/utils/api';
import MapDrawer from '../pages/MapDrawer';
import { type Place } from "@prisma/client";
import { type PublicPlaceType } from './PlaceMarker'
export interface PlaceResult {
  place: Place, 
  placeTypes: PublicPlaceType[]
}
interface MapDrawerContainerProps {
  children:React.ReactElement
  visiblePlaces:PlaceResult[]
}

const MapDrawerContainer = ({children, visiblePlaces}:MapDrawerContainerProps) => {
  return (<MapDrawer header={<>{visiblePlaces.length}</>}>
        {visiblePlaces?.length > 0 ? JSON.stringify(visiblePlaces) : null}
          {children}
        </MapDrawer>
    )

}

export default MapDrawerContainer