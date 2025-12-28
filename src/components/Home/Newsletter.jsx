import { useForm } from "react-hook-form";
import Swal from "sweetalert2";


const Newsletter = () => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        const { email } = data;
        if (email) {
            Swal.fire({
                title: 'Thanks!',
                text: 'Thank you for subscribing to our newsletter',
                icon: 'success',
                confirmButtonText: 'OK'
            })
        }
        else {
            Swal.fire({
                title: 'Error!',
                text: "Enter Correct Email",
                icon: 'error',
                confirmButtonText: 'OK'
            })
        }
    }


    return (
        <div className="mt-8 flex gap-4 flex-col lg:flex-row justify-around items-center">
            <div className='space-y-4 my-10 lg:my-12 text-center  w-full '>
                <h2 className='text-2xl lg:text-4xl font-bold'>Subscribe to our NewsLetter</h2>
                <p className="text-lg opacity-90">Together, we're building something truly special.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="join flex justify-center  w-full">
                <input {...register('email')} className="input w-3/4 input-bordered join-item" placeholder="Email" />
                <button className="btn bg-emerald-800 text-white w-1/4 join-item rounded-r-full">Subscribe</button>
            </form>
        </div>
    );
};

export default Newsletter;