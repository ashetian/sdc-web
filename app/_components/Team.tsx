"use client";
import { useRef, useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../_context/LanguageContext";
import { Crown, Star } from "lucide-react";
import UserProfileModal from "./UserProfileModal";

interface Department {
    _id: string;
    name: string;
    nameEn?: string;
    description: string;
    descriptionEn?: string;
    color: string;
    icon: string;
    leadId?: string;
    order?: number;
}

interface TeamMember {
    _id: string;
    name: string;
    photo?: string;
    role: string;
    title: string;
    departmentId?: Department | string;
    description?: string;
    order?: number;
}

const iconMap: Record<string, React.ReactNode> = {
    clipboard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    ),
    code: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
    ),
    camera: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    briefcase: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
};

// Standard Neo-Brutalist CSS class
const standardCardClass = "border-4 border-black shadow-neo bg-white transition-all";

export default function Team() {
    const { language, t } = useLanguage();
    const sectionRef = useRef<HTMLElement>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [activeDeptId, setActiveDeptId] = useState<string | null>(null);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptRes, teamRes] = await Promise.all([
                    fetch('/api/departments'),
                    fetch('/api/team?showInTeam=true')
                ]);

                if (deptRes.ok) {
                    const data = await deptRes.json();
                    setDepartments(data);
                    // Set first department as active by default if available
                    if (data.length > 0) setActiveDeptId(data[0]._id);
                }
                if (teamRes.ok) {
                    const data = await teamRes.json();
                    setMembers(data);
                }
            } catch (error) {
                console.error('Veri yüklenemedi:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const management = useMemo(() => {
        return members.filter(m => m.role === 'president' || m.role === 'vice_president')
            .sort((a, b) => (a.role === 'president' ? -1 : 1));
    }, [members]);

    const activeDept = useMemo(() => departments.find(d => d._id === activeDeptId), [departments, activeDeptId]);

    const activeDeptMembers = useMemo(() => {
        if (!activeDeptId) return [];
        return members.filter(m => {
            const mDeptId = typeof m.departmentId === 'object' ? m.departmentId?._id : m.departmentId;
            // Exclude management
            if (m.role === 'president' || m.role === 'vice_president') return false;
            return mDeptId === activeDeptId;
        }).sort((a, b) => {
            if (a.role === 'head' && b.role !== 'head') return -1;
            if (a.role !== 'head' && b.role === 'head') return 1;
            return (a.order || 0) - (b.order || 0);
        });
    }, [members, activeDeptId]);

    const lead = activeDeptMembers.find(m => m.role === 'head');
    const otherMembers = activeDeptMembers.filter(m => m.role !== 'head');

    const handleMemberClick = (member: TeamMember) => {
        const linkedId = (member as any).memberId?._id || (member as any).memberId;
        if (linkedId) setSelectedMemberId(linkedId);
    };

    if (loading) return null;

    return (
        <section ref={sectionRef} id="team" className="relative py-20 bg-white border-b-4 border-black min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Join Us Button */}
                <div className="absolute top-0 right-4 lg:right-8 z-50">
                    <Link
                        href="/apply"
                        className="bg-neo-yellow border-4 border-black px-6 py-3 font-black text-lg shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                    >
                        <span>{language === 'tr' ? 'BİZE KATILIN' : 'JOIN US'}</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>

                {/* 1. Root Node: Management */}
                <div className="flex flex-col items-center relative z-10">
                    <div className={`${standardCardClass} bg-white p-6 md:p-8 max-w-2xl w-full text-center relative z-10`}>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 font-black uppercase text-sm -rotate-2 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                            {language === 'tr' ? 'YÖNETİM' : 'MANAGEMENT'}
                        </div>
                        <div className="flex justify-center gap-8 md:gap-16">
                            {management.map(m => (
                                <div key={m._id} className="flex flex-col items-center cursor-pointer group" onClick={() => handleMemberClick(m)}>
                                    <div className="relative w-24 h-24 md:w-32 md:h-32 mb-3">
                                        <div className="absolute inset-0 bg-black rounded-full translate-x-1 translate-y-1"></div>
                                        {m.photo ? (
                                            <Image src={m.photo} alt={m.name} fill className="rounded-full border-2 border-black object-cover relative bg-white group-hover:-translate-y-1 transition-transform" />
                                        ) : (
                                            <div className="w-full h-full rounded-full border-2 border-black bg-gray-200 flex items-center justify-center relative font-black text-2xl">
                                                {m.name[0]}
                                            </div>
                                        )}
                                        {m.role === 'president' && <Crown size={24} className="absolute -top-4 -right-2 text-neo-yellow drop-shadow-md rotate-12" fill="currentColor" />}
                                    </div>
                                    <h3 className="font-black text-lg leading-tight">{m.name}</h3>
                                    <p className="text-sm font-bold text-gray-500 uppercase">{m.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Vertical Line Down - Extends to reach the horizontal bar below */}
                    <div className="w-2 h-16 bg-black mt-[-4px] relative z-0"></div>
                </div>

                {/* 2. Branches: Tabs */}
                {/* Wrapper padding-top must match the Vertical Line height to ensure overlap */}
                <div className="relative mb-0">
                    {/* Horizontal Connector Line - Visible only on LG (Desktop) where we force single row */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-black hidden lg:block mx-auto max-w-6xl"></div>

                    {/* Tabs Container - Grid for better control. Tree lines enabled only for LG+. */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 pt-8 md:pt-12 relative w-full max-w-7xl mx-auto">
                        {departments.map((dept, idx) => {
                            const isActive = activeDeptId === dept._id;
                            return (
                                <div key={dept._id} className="flex flex-col items-center relative group w-full">
                                    {/* Vertical Line Up to Connector */}
                                    <div className="w-2 bg-black absolute -top-[48px] bottom-[100%] hidden lg:block" style={{ height: '48px' }}></div>

                                    <button
                                        onClick={() => setActiveDeptId(dept._id)}
                                        className={`
                                             ${standardCardClass} w-full px-4 py-3 font-black uppercase text-xs sm:text-sm lg:text-base transition-all duration-200 relative flex items-center justify-center
                                             ${isActive ? `${dept.color} -translate-y-1 shadow-[5px_6px_0px_black] z-30` : 'bg-white hover:bg-gray-50 z-10'}
                                         `}
                                    >
                                        <span className="flex items-center gap-2 text-center">
                                            {iconMap[dept.icon]}
                                            <span>{language === 'en' && dept.nameEn ? dept.nameEn : dept.name}</span>
                                        </span>
                                    </button>
                                    {/* Vertical Line Down if Active - Absolute positioning with Z-Index sandwich */}
                                    {isActive && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-16 bg-black -mt-4 z-0"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Leaves: Content Area */}
                {activeDept && (
                    <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4">
                        <div className={`${standardCardClass} bg-white p-8 md:p-12 relative z-10 min-h-[400px]`}>
                            {/* Dept Info */}
                            <div className="text-center mb-0">
                                <h2 className="text-3xl font-black uppercase mb-3 flex items-center justify-center gap-3">
                                    {iconMap[activeDept.icon]}
                                    {language === 'en' && activeDept.nameEn ? activeDept.nameEn : activeDept.name}
                                </h2>
                                <p className="text-lg font-bold text-gray-600 max-w-2xl mx-auto">
                                    {language === 'en' && activeDept.descriptionEn ? activeDept.descriptionEn : activeDept.description}
                                </p>
                            </div>

                            {/* Tree Layout Inside Dept */}
                            <div className="flex flex-col items-center">
                                {/* Lead Node */}
                                {lead ? (
                                    <div className="mb-0 flex flex-col items-center relative">
                                        {/* Connector from Header to Lead */}
                                        <div className="w-1 h-8 bg-black"></div>

                                        <div
                                            onClick={() => handleMemberClick(lead)}
                                            className={`${standardCardClass} ${activeDept.color} p-4 w-64 flex items-center gap-4 cursor-pointer hover:-translate-y-1 transition-transform bg-opacity-20 relative z-10`}
                                        >
                                            <div className="relative w-16 h-16 shrink-0">
                                                {lead.photo ? (
                                                    <Image src={lead.photo} alt={lead.name} fill className="rounded-full border-2 border-black object-cover" />
                                                ) : (
                                                    <div className="w-full h-full rounded-full border-2 border-black bg-white flex items-center justify-center font-black">{lead.name[0]}</div>
                                                )}
                                                <Crown size={16} className="absolute -top-2 -right-1 text-black fill-yellow-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-black text-black leading-tight truncate">{lead.name}</h3>
                                                <p className="text-xs font-bold text-black/70 uppercase break-words">{lead.title}</p>
                                            </div>
                                        </div>
                                        {otherMembers.length > 0 && <div className="w-1 h-8 bg-black mt-[-4px] relative z-0"></div>}
                                    </div>
                                ) : (
                                    // No Lead - Connect Header to Grid directly
                                    otherMembers.length > 0 && <div className="w-1 h-12 bg-black"></div>
                                )}

                                {/* Members Grid */}
                                {otherMembers.length > 0 ? (
                                    <div className="relative w-full">
                                        {/* Horizontal Line for Members */}
                                        <div className="absolute top-0 left-10 right-10 h-1 bg-black hidden md:block"></div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 pt-6">
                                            {otherMembers.map((m, idx) => (
                                                <div key={m._id} className="flex flex-col items-center relative group">
                                                    {/* Connection Line */}
                                                    <div className="w-1 h-6 bg-black absolute -top-6 hidden md:block"></div>

                                                    <div
                                                        onClick={() => handleMemberClick(m)}
                                                        className={`${standardCardClass} bg-white hover:bg-gray-50 p-3 w-full cursor-pointer hover:-translate-y-1 transition-transform flex flex-col items-center text-center h-full`}
                                                    >
                                                        <div className="relative w-12 h-12 mb-2">
                                                            {m.photo ? (
                                                                <Image src={m.photo} alt={m.name} fill className="rounded-full border-2 border-black object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full rounded-full border-2 border-black bg-gray-100 flex items-center justify-center font-bold text-sm">{m.name[0]}</div>
                                                            )}
                                                        </div>
                                                        <h4 className="font-black text-sm leading-tight mb-1">{m.name}</h4>
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase leading-tight line-clamp-2">{m.title}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <span className="font-bold text-gray-400 italic">
                                            {language === 'tr' ? 'Ekip arkadaşları yakında eklenecek.' : 'Team members joining soon.'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {selectedMemberId && (
                <UserProfileModal userId={selectedMemberId} onClose={() => setSelectedMemberId(null)} />
            )}
        </section>
    );
}
