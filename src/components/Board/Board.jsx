import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Excalidraw, convertToExcalidrawElements } from '@excalidraw/excalidraw';
import Swal from 'sweetalert2';
import io from 'socket.io-client';
import { AuthContext } from '../../AuthProvider/AuthProvider';
import "@excalidraw/excalidraw/index.css";

const socket = io('http://localhost:5000');

const Board = () => {
    const { roomId } = useParams();
    const { user } = useContext(AuthContext);
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
                const response = await fetch(`https://sketchspace-server.onrender.com/board/${roomId}`);
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

        socket.on('receive-mouse', (data) => {
            setCollaborators((prev) => {
                const newMap = new Map(prev);
                newMap.set(data.socketId, {
                    pointer: data.pointer,
                    button: data.button,
                    photoURL: data.user?.photoURL,
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

    // MODIFIED: Added userEmail to identify owner/collaborator
    const handleSave = async (elements = null, isManual = false) => {
        const currentElements = elements || excalidrawAPI?.getSceneElements();
        if (!currentElements) return;

        const boardData = {
            roomId,
            name: boardName,
            elements: currentElements,
            userEmail: user?.email, // Sends your email to the backend
            lastModified: new Date()
        };

        try {
            await fetch(`https://sketchspace-server.onrender.com/board/save/${roomId}`, {
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

    // NEW: Handle Invite Logic
    const handleInvite = async () => {
        const { value: inviteeEmail } = await Swal.fire({
            title: 'Invite Collaborator',
            input: 'email',
            inputLabel: 'Their Google/Registered Email',
            inputPlaceholder: 'friend@example.com',
            showCancelButton: true,
            confirmButtonText: 'Add to Board',
            confirmButtonColor: '#e11d48', // Matching rose theme
        });

        if (inviteeEmail) {
            try {
                const response = await fetch('https://sketchspace-server.onrender.com/board/invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomId, inviteeEmail })
                });

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Collaborator Added',
                        text: `${inviteeEmail} can now see this board in their dashboard.`,
                        timer: 2000
                    });
                }
            } catch (err) {
                Swal.fire('Error', 'Could not send invitation.', 'error');
            }
        }
    };

    const handleChange = (elements) => {
        if (elements.length === 0) return;
        if (!isImportingRef.current) {
            socket.emit('drawing-update', { roomId, elements });
        }
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => { handleSave(elements, false); }, 5 * 60 * 1000);
    };

    const handlePointerUpdate = (payload) => {
        if (payload.pointer) {
            socket.emit('mouse-move', {
                roomId,
                pointer: payload.pointer,
                button: payload.button,
                user: {
                    photoURL: user?.photoURL
                }
            });
        }
    };

    const handleAiGenerate = async () => {
        const { value: userPrompt } = await Swal.fire({
            title: 'Describe your diagram',
            input: 'text',
            inputPlaceholder: 'e.g., A flow chart of an e-commerce order process',
            showCancelButton: true,
            confirmButtonText: 'Generate ✨',
            confirmButtonColor: '#9f1239', // Rose-800
        });

        if (userPrompt) {
            Swal.fire({ title: 'AI is drawing...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            try {
                const response = await fetch(`https://sketchspace-server.onrender.com/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: userPrompt })
                });
                const data = await response.json();

                if (data.elements && excalidrawAPI) {
                    // IMPORTANT: Convert raw AI JSON into real Excalidraw elements
                    const validatedElements = convertToExcalidrawElements(data.elements);

                    const currentElements = excalidrawAPI.getSceneElements();

                    excalidrawAPI.updateScene({
                        elements: [...currentElements, ...validatedElements],
                    });

                    Swal.fire('Success!', 'AI shapes added to board.', 'success');
                }
            } catch (error) {
                console.error("AI Error:", error);
                Swal.fire('Error', 'AI failed to generate valid shapes.', 'error');
            }
        }
    };

    if (isLoading) return (
        <div className="h-screen flex items-center justify-center bg-base-100">
            <span className="loading loading-spinner loading-lg text-emerald-700"></span>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-base-200 overflow-hidden text-base-content">
            <header className="navbar bg-base-100 shadow-sm z-10 px-4 flex-nowrap items-center h-auto py-2">
                {/* Left Side: Board Name - Stays fixed on the left */}
                <div className="flex-1 self-center">
                    <input
                        type="text"
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        onBlur={() => handleSave(null, false)}
                        className="input input-ghost input-sm text-xl font-bold text-emerald-600 w-full max-w-[200px] sm:max-w-xs focus:bg-transparent"
                    />
                </div>

                {/* Right Side: Buttons Container - Forced 2 Rows */}
                <div className="flex-none grid grid-rows-2 gap-y-2 items-center">
                    {/* Row 1: Action Buttons */}
                    <div className="flex justify-end gap-2">
                        <button className="btn btn-xs sm:btn-sm btn-outline btn-secondary" onClick={handleInvite}>
                            Invite
                        </button>
                        <button
                            onClick={handleAiGenerate}
                            className="btn btn-xs sm:btn-sm btn-outline btn-secondary border-dashed"
                        >
                            AI Magic ✨
                        </button>
                    </div>

                    {/* Row 2: Status & Save */}
                    <div className="flex justify-end items-center gap-2">
                        {user?.photoURL && (
                            <div className="avatar">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1 shrink-0">
                                    <img src={user.photoURL} alt="Your profile" className="rounded-full" />
                                </div>
                            </div>
                        )}
                        <div className="badge badge-success badge-outline hidden lg:flex text-[10px] sm:text-xs">Live</div>
                        <button
                            className="btn btn-xs sm:btn-sm btn-primary bg-emerald-800 border-none px-3 sm:px-6"
                            onClick={() => handleSave(null, true)}
                        >
                            Save Now
                        </button>
                    </div>
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