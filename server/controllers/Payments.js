const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const { paymentSuccess } = require("../mail/templates/paymentSuccess");
const { default: mongoose } = require("mongoose");
const CourseProgress = require("../models/CourseProgress");

// Capture payment and automatically enroll user in courses (dummy transaction)
exports.capturePayment = async (req, res) => {
    const { courses } = req.body;
    const userId = req.user.id;

    if (courses.length === 0) {
        return res.json({
            success: false,
            message: 'Please provide valid course IDs',
        });
    }

    let totalAmount = 0;

    // Calculate total amount for selected courses
    for (const course_id of courses) {
        let course;
        try {
            course = await Course.findById(course_id);
            if (!course) {
                return res.json({
                    success: false,
                    message: 'Could not find the course',
                });
            }

            const uid = new mongoose.Types.ObjectId(userId);
            if (course.studentsEnrolled.includes(uid)) {
                return res.status(200).json({
                    success: false,
                    message: 'Student is already enrolled',
                });
            }

            totalAmount += course.price;
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Simulate a successful payment and proceed with enrollment (no actual payment verification needed)
    try {
        await enrollUserInCourses(courses, userId);

        // Return response and include redirect URL
        return res.status(200).json({
            success: true,
            message: 'Payment successful (dummy transaction)',
            redirectTo: '/enrollment-success',  // Redirect to a success page or any URL
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Handle user enrollment in courses
const enrollUserInCourses = async (courses, userId) => {
    try {
        for (const course_id of courses) {
            const course = await Course.findByIdAndUpdate(
                course_id,
                { $push: { studentsEnrolled: userId } },
                { new: true }
            );

            await User.updateOne(
                { _id: userId },
                { $push: { courses: course_id } },
                { new: true }
            );

            const newCourseProgress = new CourseProgress({
                userID: userId,
                courseID: course_id,
            });
            await newCourseProgress.save();

            await User.findByIdAndUpdate(
                userId,
                { $push: { courseProgress: newCourseProgress._id } },
                { new: true }
            );

            const recipient = await User.findById(userId);
            const courseName = course.courseName;
            const courseDescription = course.courseDescription;
            const thumbnail = course.thumbnail;
            const userEmail = recipient.email;
            const userName = `${recipient.firstName} ${recipient.lastName}`;
            const emailTemplate = courseEnrollmentEmail(courseName, userName, courseDescription, thumbnail);

            await mailSender(
                userEmail,
                `You have successfully enrolled for ${courseName}`,
                emailTemplate,
            );
        }
        return { success: true, message: 'User successfully enrolled in courses' };
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
};

// Handle payment verification (no actual signature verification needed)
exports.verifySignature = async (req, res) => {
    const { courses } = req.body;
    const userId = req.user.id;

    if (!courses || !userId) {
        return res.status(400).json({
            success: false,
            message: 'Please provide valid courses and user ID',
        });
    }

    try {
        // Enroll user in the courses directly without payment verification
        await enrollUserInCourses(courses, userId);

        // Return response and include redirect URL
        return res.status(200).json({
            success: true,
            message: 'Payment signature verified (dummy transaction) and user enrolled',
            redirectTo: '/enrollment-success',  // Redirect to a success page or any URL
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Send email on payment success (dummy)
exports.sendPaymentSuccessEmail = async (req, res) => {
    const { amount, paymentId, orderId } = req.body;
    const userId = req.user.id;

    if (!amount || !paymentId) {
        return res.status(400).json({
            success: false,
            message: 'Please provide valid payment details',
        });
    }

    try {
        const enrolledStudent = await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            `Study Notion Payment successful`,
            paymentSuccess(amount / 100, paymentId, orderId, enrolledStudent.firstName, enrolledStudent.lastName),
        );
        return res.status(200).json({
            success: true,
            message: 'Payment success email sent',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
