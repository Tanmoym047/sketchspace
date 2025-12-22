import React from 'react';
import Slider from './Slider';

import Newsletter from './Newsletter';
import RecentBlogs from './RecentBlogs/RecentBlogs';

const Home = () => {
    return (
        <div className='mt-6'>
            <title>SketchSpace | Home</title>
            <Slider></Slider>
            {/* <RecentBlogs></RecentBlogs> */}
            <Newsletter></Newsletter>
        </div>
    );
};

export default Home;