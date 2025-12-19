'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/app/_context/LanguageContext';
import { Users, Calendar, FolderOpen, FileText, TrendingUp, Mail, Building2, Award, Shield, Star, Printer, Globe, Instagram, Linkedin } from 'lucide-react';
import LoadingSpinner from '@/app/_components/LoadingSpinner';

interface TeamMemberData {
    _id: string;
    name: string;
    photo?: string;
    role: string;
    title: string;
    titleEn?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    departmentId?: {
        name: string;
        nameEn?: string;
        slug: string;
    };
    memberId?: {
        department?: string;
    };
}

interface FeaturedEventData {
    _id: string;
    title: string;
    titleEn?: string;
    galleryCover?: string;
    galleryLinks?: string[];
}

interface MediaKitPage {
    _id: string;
    title: string;
    titleEn?: string;
    events: FeaturedEventData[];
}

interface MediaKitData {
    sponsorName: string;
    defaultLanguage?: 'tr' | 'en';
    pageTitle?: string;
    pageTitleEn?: string;
    stats: {
        totalMembers: number;
        activeMembers: number;
        semesterEvents: number;
        totalRegistrations: number;
        semesterParticipants: number;
        activeProjects: number;
        totalAnnouncements: number;
    };
    currentSponsors: Array<{
        _id: string;
        name: string;
        nameEn?: string;
        logo: string;
    }>;
    boardMembers: TeamMemberData[];
    departmentHeads: TeamMemberData[];
    galleryImages: string[];
    pages: MediaKitPage[];
    generatedAt: string;
}

function MediaKitContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const { language, setLanguage } = useLanguage();

    const [data, setData] = useState<MediaKitData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError('no_token');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/media-kit/view/${token}`);
                const json = await res.json();

                if (!res.ok) {
                    setError(json.error || 'unknown');
                } else {
                    setData(json);
                    // Set language from token's defaultLanguage
                    if (json.defaultLanguage) {
                        setLanguage(json.defaultLanguage);
                    }
                }
            } catch (err) {
                setError('network');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        const errorMessages: Record<string, { tr: string; en: string }> = {
            no_token: { tr: 'Geçersiz link', en: 'Invalid link' },
            invalid_token: { tr: 'Bu link geçerli değil', en: 'This link is not valid' },
            token_inactive: { tr: 'Bu link devre dışı bırakılmış', en: 'This link has been deactivated' },
            token_expired: { tr: 'Bu linkin süresi dolmuş', en: 'This link has expired' },
            network: { tr: 'Bağlantı hatası', en: 'Connection error' },
            unknown: { tr: 'Bir hata oluştu', en: 'An error occurred' },
        };

        const msg = errorMessages[error] || errorMessages.unknown;

        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {language === 'tr' ? msg.tr : msg.en}
                    </h1>
                    <p className="text-gray-500">
                        {language === 'tr'
                            ? 'Lütfen size gönderilen linki kontrol edin.'
                            : 'Please check the link that was sent to you.'}
                    </p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const stats = [
        {
            label: language === 'tr' ? 'Aktif Üye' : 'Active Members',
            value: data.stats.activeMembers,
            icon: Users,
            color: 'bg-blue-500'
        },
        {
            label: language === 'tr' ? 'Bu Dönem Etkinlik' : 'Events This Semester',
            value: data.stats.semesterEvents,
            icon: Calendar,
            color: 'bg-green-500'
        },
        {
            label: language === 'tr' ? 'Toplam Katılımcı' : 'Total Participants',
            value: data.stats.totalRegistrations,
            icon: TrendingUp,
            color: 'bg-purple-500'
        },
        {
            label: language === 'tr' ? 'Aktif Proje' : 'Active Projects',
            value: data.stats.activeProjects,
            icon: FolderOpen,
            color: 'bg-orange-500'
        },
    ];

    const packages = [
        {
            name: language === 'tr' ? 'Platin Sponsor' : 'Platinum Sponsor',
            color: 'from-gray-700 to-gray-900',
            textColor: 'text-white',
            icon: Award,
            features: language === 'tr' ? [
                'Ana sayfada büyük logo',
                'Tüm etkinliklerde marka görünürlüğü',
                'Sosyal medya paylaşımları',
                'Etkinlik açılış konuşması hakkı',
                'Özel tanıtım videosu',
            ] : [
                'Large logo on homepage',
                'Brand visibility at all events',
                'Social media mentions',
                'Event opening speech rights',
                'Dedicated promotional video',
            ],
        },
        {
            name: language === 'tr' ? 'Altın Sponsor' : 'Gold Sponsor',
            color: 'from-yellow-500 to-yellow-600',
            textColor: 'text-black',
            icon: Star,
            features: language === 'tr' ? [
                'Ana sayfada orta boy logo',
                'Seçili etkinliklerde marka görünürlüğü',
                'Sosyal medya paylaşımları',
                'Kariyer günü katılım hakkı',
            ] : [
                'Medium logo on homepage',
                'Brand visibility at selected events',
                'Social media mentions',
                'Career day participation',
            ],
        },
        {
            name: language === 'tr' ? 'Gümüş Sponsor' : 'Silver Sponsor',
            color: 'from-gray-300 to-gray-400',
            textColor: 'text-gray-800',
            icon: Shield,
            features: language === 'tr' ? [
                'Sponsorlar bölümünde logo',
                'Web sitesinde teşekkür',
                'Etkinlik materyallerinde logo',
            ] : [
                'Logo in sponsors section',
                'Website acknowledgment',
                'Logo in event materials',
            ],
        },
    ];

    // Reusable Section Header Component
    const SectionHeader = ({ dark = false }: { dark?: boolean }) => (
        <div className="flex items-center justify-center gap-4 mb-8 print:mb-4">
            <Image
                src="/ktulogo.png"
                alt="KTÜ Logo"
                width={100}
                height={50}
                className="object-contain"
            />
            <span className={`text-lg font-semibold ${dark ? 'text-white' : 'text-gray-700'}`}>
                {language === 'tr' ? 'Yazılım Geliştirme Kulübü' : 'Software Development Club'}
            </span>
            <Image
                src="/sdclogo.png"
                alt="SDC Logo"
                width={50}
                height={50}
                className="object-contain"
            />
        </div>
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 print:bg-white">
            {/* Print Button - Fixed Position */}
            <button
                onClick={handlePrint}
                className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors print:hidden"
            >
                <Printer size={20} />
                <span className="font-semibold">PDF</span>
            </button>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 1cm;
                    }
                    
                    html, body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        font-size: 12px !important;
                    }
                    
                    /* Hide non-essential elements */
                    .print\\:hidden {
                        display: none !important;
                    }
                    
                    /* Remove animations */
                    * {
                        animation: none !important;
                        transition: none !important;
                    }
                    
                    /* Page breaks for sections */
                    section {
                        page-break-inside: avoid;
                        break-inside: avoid;
                        min-height: auto !important;
                        padding-top: 40px !important;
                        padding-bottom: 40px !important;
                    }
                    
                    /* Force each major section to start on new page */
                    section.print-page-break {
                        page-break-before: always;
                        break-before: page;
                    }
                    
                    /* Ensure backgrounds print */
                    .bg-gradient-to-br,
                    .bg-gray-50,
                    .bg-gray-900,
                    .bg-white,
                    .bg-blue-600,
                    .bg-blue-700 {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    /* Optimize grid layouts for print */
                    .grid {
                        gap: 12px !important;
                    }
                    
                    .flex-wrap {
                        gap: 12px !important;
                    }
                    
                    /* Scale down images */
                    img {
                        max-height: 150px !important;
                    }
                    
                    /* Optimize card sizes for print */
                    .w-\\[480px\\] {
                        width: 300px !important;
                    }
                    
                    .w-96 {
                        width: 280px !important;
                    }
                    
                    /* Smaller text for print */
                    .text-5xl, .text-6xl, .text-7xl {
                        font-size: 28px !important;
                    }
                    
                    .text-4xl {
                        font-size: 22px !important;
                    }
                    
                    .text-3xl {
                        font-size: 18px !important;
                    }
                    
                    .text-2xl {
                        font-size: 16px !important;
                    }
                    
                    .text-xl {
                        font-size: 14px !important;
                    }
                    
                    .text-lg {
                        font-size: 13px !important;
                    }
                    
                    /* Reduce padding for print */
                    .p-10 {
                        padding: 16px !important;
                    }
                    
                    .p-8, .p-6 {
                        padding: 12px !important;
                    }
                    
                    .py-20 {
                        padding-top: 30px !important;
                        padding-bottom: 30px !important;
                    }
                    
                    .mb-16 {
                        margin-bottom: 20px !important;
                    }
                    
                    .mb-8 {
                        margin-bottom: 12px !important;
                    }
                    
                    /* Hide scroll indicator */
                    .animate-bounce {
                        display: none !important;
                    }
                    
                    /* Hide gallery animation rows in print */
                    .overflow-hidden {
                        overflow: visible !important;
                    }
                    
                    /* Section header smaller in print */
                    .print\\:mb-4 {
                        margin-bottom: 8px !important;
                    }
                    
                    /* Footer stays at bottom */
                    footer {
                        page-break-before: avoid;
                    }
                }
                
                /* Gallery Animation Keyframes */
                @keyframes scrollLeft {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(calc(-50% - 12px)); }
                }
                @keyframes scrollRight {
                    0% { transform: translateX(calc(-50% - 12px)); }
                    100% { transform: translateX(0); }
                }
            `}</style>
            {/* Full Page Hero - White Background */}
            <section className="min-h-screen flex flex-col items-center justify-center bg-white relative">

                {/* Center Content */}
                <div className="text-center px-6">
                    <Image
                        src="/sdclogo.png"
                        alt="SDC Logo"
                        width={180}
                        height={180}
                        className="mx-auto mb-8"
                    />
                    <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight text-gray-900">
                        {language === 'tr' ? 'Yazılım Geliştirme Kulübü' : 'Software Development Club'}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-500 font-medium">
                        {language === 'tr' ? 'Karadeniz Teknik Üniversitesi' : 'Karadeniz Technical University'}
                    </p>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-gray-300 rounded-full mt-2"></div>
                    </div>
                </div>
            </section>

            {/* About / Founding Story */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        {language === 'tr' ? 'Hakkımızda' : 'About Us'}
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        {language === 'tr'
                            ? 'KTÜ Yazılım Geliştirme Kulübü, Karadeniz Teknik Üniversitesi Yazılım Geliştirme Bölümü\'nün 2024 yılında kurulmasıyla birlikte bölüm öğrencileri tarafından hayata geçirilmiş bir öğrenci topluluğudur. Uygulama odaklı atölyeler ve workshop serileri, sektör profesyonelleri ve mezunlarla söyleşiler, kariyer gelişimi etkinlikleri ve teknik geziler düzenleyerek öğrencilerin birlikte öğrenmesini, proje üretmesini ve sektörle güçlü bağlar kurmasını destekler.'
                            : 'KTU Software Development Club is a student community established by department students following the founding of Karadeniz Technical University\'s Software Development Department in 2024. It supports students in learning together, producing projects, and building strong connections with the industry by organizing practice-oriented workshops and workshop series, talks with industry professionals and alumni, career development activities, and technical trips.'}
                    </p>
                    <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-gray-200">
                        <Calendar size={20} className="text-gray-500" />
                        <span className="font-semibold text-gray-700">
                            {language === 'tr' ? 'Kuruluş: 2 Aralık 2024' : 'Founded: December 2, 2024'}
                        </span>
                    </div>
                </div>
            </section>

            {/* Advisor Section */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                        {language === 'tr' ? 'Kulüp Danışmanımız' : 'Our Club Advisor'}
                    </h3>
                    <div className="flex flex-col md:flex-row items-center gap-8 bg-gray-50 rounded-2xl p-8">
                        {/* Advisor Photo */}
                        <div className="w-40 h-40 rounded-full flex-shrink-0 border-4 border-white shadow-lg overflow-hidden">
                            <Image
                                src="/advisor.png"
                                alt="Dr. Öğr. Üyesi Işılay Bozkurt"
                                width={160}
                                height={160}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        {/* Advisor Info */}
                        <div className="text-center md:text-left">
                            <h4 className="text-xl font-bold text-gray-900 mb-1">
                                Dr. Öğr. Üyesi Işılay Bozkurt
                            </h4>
                            <p className="text-blue-600 font-medium mb-3">
                                {language === 'tr' ? 'KTÜ Fen Fakültesi Yazılım Geliştirme Bölümü - Bölüm Başkan Yardımcısı' : 'KTU Faculty of Science, Software Development Department - Vice Chair'}
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                {language === 'tr'
                                    ? 'Kulübün danışmanı olarak; atölye ve workshop içeriklerinin akademik kalitesini güçlendirmeye, etkinliklerin hedef–kazanım uyumunu netleştirmeye, çalıştay/zirve programının tutarlı ve sonuç odaklı kurgulanmasına destek olmaya ve bölümle resmi koordinasyonun sağlıklı yürütülmesine katkı sağlar.'
                                    : 'As the club advisor, she contributes to strengthening the academic quality of workshop contents, clarifying the goal-outcome alignment of events, supporting the consistent and results-oriented design of workshop/summit programs, and ensuring healthy official coordination with the department.'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Board Members Section - Full Page */}
            {data.boardMembers && data.boardMembers.length > 0 && (
                <section className="min-h-screen flex flex-col justify-center bg-gray-50 py-20 print-page-break">
                    <div className="max-w-7xl mx-auto px-8">
                        <SectionHeader />
                        <h3 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 text-center">
                            {language === 'tr' ? 'Yönetim Kurulu' : 'Board of Directors'}
                        </h3>
                        <p className="text-xl text-gray-500 text-center mb-16">
                            {language === 'tr' ? 'Kulübümüzün yönetim kadrosu' : 'Our club\'s management team'}
                        </p>
                        <div className="flex flex-wrap justify-center gap-6">
                            {data.boardMembers.map((member) => {
                                const roleLabels: Record<string, { tr: string; en: string }> = {
                                    president: { tr: 'Başkan', en: 'President' },
                                    vice_president: { tr: 'Başkan Yardımcısı', en: 'Vice President' },
                                    secretary: { tr: 'Genel Sekreter', en: 'Secretary' },
                                    treasurer: { tr: 'Sayman', en: 'Treasurer' },
                                    board_member: { tr: 'Yönetim Kurulu Üyesi', en: 'Board Member' },
                                };
                                const roleLabel = roleLabels[member.role] || { tr: member.title, en: member.titleEn || member.title };

                                return (
                                    <div key={member._id} className="flex items-center gap-8 bg-white rounded-3xl p-6 shadow-md w-[480px]">
                                        <div className="w-32 h-32 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200 shadow-lg">
                                            {member.photo ? (
                                                <Image
                                                    src={member.photo}
                                                    alt={member.name}
                                                    width={128}
                                                    height={128}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Users size={56} className="text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-2xl font-bold text-gray-900">{member.name}</h4>
                                            <p className="text-lg text-blue-600 font-semibold mt-1">
                                                {language === 'tr' ? roleLabel.tr : roleLabel.en}
                                            </p>
                                            {member.memberId?.department && (
                                                <p className="text-base text-gray-400 mt-2">
                                                    {member.memberId.department}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Department Heads Section - Full Page */}
            {data.departmentHeads && data.departmentHeads.length > 0 && (
                <section className="min-h-screen flex flex-col justify-center bg-white py-20 print-page-break">
                    <div className="max-w-7xl mx-auto px-8">
                        <SectionHeader />
                        <h3 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 text-center">
                            {language === 'tr' ? 'Departman Başkanları' : 'Department Heads'}
                        </h3>
                        <p className="text-xl text-gray-500 text-center mb-16">
                            {language === 'tr' ? 'Teknik departmanlarımızı yöneten liderler' : 'Leaders managing our technical departments'}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                            {data.departmentHeads.map((member) => (
                                <div key={member._id} className="bg-gray-50 rounded-3xl p-10 text-center shadow-sm">
                                    <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-xl">
                                        {member.photo ? (
                                            <Image
                                                src={member.photo}
                                                alt={member.name}
                                                width={128}
                                                height={128}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Users size={48} className="text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h4>
                                    <p className="text-lg text-blue-600 font-semibold mb-1">
                                        {language === 'tr'
                                            ? member.departmentId?.name || member.title
                                            : member.departmentId?.nameEn || member.titleEn || member.title}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-2">
                                        {language === 'tr' ? 'Departman Başkanı' : 'Department Head'}
                                    </p>
                                    {member.memberId?.department && (
                                        <p className="text-sm text-gray-400 mt-3 pt-3 border-t border-gray-200">
                                            {member.memberId.department}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Vision Section - Full Page */}
            <section className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 print-page-break">
                <div className="max-w-5xl mx-auto px-8 text-center">
                    <SectionHeader dark />
                    <div className="mb-8">
                        <span className="inline-block px-6 py-2 bg-blue-600/20 text-blue-400 rounded-full text-lg font-medium mb-6">
                            {language === 'tr' ? 'Vizyonumuz' : 'Our Vision'}
                        </span>
                    </div>
                    <div className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto space-y-6 text-center">
                        <p>
                            {language === 'tr'
                                ? 'Vizyonumuz, Karadeniz Teknik Üniversitesi\'nde yazılım geliştirmeyi yalnızca derslerle sınırlı kalmayan; üretim, paylaşım ve topluluk kültürüyle büyüyen sürdürülebilir bir ekosisteme dönüştürmektir. Öğrencilerin "öğrenen" olmanın ötesine geçerek "üreten, anlatan ve liderlik eden" bireyler hâline geldiği; merakın cesaretle, teorinin uygulamayla, fikrin somut projelerle buluştuğu bir ortam kurmayı hedefliyoruz. Farklı seviyelerdeki katılımcıların birlikte geliştiği, bilginin akışkan biçimde paylaşıldığı kapsayıcı ve dayanışmacı bir kültürü önemsiyoruz.'
                                : 'Our vision is to transform software development at Karadeniz Technical University into a sustainable ecosystem that grows with production, sharing, and community culture—not just limited to classes. We aim to create an environment where students go beyond being "learners" to become "producers, communicators, and leaders"; where curiosity meets courage, theory meets practice, and ideas meet concrete projects.'}
                        </p>
                        <p>
                            {language === 'tr'
                                ? 'Bu vizyonu; düzenli atölyeler, uygulamalı workshop serileri, söyleşiler, sosyal etkinlikler, kariyer gelişimi programları ve teknik geziler ile hayata geçiriyoruz. Teknik eğitimlerde güncel teknolojileri gerçek problem senaryolarında kullanmayı, ekip çalışması ve proje üretim alışkanlığı kazanmayı destekliyoruz; mentorluk ve söyleşilerle sektör deneyimini kampüse taşıyoruz. Çalıştay ve zirvelerle öğrencileri, akademisyenleri, mezunları ve profesyonelleri aynı zeminde buluşturarak tartışan, üreten ve sonuç odaklı ilerleyen oturumlar tasarlıyor; etik değerlere bağlı, topluma fayda üreten ve ulusal/uluslararası ölçekte rekabet edebilen yazılımcıların yetişmesine katkı sağlamayı amaçlıyoruz.'
                                : 'We bring this vision to life through regular workshops, hands-on workshop series, talks, social events, career development programs, and technical trips. In technical training, we support using current technologies in real problem scenarios, teamwork, and project production habits; we bring industry experience to campus through mentorship and talks. Through workshops and summits, we design sessions that bring together students, academics, alumni, and professionals, fostering discussion, production, and results-oriented progress; we aim to contribute to developing software developers who are committed to ethical values, produce benefit for society, and can compete at national and international levels.'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission Section - Full Page */}
            <section className="min-h-screen flex flex-col justify-center bg-white py-20 print-page-break">
                <div className="max-w-7xl mx-auto px-8">
                    <SectionHeader />
                    <div className="text-center mb-16">
                        <span className="inline-block px-6 py-2 bg-gray-100 text-gray-600 rounded-full text-lg font-medium mb-6">
                            {language === 'tr' ? 'Misyonumuz' : 'Our Mission'}
                        </span>
                        <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                            {language === 'tr'
                                ? 'Misyonumuz, Karadeniz Teknik Üniversitesi öğrencilerinin yazılım geliştirme yolculuğunu hızlandıran, erişilebilir ve uygulama odaklı bir öğrenme ortamı sunmaktır. Atölyeler, workshop serileri, söyleşiler, proje temelli çalışmalar ve teknik geziler ile hem teknik yetkinlikleri güçlendirmeyi hem de ekip çalışması, problem çözme, iletişim ve liderlik gibi tamamlayıcı becerileri geliştirmeyi amaçlarız. Öğrencileri mezunlar ve sektör profesyonelleriyle buluşturarak mentorluk ve kariyer gelişimi fırsatları sağlar; çalıştay ve zirvelerle üniversite–sektör iş birliğini artıran, bilgi paylaşımını büyüten etkinlikler üretiriz. Her seviyeden katılımcının kendini geliştirebildiği kapsayıcı bir topluluk kültürü oluşturarak, etik değerlere bağlı ve topluma fayda üreten yazılımcıların yetişmesine katkı sağlamayı görev ediniriz.'
                                : 'Our mission is to provide an accessible and practice-oriented learning environment that accelerates the software development journey of Karadeniz Technical University students. Through workshops, workshop series, talks, project-based work, and technical trips, we aim to strengthen both technical competencies and complementary skills such as teamwork, problem-solving, communication, and leadership. We connect students with alumni and industry professionals to provide mentorship and career development opportunities; through workshops and summits, we produce events that enhance university-industry collaboration and grow knowledge sharing. By creating an inclusive community culture where participants of all levels can develop themselves, we take it as our duty to contribute to the development of software developers who are committed to ethical values and produce benefit for society.'}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Mission Item 1 */}
                        <div className="bg-gray-50 rounded-3xl p-10">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                                <Calendar size={32} className="text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {language === 'tr' ? 'Atölyeler ve Eğitimler' : 'Workshops & Training'}
                            </h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {language === 'tr'
                                    ? 'Atölyeler, workshop serileri, söyleşiler ve teknik geziler ile erişilebilir ve uygulama odaklı bir öğrenme ortamı sunarak öğrencilerin yazılım geliştirme yolculuğunu hızlandırıyoruz.'
                                    : 'We accelerate students\' software development journey by providing an accessible and practice-oriented learning environment through workshops, workshop series, talks, and technical trips.'}
                            </p>
                        </div>

                        {/* Mission Item 2 */}
                        <div className="bg-gray-50 rounded-3xl p-10">
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                                <FolderOpen size={32} className="text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {language === 'tr' ? 'Proje ve Beceri Geliştirme' : 'Project & Skill Development'}
                            </h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {language === 'tr'
                                    ? 'Proje temelli çalışmalar ile hem teknik yetkinlikleri güçlendirmeyi hem de ekip çalışması, problem çözme, iletişim ve liderlik gibi tamamlayıcı becerileri geliştirmeyi amaçlıyoruz.'
                                    : 'Through project-based work, we aim to strengthen both technical competencies and complementary skills such as teamwork, problem-solving, communication, and leadership.'}
                            </p>
                        </div>

                        {/* Mission Item 3 */}
                        <div className="bg-gray-50 rounded-3xl p-10">
                            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                                <Users size={32} className="text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {language === 'tr' ? 'Mentorluk ve Kariyer' : 'Mentorship & Career'}
                            </h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {language === 'tr'
                                    ? 'Öğrencileri mezunlar ve sektör profesyonelleriyle buluşturarak mentorluk ve kariyer gelişimi fırsatları sağlıyor; çalıştay ve zirvelerle üniversite-sektör iş birliğini artıran etkinlikler üretiyoruz.'
                                    : 'We connect students with alumni and industry professionals to provide mentorship and career development opportunities; through workshops and summits, we produce events that enhance university-industry collaboration.'}
                            </p>
                        </div>

                        {/* Mission Item 4 */}
                        <div className="bg-gray-50 rounded-3xl p-10">
                            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                                <TrendingUp size={32} className="text-orange-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {language === 'tr' ? 'Kapsayıcı Topluluk' : 'Inclusive Community'}
                            </h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {language === 'tr'
                                    ? 'Her seviyeden katılımcının kendini geliştirebildiği kapsayıcı bir topluluk kültürü oluşturarak, etik değerlere bağlı ve topluma fayda üreten yazılımcıların yetişmesine katkı sağlamayı görev ediniyoruz.'
                                    : 'By creating an inclusive community culture where participants of all levels can develop themselves, we take it as our duty to contribute to the development of software developers who are committed to ethical values and produce benefit for society.'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Future Plans Section - Full Page */}
            <section className="min-h-screen flex flex-col justify-center bg-gray-50 py-20 print-page-break">
                <div className="max-w-6xl mx-auto px-8">
                    <SectionHeader />
                    <div className="text-center mb-16">
                        <span className="inline-block px-6 py-2 bg-blue-100 text-blue-600 rounded-full text-lg font-medium mb-6">
                            {language === 'tr' ? '2025 ve Ötesi' : '2025 and Beyond'}
                        </span>
                        <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                            {language === 'tr' ? 'Gelecek Planlarımız' : 'Our Future Plans'}
                        </h2>
                        <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                            {language === 'tr'
                                ? 'Büyüme vizyonumuz doğrultusunda hayata geçirmeyi planladığımız projeler.'
                                : 'Projects we plan to implement in line with our growth vision.'}
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Intro Paragraph */}
                        <div className="bg-white rounded-3xl p-10 shadow-sm">
                            <p className="text-xl text-gray-700 leading-relaxed">
                                {language === 'tr'
                                    ? 'Önümüzdeki dönemde hedefimiz; düzenli ve sürdürülebilir bir etkinlik takvimiyle öğrencilerin teknik yetkinliklerini geliştirmek, sektörle etkileşimi artırmak ve proje üretimini teşvik eden güçlü bir topluluk ekosistemi oluşturmaktır. Bu kapsamda hem eğitim odaklı etkinliklerimizi çeşitlendirmeyi hem de çalıştay ve zirve gibi yüksek etki üreten organizasyonlarla paydaş buluşmalarını büyütmeyi planlıyoruz.'
                                    : 'Our goal for the upcoming period is to develop students\' technical competencies with a regular and sustainable event calendar, increase interaction with the industry, and create a strong community ecosystem that encourages project production. In this context, we plan to diversify our education-focused events and grow stakeholder meetings with high-impact organizations such as workshops and summits.'}
                            </p>
                        </div>

                        {/* Plan Items Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Plan 1 */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm border-l-4 border-blue-500">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {language === 'tr' ? 'Atölye ve Workshop Serileri' : 'Workshop Series'}
                                </h3>
                                <p className="text-gray-600">
                                    {language === 'tr'
                                        ? 'Farklı seviyelere uygun atölye ve workshop serileri düzenliyoruz.'
                                        : 'We organize workshop series suitable for different levels.'}
                                </p>
                            </div>

                            {/* Plan 2 */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm border-l-4 border-green-500">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {language === 'tr' ? 'Mentorluk Buluşmaları' : 'Mentorship Meetings'}
                                </h3>
                                <p className="text-gray-600">
                                    {language === 'tr'
                                        ? 'Sektör profesyonelleri ve mezunlarla söyleşi/mentorluk buluşmaları gerçekleştiriyoruz.'
                                        : 'We hold talks and mentorship meetings with industry professionals and alumni.'}
                                </p>
                            </div>

                            {/* Plan 3 */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm border-l-4 border-purple-500">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {language === 'tr' ? 'Kariyer Gelişimi' : 'Career Development'}
                                </h3>
                                <p className="text-gray-600">
                                    {language === 'tr'
                                        ? 'CV–LinkedIn ve mülakat hazırlığı gibi kariyer gelişimi etkinlikleri sunuyoruz.'
                                        : 'We offer career development activities such as CV-LinkedIn and interview preparation.'}
                                </p>
                            </div>

                            {/* Plan 4 */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm border-l-4 border-orange-500">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {language === 'tr' ? 'Teknik Geziler' : 'Technical Trips'}
                                </h3>
                                <p className="text-gray-600">
                                    {language === 'tr'
                                        ? 'Yazılım şirketleri ve teknoloji kurumlarına yönelik teknik geziler düzenliyoruz.'
                                        : 'We organize technical trips to software companies and technology institutions.'}
                                </p>
                            </div>

                            {/* Plan 5 */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm border-l-4 border-pink-500">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {language === 'tr' ? 'Proje Takımları' : 'Project Teams'}
                                </h3>
                                <p className="text-gray-600">
                                    {language === 'tr'
                                        ? 'Dönem boyunca proje takımları kurarak demo, portfolyo projeleri ve açık kaynak katkıları üretiyoruz.'
                                        : 'We form project teams throughout the semester to produce demos, portfolio projects, and open-source contributions.'}
                                </p>
                            </div>

                            {/* Plan 6 */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm border-l-4 border-cyan-500">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {language === 'tr' ? 'Üniversite-Sektör İşbirliği' : 'University-Industry Collaboration'}
                                </h3>
                                <p className="text-gray-600">
                                    {language === 'tr'
                                        ? 'Üniversite–sektör iş birliklerini artırmayı ve bilgi paylaşımını büyütmeyi hedefliyoruz.'
                                        : 'We aim to increase university-industry collaborations and grow knowledge sharing.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section - Full Page with Auto-Scroll Animation */}
            {data.galleryImages && data.galleryImages.length > 0 && (
                <section className="min-h-screen flex flex-col justify-center bg-gray-900 py-20 overflow-hidden print-page-break">
                    <div className="text-center mb-12 px-8">
                        <SectionHeader dark />
                        <h3 className="text-5xl md:text-6xl font-black text-white mb-4">
                            {language === 'tr' ? 'Etkinliklerimizden Kareler' : 'Moments from Our Events'}
                        </h3>
                        <p className="text-xl text-gray-400">
                            {language === 'tr' ? 'Kulübümüzün düzenlediği etkinliklerden anılar' : 'Memories from events organized by our club'}
                        </p>
                    </div>

                    {/* First Row - Scrolling Left */}
                    <div className="relative mb-6 overflow-hidden">
                        <div
                            className="flex gap-6"
                            style={{
                                width: 'max-content',
                                animation: 'scrollLeft 200s linear infinite'
                            }}
                        >
                            {[...data.galleryImages, ...data.galleryImages].map((img, idx) => (
                                <div key={`row1-${idx}`} className="flex-shrink-0 w-80 h-52">
                                    <Image
                                        src={img}
                                        alt={`Gallery ${idx + 1}`}
                                        width={320}
                                        height={208}
                                        className="w-full h-full object-cover rounded-2xl"
                                        loading="lazy"
                                        unoptimized
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Second Row - Scrolling Right */}
                    <div className="relative overflow-hidden">
                        <div
                            className="flex gap-6"
                            style={{
                                width: 'max-content',
                                animation: 'scrollRight 220s linear infinite'
                            }}
                        >
                            {[...data.galleryImages.slice().reverse(), ...data.galleryImages.slice().reverse()].map((img, idx) => (
                                <div key={`row2-${idx}`} className="flex-shrink-0 w-80 h-52">
                                    <Image
                                        src={img}
                                        alt={`Gallery ${idx + 1}`}
                                        width={320}
                                        height={208}
                                        className="w-full h-full object-cover rounded-2xl"
                                        loading="lazy"
                                        unoptimized
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                </section>
            )}

            {/* Event Pages - Each page becomes a full-screen section */}
            {data.pages && data.pages.length > 0 && data.pages.map((page) => (
                <section key={page._id} className="min-h-screen flex flex-col justify-center bg-white py-20 print-page-break">
                    <div className="max-w-7xl mx-auto px-8">
                        <SectionHeader />
                        <h3 className="text-5xl md:text-6xl font-black text-gray-900 mb-16 text-center">
                            {language === 'tr' ? page.title : (page.titleEn || page.title)}
                        </h3>

                        {/* Events displayed with flexbox - always centered */}
                        <div className="flex flex-wrap justify-center gap-8">
                            {page.events.map((event: FeaturedEventData) => {
                                // Get first 2 images for the event
                                const images: string[] = [];
                                if (event.galleryCover) images.push(event.galleryCover);
                                if (event.galleryLinks) {
                                    event.galleryLinks.forEach((link: string) => {
                                        if (images.length < 2 && (link.match(/\.(jpeg|jpg|gif|png|webp)$/i) || link.includes('image/upload'))) {
                                            images.push(link);
                                        }
                                    });
                                }

                                return (
                                    <div key={event._id} className="flex flex-col w-64">
                                        {/* 2 Photos stacked vertically */}
                                        <div className="space-y-3 mb-4">
                                            {images.slice(0, 2).map((img, idx) => (
                                                <div key={idx} className="aspect-[4/3] rounded-xl overflow-hidden">
                                                    <Image
                                                        src={img}
                                                        alt={`${event.title} - ${idx + 1}`}
                                                        width={400}
                                                        height={300}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                        unoptimized
                                                    />
                                                </div>
                                            ))}
                                            {/* If only 1 image, show placeholder for 2nd */}
                                            {images.length === 1 && (
                                                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    <span className="text-gray-400 text-sm">Görsel yok</span>
                                                </div>
                                            )}
                                            {/* If no images at all */}
                                            {images.length === 0 && (
                                                <>
                                                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                                                        <span className="text-gray-400 text-sm">Görsel yok</span>
                                                    </div>
                                                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                                                        <span className="text-gray-400 text-sm">Görsel yok</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {/* Event Title */}
                                        <h4 className="text-lg font-bold text-gray-900 text-center">
                                            {language === 'tr' ? event.title : (event.titleEn || event.title)}
                                        </h4>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            ))}

            {/* Sponsorship Opportunities Title */}
            <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-4">
                        {language === 'tr' ? 'Sponsorluk Fırsatları' : 'Sponsorship Opportunities'}
                    </h2>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        {language === 'tr'
                            ? 'Türkiye\'nin en genç ve dinamik üniversite yazılım topluluklarından biri ile işbirliği yapın. Geleceğin yazılımcılarına ulaşın.'
                            : 'Partner with one of Turkey\'s youngest and most dynamic university software communities. Reach the developers of tomorrow.'}
                    </p>
                </div>
            </section>

            {/* Sponsorship Packages */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                        {language === 'tr' ? 'Sponsorluk Paketleri' : 'Sponsorship Packages'}
                    </h3>
                    <p className="text-gray-500 text-center mb-8">
                        {language === 'tr' ? 'İhtiyaçlarınıza uygun paketi seçin' : 'Choose the package that fits your needs'}
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {packages.map((pkg, index) => (
                            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
                                <div className={`bg-gradient-to-r ${pkg.color} ${pkg.textColor} p-6`}>
                                    <pkg.icon size={32} className="mb-2" />
                                    <h4 className="text-xl font-bold">{pkg.name}</h4>
                                </div>
                                <div className="p-6">
                                    <ul className="space-y-3">
                                        {pkg.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2 text-gray-600">
                                                <span className="text-green-500 mt-0.5">✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Live Statistics */}
            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                        {language === 'tr' ? 'Canlı İstatistikler' : 'Live Statistics'}
                    </h3>
                    <p className="text-gray-500 text-center mb-8">
                        {language === 'tr' ? 'Veriler anlık olarak güncellenmektedir' : 'Data is updated in real-time'}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-6 text-center border border-gray-100">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.color} text-white mb-4`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="text-4xl font-bold text-gray-900 mb-1">
                                    {stat.value.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Current Sponsors */}
            {data.currentSponsors.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="max-w-6xl mx-auto px-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                            {language === 'tr' ? 'Mevcut Sponsorlarımız' : 'Our Current Sponsors'}
                        </h3>
                        <div className="flex flex-wrap justify-center items-center gap-8">
                            {data.currentSponsors.map((sponsor) => (
                                <div key={sponsor._id} className="grayscale hover:grayscale-0 transition-all">
                                    <Image
                                        src={sponsor.logo}
                                        alt={language === 'tr' ? sponsor.name : (sponsor.nameEn || sponsor.name)}
                                        width={120}
                                        height={60}
                                        className="object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Contact CTA */}
            <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        {/* Left - Main CTA */}
                        <div className="flex-1 text-center lg:text-left">
                            <Building2 size={48} className="mb-4 opacity-80 mx-auto lg:mx-0" />
                            <h3 className="text-3xl font-bold mb-4">
                                {language === 'tr' ? 'Birlikte Çalışalım' : 'Let\'s Work Together'}
                            </h3>
                            <p className="text-blue-100 mb-8 text-lg">
                                {language === 'tr'
                                    ? 'Sponsorluk fırsatları hakkında detaylı bilgi almak için bizimle iletişime geçin.'
                                    : 'Contact us for detailed information about sponsorship opportunities.'}
                            </p>
                            <a
                                href="mailto:contact@ktusdc.com"
                                className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                <Mail size={20} />
                                contact@ktusdc.com
                            </a>

                            {/* Social Media Links */}
                            <div className="mt-6 flex flex-col items-center lg:items-start gap-2 text-blue-100 text-sm">
                                <p className="font-semibold text-white mb-1">
                                    {language === 'tr' ? 'Sosyal Medya' : 'Social Media'}
                                </p>
                                <a href="https://ktusdc.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                                    <Globe size={16} /> ktusdc.com
                                </a>
                                <a href="https://instagram.com/ktu.sdc" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                                    <Instagram size={16} /> instagram.com/ktu.sdc
                                </a>
                                <a href="https://linkedin.com/company/ktusdc" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                                    <Linkedin size={16} /> linkedin.com/company/ktusdc
                                </a>
                            </div>
                        </div>

                        {/* Right - President Info */}
                        {(() => {
                            const president = data.boardMembers.find(m => m.role === 'president');
                            if (!president) return null;
                            return (
                                <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-white/20 border-4 border-white/30">
                                        {president.photo ? (
                                            <Image
                                                src={president.photo}
                                                alt={president.name}
                                                width={96}
                                                height={96}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Users size={32} className="text-white/60" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="font-bold text-white text-xl mb-1">{president.name}</p>
                                    <p className="text-blue-200 mb-3">
                                        {language === 'tr' ? 'Kulüp Başkanı' : 'Club President'}
                                    </p>
                                    {/* President Contact Details */}
                                    <div className="space-y-2 text-sm">
                                        {president.email && (
                                            <a href={`mailto:${president.email}`} className="flex items-center justify-center gap-2 text-white/90 hover:text-white transition-colors">
                                                <Mail size={14} />
                                                {president.email}
                                            </a>
                                        )}
                                        {president.phone && (
                                            <p className="text-white/90">
                                                {president.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-8">
                <div className="max-w-6xl mx-auto px-6 text-center text-sm">
                    <p>
                        © {new Date().getFullYear()} Software Development Club - Karadeniz Technical University
                    </p>
                    <p className="mt-2 text-gray-500">
                        {language === 'tr' ? 'Bu döküman' : 'This document was generated on'}{' '}
                        {new Date(data.generatedAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}{' '}
                        {language === 'tr' ? 'tarihinde oluşturulmuştur.' : '.'}
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default function MediaKitPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" />
            </div>
        }>
            <MediaKitContent />
        </Suspense>
    );
}
