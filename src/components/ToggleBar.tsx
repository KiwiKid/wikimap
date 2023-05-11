import { useState } from "react";
import { PageMode } from "~/pages";
import locIconFile from 'src/styles/book-closed.png'
import openBookIconFile from 'src/styles/book-open.png'
import openBookRedIconFile from 'src/styles/book-open-red.png'
import loadingSpinner from 'src/styles/loading_icon.gif'
import greenTick from 'src/styles/green-tick.png'

import Image from "next/image";

interface ToggleProps {
    pageMode:PageMode
    onToggle:() => void
    renderedPlaceLength:number
    isAnyLoading:string
}

export default function ToggleBar({pageMode, onToggle, renderedPlaceLength, isAnyLoading}:ToggleProps) {
    const isToggled = () => pageMode === 'newLocationSearch'

    return (
        <div style={{zIndex: 99999}} className="fixed top-0 right-0 overflow-hidden h-8 bg-white">
            <div className="flex">
        
                {isAnyLoading !== null && <label htmlFor="pageMode" className="inline-flex float-right md:mr-5 md:ml-2 relative cursor-pointer">
                    <input
                        id="pageMode"
                        type="checkbox"
                        className="sr-only peer"
                        checked={isToggled()}
                        readOnly
                        onClick={() => onToggle()}
                    />
                    <div
                        id="toggle-mode"
                        
                        className="w-11 h-6 md:mr-2 bg-gray-200 rounded-full peer  peer-focus:ring-green-300  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"
                    ></div>
                    <span className="ml--10 pl-4 sm:pl-0 text-xs sm:text-base whitespace-nowrap font-medium text-gray-900">
                         <div>{isToggled() ? `[FIND 🔵]` :`[MOVE 🤚]`}</div>
                    </span>
                </label>}



                {isAnyLoading !== null && renderedPlaceLength == 0 && isToggled() ? <div>{`Click the map to place 🔵 and find new stories`}</div> : null}
                {isAnyLoading !== null && renderedPlaceLength == 0 && !isToggled() ? <div>{`<=========== Turn on FIND and click the map find new stories here`}</div> : null}
                {isAnyLoading !== null && renderedPlaceLength > 0 && <div className="items-end text-xs sm:text-base whitespace-nowrap flex-shrink">
                        <div>
                        [<Image className="inline-block" src={locIconFile.src} alt="new place" width={20} height={10}/> unimagined]
                        &nbsp;&nbsp;&nbsp;&nbsp;[<Image className="inline-block" src={openBookIconFile.src} alt="new place" width={20} height={10}/> existing]
                        &nbsp;&nbsp;&nbsp;&nbsp;[<Image className="inline-block" src={openBookRedIconFile.src} alt="new place" width={20} height={10}/> your finds]

                        </div>

                    </div>}
                    <div>{isAnyLoading == null || isAnyLoading.length > 0 ?
                        <Image style={{marginTop: '-30px'}} width={120} height={50} src={loadingSpinner.src} alt="loading"/>
                         : <div style={{width: '120px'}}></div>
                        }</div>
                {/*
                <span className="flex-right">
                    <Image className="inline-block" src={locIconFile.src} alt="new place" width={20} height={10}/>
                    <Image className="inline-block" src={locIconFile.src} alt="new place" width={20} height={10}/>
                    </span>*/}
            </div>
            
        </div>
    );
}