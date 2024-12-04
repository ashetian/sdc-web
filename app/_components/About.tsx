import React from 'react';

export default function About() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <div className="container mx-auto text-center py-20">
        <h1 className="text-4xl font-bold mb-6">About Us</h1>
        <p className="text-lg mb-12">
          We are the KTU Software Development Club, a community of developers and designers dedicated to learning, sharing, and growing together. Our mission is to foster a collaborative environment where members can enhance their skills, work on exciting projects, and connect with like-minded individuals.
        </p>
        <p className="text-lg mb-12">
          Join us to participate in workshops, hackathons, and networking events. Whether you are a beginner or an experienced developer, there is a place for you in our community.
        </p>
      </div>
    </section>
  );
}