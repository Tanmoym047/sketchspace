import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Excalidraw } from '@excalidraw/excalidraw';
import Swal from 'sweetalert2';
import "@excalidraw/excalidraw/index.css";

const Board = () => {
    const { roomId } = useParams();
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);
    const [initialData, setInitialData] = useState(null);
    const [boardName, setBoardName] = useState("Untitled Board");
    const [isLoading, setIsLoading] = useState(true);
    
    // Ref to store the auto-save timer
    const saveTimerRef = useRef(null);

    // Fetch Board from MongoDB on mount
    useEffect(() => {
        const fetchBoard = async () => {
            try {
                const response = await fetch(`http://localhost:5000/board/${roomId}`);
                const data = await response.json();
                if (data) {
                    setBoardName(data.name || "Untitled Board");
                    setInitialData({
                        elements: data.elements,
                        appState: { theme: 'light' },
                    });
                }
            } catch (error) {
                console.error("Load error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBoard();

        // Cleanup timer when user leaves the board
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, [roomId]);

    // The core Save function
    const handleSave = async (elements = null, isManual = false) => {
        const currentElements = elements || excalidrawAPI?.getSceneElements();
        if (!currentElements) return;

        const boardData = {
            roomId,
            name: boardName,
            elements: currentElements,
            lastModified: new Date()
        };

        try {
            await fetch(`http://localhost:5000/board/save/${roomId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(boardData)
            });

            if (isManual) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Cloud sync complete',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            console.log("Auto-saved to MongoDB at", new Date().toLocaleTimeString());
        } catch (error) {
            console.error("Save failed:", error);
        }
    };

    // Triggered on every drawing change
    const handleChange = (elements) => {
        if (elements.length === 0) return;

        // Clear existing timer if user is still drawing
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

        // Set a new timer for 5 minutes (300,000 milliseconds)
        saveTimerRef.current = setTimeout(() => {
            handleSave(elements, false);
        }, 5 * 60 * 1000); 
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center"><span className="loading loading-spinner text-primary"></span></div>;

    return (
        <div className="flex flex-col h-screen bg-base-200 overflow-hidden">
            <header className="navbar bg-base-100 shadow-sm z-10 px-4">
                <div className="flex-1">
                    <input 
                        type="text" 
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        onBlur={() => handleSave(null, false)}
                        className="input input-ghost input-sm text-xl font-bold text-primary w-full max-w-xs"
                    />
                </div>
                <div className="flex-none">
                    <button className="btn btn-sm btn-primary" onClick={() => handleSave(null, true)}>
                        Save Now
                    </button>
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