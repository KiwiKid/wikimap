import { type RouterOutputs } from '~/utils/api';
import MapDrawer from './MapDrawer';

interface MapContainerProps{
  places:RouterOutputs['place']['getAll'] | null
}

const MapDrawerContainer = ({places}:MapContainerProps) => {
  return (<MapDrawer>
          <div>
            This is the map drawer
            {!!places ? places?.map((p) => <div key={p.id}>{JSON.stringify(p)}</div>) : 'no places'}
          </div>
        </MapDrawer>
    )

}

export default MapDrawerContainer