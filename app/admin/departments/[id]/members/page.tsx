'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, Github, Linkedin, Twitter, Globe, Instagram, Crown } from 'lucide-react';
import GlobalLoading from '@/app/_components/GlobalLoading';
import { useParams } from 'next/navigation';

interface SocialLinks {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
    instagram?: string;
}

interface MemberProfile {
    _id: string;
    fullName: string;
    studentNo: string;
    email: string;
    avatar?: string;
    bio?: string;
    socialLinks?: SocialLinks;
}

interface Department {
    _id: string;
    name: string;
    description: string;
    color: string;
    leadId?: MemberProfile;
}

interface TeamMember {
    _id: string;
    name: string;
    role: string;
    title: string;
    photo?: string;
    memberId?: string; // If linked
}

export default function DepartmentMembersPage() {
    const params = useParams();
    const id = params.id as string;

    const [department, setDepartment] = useState<Department | null>(null);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptRes, teamRes] = await Promise.all([
                    fetch(`/api/departments/${id}`),
                    fetch(`/api/team?departmentId=${id}`)
                ]);

                if (deptRes.ok) {
                    const deptData = await deptRes.json();
                    setDepartment(deptData);
                }

                if (teamRes.ok) {
                    const teamData = await teamRes.json();
                    setMembers(teamData);
                }
            } catch (error) {
                console.error('Failed to load department members:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    if (loading) return <div className="min-h-screen pt-24 flex justify-center"><GlobalLoading /></div>;
    if (!department) return <div className="p-8 text-center text-xl font-bold">Departman bulunamadı</div>;

    const lead = department.leadId;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className={`bg-white border-4 border-black shadow-neo p-8 relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-32 h-32 ${department.color} opacity-20 transform rotate-45 translate-x-16 -translate-y-16`}></div>

                <Link
                    href="/admin/departments"
                    className="inline-flex items-center gap-2 font-bold mb-4 hover:underline"
                >
                    <ArrowLeft size={20} /> Departmanlara Dön
                </Link>

                <h1 className="text-4xl font-black text-black uppercase mb-2 relative z-10">{department.name}</h1>
                <p className="text-xl text-gray-600 max-w-2xl relative z-10">{department.description}</p>
            </div>

            {/* Department Lead */}
            {lead && (
                <div className="bg-neo-yellow border-4 border-black shadow-neo p-8">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Crown size={32} className="text-black" />
                            <h2 className="text-2xl font-black uppercase">Departman Sorumlusu</h2>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                        <div className="relative w-32 h-32 md:w-48 md:h-48 border-4 border-black shadow-neo bg-white shrink-0">
                            {lead.avatar ? (
                                <Image
                                    src={lead.avatar}
                                    alt={lead.fullName}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-4xl font-black">
                                    {lead.fullName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-3xl font-black mb-2">{lead.fullName}</h3>
                            <p className="text-gray-700 font-bold mb-4">{lead.email}</p>
                            {lead.bio && <p className="text-gray-800 mb-6 italic">"{lead.bio}"</p>}

                            {lead.socialLinks && (
                                <div className="flex gap-4 justify-center md:justify-start flex-wrap">
                                    {lead.socialLinks.github && (
                                        <a href={lead.socialLinks.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-black text-white hover:bg-gray-800 transition-transform hover:-translate-y-1">
                                            <Github size={20} />
                                        </a>
                                    )}
                                    {lead.socialLinks.linkedin && (
                                        <a href={lead.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#0077b5] text-white border-2 border-black hover:brightness-110 transition-transform hover:-translate-y-1">
                                            <Linkedin size={20} />
                                        </a>
                                    )}
                                    {lead.socialLinks.twitter && (
                                        <a href={lead.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-black text-white hover:bg-gray-800 transition-transform hover:-translate-y-1">
                                            <Twitter size={20} />
                                        </a>
                                    )}
                                    {lead.socialLinks.website && (
                                        <a href={lead.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-black border-2 border-black hover:bg-gray-100 transition-transform hover:-translate-y-1">
                                            <Globe size={20} />
                                        </a>
                                    )}
                                    {lead.socialLinks.instagram && (
                                        <a href={lead.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#E1306C] text-white border-2 border-black hover:brightness-110 transition-transform hover:-translate-y-1">
                                            <Instagram size={20} />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Team Members */}
            <div>
                <h2 className="text-2xl font-black text-black mb-6 uppercase border-b-4 border-black inline-block pb-1">
                    Ekip Üyeleri ({members.length})
                </h2>

                {members.length === 0 ? (
                    <div className="text-center p-12 bg-gray-100 border-2 border-gray-300">
                        <p className="font-bold text-gray-500">Bu departmana kayıtlı ekip üyesi bulunamadı.</p>
                        <Link href="/admin/team" className="text-blue-600 underline mt-2 inline-block">Ekip Yönetimine Git</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {members.map(member => (
                            <div key={member._id} className="bg-white border-4 border-black shadow-neo p-6 hover:-translate-y-1 transition-transform">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative w-16 h-16 border-2 border-black shrink-0">
                                        {member.photo ? (
                                            <Image src={member.photo} alt={member.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center font-black text-xl">
                                                {member.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black leading-tight">{member.name}</h3>
                                        <p className="text-sm font-bold text-gray-500 uppercase">{member.title}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-gray-100">
                                    <span className="text-xs font-bold bg-gray-200 px-2 py-1">
                                        {member.role === 'member' ? 'Üye' : member.role}
                                    </span>
                                    {member.memberId && (
                                        <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div> Onaylı Üye
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
