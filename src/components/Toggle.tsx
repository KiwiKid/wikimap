import { useState } from "react";

interface ToggleProps {
    isToggled:boolean
    onToggle:() => void
}

export default function Toggle({isToggled, onToggle}:ToggleProps) {
    return (
        <div className="relative flex flex-col min-h-screen overflow-hidden">
            <div className="flex">
                <label 
                
                        className="inline-flex relative mr-5 cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isToggled}
                        readOnly
                        onClick={() => onToggle()}
                    />
                    <div
                        id="toggle-mode"
                        
                        className="w-11 h-6 bg-gray-200 rounded-full peer  peer-focus:ring-green-300  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"
                    ></div>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                        {isToggled ? '[Find New Books ON 🔍] - Click the map to search and find new places' :'[Find new Books OFF]'}
                    </span>
                </label>
            </div>
        </div>
    );
}