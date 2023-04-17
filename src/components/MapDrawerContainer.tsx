import { type RouterOutputs } from '~/utils/api';
import MapDrawer from '../pages/MapDrawer';
import { PlaceResult } from './DebugMarkers';


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