'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { FaLinkedin, FaGithub, FaTwitter } from 'react-icons/fa';

const teamMembers = [
  {
    name: 'Cihan Bayram',
    role: 'Role',
    image: '/sdclogo.jpg',
    socials: {
      linkedin: '#',
      github: '#',
      twitter: '#'
    }
  },
  {
    name: 'Caner Gorez',
    role: 'Role',
    image: '/sdclogo.jpg',
    socials: {
      linkedin: '#',
      github: '#',
      twitter: '#'
    }
  },
  {
    name: 'Tunahan Akargül',
    role: 'Role',
    image: '/sdclogo.jpg',
    socials: {
      linkedin: '#',
      github: '#',
      twitter: '#'
    }
  },
];

export default function Teams() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Team
            </h1>
            <p className="text-lg text-gray-600">
              Meet our talented team behind our success
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group w-full"
              >
                <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <div className="aspect-w-1 aspect-h-1">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm text-blue-600 font-medium mb-3">
                      {member.role}
                    </p>
                    
                    <div className="flex justify-center space-x-3">
                      <a href={member.socials.linkedin} className="text-gray-600 hover:text-blue-600 transition-colors">
                        <FaLinkedin className="w-5 h-5" />
                      </a>
                      <a href={member.socials.github} className="text-gray-600 hover:text-gray-900 transition-colors">
                        <FaGithub className="w-5 h-5" />
                      </a>
                      <a href={member.socials.twitter} className="text-gray-600 hover:text-blue-400 transition-colors">
                        <FaTwitter className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}