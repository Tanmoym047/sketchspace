import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Excalidraw, convertToExcalidrawElements, Sidebar } from '@excalidraw/excalidraw';
import Swal from 'sweetalert2';
import io from 'socket.io-client';
import { AuthContext } from '../../AuthProvider/AuthProvider';
import "@excalidraw/excalidraw/index.css";

const socket = io(`${import.meta.env.VITE_BACKEND_URL}/`);

const Board = () => {
    const { roomId } = useParams();
    const { user } = useContext(AuthContext);
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);
    const [initialData, setInitialData] = useState(null);
    const [boardName, setBoardName] = useState("Untitled Board");
    const [isLoading, setIsLoading] = useState(true);
    const [cameraPos, setCameraPos] = useState({ x: 0, y: 0 });

    const [collaborators, setCollaborators] = useState(new Map());
    const saveTimerRef = useRef(null);
    const isImportingRef = useRef(false);

    useEffect(() => {
        const fetchBoard = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/board/${roomId}`);

                // If the board doesn't exist (new room), just stop loading and show empty board
                if (!response.ok || response.status === 204) {
                    setInitialData({ elements: [], appState: { theme: 'light', scrollToContent: true, viewBackgroundColor: "#f8fafc", openSidebar: { name: "custom", tab: "minimap" } } });
                    return;
                }

                const text = await response.text();
                if (!text) {
                    setInitialData({ elements: [], appState: { theme: 'light', scrollToContent: true, viewBackgroundColor: "#f8fafc", openSidebar: { name: "custom", tab: "minimap" } } });
                    return;
                }

                const data = JSON.parse(text);
                if (data) {
                    setBoardName(data.name || "Untitled Board");
                    setInitialData({
                        elements: data.elements || [],
                        appState: { theme: 'light', scrollToContent: true, viewBackgroundColor: "#f8fafc", openSidebar: { name: "custom", tab: "minimap" } },
                    });
                }
            } catch (error) {
                console.error("Load error:", error);
                // Fallback for new rooms or errors
                setInitialData({ elements: [], appState: { theme: 'light', scrollToContent: true } });
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

    // New Effect for Extension Text Import
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const isTextImport = urlParams.get('import') === 'text';

        if (isTextImport && excalidrawAPI && !isLoading) {
            // Wait a second for the board to settle
            const timer = setTimeout(() => {
                window.postMessage({ type: "REQUEST_TEXT_FROM_EXTENSION" }, "*");
            }, 1000);

            const handleMessage = (event) => {
                if (event.data && event.data.type === "TEXT_RECEIVED") {
                    const clippedText = event.data.text;
                    if (!clippedText || !excalidrawAPI) return;

                    // 1. Get the current elements from the API (Just like your AI button does)
                    const currentElements = excalidrawAPI.getSceneElements();

                    // 2. Create the element with a UNIQUE ID and VERSION
                    const textElement = {
                        type: "text",
                        // Center it based on current camera position
                        x: excalidrawAPI.getAppState().scrollX + (window.innerWidth / 2) - 100,
                        y: excalidrawAPI.getAppState().scrollY + (window.innerHeight / 2) - 50,
                        text: clippedText,
                        fontSize: 20,
                        fontFamily: 1,
                        textAlign: "left",
                        verticalAlign: "top",
                        strokeColor: "#000000",
                        backgroundColor: "transparent",
                        width: 400,
                        // REQUIRED: Generate a new version so Excalidraw renders it ON TOP
                        version: Date.now(),
                        versionNonce: Math.floor(Math.random() * 1000000000),
                        updated: Date.now(),
                    };

                    // 3. Update the scene (Exactly like your handleAiGenerate does)
                    excalidrawAPI.updateScene({
                        elements: [...currentElements, textElement],
                        appState: {
                            scrollToContent: true
                        }
                    });

                    // 4. Force a sync to your database immediately
                    handleSave([...currentElements, textElement], false);

                    // Clean the URL
                    window.history.replaceState({}, '', window.location.pathname);

                    setTimeout(() => {
                        window.location.reload();
                    }, 700); // 5000ms = 5 seconds
                }
            };

            window.addEventListener("message", handleMessage);
            return () => {
                window.removeEventListener("message", handleMessage);
                clearTimeout(timer);
            };
        }
    }, [excalidrawAPI, isLoading, roomId]);

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
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/board/save/${roomId}`, {
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
            confirmButtonColor: '#006045',
        });

        if (inviteeEmail) {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/board/invite`, {
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

    const handleChange = (elements, appState) => {
        if (appState) {
            const newX = Math.round(appState.scrollX || 0);
            const newY = Math.round(appState.scrollY || 0);

            // ONLY update state if the coordinates actually moved
            // This breaks the infinite loop
            setCameraPos(prev => {
                if (prev.x !== newX || prev.y !== newY) {
                    return { x: newX, y: newY };
                }
                return prev;
            });
        }
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
    const moveCamera = (deltaX, deltaY) => {
        if (!excalidrawAPI) return;
        const { scrollX, scrollY } = excalidrawAPI.getAppState();
        excalidrawAPI.updateScene({
            appState: {
                scrollX: scrollX + deltaX,
                scrollY: scrollY + deltaY
            }
        });
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
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/generate`, {
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
                        <button
                            className="btn btn-xs sm:btn-sm btn-primary bg-emerald-800 border-none px-3 sm:px-6"
                            onClick={() => {
                                if (!excalidrawAPI) return;

                                const currentAppState = excalidrawAPI.getAppState();

                                // Check if our specific 'custom' sidebar is currently open
                                const isSidebarOpen = currentAppState.openSidebar?.name === "custom";

                                excalidrawAPI.updateScene({
                                    appState: {
                                        // If open, set to null (close). If closed, set to our name.
                                        openSidebar: isSidebarOpen ? null : { name: "custom" }
                                    }
                                });
                            }}
                            title="Toggle Navigation Hub"
                        >
                            Sidebar
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

            <main className="flex-grow relative px-4">
                <div className="absolute bottom-20 left-4 z-50 pointer-events-none bg-black backdrop-blur-sm px-4 py-2 rounded-xl border border-emerald-100 text-[11px] font-mono shadow-lg flex gap-4 transition-all">
                    <div className="flex flex-col">
                        <span className="text-white uppercase text-[9px]">X axis</span>
                        <span className="text-emerald-700 font-bold">{cameraPos.x}</span>
                    </div>
                    <div className="flex flex-col border-l border-emerald-100 pl-4">
                        <span className="text-white uppercase text-[9px]">Y axis</span>
                        <span className="text-emerald-700 font-bold">{cameraPos.y}</span>
                    </div>
                </div>
                <Excalidraw
                    excalidrawAPI={(api) => setExcalidrawAPI(api)}
                    initialData={initialData}
                    onChange={handleChange}
                    onPointerUpdate={handlePointerUpdate}
                    UIOptions={{
                        canvasActions: {
                            toggleZenMode: true,
                            // This ensures the view mode doesn't block tools
                            viewBackgroundColor: true,
                        }
                    }}
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
                >
                    <Sidebar name="custom">
                        <Sidebar.Header>Navigation Hub</Sidebar.Header>
                        <div className=" p-4 space-y-6">

                            {/* 1. Coordinate Overview */}
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                <h3 className="text-[10px] uppercase tracking-widest text-emerald-800 font-bold mb-2">Current Location</h3>
                                <div className="flex justify-between font-mono text-sm">
                                    <span>X: {cameraPos.x}</span>
                                    <span>Y: {cameraPos.y}</span>
                                </div>
                            </div>

                            {/* 2. Quick Jump Buttons (The "Scrollbar Replacement") */}
                            <div className="space-y-2">
                                <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Quick Jump</h3>
                                <button
                                    className="btn btn-sm btn-block btn-outline border-emerald-200 text-emerald-700"
                                    onClick={() => excalidrawAPI.scrollToContent(excalidrawAPI.getSceneElements())}
                                >
                                    Fit All Content
                                </button>
                                <button
                                    className="btn btn-sm btn-block btn-outline border-emerald-200 text-emerald-700"
                                    onClick={() => excalidrawAPI.updateScene({ appState: { scrollX: 0, scrollY: 0, zoom: { value: 1 } } })}
                                >
                                    Center (0, 0)
                                </button>
                            </div>

                            {/* 3. Manual Scroller (Directional) */}
                            <div className="space-y-2">
                                <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Pan Camera</h3>
                                <div className="grid grid-cols-3 gap-1 max-w-[120px] mx-auto">
                                    <div />
                                    <button className="btn btn-xs btn-square" onClick={() => moveCamera(0, 100)}>↑</button>
                                    <div />
                                    <button className="btn btn-xs btn-square" onClick={() => moveCamera(100, 0)}>←</button>
                                    <button className="btn btn-xs btn-square" onClick={() => excalidrawAPI.scrollToContent()}>•</button>
                                    <button className="btn btn-xs btn-square" onClick={() => moveCamera(-100, 0)}>→</button>
                                    <div />
                                    <button className="btn btn-xs btn-square" onClick={() => moveCamera(0, -100)}>↓</button>
                                    <div />
                                </div>
                            </div>
                        </div>
                    </Sidebar>
                </Excalidraw>

            </main>
        </div>
    );
};

export default Board;