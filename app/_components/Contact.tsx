'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { MdEmail, MdLocationOn, MdPhone } from 'react-icons/md';

export default function Contact() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Contact
            </h1>
            <p className="text-xl text-gray-600">
              You can contact us for your questions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-4 mb-6">
                  <MdLocationOn className="text-3xl text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Address</h3>
                    <p className="text-gray-600">Karadeniz Teknik Üniversitesi, Fen Fakültesi, Yazılım Geliştirme Bölümü, 61080, Ortahisar, TRABZON</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <MdEmail className="text-3xl text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Email</h3>
                    <p className="text-gray-600">info@xxxx.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <MdPhone className="text-3xl text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Telephone</h3>
                    <p className="text-gray-600">+90 XXX XXX XX XX</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <form className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="name">
                    Name
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    type="text"
                    id="name"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    type="email"
                    id="email"
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all h-32 resize-none"
                    id="message"
                    placeholder="Write your message"
                  />
                </div>

                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
                  Send
                </button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}