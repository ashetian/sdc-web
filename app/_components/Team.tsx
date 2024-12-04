import React from 'react';

const teamMembers = [
  {
    name: 'Cihan Bayram',
    role: 'Role',
    image: '/sdclogo.jpg',
  },
  {
    name: 'Caner Gorez',
    role: 'Role',
    image: '/sdclogo.jpg',
  },
  {
    name: 'Tunahan Akargül',
    role: 'Role',
    image: '/sdclogo.jpg',
  },
  
];

export default function Teams() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <div className="container mx-auto text-center py-20">
        <h1 className="text-4xl font-bold mb-6">Our Team</h1>
        <p className="text-lg mb-12">
          Meet the talented individuals behind our success.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
              <img
                src={member.image}
                alt={member.name}
                className="w-32 h-32 rounded-full mx-auto mb-4"
              />
              <h2 className="text-xl font-bold mb-2">{member.name}</h2>
              <p className="text-gray-600">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}