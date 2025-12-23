import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const BoardList = () => {
    const navigate = useNavigate();
    const [savedBoards, setSavedBoards] = useState([]);

    useEffect(() => {
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
                } catch (e) {
                    console.error("Error parsing board", e);
                }
            }
        }
        // Sort by newest first
        setSavedBoards(boards.sort((a, b) => b.date - a.date));
    }, []);

    const handleCreateNew = () => {
        const newId = uuidv4();
        navigate(`/board/${newId}`);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-primary">Your Boards</h1>
                <button onClick={handleCreateNew} className="btn btn-primary">
                    + New Board
                </button>
            </div>

            {savedBoards.length === 0 ? (
                <div className="text-center py-20 bg-base-200 rounded-box">
                    <p className="opacity-50">No boards found. Create your first one!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedBoards.map((board) => (
                        <div key={board.id} className="card bg-base-100 shadow-xl border border-base-300">
                            <div className="card-body p-4">
                                <h2 className="card-title text-lg text-primary truncate">{board.name}</h2>
                                <p className="text-[10px] font-mono opacity-40">ID: {board.id}</p>
                                <div className="card-actions justify-end mt-2">
                                    <button onClick={() => navigate(`/board/${board.id}`)} className="btn btn-xs btn-outline">Open</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BoardList;