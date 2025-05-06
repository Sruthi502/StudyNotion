import React from "react";
import { Link } from "react-router-dom";

// Images
import Logo from "../../assets/Logo/Logo-Full-Light.png";

// Icons
import { FaFacebook, FaGoogle, FaTwitter, FaYoutube } from "react-icons/fa";

const BottomFooter = ["Privacy Policy", "Cookie Policy", "Terms"];

const Footer = () => {
  return (
    <div className="bg-richblack-800 py-6">
      <div className="flex justify-between items-center w-11/12 max-w-maxContent text-richblack-400 mx-auto">
        {/* Left Section - Logo and Company Info */}
        <div className="flex flex-col gap-3">
          <img src={Logo} alt="Company Logo" className="object-contain w-32" />
          
          <div className="flex gap-4">
            {["About", "Careers", "Affiliates"].map((ele, i) => (
              <Link
                key={i}
                to={ele.toLowerCase()}
                className="text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200"
              >
                {ele}
              </Link>
            ))}
          </div>
        </div>

     
        <div className="flex flex-col items-end">
          <h1 className="text-richblack-50 font-semibold text-[16px]">Follow Us</h1>
          <div className="flex gap-3 text-lg mt-2">
            <FaFacebook className="cursor-pointer hover:text-richblack-50" />
            <FaGoogle className="cursor-pointer hover:text-richblack-50" />
            <FaTwitter className="cursor-pointer hover:text-richblack-50" />
            <FaYoutube className="cursor-pointer hover:text-richblack-50" />
          </div>
        </div>
      </div>

     
    </div>
  );
};

export default Footer;
