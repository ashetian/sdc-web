import React from 'react';

export default function Contact() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <div className="container mx-auto text-center py-20">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <p className="text-lg mb-12">
          If you have any questions or would like to get in touch, please fill out the form below.
        </p>
        <form className="w-full max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              type="text"
              id="name"
              placeholder="Your Name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              type="email"
              id="email"
              placeholder="Your Email"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
              Message
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              id="message"
              rows={5}
              placeholder="Your Message"
            ></textarea>
          </div>
          <button
            className="w-full bg-purple-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-600 transition duration-300"
            type="submit"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}