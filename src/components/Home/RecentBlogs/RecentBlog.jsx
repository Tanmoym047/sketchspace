import React, { useContext } from 'react';
import { CiClock2, CiLocationArrow1 } from 'react-icons/ci';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../AuthProvider/AuthProvider';
import axios from 'axios';
import Swal from 'sweetalert2';

const RecentBlog = ({ recentBlog }) => {
    const { user } = useContext(AuthContext);

    const { _id, title, poster, postTime, blogImage, short_description, category } = recentBlog;

    const id = _id

    const handleAddWishlist = () => {
        const data = { id, title, poster, postTime, blogImage, short_description, category, email: user.email };

        axios.post(`https://your-voice-server.vercel.app/wishlist`, data)
            .then(res => {
                console.log(res.data);
                if (res.data.insertedId) {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Wishlist Added',
                        icon: 'success',
                        confirmButtonText: 'Cool'
                    })
                }
            })

    }

    return (
        <div className="card bg-base-100 shadow-xl max-h-[600px]" data-aos="fade-up" data-aos-duration="700">
            <figure className=" "><img className="lg:h-[300px] rounded-xl" src={blogImage} alt="" /></figure>
            <div className="card-body space-y-3">
                <div className="flex justify-between border-b pb-4">
                    <div className="space-y-2">
                        <h2 className="font-bold text-3xl">{title}</h2>
                    </div>

                </div>
                <p className="border-b pb-4">{short_description}</p>

                <div className="flex gap-8 flex-wrap items-center justify-between">

                    <h3 className="btn btn-ghost font-bold text-2xl text-emerald-800">{category}</h3>
                    <h3 className='text-lg opacity-80'>Posted by: {poster}</h3>
                </div>

                <div className="card-actions justify-end">
                    <Link to={`/blogs/${_id}`}><button className="btn bg-emerald-800 text-white">View Details</button></Link>
                                        
                </div>
            </div>
        </div>
    );
};

export default RecentBlog;