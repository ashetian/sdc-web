'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };
  return (
    <section 
      className="min-h-screen relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/background.jpg")' }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-800/70 to-gray-900/70"></div>
      
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
            className="text-7xl font-bold mb-8"
          >
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              KTU Software Development Club
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl mb-12 text-gray-300"
          >
            Pioneers of technology and innovation, future software developers are trained here.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="space-x-6"
          >
           <button 
              onClick={() => scrollToSection('about')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-full hover:opacity-90 transition duration-300 inline-block"
            >
              About Us
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-full hover:bg-white hover:text-gray-900 transition duration-300 inline-block"
            >
              Contact
            </button>
          </motion.div>

          
        </motion.div>
      </div>
    </section>
  );
}