
"use client";
import { useRef, useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../_context/LanguageContext";
import { Crown, ChevronDown, ChevronUp, Users, ExternalLink } from "lucide-react";
import UserProfileModal from "./UserProfileModal";
import { useDepartments, useTeam } from "../lib/swr";
import type { TeamMember, Department } from "../lib/types/api";

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

// Map department colors to border colors for connectors
const borderColorMap: Record<string, string> = {
    'bg-neo-blue': 'border-neo-blue',
    'bg-neo-pink': 'border-neo-pink',
    'bg-neo-green': 'border-neo-green',
    'bg-neo-yellow': 'border-neo-yellow',
    'bg-neo-purple': 'border-neo-purple',
    'bg-neo-orange': 'border-neo-orange',
};

// Standard Neo-Brutalist CSS class
const standardCardClass = "border-4 border-black shadow-neo bg-white transition-all";

export default function Team() {
    const { language, t } = useLanguage();
    const sectionRef = useRef<HTMLElement>(null);

    // SWR hooks
    const { data: departmentsData, isLoading: deptLoading } = useDepartments();
    const { data: membersData, isLoading: teamLoading } = useTeam();

    const departments = departmentsData || [];
    const members = membersData || [];
    const loading = deptLoading || teamLoading;

    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

    const management = useMemo(() => {
        return members.filter(m => m.role === 'president' || m.role === 'vice_president')
            .sort((a, b) => (a.role === 'president' ? -1 : 1));
    }, [members]);

    const getDeptMembers = (deptId: string) => {
        return members.filter(m => {
            const mDeptId = typeof m.departmentId === 'object' && m.departmentId ? (m.departmentId as any)._id : m.departmentId;
            if (m.role === 'president' || m.role === 'vice_president') return false;
            return String(mDeptId) === String(deptId);
        }).sort((a, b) => {
            if (a.role === 'head' && b.role !== 'head') return -1;
            if (a.role !== 'head' && b.role === 'head') return 1;
            return (a.order || 0) - (b.order || 0);
        });
    };

    const toggleDept = (deptId: string) => {
        setExpandedDepts(prev => {
            const next = new Set(prev);
            if (next.has(deptId)) {
                next.delete(deptId);
            } else {
                next.add(deptId);
            }
            return next;
        });
    };

    const handleMemberClick = (member: TeamMember) => {
        const linkedId = (member as any).memberId?._id || (member as any).memberId;
        if (linkedId) setSelectedMemberId(linkedId);
    };

    if (loading) {
        return (
            <section className="py-20 bg-neo-blue border-b-4 border-black scroll-mt-20" id="team">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <div className="h-12 w-48 bg-gray-200 animate-pulse mx-auto rounded mb-4"></div>
                    </div>
                </div>
            </section>
        );
    }

    const MemberCard = ({ member, size = 'normal', showCrown = false, bgColor = 'bg-white', className = '' }:
        { member: TeamMember, size?: 'small' | 'normal' | 'large', showCrown?: boolean, bgColor?: string, className?: string }) => {
        const sizeClasses = {
            small: 'w-10 h-10',
            normal: 'w-12 h-12',
            large: 'w-16 h-16'
        };
        return (
            <div
                onClick={() => handleMemberClick(member)}
                className={`${standardCardClass} ${bgColor} hover:bg-gray-50 p-3 cursor-pointer hover:-translate-y-1 transition-transform flex items-center gap-3 ${className}`}
            >
                <div className={`relative ${sizeClasses[size]} shrink-0`}>
                    {member.photo ? (
                        <Image src={member.photo} alt={member.name} fill className="rounded-full border-2 border-black object-cover" />
                    ) : (
                        <div className="w-full h-full rounded-full border-2 border-black bg-gray-100 flex items-center justify-center font-black text-sm">{member.name[0]}</div>
                    )}
                    {showCrown && <Crown size={14} className="absolute -top-2 -right-1 text-black fill-yellow-400" />}
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="font-black text-xs sm:text-sm leading-tight truncate">{member.name}</h4>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-700 uppercase truncate opacity-80">{member.title}</p>
                </div>
            </div>
        );
    };

    return (
        <section ref={sectionRef} id="team" className="relative py-12 lg:py-20 bg-white border-b-4 border-black min-h-screen overflow-hidden">
            {/* Title */}
            <div className="text-center mb-12 lg:mb-20 px-4">
                <h2 className="inline-block bg-white border-4 border-black shadow-neo-lg px-6 py-2 lg:px-12 lg:py-4 text-3xl lg:text-5xl font-black uppercase transform -rotate-2">
                    {t('team.title')}
                </h2>
                <div className="mt-4 flex justify-center">
                    <p className="bg-neo-yellow border-4 border-black px-4 py-2 font-bold text-lg shadow-neo transform rotate-1 max-w-2xl">
                        {t('team.subtitle')}
                    </p>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative">

                {/* Join Us (Desktop) */}
                <div className="absolute top-0 right-4 lg:right-8 z-50 hidden md:block">
                    <Link
                        href="/apply"
                        className="bg-neo-yellow border-4 border-black px-4 py-2 md:px-6 md:py-3 font-black text-sm md:text-lg shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                    >
                        <span>{t('team.joinUs')}</span>
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>

                {/* ==================== MOBILE VIEW (Accordion) ==================== */}
                <div className="lg:hidden">
                    {/* Management Section */}
                    <div className="mb-8">
                        <div className="bg-black text-white px-4 py-2 font-black uppercase text-sm inline-block mb-4 shadow-neo border-2 border-white">
                            {t('team.management')}
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {management.map(m => (
                                <MemberCard key={m._id} member={m} size="large" showCrown bgColor="bg-neo-yellow" className="py-4" />
                            ))}
                        </div>
                    </div>

                    {/* Departments Accordion */}
                    <div className="space-y-4">
                        {departments.map(dept => {
                            const isExpanded = expandedDepts.has(dept._id);
                            const deptMembers = getDeptMembers(dept._id);
                            const deptLead = deptMembers.find(m => m.role === 'head');
                            const deptOthers = deptMembers.filter(m => m.role !== 'head');

                            return (
                                <div key={dept._id} className={`${standardCardClass} overflow-hidden`}>
                                    <button
                                        onClick={() => toggleDept(dept._id)}
                                        className={`w-full px-4 py-4 font-black uppercase text-sm flex items-center justify-between ${dept.color || 'bg-white'} border-b-4 border-black transition-colors`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white border-2 border-black p-1.5 shadow-sm rounded-md">
                                                {iconMap[dept.icon]}
                                            </div>
                                            <span className="text-left leading-tight py-1">{language === 'en' && dept.nameEn ? dept.nameEn : dept.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white border-2 border-black px-2 py-1 shadow-sm ml-2 shrink-0">
                                            <span className="text-xs font-bold">{deptMembers.length}</span>
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="p-4 bg-gray-50">
                                            <p className="text-sm font-medium text-gray-600 mb-6 italic border-l-4 border-black pl-3 py-1">
                                                "{language === 'en' && dept.descriptionEn ? dept.descriptionEn : dept.description}"
                                            </p>

                                            <div className="space-y-3">
                                                {deptLead && (
                                                    <div className="mb-4 relative">
                                                        <div className="absolute -top-3 left-3 bg-black text-white text-[10px] font-black px-2 py-0.5 uppercase z-10">
                                                            {t('about.departmentHead')}
                                                        </div>
                                                        <MemberCard member={deptLead} size="normal" showCrown bgColor={dept.color} />
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 gap-3 pl-4 border-l-2 border-dashed border-gray-300">
                                                    {deptOthers.map(m => (
                                                        <MemberCard key={m._id} member={m} size="small" />
                                                    ))}
                                                </div>

                                                {deptMembers.length === 0 && (
                                                    <p className="text-center text-gray-400 italic text-sm py-4">
                                                        {t('team.membersSoon')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ==================== DESKTOP VIEW (Scalable Tree) ==================== */}
                <div className="hidden lg:block overflow-x-auto pb-12 pt-8">
                    <div className="min-w-fit flex flex-col items-center">

                        {/* 1. Root: Management */}
                        <div className="relative z-20 mb-12">
                            <div className={`${standardCardClass} p-6 flex gap-6 items-center bg-white relative`}>
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-1 font-black uppercase text-sm shadow-neo transform -rotate-1">
                                    {t('team.management')}
                                </div>
                                {management.map((m, i) => (
                                    <div key={m._id} className="flex gap-4 items-center group cursor-pointer" onClick={() => handleMemberClick(m)}>
                                        <div className="relative w-20 h-20">
                                            <Image
                                                src={m.photo || '/avatar-placeholder.png'}
                                                alt={m.name}
                                                fill
                                                className="rounded-full border-4 border-black object-cover bg-gray-100"
                                            />
                                            {m.role === 'president' && <Crown size={24} className="absolute -top-3 -right-2 text-neo-yellow drop-shadow-md rotate-12 fill-current" />}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg leading-none mb-1 group-hover:text-neo-blue transition-colors">{m.name}</h3>
                                            <p className="text-xs font-bold text-gray-500 uppercase bg-gray-100 px-2 py-0.5 inline-block border-2 border-black/10 rounded-sm">{m.title}</p>
                                        </div>
                                        {i < management.length - 1 && <div className="w-px h-12 bg-gray-300 mx-2"></div>}
                                    </div>
                                ))}
                            </div>
                            {/* Vertical Line from Management */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-12 bg-black"></div>
                        </div>

                        {/* Horizontal Connector Bar */}
                        <div className="relative w-full flex justify-center mb-12">
                            {/* The actual line needs to span from the center of the first child to the center of the last child. 
                                 We can approximate this with a wide div, provided the children are centered. 
                             */}
                            <div className="h-1 bg-black w-[90%] max-w-[95%] rounded-full absolute top-0"></div>
                        </div>

                        {/* 2. Branches: Departments */}
                        <div className="flex justify-center gap-6 px-4 w-full">
                            {departments.map((dept, index) => {
                                const deptMembers = getDeptMembers(dept._id);
                                const deptLead = deptMembers.find(m => m.role === 'head');
                                const deptOthers = deptMembers.filter(m => m.role !== 'head');
                                const borderColor = borderColorMap[dept.color] || 'border-black';

                                return (
                                    <div key={dept._id} className="flex flex-col items-center flex-1 min-w-[240px] max-w-[320px] relative">
                                        {/* Connector from horizontal bar to department */}
                                        <div className={`w-1 h-12 bg-black absolute -top-12 left-1/2 -translate-x-1/2`}></div>

                                        {/* Department Node */}
                                        <div className={`w-full flex flex-col items-center`}>

                                            {/* Header / Head */}
                                            <div className={`${standardCardClass} w-full p-0 overflow-hidden flex flex-col mb-4 relative z-10 hover:-translate-y-1 transition-transform duration-300 group`}>
                                                {/* Color Header */}
                                                <div className={`${dept.color} p-3 border-b-4 border-black flex items-center justify-center gap-2 h-16`}>
                                                    <div className="bg-white/90 p-1.5 rounded-full border-2 border-black/20 text-black">
                                                        {iconMap[dept.icon]}
                                                    </div>
                                                    <h3 className="font-black text-xs uppercase text-center leading-tight">
                                                        {language === 'en' && dept.nameEn ? dept.nameEn : dept.name}
                                                    </h3>
                                                </div>

                                                {/* Dept Description Tooltip (Optional, or just static content) */}
                                                <div className="p-4 text-center bg-white flex-1 flex flex-col items-center justify-center min-h-[140px]">
                                                    {/* Lead Info */}
                                                    {deptLead ? (
                                                        <div className="flex flex-col items-center cursor-pointer" onClick={() => handleMemberClick(deptLead)}>
                                                            <div className="relative w-16 h-16 mb-2">
                                                                <div className={`absolute inset-0 rounded-full border-4 ${borderColor} animate-pulse-slow opacity-20`}></div>
                                                                {deptLead.photo ? (
                                                                    <Image src={deptLead.photo} alt={deptLead.name} fill className="rounded-full border-2 border-black object-cover relative z-10" />
                                                                ) : (
                                                                    <div className="w-full h-full rounded-full border-2 border-black bg-gray-100 flex items-center justify-center font-black relative z-10">{deptLead.name[0]}</div>
                                                                )}
                                                                <Crown size={14} className="absolute -top-2 -right-1 text-black fill-yellow-400 z-20" />
                                                            </div>
                                                            <div className="font-black text-sm leading-tight mb-1">{deptLead.name}</div>
                                                            <div className="text-[10px] font-bold text-gray-500 uppercase bg-gray-100 px-2 rounded-full">{t('about.departmentHead')}</div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-400 italic text-xs py-4 flex flex-col items-center">
                                                            <Users size={24} className="mb-2 opacity-20" />
                                                            <span>{t('team.managersSoon')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Connector to Members */}
                                            {deptOthers.length > 0 && (
                                                <div className={`w-1 h-6 bg-black mb-0`}></div>
                                            )}

                                            {/* Members Grid */}
                                            {deptOthers.length > 0 && (
                                                <div className={`grid grid-cols-1 gap-2 w-full pt-2 border-t-4 ${borderColor} relative`}>
                                                    {/* Decorative styling for the member list container */}
                                                    <div className={`absolute top-0 left-0 w-full h-full ${dept.color} opacity-5 -z-10`}></div>

                                                    {deptOthers.map(m => (
                                                        <div
                                                            key={m._id}
                                                            onClick={() => handleMemberClick(m)}
                                                            className="bg-white border-2 border-black p-2 flex items-center gap-2 hover:bg-gray-50 cursor-pointer transition-colors shadow-sm"
                                                        >
                                                            <div className="relative w-8 h-8 shrink-0">
                                                                {m.photo ? (
                                                                    <Image src={m.photo} alt={m.name} fill className="rounded-full border border-black object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full rounded-full border border-black bg-gray-100 flex items-center justify-center font-bold text-xs">{m.name[0]}</div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-bold text-xs truncate leading-tight">{m.name}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {selectedMemberId && (
                <UserProfileModal userId={selectedMemberId} onClose={() => setSelectedMemberId(null)} />
            )}
        </section>
    );
}

