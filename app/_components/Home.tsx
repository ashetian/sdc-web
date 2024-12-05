'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { Link as ScrollLink } from 'react-scroll';

export default function Home() {
  return (
    <section 
      className="min-h-screen relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/background.jpg")' }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/50 to-gray-900/50"></div>
      
      <div className="container mx-auto px-4 h-screen flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl"
        >
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-8"
          >
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              KTU Software Development Club
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl mb-12 text-gray-300"
          >
            Pioneers of technology and innovation, future software developers are trained here.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <ScrollLink
              to="about"
              smooth={true}
              duration={500}
              offset={-100}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-full hover:opacity-90 transition duration-300 inline-block cursor-pointer"
            >
              About
            </ScrollLink>
            <ScrollLink
              to="contact"
              smooth={true}
              duration={500}
              offset={-100}
              className="bg-transparent border-2 border-white text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-full hover:bg-white hover:text-gray-900 transition duration-300 inline-block mt-4 sm:mt-0 cursor-pointer"
            >
              Contact
            </ScrollLink>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}