import React, { useState, useEffect } from 'react';
import { buyCourse } from '../services/operations/studentFeaturesAPI';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCourseDetails } from '../services/operations/courseDetailsAPI';
import { toast } from 'react-hot-toast';
import RatingStars from '../Components/common/RatingStars';
import GetAvgRating from '../utils/avgRating';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { BsGlobe } from 'react-icons/bs';
import { FaShareSquare, FaChevronDown } from 'react-icons/fa';
import { IoVideocamOutline } from 'react-icons/io5';
import { addToCart } from '../slices/cartSlice';
import { ACCOUNT_TYPE } from '../utils/constants';

const CourseDetails = () => {
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);
    const { cart } = useSelector((state) => state.cart);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { courseId } = useParams();
    const [courseDetail, setCourseDetail] = useState(null);
    const [avgReviewCount, setAvgReviewCount] = useState(0);
    const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);

    // Handle payment action
    const handlePayment = () => {
        if (token) {
            buyCourse(token, [courseId], user, navigate, dispatch)
                .then(() => {
                    toast.success('Course enrolled successfully!');
                    setAlreadyEnrolled(true);  // Set this to true after successful enrollment
                })
                .catch((error) => {
                    console.error("Error during payment:", error);
                    // toast.error('Something went wrong. Please try again.');
                });
        } else {
            navigate('/login');
        }
    };

    // Fetch course details
    useEffect(() => {
        const getCourseDetails = async () => {
            const response = await fetchCourseDetails(courseId, dispatch);
            if (response) {
                setCourseDetail(response);
            }
        };
        getCourseDetails();
    }, [courseId]);

    // Calculate average review count
    useEffect(() => {
        if (courseDetail?.ratingAndReviews?.length > 0) {
            const count = GetAvgRating(courseDetail?.ratingAndReviews);
            setAvgReviewCount(count);
        }
    }, [courseDetail?.ratingAndReviews]);

    // Add course to cart
    const handleAddToCart = () => {
        if (token) {
            dispatch(addToCart(courseDetail));
            toast.success('Course added to cart');
        } else {
            navigate('/login');
        }
    };

    // Check if user is already enrolled in the course
    useEffect(() => {
        if (courseDetail && user) {
            const isEnrolled = courseDetail?.studentsEnrolled?.includes(user?._id);
            setAlreadyEnrolled(isEnrolled);
        }
    }, [courseDetail, user]);

    // Loading state when course details are being fetched
    if (!courseDetail) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <div className='custom-loader'></div>
            </div>
        );
    }

    return (
        <div>
            <div className='mx-auto box-content px-4 lg:w-[1260px] lg:relative'>
                <div className='mx-auto grid min-h-[450px] max-w-maxContentTab justify-items-center py-8 lg:mx-0 lg:justify-items-start lg:py-0 xl:max-w-[810px]'>
                    <div className='relative block max-h-[30rem] lg:hidden'>
                        <div className='absolute bottom-0 left-0 h-full w-full shadow-[#161D29_0px_-64px_36px_-28px_inset]'></div>
                        <img src={courseDetail?.thumbnail} alt="course img" />
                    </div>
                    <div className='z-30 my-5 flex flex-col justify-center gap-4 py-5 text-lg text-richblack-5'>
                        <p className='text-4xl font-bold text-richblack-5 sm:text-[42px]'>
                            {courseDetail?.courseName}
                        </p>
                        <p className='text-richblack-200'>{courseDetail?.courseDescription}</p>
                        <div className='flex gap-x-3 items-center'>
                            <span className='text-yellow-50'>{avgReviewCount || 0}</span>
                            <RatingStars Review_Count={avgReviewCount} />
                            <span className='md:block hidden md:text-xl text-richblack-5'>
                                ({courseDetail?.ratingAndReviews?.length} Reviews)
                            </span>
                            <span className='text-richblack-200'>
                                {courseDetail?.studentsEnrolled?.length} students enrolled
                            </span>
                        </div>
                        <div>
                            <p>Created By {courseDetail?.instructor?.firstName} {courseDetail?.instructor?.lastName}</p>
                        </div>
                        <div className='flex flex-wrap gap-5 text-lg'>
                            <AiOutlineInfoCircle className='text-2xl text-richblack-5' />
                            <p className='text-richblack-50'>Created at &nbsp;
                                {new Date(courseDetail?.createdAt || courseDetail?.updatedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                            <p className='flex items-center gap-2 text-richblack-50'>
                                <BsGlobe className='text-lg text-richblack-50' /> English
                            </p>
                        </div>
                    </div>

                    <div className='flex w-full flex-col gap-4 border-y border-y-richblack-500 py-4 lg:hidden'>
                        <p className='space-x-3 pb-4 text-3xl font-semibold text-richblack-5'>
                            <span>₹{courseDetail?.price}</span>
                        </p>
                        {ACCOUNT_TYPE.INSTRUCTOR !== user?.accountType && (
                            <>
                                {alreadyEnrolled ? (
                                    <button onClick={() => navigate("/dashboard/enrolled-courses")} className='yellowButton'>
                                        Go to Course
                                    </button>
                                ) : (
                                    <button onClick={handlePayment} className='yellowButton'>
                                        Buy Now
                                    </button>
                                )}
                                {alreadyEnrolled ? null : (
                                    cart?.find((item) => item?._id === courseDetail?._id) ? (
                                        <button onClick={() => navigate("/dashboard/cart")} className='blackButton text-richblack-5'>
                                            Go to Cart
                                        </button>
                                    ) : (
                                        <button onClick={handleAddToCart} className='blackButton text-richblack-5'>
                                            Add to Cart
                                        </button>
                                    )
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Right panel for larger screens */}
                <div className='right-[1rem] top-[60px] mx-auto hidden min-h-[600px] w-1/3 max-w-[410px] translate-y-24 md:translate-y-0 lg:absolute lg:block'>
                    <div className='flex flex-col gap-4 rounded-md bg-richblack-700 p-4 text-richblack-5'>
                        <img src={courseDetail?.thumbnail} alt="course img" className='max-h-[300px] min-h-[180px] w-[400px] overflow-hidden rounded-2xl object-cover md:max-w-full' />
                        <div className='px-4'>
                            <div className='space-x-3 pb-4 text-3xl font-semibold'>
                                <span>₹{courseDetail?.price}</span>
                            </div>
                            <div className='flex flex-col gap-4'>
                                {ACCOUNT_TYPE.INSTRUCTOR !== user?.accountType && (
                                    <>
                                        {alreadyEnrolled ? (
                                            <button onClick={() => navigate("/dashboard/enrolled-courses")} className='yellowButton'>
                                                Go to Course
                                            </button>
                                        ) : (
                                            <button onClick={handlePayment} className='yellowButton'>
                                                Buy Now
                                            </button>
                                        )}
                                        {alreadyEnrolled ? null : (
                                            cart?.find((item) => item._id === courseDetail._id) ? (
                                                <button onClick={() => navigate("/dashboard/cart")} className='blackButton text-richblack-5'>
                                                    Go to Cart
                                                </button>
                                            ) : (
                                                <button onClick={handleAddToCart} className='blackButton text-richblack-5'>
                                                    Add to Cart
                                                </button>
                                            )
                                        )}
                                    </>
                                )}
                            </div>
                            <div className='pb-3 pt-6 text-center text-sm text-richblack-25'>
                                <p>30-Day Money-Back Guarantee</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course content */}
            <div className='mx-auto box-content px-4 text-start text-richblack-5 lg:w-[1260px]'>
                <div className='mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]'>
                    <div className='my-8 border border-richblack-600 p-8'>
                        <p className='text-3xl font-semibold'>
                            What you'll learn
                        </p>
                        <div className='mt-5'>
                            {courseDetail?.whatYouWillLearn}
                        </div>
                    </div>
                    <div className='max-w-[830px]'>
                        <div className='flex flex-col gap-3'>
                            <p className='text-[28px] font-semibold'>Course Content</p>
                            <div className='flex flex-wrap justify-between gap-5'>
                                {courseDetail?.courseContent?.map((section, index) => (
                                    <div key={index} className='w-full lg:w-1/2'>
                                        <div className='pb-3'>
                                            <div className='flex items-center gap-3'>
                                                <IoVideocamOutline />
                                                <p className='text-lg font-semibold text-richblack-200'>{section?.title}</p>
                                            </div>
                                            <p className='text-sm text-richblack-400'>{section?.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
