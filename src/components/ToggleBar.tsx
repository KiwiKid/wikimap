import { useState } from "react";
import { PageMode } from "~/pages";
import locIconFile from 'src/styles/book-closed.png'
import openBookIconFile from 'src/styles/book-open.png'
import openBookRedIconFile from 'src/styles/book-open-red.png'

import Image from "next/image";

interface ToggleProps {
    pageMode:PageMode
    onToggle:() => void
    renderedPlaceLength:number
}

export default function ToggleBar({pageMode, onToggle, renderedPlaceLength}:ToggleProps) {
    const isToggled = () => pageMode === 'newLocationSearch'
    return (
        <div style={{zIndex: 99999}} className="fixed top-0 right-0 overflow-hidden h-8 bg-white">
            <div className="flex">
                <label htmlFor="pageMode" className="inline-flex float-right relative mr-5 cursor-pointer">
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
                        
                        className="w-11 h-6 bg-gray-200 rounded-full peer  peer-focus:ring-green-300  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"
                    ></div>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                         <div>{isToggled() ? `[FIND 🔵]` :`[MOVE ☝️]`}</div>
                    </span>
                </label>


                {renderedPlaceLength == 0 && isToggled() ? <div>{`Click the map to place 🔵 and find new stories`}</div> : null}
                {renderedPlaceLength == 0 && !isToggled() ? <div>{`<=========== Turn on FIND and click the map find new stories here`}</div> : null}
                {renderedPlaceLength > 0 && <div className="items-end">
                        <div>
                        [<Image className="inline-block" src={locIconFile.src} alt="new place" width={20} height={10}/> unexplored]
                        &nbsp;&nbsp;&nbsp;&nbsp;[<Image className="inline-block" src={openBookIconFile.src} alt="new place" width={20} height={10}/> existing]
                        &nbsp;&nbsp;&nbsp;&nbsp;[<Image className="inline-block" src={openBookRedIconFile.src} alt="new place" width={20} height={10}/> your finds]
                        </div>
                    </div>}
                {/*
                <span className="flex-right">
                    <Image className="inline-block" src={locIconFile.src} alt="new place" width={20} height={10}/>
                    <Image className="inline-block" src={locIconFile.src} alt="new place" width={20} height={10}/>
                    </span>*/}
            </div>
            
        </div>
    );
}