import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const BoardList = () => {
    const navigate = useNavigate();
    const [savedBoards, setSavedBoards] = useState([]);

    const loadBoards = () => {
        const boards = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith("sketchspace_data_")) {
                const rawData = localStorage.getItem(key);
                try {
                    const parsed = JSON.parse(rawData);
                    boards.push({
                        id: key.replace("sketchspace_data_", ""),
                        name: parsed.name || "Untitled Board",
                        date: parsed.lastModified || 0
                    });
                } catch (e) { console.error(e); }
            }
        }
        setSavedBoards(boards.sort((a, b) => b.date - a.date));
    };

    useEffect(() => { loadBoards(); }, []);

    const handleDelete = (id, name) => {
        Swal.fire({
            title: `Delete "${name}"?`,
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem(`sketchspace_data_${id}`);
                loadBoards(); // Refresh list
                Swal.fire('Deleted!', 'Board has been removed.', 'success');
            }
        });
    };

    return (
        <div className="p-8 max-w-5xl mx-auto min-h-screen bg-base-100">
            <div className="flex justify-between items-center mb-10 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-primary">My SketchSpaces</h1>
                <button 
                    onClick={() => navigate(`/board/${crypto.randomUUID()}`)} 
                    className="btn btn-primary shadow-lg"
                >
                    + Create New Space
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedBoards.map((board) => (
                    <div key={board.id} className="group card bg-base-100 border border-base-300 shadow-md hover:shadow-xl transition-all">
                        <div className="card-body p-6">
                            <h2 className="card-title text-primary truncate mb-0">{board.name}</h2>
                            <p className="text-[10px] opacity-40 font-mono italic">ID: {board.id}</p>
                            
                            <div className="card-actions justify-between items-center mt-6">
                                <button 
                                    onClick={() => handleDelete(board.id, board.name)} 
                                    className="btn btn-square btn-outline btn-error btn-s opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                </button>
                                <button 
                                    onClick={() => navigate(`/board/${board.id}`)} 
                                    className="btn btn-sm btn-primary px-5"
                                >
                                    Open
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BoardList;