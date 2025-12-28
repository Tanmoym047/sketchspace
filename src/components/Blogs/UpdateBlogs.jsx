import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../AuthProvider/AuthProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const UpdateBlogs = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isUpdating, setIsUpdating] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm();
    const { user } = useContext(AuthContext);
    const param = useParams();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["update", param.id],
        queryFn: async () => {
            const res = await axios.get(`https://your-voice-server.vercel.app/allBlogs/${param.id}`, { withCredentials: true });
            return res.data;
        }
    });

    const onSubmitData = async (formData) => {
        setIsUpdating(true);
        try {
            const newImageFile = formData.blogImage[0];
            let blogImageToUpdate;

            if (newImageFile) {
                // Upload new image if a file is selected
                const imageFile = { image: newImageFile };
                const res = await axios.post(image_hosting_api, imageFile, {
                    headers: {
                        'content-type': 'multipart/form-data'
                    }
                });
                if (res.data.success) {
                    blogImageToUpdate = res.data.data.display_url;
                } else {
                    throw new Error('Image upload failed');
                }
            } else {
                // Retain original image URL if no new file is selected
                blogImageToUpdate = data.blogImage;
            }

            const updatedBlogData = {
                ...formData,
                email: user.email,
                posterImage: user.photoURL,
                time: new Date(),
                blogImage: blogImageToUpdate,
            };

            await axios.put(`https://your-voice-server.vercel.app/update/${param.id}`, updatedBlogData, { withCredentials: true });

            Swal.fire({
                title: 'Success!',
                text: 'Blog Updated successfully',
                icon: 'success',
                confirmButtonText: 'Cool'
            });

            queryClient.invalidateQueries(["update"]);
            refetch();
            navigate(`/blogs/${param.id}`);

        } catch (error) {
            console.error("Error updating blog:", error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update blog. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const { mutateAsync } = useMutation({
        mutationFn: onSubmitData,
    });

    if (isLoading) {
        return <div className="text-center h-screen">
            <span className="loading loading-spinner loading-lg "></span>
        </div>;
    }

    const { _id, poster, title, blogImage, short_description, long_description, category } = data;

    return (
        <div className="flex justify-center items-center py-10 bg-base-content rounded-2xl transition-colors duration-300 m-6">
            <title>SketchSpace | Update</title>
            <div className="container max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="text-center mb-10">
                    <h1 className="text-3xl lg:text-5xl font-bold text-rose-700 animate__animated animate__backInUp">
                        Update Blog - {title}
                    </h1>
                    <p className="mt-4 text-gray-500 font-bold">
                        Update your blog post details below.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-600 shadow-xl rounded-2xl p-6 md:p-12 transition-colors duration-300">
                    <form onSubmit={handleSubmit(mutateAsync)} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Blog Image */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text dark:text-gray-200">Current Image URL (Read-only)</span>
                                </label>
                                <input
                                    defaultValue={blogImage}
                                    type="url"
                                    readOnly
                                    className="input input-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            {/* New Image Input */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text dark:text-gray-200">New Image (Optional)</span>
                                </label>
                                <input
                                    {...register('blogImage')}
                                    type="file"
                                    className="file-input file-input-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                {errors.blogImage && <span className="text-red-500 text-sm mt-1">Image URL is required</span>}
                            </div>

                            {/* Title */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text dark:text-gray-200">Title</span>
                                </label>
                                <input
                                    defaultValue={title}
                                    {...register('title', { required: true })}
                                    type="text"
                                    placeholder="Enter blog title"
                                    className="input input-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                {errors.title && <span className="text-red-500 text-sm mt-1">Title is required</span>}
                            </div>

                            {/* Category */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text dark:text-gray-200">Category</span>
                                </label>
                                <select
                                    defaultValue={category}
                                    {...register('category', { required: true })}
                                    className="select select-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="" className="bg-gray-100 dark:bg-gray-800">Select a category</option>
                                    <option value="Health & Fitness" className="bg-gray-100 dark:bg-gray-800">Health & Fitness</option>
                                    <option value="Gaming" className="bg-gray-100 dark:bg-gray-800">Gaming</option>
                                    <option value="Travel" className="bg-gray-100 dark:bg-gray-800">Travel</option>
                                    <option value="Nutrition" className="bg-gray-100 dark:bg-gray-800">Nutrition</option>
                                    <option value="Productivity" className="bg-gray-100 dark:bg-gray-800">Productivity</option>
                                    <option value="Mental Health" className="bg-gray-100 dark:bg-gray-800">Mental Health</option>
                                    <option value="Finance" className="bg-gray-100 dark:bg-gray-800">Finance</option>
                                    <option value="Miscellaneous" className="bg-gray-100 dark:bg-gray-800">Miscellaneous</option>
                                </select>
                                {errors.category && <span className="text-red-500 text-sm mt-1">Category is required</span>}
                            </div>

                            {/* User Name */}
                            <div className="form-control md:col-span-2">
                                <label className="label">
                                    <span className="label-text dark:text-gray-200">Your Name</span>
                                </label>
                                <input
                                    defaultValue={poster}
                                    {...register('poster', { required: true })}
                                    type="text"
                                    placeholder="Your Name"
                                    className="input input-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                {errors.poster && <span className="text-red-500 text-sm mt-1">Your Name is required</span>}
                            </div>
                        </div>

                        {/* Short Description */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text dark:text-gray-200">Short Description</span>
                            </label>
                            <textarea
                                defaultValue={short_description}
                                {...register('short_description', { required: true })}
                                placeholder="A brief summary of your blog post"
                                className="textarea textarea-bordered h-20 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            ></textarea>
                            {errors.short_description && <span className="text-red-500 text-sm mt-1">Short Description is required</span>}
                        </div>

                        {/* Long Description */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text dark:text-gray-200">Long Description</span>
                            </label>
                            <textarea
                                defaultValue={long_description}
                                {...register('long_description', { required: true })}
                                placeholder="Write the full content of your blog post here"
                                className="textarea textarea-bordered h-24 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            ></textarea>
                            {errors.long_description && <span className="text-red-500 text-sm mt-1">Long Description is required</span>}
                        </div>

                        {/* Submit button */}
                        <div className="form-control mt-6">
                            <button
                                className="btn bg-emerald-800 text-white hover:bg-rose-700 w-full dark:bg-emerald-800"
                                type="submit"
                                disabled={isUpdating}
                            >
                                {isUpdating ? 'Updating...' : 'Update Blog'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateBlogs;