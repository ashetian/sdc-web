import React from 'react';

export default function Home() {
  return (
    <section
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      <div className="container mx-auto text-center py-20 bg-black bg-opacity-50 rounded-lg">
        <h1 className="text-5xl font-bold mb-6">Welcome to KTU SDC</h1>
        <p className="text-xl mb-12">We are a community of developers.</p>
        <a href="#about" className="bg-white text-gray-800 font-bold py-3 px-6 rounded-full hover:bg-gray-200 transition duration-300">
          Learn More
        </a>
      </div>
    </section>
  );
}