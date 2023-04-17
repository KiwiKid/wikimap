import { ReactNode, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
import useWindowSize from "~/utils/useWindowSize";

const CLOSED_DRAW_POS = -60;

interface MapDrawerProps extends React.PropsWithChildren {
  header: ReactNode
}

const MapDrawer = ({children, header}:MapDrawerProps) => {
   const [isOpen, setIsOpen] = useState(false);
   const PX_FROM_BOTTOM = -50

   const [lastDrawPositionY, setLastDrawPositionY] = useState(PX_FROM_BOTTOM)

   const [topDrawPosition, setTopDrawPosition] = useState(null);
   const [drawPositionY, setDrawPositionY] = useState(CLOSED_DRAW_POS);
   const [width, windowHeight] = useWindowSize();

   const openDrawPosition = -(windowHeight || 800)*0.79

   const handleClickEnd = (e:DraggableEvent, d:DraggableData) => {
    e.stopPropagation();

    // Click (or nearly a click)
    if(lastDrawPositionY < d.y+10 && lastDrawPositionY > d.y-10){
      if(-drawPositionY < (windowHeight || 800)*0.4){
        setDrawPositionY(openDrawPosition);
      }else{
        setDrawPositionY(PX_FROM_BOTTOM);
      }
      return;
    }

    const probablyMobile = screen.width <= 480;
    // Drag 
    if(probablyMobile){
      if(lastDrawPositionY > d.y){
        setDrawPositionY(openDrawPosition);
      }else if(lastDrawPositionY < d.y){
        setDrawPositionY(PX_FROM_BOTTOM);
      }
    }else{
      setDrawPositionY(d.y);
    }
  }



      
    return (<Draggable
      handle=".handle"
      bounds={{top: openDrawPosition, bottom: PX_FROM_BOTTOM}} 
      axis="y"
   //   nodeRef={drawerRef}
      position={{x: 0, y: drawPositionY}}
      onStart={(e:DraggableEvent,d:DraggableData) => { e.stopPropagation(); setLastDrawPositionY(d.y); } }
      onStop={handleClickEnd}
      >
        <div style={{ zIndex: 999999}} className={`absolute top-full left-0 w-full h-80vh transition-transform transform ${isOpen ? 'translate-y-0' : 'translate-y-84'}`}>
          <div className="handle w-full h-12 bg-gray-300 cursor-pointer" >
            {header}
          </div>
          <div className="px-4 py-2 bg-gray-200 h-84">
            {children}
          </div>
        </div>
      </Draggable>
    )
  }
  
  export default MapDrawer