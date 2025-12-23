import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Excalidraw } from '@excalidraw/excalidraw';
import "@excalidraw/excalidraw/index.css";

const Board = () => {
    const { roomId } = useParams();
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);
    const [initialData, setInitialData] = useState(null);
    const [boardName, setBoardName] = useState("Untitled Board");

    // Load Board Data
    useEffect(() => {
        const rawData = localStorage.getItem(`sketchspace_data_${roomId}`);
        if (rawData) {
            const parsed = JSON.parse(rawData);
            setBoardName(parsed.name || "Untitled Board");
            setInitialData({
                elements: parsed.elements,
                appState: { theme: 'light' },
            });
        }
    }, [roomId]);

    // Save Data (Metadata + Elements)
    const handleSave = (elements = null) => {
        const currentElements = elements || excalidrawAPI?.getSceneElements();
        const dataToSave = {
            name: boardName,
            elements: currentElements || [],
            lastModified: Date.now()
        };
        localStorage.setItem(`sketchspace_data_${roomId}`, JSON.stringify(dataToSave));
    };

    const handleChange = (elements) => {
        if (elements.length > 0) handleSave(elements);
    };

    return (
        <div className="flex flex-col h-screen bg-base-200 overflow-hidden">
            <header className="navbar bg-base-100 shadow-sm z-10 px-4 gap-4">
                <div className="flex-1 gap-2">
                    {/* Editable Board Name */}
                    <input 
                        type="text" 
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        onBlur={() => handleSave()} // Save when user clicks away
                        className="input input-ghost input-sm text-xl font-bold text-primary focus:bg-base-200"
                        placeholder="Untitled Board"
                    />
                    <span className="text-[10px] font-mono opacity-30 mt-1 hidden md:block">ID: {roomId}</span>
                </div>
                
                <div className="flex-none gap-2">
                    <button className="btn btn-sm btn-primary px-6" onClick={() => handleSave()}>Save Now</button>
                </div>
            </header>

            <main className="flex-grow relative">
                <Excalidraw
                    excalidrawAPI={(api) => setExcalidrawAPI(api)}
                    initialData={initialData}
                    onChange={handleChange}
                />
            </main>
        </div>
    );
};

export default Board;