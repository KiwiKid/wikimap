import { useState } from "react";
import { PageMode } from "~/pages";

interface ToggleProps {
    pageMode:PageMode
    onToggle:() => void
}

export default function ToggleBar({pageMode, onToggle}:ToggleProps) {
    const isToggled = () => pageMode === 'newLocationSearch'
    return (
        <div className="relative flex flex-col overflow-hidden">
            <div className="flex">
                <div className="max-h-6"></div>
                <label htmlFor="pageMode" className="inline-flex relative mr-5 cursor-pointer">
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
                        {`${isToggled() ? `mode:[SEARCH] Click the map to find new books` : 'mode:[EXPLORE] Just move around the map'}`}
                    </span>
                </label>
            </div>
        </div>
    );
}