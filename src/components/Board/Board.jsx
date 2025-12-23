import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Excalidraw } from '@excalidraw/excalidraw';
import "@excalidraw/excalidraw/index.css";

const Board = () => {
    const { boardId } = useParams();
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);
    const [initialData, setInitialData] = useState(null);

    // 1. Load data from LocalStorage on component mount
    useEffect(() => {
        const savedData = localStorage.getItem(`sketchspace_${boardId}`);
        if (savedData) {
            setInitialData({
                elements: JSON.parse(savedData),
                appState: { theme: 'light' },
            });
        }
    }, [boardId]);

    // 2. Auto-save to LocalStorage on every change
    const handleChange = (elements) => {
        if (elements.length > 0) {
            localStorage.setItem(`sketchspace_${boardId}`, JSON.stringify(elements));
        }
    };

    // --- Toolbar Actions ---

    const handleUndo = () => {
        excalidrawAPI?.history.undo();
    };

    const handleRedo = () => {
        excalidrawAPI?.history.redo();
    };

    const handleClear = () => {
        if (window.confirm("Are you sure you want to clear the entire board?")) {
            excalidrawAPI?.updateScene({ elements: [] });
            localStorage.removeItem(`sketchspace_${boardId}`);
        }
    };

    const handleSave = () => {
        // This manually triggers a save to LocalStorage (though auto-save is already running)
        const elements = excalidrawAPI.getSceneElements();
        localStorage.setItem(`sketchspace_${boardId}`, JSON.stringify(elements));
        alert("Board saved locally!");
    };

    return (
        <div className="flex flex-col h-screen bg-base-200 overflow-hidden">
            {/* Custom DaisyUI Navbar with Control Buttons */}
            <header className="navbar bg-base-100 shadow-md z-10 px-4 gap-2">
                <div className="flex-1">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-primary">SketchSpace</h2>
                        <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">{boardId}</span>
                    </div>
                </div>

                <div className="flex-none gap-2">
                    {/* History Controls */}
                    <div className="join bg-base-200 p-1 rounded-lg mr-4 gap-2">
                        <button onClick={handleUndo} className="btn btn-sm btn-ghost join-item tooltip tooltip-bottom" data-tip="Undo">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
                        </button>
                        <button onClick={handleRedo} className="btn btn-sm btn-ghost join-item tooltip tooltip-bottom" data-tip="Redo">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" /></svg>
                        </button>
                        <button onClick={handleClear} className="btn btn-sm btn-error btn-outline">
                            Clear
                        </button>

                        <button onClick={handleSave} className="btn btn-sm btn-primary">
                            Save
                        </button>
                    </div>

                </div>
            </header>

            {/* Excalidraw Canvas Area */}
            <main className="flex-grow relative">
                <Excalidraw
                    excalidrawAPI={(api) => setExcalidrawAPI(api)}
                    initialData={initialData}
                    onChange={handleChange}
                    UIOptions={{
                        canvasActions: {
                            loadScene: false,
                            saveToActiveFile: false,
                            themeSelection: true,
                            export: { saveFileToDisk: true }
                        },
                    }}
                />
            </main>
        </div>
    );
};

export default Board;