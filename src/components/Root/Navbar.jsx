import React, { useContext, useEffect, useState } from 'react';
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../../AuthProvider/AuthProvider";
import { Tooltip } from 'react-tooltip'
import Swal from 'sweetalert2'
import axios from "axios";
import Lottie from "lottie-react";
import blog from '../../assets/blog.json'


const Navbar = () => {
    const { user, logOut } = useContext(AuthContext);

    // Dark, LIght theme
    const [theme, setTheme] = useState(localStorage.getItem('theme') ? localStorage.getItem('theme') : 'light');

    useEffect(() => {
        localStorage.setItem('theme', theme);
        const localTheme = localStorage.getItem('theme');
        document.querySelector('html').setAttribute('data-theme', localTheme)
    }, [theme])

    const handleToggle = (e) => {
        if (e.target.checked) {
            setTheme('dark');
        }
        else {
            setTheme('light');
        }
    }

    const signOut = () => {
        logOut()
            .then(() => {

                Swal.fire({
                    title: 'Success!',
                    text: 'Successfully Logged Out',
                    icon: 'success',
                    confirmButtonText: 'OK'
                })
                axios.post('https://your-voice-server.vercel.app/logout')
                    .then(res => {
                        console.log(res.data)
                    })
            })
            .catch(error => {
                console.error(error.message);
                Swal.fire({
                    title: 'Error!',
                    text: error.message,
                    icon: 'error',
                    confirmButtonText: 'OK'
                })
            })
    }

    const links = <>
        <li className='p-1'><NavLink style={({ isActive }) => {
            return {
                backgroundColor: isActive ? '#a50036' : 'white',
                fontWeight: isActive ? "bold" : "",
                color: isActive ? 'white' : 'black'
            };
        }} to='/'>Home</NavLink></li>
        {/* <li className='p-1'><NavLink style={({ isActive }) => {
            return {
                backgroundColor: isActive ? '#a50036' : 'white',
                fontWeight: isActive ? "bold" : "",
                color: isActive ? 'white' : 'black'
            };
        }} to='/allblogs'>All Blogs</NavLink></li> */}
        {/* <li className='p-1'><NavLink style={({ isActive }) => {
            return {
                backgroundColor: isActive ? '#a50036' : 'white',
                fontWeight: isActive ? "bold" : "",
                color: isActive ? 'white' : 'black'
            };
        }} to='/addblog'>Add Blogs</NavLink></li> */}
        <li className='p-1'><NavLink style={({ isActive }) => {
            return {
                backgroundColor: isActive ? '#a50036' : 'white',
                fontWeight: isActive ? "bold" : "",
                color: isActive ? 'white' : 'black'
            };
        }} to='/board'>Board</NavLink></li>
        <li className='p-1'><NavLink style={({ isActive }) => {
            return {
                backgroundColor: isActive ? '#a50036' : 'white',
                fontWeight: isActive ? "bold" : "",
                color: isActive ? 'white' : 'black'
            };
        }} to='/chatbot'>ChatBot</NavLink></li>
        {/* <li className='p-1'><NavLink style={({ isActive }) => {
            return {
                backgroundColor: isActive ? '#a50036' : 'white',
                fontWeight: isActive ? "bold" : "",
                color: isActive ? 'white' : 'black'
            };
        }} to='/featuredblogs'>Featured Blogs</NavLink></li> */}
        <li>
            <label className="swap swap-rotate">

                {/* this hidden checkbox controls the state */}
                <input onChange={handleToggle} type="checkbox" />

                {/* sun icon */}
                <svg className="swap-on fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" /></svg>

                {/* moon icon */}
                <svg className="swap-off fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" /></svg>

            </label>
        </li>
    </>


    return (
        <div className=''>
            <Tooltip id="my-tooltip" />
            <div className="navbar bg-base-100 shadow-sm rounded-2xl">
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                            {
                                links
                            }
                        </ul>
                    </div>
                    <NavLink to='/' className="btn btn-ghost text-lg lg:text-xl bg-clip-text text-transparent bg-gradient-to-r from-rose-800 to-rose-500">
                        <Lottie className="h-8 hidden md:inline-block" animationData={blog}></Lottie>
                        SketchSpace</NavLink>
                </div>
                <div className="navbar-center hidden lg:flex">
                    <ul className="menu menu-horizontal mx-6">
                        {
                            links
                        }
                    </ul>
                </div>
                <div className="navbar-end">
                    {
                        (user) ?
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                    <div data-tooltip-id="my-tooltip"
                                        data-tooltip-content={user.displayName ? user.displayName : 'Please update your profile'}
                                        className="w-10 rounded-full">
                                        <img alt='image not available' src={user.photoURL} />

                                    </div>
                                </div>
                                <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">

                                    <li onClick={signOut}><a>Logout</a></li>
                                </ul>
                            </div>
                            : <div className="space-x-2">
                                <Link to='/login' ><button className="btn btn-sm rounded-lg lg:btn-md  bg-rose-800 text-white">Login</button></Link>
                                <Link to='/register' ><button className="btn btn-sm rounded-lg lg:btn-md bg-rose-800 text-white">Register</button> </Link>
                            </div>
                    }
                </div>
            </div>
        </div>
    );
};

export default Navbar;