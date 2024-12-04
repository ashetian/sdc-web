import React from 'react';

const announcements = [
  {
    title: 'Başlık4',
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
  // Diğer duyurular
];

export default function Announcements() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <div className="container mx-auto text-center py-20">
        <h1 className="text-4xl font-bold mb-6">Announcements</h1>
        <p className="text-lg mb-12">
          Stay updated with the latest news and events.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {announcements.map((announcement, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-2">{announcement.title}</h2>
              <p className="text-gray-600 mb-4">{announcement.date}</p>
              <p className="text-gray-800">{announcement.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}