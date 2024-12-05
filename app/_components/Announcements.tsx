'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const announcements = [
  {
    title: 'Başlık1',
    date: '2023-11-01',
    description: 'Zing zung.',
  },
  {
    title: 'Başlık2',
    date: '2023-12-15',
    description: 'Zang Zing.',
  },
  {
    title: 'Başlık3',
    date: '2024-01-10',
    description: 'Zung Zang',
  },
];

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function Announcements() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
             Announcements
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
             Stay informed about the latest news and events
            </p>
          </div>

          <div className="grid gap-6">
            {announcements.map((announcement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div className="mb-4 sm:mb-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                      {announcement.title}
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {announcement.description}
                    </p>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm sm:text-base">
                    <CalendarIcon className="w-5 h-5 mr-2" />
                    <span>{formatDate(announcement.date)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}