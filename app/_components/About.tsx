'use client';
import { useEffect, useRef, useState } from 'react';

export default function About() {
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

  const features = [
    {
      title: 'Eğitim ve Gelişim',
      description: 'Modern yazılım teknolojileri ve metodolojileri üzerine düzenli eğitimler',
      icon: '🎓'
    },
    {
      title: 'Proje Deneyimi',
      description: 'Gerçek dünya projelerinde pratik deneyim kazanma fırsatı',
      icon: '💻'
    },
    {
      title: 'Networking',
      description: 'Sektör profesyonelleri ve diğer öğrencilerle networking imkanı',
      icon: '🤝'
    },
    {
      title: 'Kariyer Fırsatları',
      description: 'Staj ve iş fırsatları için sektör bağlantıları',
      icon: '🚀'
    }
  ];

  const handleContactClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-20 bg-gradient-to-b from-secondary-900 to-secondary-800 overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-secondary-900 opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-900/50" />
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
            Hakkımızda
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-16">
            KTÜ Software Development Club, yazılım dünyasında kendini geliştirmek isteyen
            öğrenciler için bir öğrenme ve gelişim platformudur.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group bg-secondary-800/50 backdrop-blur-sm p-6 rounded-xl 
                          transform transition-all duration-500 hover:scale-105 hover:bg-secondary-700/50
                          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl mb-4 transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className={`mt-16 transform transition-all duration-1000 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <button
              onClick={handleContactClick}
              className="inline-flex items-center px-8 py-3 border border-transparent 
                       text-base font-medium rounded-full text-white bg-primary-600 
                       hover:bg-primary-700 transition-all duration-300
                       hover:scale-105 hover:shadow-lg hover:shadow-primary-500/25"
            >
              Bize Katılın
              <svg
                className="ml-2 -mr-1 w-5 h-5 transform transition-transform group-hover:translate-x-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}