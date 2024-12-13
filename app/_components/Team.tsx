'use client';
import { useEffect, useRef, useState } from 'react';
import TeamCard from './TeamCard';

interface TeamMember {
  name: string;
  role: string;
  email: string;
  description: string;
  image: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  x?: string;
  instagram?: string;
}

export default function Team() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const teamMembers: TeamMember[] = [
    {
      name: "Cihan Bayram",
      role: "Developer",
      email: "cihanbayram@gmail.com",
      image: "/sdclogo.jpg",
      linkedin: "#",
      description: '31 cihan 31',
      github: "https://github.com/C1H4N",
      x: "31",
      instagram: "https://www.instagram.com/c1h4n/"

    },
    {
      name: "Caner Görez",
      role: "Developer",
      description: 'merhaba ben caner karadeniz teknik üniversitesinde okuyorum ve web geliştirmeyle ilgileniyorum.',
      email: "caner19741@outlook.com",
      image: "/sdclogo.jpg",
      linkedin: "#",
      github: "https://github.com/ashetian",
      instagram: "#",
      x: "31",
    },
    // Diğer takım üyelerini buraya ekleyin
  ];

  return (
    <section
      ref={sectionRef}
      id="team"
      className="relative py-20 bg-gradient-to-b from-secondary-800 to-secondary-900 overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-secondary-900 opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 via-transparent to-secondary-900/50" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ekibimiz
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-16">
            Yazılım tutkusuyla bir araya gelmiş, yenilikçi ve dinamik ekibimizle tanışın.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <TeamCard
                id={index}
                key={index}
                name={member.name}
                role={member.role}
                description={member.description}
                image={member.image}
                x = {member.x}
                instagram={member.instagram}
                github={member.github}
                email={member.email}
                linkedin={member.linkedin}
              ></TeamCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}