'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Crown, UserPlus, X, Check, Crown as CrownIcon, Star, Target, User, Sparkles, Eye, EyeOff, ChevronUp, ChevronDown, BookOpen, Wallet, Gavel, Users } from 'lucide-react';
import { SkeletonList } from '@/app/_components/Skeleton';
import { useParams } from 'next/navigation';
import { Button, ConfirmModal } from '@/app/_components/ui';
import { useToast } from '@/app/_context/ToastContext';

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
    memberId?: string;
    showInTeam: boolean;
    order: number;
}

interface SiteMember {
    _id: string;
    fullName: string;
    email: string;
    studentNo: string;
    avatar?: string;
}

const roleOptions = [
    { value: 'president', label: 'Kulüp Başkanı', icon: CrownIcon, color: 'bg-neo-yellow', description: 'Kulübün genel yönetimi' },
    { value: 'vice_president', label: 'Başkan Yardımcısı', icon: Star, color: 'bg-neo-orange', description: 'Başkana destek ve vekalet' },
    { value: 'secretary', label: 'Yazman', icon: BookOpen, color: 'bg-blue-200', description: 'Yazışma ve kayıtlar' },
    { value: 'treasurer', label: 'Sayman', icon: Wallet, color: 'bg-green-200', description: 'Mali işler' },
    { value: 'board_member', label: 'Yönetim Kurulu Üyesi', icon: Users, color: 'bg-purple-200', description: 'Yönetim kurulu üyesi' },
    { value: 'audit_head', label: 'Denetleme Kurulu Başkanı', icon: Gavel, color: 'bg-red-200', description: 'Denetim liderliği' },
    { value: 'audit_member', label: 'Denetleme Kurulu Üyesi', icon: Gavel, color: 'bg-red-100', description: 'Denetim üyesi' },
    { value: 'head', label: 'Departman Başkanı', icon: Target, color: 'bg-neo-purple text-white', description: 'Departman liderliği' },
    { value: 'member', label: 'Üye', icon: User, color: 'bg-gray-200', description: 'Departman üyesi' },
    { value: 'featured', label: 'Öne Çıkan', icon: Sparkles, color: 'bg-neo-pink', description: 'Özel katkı sağlayan' },
];

const getRoleLabel = (role: string) => {
    return roleOptions.find(r => r.value === role)?.label || role;
};

const getRoleBadgeColor = (role: string) => {
    const found = roleOptions.find(r => r.value === role);
    return found?.color || 'bg-gray-200';
};

export default function DepartmentMembersPage() {
    const params = useParams();
    const id = params.id as string;

    const [department, setDepartment] = useState<Department | null>(null);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Add/Edit Member Modal
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [memberQuery, setMemberQuery] = useState('');
    const [foundMembers, setFoundMembers] = useState<SiteMember[]>([]);
    const [selectedSiteMember, setSelectedSiteMember] = useState<SiteMember | null>(null);

    const [formData, setFormData] = useState({
        memberId: '',
        role: 'member',
        title: '',
        showInTeam: true,
    });

    // Delete confirmation modal
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; memberId: string; memberName: string }>({ isOpen: false, memberId: '', memberName: '' });

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

        if (id) {
            if (id === 'management') {
                // Mock Management Department
                setDepartment({
                    _id: 'management',
                    name: 'YÖNETİM KURULU',
                    description: 'Kulüp yönetimi ve denetim kurulu üyeleri.',
                    color: 'bg-black text-white',
                });

                // Fetch management members
                // We fetch by role filter
                const roles = 'president,vice_president,secretary,treasurer,board_member,audit_head,audit_member';
                fetch(`/api/team?role=${roles}`)
                    .then(res => res.json())
                    .then(data => setMembers(data))
                    .catch(err => console.error(err))
                    .finally(() => setLoading(false));
            } else {
                fetchData();
            }
        }
    }, [id]);

    // Search site members
    useEffect(() => {
        if (memberQuery.length < 2) { setFoundMembers([]); return; }
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/members?search=${memberQuery}&limit=5`);
                if (res.ok) {
                    const data = await res.json();
                    setFoundMembers(data.members || []);
                }
            } catch (e) { console.error(e); }
        }, 300);
        return () => clearTimeout(timer);
    }, [memberQuery]);

    const handleSelectSiteMember = (m: SiteMember) => {
        setSelectedSiteMember(m);
        setFormData(prev => ({
            ...prev,
            memberId: m._id,
        }));
        setMemberQuery('');
        setFoundMembers([]);
    };

    const handleOpenAddModal = () => {
        setEditingMember(null);
        setSelectedSiteMember(null);
        setFormData({
            memberId: '',
            role: 'member',
            title: '',
            showInTeam: true,
        });
        setShowMemberModal(true);
    };

    const handleOpenEditModal = (member: TeamMember) => {
        setEditingMember(member);
        setSelectedSiteMember(null);
        setFormData({
            memberId: member.memberId || '',
            role: member.role,
            title: member.title,
            showInTeam: member.showInTeam,
        });
        setShowMemberModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingMember && !selectedSiteMember) {
            showToast('Lütfen bir üye seçin', 'warning');
            return;
        }

        try {
            // Check for duplicates in the current list
            const targetMemberId = selectedSiteMember?._id || editingMember?.memberId;
            const isDuplicate = members.some(m =>
                m.memberId === targetMemberId &&
                (!editingMember || m._id !== editingMember._id)
            );

            if (isDuplicate) {
                showToast('Bu üye zaten bu listede ekli!', 'error');
                return;
            }

            const url = editingMember ? `/api/team/${editingMember._id}` : '/api/team';
            const method = editingMember ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                departmentId: id === 'management' ? undefined : id,
                name: selectedSiteMember?.fullName || editingMember?.name,
                email: selectedSiteMember?.email || '',
                photo: selectedSiteMember?.avatar || editingMember?.photo || '',
                order: editingMember ? editingMember.order : members.length,
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                // Refresh members
                if (id === 'management') {
                    const roles = 'president,vice_president,secretary,treasurer,board_member,audit_head,audit_member';
                    const teamRes = await fetch(`/api/team?role=${roles}`);
                    if (teamRes.ok) setMembers(await teamRes.json());
                } else {
                    const teamRes = await fetch(`/api/team?departmentId=${id}`);
                    if (teamRes.ok) setMembers(await teamRes.json());
                }
                setShowMemberModal(false);
                showToast(editingMember ? 'Üye güncellendi!' : 'Üye eklendi!', 'success');
            } else {
                const error = await res.json();
                showToast(error.error || 'Bir hata oluştu', 'error');
            }
        } catch (error) {
            console.error('Üye kaydedilemedi:', error);
            showToast('Bir hata oluştu', 'error');
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.memberId) return;

        try {
            const res = await fetch(`/api/team/${deleteModal.memberId}`, { method: 'DELETE' });
            if (res.ok) {
                setMembers(members.filter(m => m._id !== deleteModal.memberId));
            } else {
                const error = await res.json();
                showToast(error.error || 'Üye silinemedi', 'error');
            }
        } catch (error) {
            console.error('Üye silinemedi:', error);
            showToast('Bir hata oluştu', 'error');
        } finally {
            setDeleteModal({ isOpen: false, memberId: '', memberName: '' });
        }
    };

    const handleMoveUp = async (index: number) => {
        if (index === 0) return;
        const member = members[index];
        const prevMember = members[index - 1];

        try {
            // Swap orders
            await Promise.all([
                fetch(`/api/team/${member._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: prevMember.order }),
                }),
                fetch(`/api/team/${prevMember._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: member.order }),
                }),
            ]);

            // Update local state
            const newMembers = [...members];
            [newMembers[index], newMembers[index - 1]] = [newMembers[index - 1], newMembers[index]];
            setMembers(newMembers);
        } catch (error) {
            console.error('Sıralama değiştirilemedi:', error);
        }
    };

    const handleMoveDown = async (index: number) => {
        if (index === members.length - 1) return;
        const member = members[index];
        const nextMember = members[index + 1];

        try {
            // Swap orders
            await Promise.all([
                fetch(`/api/team/${member._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: nextMember.order }),
                }),
                fetch(`/api/team/${nextMember._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: member.order }),
                }),
            ]);

            // Update local state
            const newMembers = [...members];
            [newMembers[index], newMembers[index + 1]] = [newMembers[index + 1], newMembers[index]];
            setMembers(newMembers);
        } catch (error) {
            console.error('Sıralama değiştirilemedi:', error);
        }
    };

    if (loading) return <div className="min-h-screen pt-24 flex justify-center"><SkeletonList items={5} /></div>;
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

                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-black uppercase mb-2 relative z-10">{department.name}</h1>
                        <p className="text-xl text-gray-600 max-w-2xl relative z-10">{department.description}</p>
                    </div>
                    <Button onClick={handleOpenAddModal} variant="success">
                        <UserPlus size={18} className="mr-2" />
                        Üye Ekle
                    </Button>
                </div>
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
                        <p className="font-bold text-gray-500 mb-4">Bu departmana kayıtlı ekip üyesi bulunamadı.</p>
                        <Button onClick={handleOpenAddModal} variant="success">
                            <UserPlus size={18} className="mr-2" />
                            İlk Üyeyi Ekle
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {members.map((member, index) => (
                            <div key={member._id} className="bg-white border-4 border-black shadow-neo p-4 flex items-center gap-4">
                                {/* Order arrows */}
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => handleMoveUp(index)}
                                        disabled={index === 0}
                                        className={`p-1 border-2 border-black ${index === 0 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white hover:bg-neo-yellow'}`}
                                    >
                                        <ChevronUp size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleMoveDown(index)}
                                        disabled={index === members.length - 1}
                                        className={`p-1 border-2 border-black ${index === members.length - 1 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white hover:bg-neo-yellow'}`}
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                </div>

                                {/* Photo */}
                                <div className="relative w-14 h-14 border-2 border-black shrink-0">
                                    {member.photo ? (
                                        <Image src={member.photo} alt={member.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center font-black text-lg">
                                            {member.name.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-black leading-tight truncate">{member.name}</h3>
                                    <p className="text-sm font-bold text-gray-500">{member.title || '-'}</p>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className={`text-xs font-bold px-2 py-1 border border-black ${getRoleBadgeColor(member.role)}`}>
                                        {getRoleLabel(member.role)}
                                    </span>
                                    {member.showInTeam ? (
                                        <Eye size={16} className="text-green-600" />
                                    ) : (
                                        <EyeOff size={16} className="text-gray-400" />
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 shrink-0">
                                    <Button onClick={() => handleOpenEditModal(member)} size="sm">
                                        Düzenle
                                    </Button>
                                    <Button onClick={() => setDeleteModal({ isOpen: true, memberId: member._id, memberName: member.name })} variant="danger" size="sm">
                                        Sil
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Member Modal */}
            {showMemberModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black shadow-neo max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b-4 border-black bg-neo-green flex justify-between items-center">
                            <h2 className="text-xl font-black">
                                {editingMember ? 'Üyeyi Düzenle' : 'Yeni Üye Ekle'}
                            </h2>
                            <button onClick={() => setShowMemberModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Member Selection (only for new) */}
                            {!editingMember && (
                                <div>
                                    <label className="block text-sm font-black text-black uppercase mb-2">Site Üyesi Seç</label>
                                    <p className="text-xs text-gray-500 mb-3">Sadece kayıtlı site üyeleri eklenebilir.</p>

                                    {selectedSiteMember ? (
                                        <div className="flex items-center gap-4 p-4 bg-green-50 border-2 border-green-500">
                                            <div className="relative w-12 h-12 border-2 border-black shrink-0">
                                                {selectedSiteMember.avatar ? (
                                                    <Image src={selectedSiteMember.avatar} alt={selectedSiteMember.fullName} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center font-black">
                                                        {selectedSiteMember.fullName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black">{selectedSiteMember.fullName}</p>
                                                <p className="text-sm text-gray-600">{selectedSiteMember.studentNo}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedSiteMember(null);
                                                    setFormData(prev => ({ ...prev, memberId: '' }));
                                                }}
                                                className="text-red-500 font-bold"
                                            >
                                                Değiştir
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="İsim veya öğrenci no ile ara..."
                                                value={memberQuery}
                                                onChange={(e) => setMemberQuery(e.target.value)}
                                                className="w-full px-4 py-3 border-4 border-black font-bold"
                                                autoFocus
                                            />
                                            {foundMembers.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 bg-white border-2 border-black border-t-0 max-h-60 overflow-y-auto z-10">
                                                    {foundMembers.map(m => (
                                                        <button
                                                            key={m._id}
                                                            type="button"
                                                            onClick={() => handleSelectSiteMember(m)}
                                                            className="w-full text-left p-3 hover:bg-neo-yellow border-b border-gray-100 last:border-0 flex items-center gap-3"
                                                        >
                                                            <div className="relative w-10 h-10 border border-black shrink-0 bg-gray-100 flex items-center justify-center font-bold">
                                                                {m.avatar ? (
                                                                    <Image src={m.avatar} alt={m.fullName} fill className="object-cover" />
                                                                ) : (
                                                                    m.fullName.charAt(0)
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold">{m.fullName}</p>
                                                                <p className="text-xs text-gray-500">{m.studentNo}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {memberQuery.length >= 2 && foundMembers.length === 0 && (
                                                <p className="mt-2 text-sm text-gray-500">Üye bulunamadı.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Editing member info */}
                            {editingMember && (
                                <div className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-300">
                                    <div className="relative w-12 h-12 border-2 border-black shrink-0">
                                        {editingMember.photo ? (
                                            <Image src={editingMember.photo} alt={editingMember.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center font-black">
                                                {editingMember.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-black">{editingMember.name}</p>
                                        <p className="text-sm text-gray-600">Düzenleniyor</p>
                                    </div>
                                </div>
                            )}

                            {/* Role Selection - Visual Cards */}
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-3">Rol Seçin</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {roleOptions.map(role => {
                                        const Icon = role.icon;
                                        const isSelected = formData.role === role.value;
                                        return (
                                            <button
                                                key={role.value}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
                                                className={`p-4 border-4 transition-all text-left ${isSelected
                                                    ? 'border-black shadow-neo bg-white'
                                                    : 'border-gray-200 hover:border-gray-400'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 ${role.color} border-2 border-black flex items-center justify-center mb-2`}>
                                                    <Icon size={20} />
                                                </div>
                                                <p className="font-black text-sm">{role.label}</p>
                                                <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                                                {isSelected && (
                                                    <div className="mt-2">
                                                        <Check size={16} className="text-green-600" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-2">Ünvan (Opsiyonel)</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Örn: Frontend Developer, Etkinlik Koordinatörü"
                                    className="w-full px-4 py-3 border-4 border-black font-bold"
                                />
                            </div>

                            {/* Show in Team Tree Toggle */}
                            <div className="bg-gray-50 p-4 border-2 border-gray-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-black">Ekip Ağacında Göster</p>
                                        <p className="text-sm text-gray-500">Bu üye "Ekibimiz" sayfasında görünecek</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, showInTeam: !prev.showInTeam }))}
                                        className={`relative w-14 h-7 rounded-full transition-colors ${formData.showInTeam ? 'bg-neo-green' : 'bg-gray-300'} border-2 border-black`}
                                    >
                                        <span
                                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white border-2 border-black rounded-full transition-all duration-200 ${formData.showInTeam ? 'left-7' : 'left-0.5'}`}
                                        />
                                    </button>
                                </div>
                            </div>


                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t-4 border-black">
                                <Button type="submit" variant="success">
                                    {editingMember ? 'Güncelle' : 'Ekle'}
                                </Button>
                                <Button type="button" onClick={() => setShowMemberModal(false)} variant="secondary">
                                    İptal
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, memberId: '', memberName: '' })}
                onConfirm={handleDelete}
                title="Üye Sil"
                message={`"${deleteModal.memberName}" adlı üyeyi departmandan silmek istediğinize emin misiniz?`}
                confirmText="Sil"
                cancelText="İptal"
                variant="danger"
            />
        </div>
    );
}
