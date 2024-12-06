// "use client";

// import { useEffect, useState } from "react";
// import { FaArrowUp } from "react-icons/fa6";

// const DEFAULT_BTN_CLS =
//   "fixed bottom-8 right-6 z-50 flex items-center rounded-full bg-gradient-to-r from-pink-500 to-violet-600 p-4 hover:text-xl transition-all duration-300 ease-out hidden";
// const SCROLL_THRESHOLD = 50;

// const ScrollToTop = () => {
//   const [btnCls, setBtnCls] = useState(DEFAULT_BTN_CLS);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > SCROLL_THRESHOLD) {
//         setBtnCls(DEFAULT_BTN_CLS.replace(" hidden", ""));
//       } else {
//         setBtnCls(DEFAULT_BTN_CLS + " hidden");
//       }
//     };
//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => {
//       window.removeEventListener("scroll", handleScroll, { passive: true });
//     };
//   }, []);

//   const onClickBtn = () => window.scrollTo({ top: 0, behavior: "smooth" });

//   return (
//     <button className={btnCls} onClick={onClickBtn}>
//       <FaArrowUp />
//     </button>
//   );
// };

// export default ScrollToTop;
//merge conflict
'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowUp } from 'react-icons/fa';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Scroll event listener
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowUp className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
