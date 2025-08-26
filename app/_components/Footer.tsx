import React from "react";
// import { FaWhatsapp } from 'react-icons/fa';
// import { BsLinkedin } from "react-icons/bs";
// import { FaXTwitter, FaInstagram } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-6 relative z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className=" m-2 flex flex-col">
          <p className="text-left opacity-60 font-bold">
            &copy; {new Date().getFullYear()} KTUSDC. All rights reserved.
          </p>
          <span className="text-xs opacity-40 mt-1">Developed by Cihan</span>
          <span className="text-xs opacity-40 mt-1">
            I know its just a couple commits but where am i 🥺🥺? -ashetian_
          </span>
        </div>
        {
          //*no need to add socials twice imo
          /* <div className="flex space-x-6">
          <a href="https://x.com/ktusdc" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400">
            <FaXTwitter size={24} />
          </a>
          <a href="https://www.instagram.com/ktu.sdc" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400">
            <FaInstagram size={24} />
          </a>
          <a href="https://chat.whatsapp.com/FH8knELNs0E5ZMd7XxH5YB" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400">
            <FaWhatsapp size={24} />
          </a>
          <a href="https://www.linkedin.com/company/ktusdc/about/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400">
            <BsLinkedin size={24} />
          </a>
        </div> */
        }
      </div>
    </footer>
  );
}
