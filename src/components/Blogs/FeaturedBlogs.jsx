// import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";


const FeaturedBlogs = () => {

    const [featureBlogs, setFeatureBlogs] = useState([]);
    useMemo(() => {
        fetch('https://your-voice-server.vercel.app/featured')
            .then(res => res.json())
            .then(data => {
                // data.sort((a, b) => b.long_description.length - a.long_description.length);
                setFeatureBlogs(data);
                
            })
    }, [])

    console.log(featureBlogs);

    const columns = [
       
        {
            name: 'Blog Title',
            selector: row => row.title,
            sortable: true
        },
        {
            name: 'Blog Owner',
            selector: row => row.poster
        },
        {
            name: ' Picture',
            selector: row => <img className="w-10 rounded-full" src={row.posterImage} alt="" />
        },
    ];

    return (
            <div className='mt-12 lg:mt-20'>
                <div className="text-center mb-10">
                    <h1 className="text-3xl lg:text-5xl font-bold text-rose-700  animate__animated animate__backInUp">
                        Featured Blogs
                    </h1>
                    <p className="mt-4 text-white dark:text-gray-500 font-bold">
                        Share your thoughts and experiences with the community.
                    </p>
                </div>
                
                <div className="">
                    <DataTable columns={columns} data={featureBlogs}>
                    </DataTable>
                </div>


            </div>

    );
};

export default FeaturedBlogs;

