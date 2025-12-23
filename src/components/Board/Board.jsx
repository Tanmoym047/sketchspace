import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Excalidraw } from '@excalidraw/excalidraw';
import Swal from 'sweetalert2'; // Import SweetAlert2
import "@excalidraw/excalidraw/index.css";

const Board = () => {
    const { roomId } = useParams();
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);
    const [initialData, setInitialData] = useState(null);
    const [boardName, setBoardName] = useState("Untitled Board");

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

    const handleSave = (elements = null, showUI = false) => {
        const currentElements = elements || excalidrawAPI?.getSceneElements();
        const dataToSave = {
            name: boardName,
            elements: currentElements || [],
            lastModified: Date.now()
        };
        localStorage.setItem(`sketchspace_data_${roomId}`, JSON.stringify(dataToSave));

        // Show SweetAlert only when manually clicked
        if (showUI) {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });

            Toast.fire({
                icon: 'success',
                title: 'Progress Saved!'
            });
        }
    };

    return (
        <div className="flex flex-col h-screen bg-base-200 overflow-hidden">
            <header className="navbar bg-base-100 shadow-sm z-10 px-4">
                <div className="flex-1 gap-2">
                    <input 
                        type="text" 
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        onBlur={() => handleSave(null, false)} // Auto-save on blur (silent)
                        className="input input-ghost input-sm text-xl font-bold text-primary focus:bg-base-200 w-full max-w-xs"
                    />
                </div>
                
                <div className="flex-none gap-2">
                    {/* Manual Save Button calls handleSave with showUI = true */}
                    <button className="btn btn-sm btn-primary px-6" onClick={() => handleSave(null, true)}>
                        Save
                    </button>
                </div>
            </header>

            <main className="flex-grow relative">
                <Excalidraw
                    excalidrawAPI={(api) => setExcalidrawAPI(api)}
                    initialData={initialData}
                    onChange={(elements) => {
                        if (elements.length > 0) handleSave(elements, false); // Silent auto-save
                    }}
                />
            </main>
        </div>
    );
};

export default Board;