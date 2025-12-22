
const Comment = ({ cmnt }) => {
    const { comment, email, name, image, time, _id } = cmnt;
    return (
        <div>
            <div className="card  bg-base-100 shadow-xl">
                <div className="card-body space-y-4">
                    <div className="flex justify-center gap-3">
                        <div className="avatar">
                            <div className="w-10 rounded-full">
                                <img src={image} />
                            </div>
                        </div>
                        <h4 className="text-xl font-medium">{name} said:</h4>
                    </div>

                    <h2 className="text-2xl font-bold">{comment}</h2>
                    <p className="opacity-80 ">at: {time}</p>
                </div>
            </div>
        </div>
    );
};

export default Comment;