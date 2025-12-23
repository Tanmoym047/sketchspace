import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const BoardList = () => {
    const navigate = useNavigate();
    const [savedBoards, setSavedBoards] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBoardsFromDB = async () => {
        try {
            const response = await fetch('http://localhost:5000/allBoards');
            const data = await response.json();
            setSavedBoards(data);
        } catch (error) {
            console.error("Failed to fetch boards:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBoardsFromDB(); }, []);

    const handleDelete = async (id, name) => {
        const result = await Swal.fire({
            title: `Delete ${name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete'
        });

        if (result.isConfirmed) {
            await fetch(`http://localhost:5000/board/delete/${id}`, { method: 'DELETE' });
            fetchBoardsFromDB(); // Refresh list
            Swal.fire('Deleted', '', 'success');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between mb-8">
                <h1 className="text-2xl font-bold">Cloud Boards</h1>
                <button 
                    onClick={() => navigate(`/board/${crypto.randomUUID()}`)} 
                    className="btn btn-primary"
                >
                    + New Board
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {savedBoards.map((board) => (
                    <div key={board.roomId} className="card bg-base-100 border shadow-sm p-4">
                        <h2 className="font-bold text-lg">{board.name}</h2>
                        <p className="text-xs opacity-50 truncate">{board.roomId}</p>
                        <div className="flex justify-between mt-4">
                            <button onClick={() => handleDelete(board.roomId, board.name)} className="btn btn-xs btn-error btn-outline">Delete</button>
                            <button onClick={() => navigate(`/board/${board.roomId}`)} className="btn btn-xs btn-primary">Open</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BoardList;