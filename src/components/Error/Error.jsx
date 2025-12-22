import { Link } from "react-router-dom";
import Navbar from "../Root/Navbar";



const Error = () => {
    return (
        <div className="container mx-auto ">
            <Navbar></Navbar>
            <div className="text-center flex flex-col items-center justify-center space-y-6 mt-16">
                <h2 className="text-5xl">404</h2>
                <h3 className="text-2xl">Not found</h3>
                <p className="text-xl">Please check the URL or go to Home</p>
            </div>
            
            
        </div>
    );
};

export default Error;