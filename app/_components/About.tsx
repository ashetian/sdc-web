"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "../_context/LanguageContext";

interface Department {
  _id: string;
  name: string;
  nameEn?: string;
  slug: string;
  description: string;
  descriptionEn?: string;
  icon: string;
  color: string;
  order: number;
}

interface TeamMember {
  _id: string;
  name: string;
  email?: string;
  photo?: string;
  role: string;
  departmentId?: { _id: string; name: string };
  title: string;
  description?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  clipboard: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  code: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  camera: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  briefcase: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

// Fallback departments
const fallbackDepartments = [
  { _id: '1', name: "Proje Departmanı", nameEn: "Project Department", slug: 'proje', description: "Kulüp etkinlikleri ve yazılım projeleri için fikir üretip planlama, görev dağıtımı ve teknik gereksinimleri belirleme sürecini yürütür.", descriptionEn: "Handles ideation, planning, task distribution and technical requirements for club activities and software projects.", icon: "clipboard", color: "bg-neo-blue", order: 0 },
  { _id: '2', name: "Teknik Departman", nameEn: "Technical Department", slug: 'teknik', description: "Yazılım geliştirme, proje geliştirme, altyapı, web sitesi, otomasyon ve teknik sorun çözme gibi tüm teknik uygulamaları gerçekleştirir.", descriptionEn: "Executes all technical implementations including software development, infrastructure, website, automation and troubleshooting.", icon: "code", color: "bg-neo-green", order: 1 },
  { _id: '3', name: "Medya Departmanı", nameEn: "Media Department", slug: 'medya', description: "Etkinlik duyuruları, sosyal medya yönetimi, tasarım, afiş-video içerikleri ve kulübün dış iletişim görünürlüğünü sağlar.", descriptionEn: "Manages event announcements, social media, design, poster-video content and the club's external communication visibility.", icon: "camera", color: "bg-neo-purple", order: 2 },
  { _id: '4', name: "Kurumsal İletişim Departmanı", nameEn: "Corporate Relations", slug: 'kurumsal', description: "Şirketlerle iletişim kurarak iş birlikleri, maddi-manevi destekler ve sponsorluk anlaşmalarını organize eder.", descriptionEn: "Establishes connections with companies, organizing collaborations, support and sponsorship agreements.", icon: "briefcase", color: "bg-neo-pink", order: 3 },
];

export default function About() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [deptMembers, setDeptMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { language, t } = useLanguage();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch('/api/departments');
        if (res.ok) {
          const data = await res.json();
          setDepartments(data.length > 0 ? data : fallbackDepartments);
        } else {
          setDepartments(fallbackDepartments);
        }
      } catch {
        setDepartments(fallbackDepartments);
      }
    };
    fetchDepartments();
  }, []);

  const handleDeptClick = async (dept: Department) => {
    setSelectedDept(dept);
    setLoading(true);
    try {
      const res = await fetch(`/api/team?departmentId=${dept._id}`);
      if (res.ok) {
        const data = await res.json();
        // Sort: head first, then by order
        const sorted = data.sort((a: TeamMember, b: TeamMember) => {
          if (a.role === 'head' && b.role !== 'head') return -1;
          if (a.role !== 'head' && b.role === 'head') return 1;
          return 0;
        });
        setDeptMembers(sorted);
      }
    } catch (error) {
      console.error('Departman üyeleri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedDept(null);
    setDeptMembers([]);
  };

  const handleJoinClick = () => {
    window.location.href = "/apply";
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-20 bg-white border-b-4 border-black"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 ref={titleRef} className="inline-block text-4xl sm:text-5xl font-black text-black mb-6 bg-neo-yellow border-4 border-black shadow-neo px-6 py-2 transform -rotate-1">
            {t('about.title')}
          </h2>
          <p className="text-xl font-bold text-black max-w-3xl mx-auto mt-4 border-2 border-black p-4 bg-gray-100 shadow-neo-sm">
            {language === 'tr'
              ? 'Karadeniz Teknik Üniversitesi Yazılım Geliştirme Kulübü, yazılım dünyasında kendini geliştirmek isteyen öğrenciler için yalnızca bir öğrenme alanı değil; gerçek hayat iş süreçlerini, ekip çalışmasını ve proje geliştirme kültürünü deneyimleyebilecekleri bir profesyonel simülasyon ortamıdır.'
              : 'Karadeniz Technical University Software Development Club is not just a learning space for students who want to improve themselves in the software world; it is a professional simulation environment where they can experience real-life business processes, teamwork and project development culture.'}
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {departments.map((dept, index) => (
            <div
              key={dept._id || index}
              onClick={() => handleDeptClick(dept)}
              className={`feature-card group ${dept.color} border-4 border-black shadow-neo p-6 
                        transform transition-all duration-200 hover:-translate-y-2 hover:shadow-neo-lg cursor-pointer`}
            >
              <div className="mb-4 bg-white border-2 border-black w-16 h-16 flex items-center justify-center rounded-none shadow-neo-sm">
                {iconMap[dept.icon] || iconMap.code}
              </div>
              <h3 className="text-xl font-black text-black mb-3 uppercase">
                {language === 'en' && dept.nameEn ? dept.nameEn : dept.name}
              </h3>
              <p className="text-black font-medium border-t-2 border-black pt-2">
                {language === 'en' && dept.descriptionEn ? dept.descriptionEn : dept.description}
              </p>
              <div className="mt-4 text-sm font-black text-black/60 group-hover:text-black transition-colors">
                {language === 'tr' ? 'Tıkla → Ekibi Gör' : 'Click → See Team'}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-32 text-center">
          <button
            onClick={handleJoinClick}
            className="inline-flex items-center px-8 py-4 bg-black text-white border-4 border-transparent 
                     text-lg font-bold hover:bg-white hover:text-black hover:border-black hover:shadow-neo 
                     transition-all duration-200"
          >
            {language === 'tr' ? 'Ekibimize Katılın' : 'Join Our Team'}
            <svg
              className="ml-2 -mr-1 w-5 h-5"
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

      {/* Department Members Modal */}
      {selectedDept && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white border-4 border-black shadow-neo-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`${selectedDept.color} p-6 border-b-4 border-black flex justify-between items-center`}>
              <div>
                <h3 className="text-2xl font-black text-black uppercase">{language === 'en' && selectedDept.nameEn ? selectedDept.nameEn : selectedDept.name}</h3>
                <p className="text-black font-medium mt-1">{language === 'en' && selectedDept.descriptionEn ? selectedDept.descriptionEn : selectedDept.description}</p>
              </div>
              <button
                onClick={closeModal}
                className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center text-2xl font-black hover:bg-black hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-xl font-bold animate-pulse">{language === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
                </div>
              ) : deptMembers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl font-bold text-gray-500">{language === 'tr' ? 'Bu departmanda henüz üye bulunmuyor.' : 'No members in this department yet.'}</p>
                  <p className="text-gray-400 mt-2">{language === 'tr' ? 'Departman yöneticileri yakında eklenecek.' : 'Department managers will be added soon.'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {deptMembers.map((member) => (
                    <div
                      key={member._id}
                      className={`border-4 border-black p-4 ${member.role === 'head' ? 'bg-neo-yellow shadow-neo' : 'bg-white'}`}
                    >
                      {/* Photo */}
                      <div className="relative w-24 h-24 mx-auto mb-4 border-4 border-black bg-gray-100">
                        {member.photo ? (
                          <Image src={member.photo} alt={member.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl font-black">
                            {member.name[0]}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="text-center">
                        <h4 className="text-lg font-black text-black">{member.name}</h4>
                        <p className="text-sm font-bold text-gray-600">{member.title}</p>
                        {member.role === 'head' && (
                          <span className="inline-block mt-2 px-3 py-1 bg-black text-white text-xs font-black">
                            {language === 'tr' ? 'DEPARTMAN BAŞKANI' : 'DEPARTMENT HEAD'}
                          </span>
                        )}

                        {/* Social Links */}
                        {(member.github || member.linkedin || member.instagram) && (
                          <div className="flex justify-center gap-3 mt-4">
                            {member.github && (
                              <a href={member.github} target="_blank" rel="noopener noreferrer"
                                className="w-8 h-8 bg-black text-white flex items-center justify-center hover:bg-gray-700 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                              </a>
                            )}
                            {member.linkedin && (
                              <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                                className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                              </a>
                            )}
                            {member.instagram && (
                              <a href={member.instagram} target="_blank" rel="noopener noreferrer"
                                className="w-8 h-8 bg-pink-500 text-white flex items-center justify-center hover:bg-pink-600 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
