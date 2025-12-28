import { Link, useLocation, useNavigate } from "react-router-dom";
import 'animate.css';
import { FaGoogle, FaGithub, FaEye, FaEyeSlash } from "react-icons/fa";

import Swal from 'sweetalert2'

import { useForm } from "react-hook-form"
import { useContext, useState } from "react";
import { AuthContext } from "../../AuthProvider/AuthProvider";
import { GithubAuthProvider } from "firebase/auth";

import axios from "axios";

const Login = () => {
    const [showPass, setShowPass] = useState(false);
    const showPassword = () => {
        setShowPass(!showPass);
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const location = useLocation();
    const navigate = useNavigate();

    const { signIn, signInWithGoogle, signInWithGithub } = useContext(AuthContext)

    const handleLoginSuccess = (user, data) => {
        // 1. Prepare user profile for MongoDB
        const userData = {
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL
        };

        Swal.fire({
            title: 'Success!',
            text: 'Successfully Logged In',
            icon: 'success',
            confirmButtonText: 'OK'
        }).then(() => {
            // 2. Sync user to MongoDB first
            // We use PUT and your localhost URL for the new SketchSpace backend
            axios.put('https://sketchspace-server.onrender.com/user/sync', userData)
                .then(() => {
                    // 3. NOW run your original JWT logic
                    // Using 'data' variable exactly as your working code did
                    axios.post('https://sketchspace-server.onrender.com/jwt', data, {
                        withCredentials: true
                    }).then(res => {
                        if (res.data.success) {
                            // 4. Navigate using your PrivateRoute's state logic
                            // This sends the user back to the board they were trying to access
                            navigate(location?.state ? location?.state : '/');
                        }
                    });
                })
                .catch(err => {
                    console.error("DB Sync Error:", err);
                    // Fallback: If DB sync fails, still try to navigate so the user isn't stuck
                    axios.post('https://sketchspace-server.onrender.com/jwt', data, { withCredentials: true })
                        .then(res => res.data.success && navigate(location?.state ? location?.state : '/'));
                });
        });
    };

    const handleLoginError = (error) => {
        console.error(error.message);
        Swal.fire({
            title: 'Error!',
            text: error.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    };

    const googleSignIn = () => {
        signInWithGoogle()
            .then(result => {
                const data = { email: result.user.email };
                handleLoginSuccess(result.user, data);
            })
            .catch(handleLoginError);
    };

    const onSubmit = (data) => {
        const { email, password } = data;
        const pattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*()])(?=.*[0-9]).{6,}$/;

        if (!email) {
            handleLoginError({ message: 'Please Check the Email Again' });
            return;
        }

        if (!pattern.test(password)) {
            handleLoginError({ message: 'Password must be at least 6 characters long and include an uppercase letter, a number, and a special character.' });
            return;
        }

        signIn(email, password)
            .then(result => {
                handleLoginSuccess(result.user, data);
            })
            .catch(error => {
                if (error.code === 'auth/invalid-credential') {
                    handleLoginError({ message: 'Invalid email or password. Please try again.' });
                } else {
                    handleLoginError(error);
                }
            });
    };

    return (
        <div className="flex items-center justify-center max-h-1/2 bg-base-content p-4 rounded-2xl mt-2">
            <title>SketchSpace | Login</title>
            <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 animate__animated animate__zoomIn">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 animate__animated animate__fadeInDown">Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-emerald-500">SketchSpace</span></h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Log in to see how deep the rabbit hole goes.</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input {...register('email')} type="email" placeholder="Email" className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <div className="relative mt-1">
                            <input
                                {...register('password')}
                                type={showPass ? 'text' : 'password'}
                                placeholder="Password"
                                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <button
                                type="button"
                                onClick={showPassword}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none"
                            >
                                {showPass ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-800 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors">
                            Login
                        </button>
                    </div>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        New here? <Link to='/register' className="text-emerald-800 font-semibold hover:text-rose-700 transition-colors">Register</Link>
                    </p>
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">OR</span>
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <button onClick={googleSignIn} className="flex-1 inline-flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                            <FaGoogle className="mr-2" /> Google
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;