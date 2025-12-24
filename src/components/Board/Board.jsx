import React, { useState, useEffect, useRef, useContext } from 'react'; // Added useContext
import { useParams } from 'react-router-dom';
import { Excalidraw } from '@excalidraw/excalidraw';
import Swal from 'sweetalert2';
import io from 'socket.io-client';
import { AuthContext } from '../../AuthProvider/AuthProvider'; // 1. Adjust path to your AuthProvider
import "@excalidraw/excalidraw/index.css";

const socket = io('http://localhost:5000');

const Board = () => {
    const { roomId } = useParams();
    const { user } = useContext(AuthContext); // 2. Get current logged-in user
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);
    const [initialData, setInitialData] = useState(null);
    const [boardName, setBoardName] = useState("Untitled Board");
    const [isLoading, setIsLoading] = useState(true);
    
    const [collaborators, setCollaborators] = useState(new Map());
    const saveTimerRef = useRef(null);
    const isImportingRef = useRef(false);

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

        socket.emit('join-room', roomId);

        socket.on('receive-drawing', (elements) => {
            if (excalidrawAPI) {
                isImportingRef.current = true;
                excalidrawAPI.updateScene({ elements });
                setTimeout(() => { isImportingRef.current = false; }, 100);
            }
        });

        // 3. Listen for mouse + user info (including photo)
        socket.on('receive-mouse', (data) => {
            setCollaborators((prev) => {
                const newMap = new Map(prev);
                newMap.set(data.socketId, {
                    pointer: data.pointer,
                    button: data.button,
                    photoURL: data.user?.photoURL, // Get their Google image
                });
                return newMap;
            });
        });

        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            socket.off('receive-drawing');
            socket.off('receive-mouse');
        };
    }, [roomId, excalidrawAPI]);

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
                    toast: true, position: 'top-end', icon: 'success',
                    title: 'Cloud sync complete', showConfirmButton: false, timer: 1500
                });
            }
        } catch (error) { console.error("Save failed:", error); }
    };

    const handleChange = (elements) => {
        if (elements.length === 0) return;
        if (!isImportingRef.current) {
            socket.emit('drawing-update', { roomId, elements });
        }
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => { handleSave(elements, false); }, 5 * 60 * 1000); 
    };

    // 4. Broadcast your mouse + Google photo
    const handlePointerUpdate = (payload) => {
        if (payload.pointer) {
            socket.emit('mouse-move', {
                roomId,
                pointer: payload.pointer,
                button: payload.button,
                user: {
                    photoURL: user?.photoURL // Send your photo to others
                }
            });
        }
    };

    if (isLoading) return (
        <div className="h-screen flex items-center justify-center bg-base-100">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-base-200 overflow-hidden text-base-content">
            <header className="navbar bg-base-100 shadow-sm z-10 px-4">
                <div className="flex-1">
                    <input 
                        type="text" 
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        onBlur={() => handleSave(null, false)}
                        className="input input-ghost input-sm text-xl font-bold text-primary w-full max-w-xs focus:bg-transparent"
                    />
                </div>
                <div className="flex-none flex items-center gap-2">
                    {/* 5. Show your own profile picture in the header */}
                    {user?.photoURL && (
                        <div className="avatar">
                            <div className="w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 mr-2">
                                <img src={user.photoURL} alt="Your profile" />
                            </div>
                        </div>
                    )}
                    <div className="badge badge-success badge-outline hidden sm:flex">Live Sync</div>
                    <button className="btn btn-sm btn-primary px-6" onClick={() => handleSave(null, true)}>
                        Save Now
                    </button>
                </div>
            </header>

            <main className="flex-grow relative">
                <Excalidraw
                    excalidrawAPI={(api) => setExcalidrawAPI(api)}
                    initialData={initialData}
                    onChange={handleChange}
                    onPointerUpdate={handlePointerUpdate}
                    renderTopRightUI={() => (
                        <div className="flex -space-x-2 mr-2">
                            {/* 6. Show other people's Google images inside the canvas */}
                            {[...collaborators.values()].map((collab, index) => (
                                collab.photoURL && (
                                    <div key={index} className="avatar">
                                        <div className="bg-neutral text-neutral-content rounded-full w-8 border-2 border-base-100">
                                            <img src={collab.photoURL} alt="collaborator" className="rounded-full" />
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                />
            </main>
        </div>
    );
};

export default Board;