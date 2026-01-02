import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
    const API_URL = `${import.meta.env.VITE_BACKEND_URL}/chatbot/generate`;

    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError('');
        setResponse('');

        if (!prompt.trim()) {
            setError("Please enter a prompt to generate text.");
            setLoading(false);
            return;
        }
        try {
            const res = await axios.post(API_URL, { prompt });
            setResponse(res.data.text);
        } catch (err) {
            console.error("API call failed:", err);
            setError("Failed to get a response from the AI. Please ensure your backend is running and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-1/2 flex items-center justify-center p-4 sm:p-8 font-sans text-gray-200">
            <title>SketchSpace | ChatBot</title>
            <div className="w-full max-w-2xl bg-base-content rounded-3xl shadow-xl border border-slate-700 p-6 sm:p-10 flex flex-col items-center animate-fade-in">

                <h1 className="text-3xl sm:text-3xl font-extrabold text-gray-500 text-center mb-2 leading-tight tracking-wide">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-emerald-500">SketchSpace</span> Chatbot
                </h1>
                <p className="text-center text-gray-500 mb-8 max-w-md text-sm sm:text-base font-bold">
                    Use it to help post your blog
                </p>

                <form onSubmit={handleSubmit} className="w-full mb-8">

                    <textarea
                        id="prompt"
                        className="textarea w-full resize-y min-h-16 mb-4 bg-slate-600 text-base border-slate-600 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 "
                        placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />

                    <button
                        type="submit"
                        className="btn w-full font-bold py-3 rounded-xl text-md transition-all duration-300 transform hover:scale-105
                       bg-emerald-800 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 text-white"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading loading-dots loading-md text-white"></span>
                        ) : (
                            'Generate Text'
                        )}
                    </button>
                </form>

                <div className="w-full">
                    {error && (

                        <div role="alert" className="alert alert-error bg-red-900 text-red-300 border-red-700 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {response && !loading && (

                        <div className="card w-full bg-slate-700 shadow-lg border border-slate-600 mt-2 rounded-xl animate-fade-in-up">
                            <div className="card-body p-2">
                                <h2 className="card-title text-2xl mb-4 text-rose-700 font-bold border-b border-emerald-500/50 pb-2">Response</h2>

                                <p className="whitespace-pre-wrap text-gray-300 leading-relaxed text-base">{response}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chatbot;