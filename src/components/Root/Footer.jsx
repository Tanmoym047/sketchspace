import { FaFacebookF, FaTwitter, FaGithub, FaInstagram } from "react-icons/fa";
import Lottie from "lottie-react";
import blog from '../../assets/blog.json'

const Footer = () => {
    return (
        <footer className="mt-6 footer footer-horizontal footer-center bg-base-200 text-base-content rounded-2xl p-8 flex flex-col">

            < aside className="space-y-1 px-4">
                <div className="flex space-x-2 items-center">
                    <Lottie className="h-12 hidden md:inline-block" animationData={blog}></Lottie>
                    <h2 className="font-bold text-xl lg:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-emerald-500">
                        SketchSpace
                    </h2>
                </div>

                <h3 className=" opacity-90 text-lg lg:text-xl">
                    Explore. Explain. Inspire. Connect.
                </h3>
            </aside >
            <nav>
                <div className="grid grid-flow-col gap-6 text-3xl">
                    <FaFacebookF />
                    <FaTwitter />
                    {/* <FaGithub /> */}
                    <FaInstagram />
                </div>
                <p className="text-base mt-2">Copyright © 2025 - All right reserved</p>
            </nav>
        </footer>
    );
};

export default Footer;