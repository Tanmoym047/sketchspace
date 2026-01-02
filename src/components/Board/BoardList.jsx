import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../../AuthProvider/AuthProvider'; // 1. Import AuthContext

const BoardList = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); // 2. Get current user
    const [savedBoards, setSavedBoards] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBoardsFromDB = async () => {
        if (!user?.email) return; // Wait for user data

        try {
            // 3. Fetch boards specific to this user's email
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/allBoards/${user.email}`);
            const data = await response.json();
            setSavedBoards(data);
        } catch (error) {
            console.error("Failed to fetch boards:", error);
        } finally {
            setLoading(false);
        }
    };

    // 4. Re-fetch whenever the user email changes (e.g., on login)
    useEffect(() => { 
        if (user?.email) {
            fetchBoardsFromDB(); 
        }
    }, [user?.email]);

    const handleDelete = async (id, name) => {
        const result = await Swal.fire({
            title: `Delete ${name}?`,
            text: "This will remove the board for all collaborators.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Delete'
        });

        if (result.isConfirmed) {
            try {
                await fetch(`${import.meta.env.VITE_BACKEND_URL}/board/delete/${id}`, { method: 'DELETE' });
                fetchBoardsFromDB(); // Refresh list
                Swal.fire('Deleted', '', 'success');
            } catch (error) {
                Swal.fire('Error', 'Failed to delete board.', 'error');
            }
        }
    };

    if (loading) return (
        <div className="h-64 flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-emerald-700"></span>
        </div>
    );

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Your Boards</h1>
                    <p className="text-sm opacity-60">Welcome, {user?.displayName || user?.email}</p>
                </div>
                <button 
                    onClick={() => navigate(`/board/${crypto.randomUUID()}`)} 
                    className="btn btn-primary bg-emerald-800"
                >
                    + New Board
                </button>
            </div>

            {savedBoards.length === 0 ? (
                <div className="text-center p-20 bg-base-200 rounded-xl border-2 border-dashed border-base-300">
                    <p className="text-lg opacity-50">No boards found. Create your first one!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {savedBoards.map((board) => (
                        <div key={board.roomId} className="card bg-base-100 border shadow-sm hover:shadow-md transition-shadow p-4">
                            <div className="flex justify-between items-start">
                                <h2 className="font-bold text-lg truncate w-4/5">{board.name}</h2>
                                {board.owner === user?.email && (
                                    <div className="badge badge-outline badge-xs ">Owner</div>
                                )}
                            </div>
                            <p className="text-xs opacity-50 truncate mt-1">ID: {board.roomId}</p>
                            
                            <div className="flex justify-between mt-6">
                                <button 
                                    onClick={() => handleDelete(board.roomId, board.name)} 
                                    className="btn btn-xs btn-error btn-outline"
                                >
                                    Delete
                                </button>
                                <button 
                                    onClick={() => navigate(`/board/${board.roomId}`)} 
                                    className="btn btn-xs btn-primary bg-emerald-800 px-4"
                                >
                                    Open
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BoardList;