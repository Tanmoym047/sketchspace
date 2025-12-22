// swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
// import required modules
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// animation
import { useTypewriter, Cursor } from 'react-simple-typewriter'

// aos initialization
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init();

const Slider = () => {
    const [text] = useTypewriter({
        words: ['Your', 'Voice'],
        loop: 0,
        onLoopDone: () => console.log(`loop completed after 3 runs.`)
    })


    return (
        <div className=' rounded-2xl'>
            <Swiper
                autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                }}
                loop={true}
                pagination={{
                    dynamicBullets: true,
                }}
                navigation={true}
                modules={[Autoplay, Navigation, Pagination]}
                className="mySwiper"
            >
                <SwiperSlide>
                    <div className='bg-[url(https://images.unsplash.com/photo-1731963094554-c5c981ccdefd?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)] h-[350px] lg:h-[550px] lg:bg-no-repeat bg-cover rounded-2xl flex justify-center items-center '>
                        <h2 className='text-white text-4xl lg:text-7xl text-center font-bold leading-relaxed lg:leading-relaxed'>Welcome to <br /> <span className='  text-rose-800 uppercase font-extrabold'>{text}</span> <Cursor cursorColor='blue' /></h2>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='bg-[url(https://plus.unsplash.com/premium_photo-1683309565422-77818a287060?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)] h-[350px] lg:h-[550px] lg:bg-no-repeat bg-cover rounded-2xl flex justify-center items-center '>
                        <h2 className=' text-white text-4xl  lg:text-7xl leading-relaxed lg:leading-relaxed text-center font-bold'>Connect Together</h2>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='bg-[url(https://plus.unsplash.com/premium_photo-1681825268400-c561bd47d586?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)] h-[350px] lg:h-[550px] lg:bg-no-repeat bg-cover rounded-2xl flex justify-center items-center '>
                        <h2 className=' text-white text-4xl  lg:text-7xl leading-relaxed lg:leading-relaxed font-poppins text-center font-bold'>With<br /> <span className='animate__animated animate__fadeInDown animate__delay-1s  text-rose-800 uppercase font-extrabold'> Like minded people</span> </h2>
                    </div>
                </SwiperSlide>
                
            </Swiper>
        </div>
    );
};

export default Slider;