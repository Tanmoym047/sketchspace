import { useContext, useEffect, useState } from "react";
import RecentBlog from "./RecentBlog";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../../AuthProvider/AuthProvider";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css'

const RecentBlogs = () => {

    const { data, isLoading } = new useQuery({
        queryKey: ["recent"],
        queryFn: async () => {
            const res = await axios.get(`https://your-voice-server.vercel.app/recent/`)

            console.log(res.data);
            return res.data;
        }
    })

    console.log(data);

    return (
        <div className='mt-12 lg:mt-20'>
            <div className='space-y-4 mb-10 text-center'>
                <h2 className='text-2xl lg:text-4xl font-bold'>Recent Blogs</h2>
                <p className='text-lg lg:text-2xl'>Some recent blogs you would like</p>
            </div>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 ">
                {
                    isLoading ? <Skeleton className="" count={5} /> :
                        data.map(recentBlog => <RecentBlog recentBlog={recentBlog}></RecentBlog>)
                }
            </div>
        </div>
    );
};

export default RecentBlogs;