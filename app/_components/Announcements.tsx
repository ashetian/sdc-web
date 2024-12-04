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
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Announcements
          </h1>
          <p className="text-xl text-gray-600">
            Stay informed about the latest news and events
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {announcements.map((announcement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full" />
              
              <div className="flex items-center text-gray-500 mb-4">
                <CalendarIcon className="w-5 h-5 mr-2" />
                <span>{formatDate(announcement.date)}</span>
              </div>

              <h3 className="text-2xl font-bold mb-3 text-gray-800">
                {announcement.title}
              </h3>

              <p className="text-gray-600 mb-6">
                {announcement.description}
              </p>

              <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                <span className="font-medium">View details</span>
                <ChevronRightIcon className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}