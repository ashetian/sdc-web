'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About
          </h1>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <p className="text-xl text-gray-700 leading-relaxed">
                We are the KTU Software Development Club, a vibrant community of innovators, developers, and designers passionate about technology and creative solutions.
              </p>
              <p className="text-xl text-gray-700 leading-relaxed">
                Our mission is to cultivate an environment where technology enthusiasts can thrive, collaborate, and transform their ideas into reality.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-4xl font-bold text-blue-600 mb-2">25+</h3>
                <p className="text-gray-600">Active Members</p>
              </div>
              <div className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-4xl font-bold text-purple-600 mb-2">2</h3>
                <p className="text-gray-600">Projects Completed</p>
              </div>
              <div className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-4xl font-bold text-blue-600 mb-2">2</h3>
                <p className="text-gray-600">Monthly Events</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Join Our Community</h2>
            <p className="text-lg text-gray-700">
              Whether you&aposre a beginner taking your first steps in coding or an experienced developer looking to share your knowledge, our doors are open. Participate in workshops, hackathons, and networking events to grow your skills and expand your professional network.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}