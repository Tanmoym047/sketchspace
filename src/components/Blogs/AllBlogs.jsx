import React, { useEffect, useState } from 'react';
import RecentBlog from '../Home/RecentBlogs/RecentBlog';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const AllBlogs = () => {
    const handleClick = (category) => {
        console.log(category);
        axios.get(`https://your-voice-server.vercel.app/filter?filter=${category}`)
            .then(res => {
                console.log(res.data);
                setRecentBlogs(res.data)
            })
    }

    const dropdown = <>
        <li onClick={() => handleClick('Health & Fitness')} ><a>Health & Fitness</a></li>
        <li onClick={() => handleClick('Travel')}>
            <a>Travel</a></li>
        <li onClick={() => handleClick('Nutrition')}><a>Nutrition</a></li>
        <li onClick={() => handleClick('Productivity')}><a>Productivity</a></li>
        <li onClick={() => handleClick('Mental Health')}><a>Mental Health</a></li>
        <li onClick={() => handleClick('Finance')}><a>Finance</a></li>
    </>


    const [recentBlogs, setRecentBlogs] = useState([]);
    useEffect(() => {
        axios.get('https://your-voice-server.vercel.app/allBlogs')
            .then(res => setRecentBlogs(res.data))

    }, [])

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        const { title } = data;
        console.log(title);

        axios.get(`https://your-voice-server.vercel.app/search?title=${title}`)
            .then(res => setRecentBlogs(res.data))

    }

    return (
        <div className='mt-12 lg:mt-20'>
            <title>SketchSpace | All Blogs</title>

            <div className='space-y-4 mb-10 text-center'>
                <h2 className='text-2xl lg:text-4xl font-bold'>All Blogs</h2>
                <p className='text-lg lg:text-2xl'>Here are all the blogs that our community have posted</p>
            </div>
            {/*  */}
            <div className='flex flex-col md:flex-row justify-center items-center'>
                <form onSubmit={handleSubmit(onSubmit)} className="input input-bordered flex items-center  gap-2">
                    <input {...register('title')} type="text" className="grow" placeholder="Search" />

                    {/* <input type="submit" value="Hello" /> */}
                    <button className='btn btn-ghost '>Search<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" /></svg></button>
                </form>
                <div className="dropdown flex justify-center">
                    <div tabIndex={0} role="button" className="btn bg-emerald-800 text-white m-1">Filter</div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                        {
                            dropdown
                        }
                    </ul>
                </div>
            </div>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2  mt-6">
                {
                    recentBlogs.map(recentBlog => <RecentBlog recentBlog={recentBlog}></RecentBlog>)
                }
            </div>
        </div>

    );
};

export default AllBlogs;