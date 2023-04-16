import { type RouterOutputs } from '~/utils/api';
import MapDrawer from '../pages/MapDrawer';


interface MapDrawerContainerProps {
  children:React.ReactElement
}

const MapDrawerContainer = ({children}:MapDrawerContainerProps) => {
  return (<MapDrawer>
          {children}
        </MapDrawer>
    )

}

export default MapDrawerContainer