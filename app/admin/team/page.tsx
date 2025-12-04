'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Department {
    _id: string;
    name: string;
    slug: string;
    color: string;
}

interface TeamMember {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    photo?: string;
    role: string;
    departmentId?: Department;
    title: string;
    description?: string;
    location?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
    x?: string;
    website?: string;
    order: number;
    isActive: boolean;
    showInTeam: boolean;
}

interface Applicant {
    _id: string;
    fullName: string;
    email: string;
    selectedDepartment: string;
}

const roleOptions = [
    { value: 'president', label: 'Kulüp Başkanı' },
    { value: 'vice_president', label: 'Başkan Yardımcısı' },
    { value: 'head', label: 'Departman Başkanı' },
    { value: 'member', label: 'Üye' },
    { value: 'featured', label: 'Öne Çıkan' },
];

const getRoleLabel = (role: string) => {
    return roleOptions.find(r => r.value === role)?.label || role;
};

const getRoleBadgeColor = (role: string) => {
    switch (role) {
        case 'president': return 'bg-neo-yellow text-black';
        case 'vice_president': return 'bg-neo-orange text-black';
        case 'head': return 'bg-neo-purple text-white';
        case 'featured': return 'bg-neo-pink text-black';
        default: return 'bg-gray-200 text-black';
    }
};

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showApplicantModal, setShowApplicantModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        photo: '',
        role: 'member',
        departmentId: '',
        title: '',
        description: '',
        location: '',
        github: '',
        linkedin: '',
        instagram: '',
        x: '',
        website: '',
        order: 0,
        showInTeam: true,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [membersRes, deptRes, applicantsRes] = await Promise.all([
                fetch('/api/team'),
                fetch('/api/departments'),
                fetch('/api/applicants'),
            ]);

            if (membersRes.ok) setMembers(await membersRes.json());
            if (deptRes.ok) setDepartments(await deptRes.json());
            if (applicantsRes.ok) setApplicants(await applicantsRes.json());
        } catch (error) {
            console.error('Veri yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('folder', 'sdc-web-team');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData,
            });

            if (res.ok) {
                const { url } = await res.json();
                setFormData({ ...formData, photo: url });
            }
        } catch (error) {
            console.error('Fotoğraf yüklenemedi:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId ? `/api/team/${editingId}` : '/api/team';
            const method = editingId ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                departmentId: formData.departmentId || undefined,
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                fetchData();
                resetForm();
            }
        } catch (error) {
            console.error('Ekip üyesi kaydedilemedi:', error);
        }
    };

    const handleAddFromApplicant = async (applicant: Applicant) => {
        try {
            const res = await fetch('/api/team/from-applicant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicantId: applicant._id,
                    role: 'member',
                    showInTeam: false,
                }),
            });

            if (res.ok) {
                fetchData();
                setShowApplicantModal(false);
                alert('Başvuran ekibe eklendi!');
            }
        } catch (error) {
            console.error('Ekibe eklenemedi:', error);
        }
    };

    const handleEdit = (member: TeamMember) => {
        setFormData({
            name: member.name,
            email: member.email,
            phone: member.phone || '',
            photo: member.photo || '',
            role: member.role,
            departmentId: member.departmentId?._id || '',
            title: member.title,
            description: member.description || '',
            location: member.location || '',
            github: member.github || '',
            linkedin: member.linkedin || '',
            instagram: member.instagram || '',
            x: member.x || '',
            website: member.website || '',
            order: member.order,
            showInTeam: member.showInTeam,
        });
        setEditingId(member._id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu ekip üyesini silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/team/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error('Ekip üyesi silinemedi:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', email: '', phone: '', photo: '', role: 'member', departmentId: '',
            title: '', description: '', location: '', github: '', linkedin: '',
            instagram: '', x: '', website: '', order: 0, showInTeam: true,
        });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="bg-white border-4 border-black shadow-neo px-8 py-4">
                    <span className="text-xl font-black text-black animate-pulse">Yükleniyor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-black text-black uppercase">Ekip Yönetimi</h1>
                    <p className="text-gray-600 font-medium mt-1">Kulüp ekip üyelerini yönetin</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <Link
                        href="/admin/departments"
                        className="bg-neo-blue text-black border-4 border-black shadow-neo px-6 py-3 font-black uppercase hover:bg-blue-300 hover:shadow-none transition-all"
                    >
                        Departmanlar
                    </Link>
                    <button
                        onClick={() => setShowApplicantModal(true)}
                        className="bg-neo-purple text-white border-4 border-black shadow-neo px-6 py-3 font-black uppercase hover:bg-purple-400 hover:shadow-none transition-all"
                    >
                        Başvurudan Ekle
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-neo-green text-black border-4 border-black shadow-neo px-6 py-3 font-black uppercase hover:bg-white hover:shadow-none transition-all"
                    >
                        {showForm ? 'İptal' : '+ Yeni Üye'}
                    </button>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white border-4 border-black shadow-neo p-6">
                    <h2 className="text-xl font-black text-black mb-4">
                        {editingId ? 'Üye Düzenle' : 'Yeni Üye Ekle'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Photo Upload */}
                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-2">Fotoğraf</label>
                            <div className="flex items-center gap-4">
                                {formData.photo && (
                                    <div className="relative w-20 h-20 border-2 border-black">
                                        <Image src={formData.photo} alt="Preview" fill className="object-cover" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="border-2 border-black p-2 font-bold"
                                />
                                {uploading && <span className="text-sm font-bold">Yükleniyor...</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">İsim *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">E-posta</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">Rol</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                >
                                    {roleOptions.map((r) => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">Departman</label>
                                <select
                                    value={formData.departmentId}
                                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                >
                                    <option value="">Seçiniz</option>
                                    {departments.map((d) => (
                                        <option key={d._id} value={d._id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">Ünvan</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-1">Açıklama</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">Telefon</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">Konum</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">Sıra</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">GitHub</label>
                                <input
                                    type="url"
                                    value={formData.github}
                                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">LinkedIn</label>
                                <input
                                    type="url"
                                    value={formData.linkedin}
                                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">Instagram</label>
                                <input
                                    type="url"
                                    value={formData.instagram}
                                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.showInTeam}
                                    onChange={(e) => setFormData({ ...formData, showInTeam: e.target.checked })}
                                    className="w-5 h-5 border-2 border-black"
                                />
                                <span className="font-bold">Ekibimiz sayfasında göster</span>
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="bg-black text-white border-4 border-black px-6 py-3 font-black uppercase hover:bg-white hover:text-black transition-all"
                            >
                                {editingId ? 'Güncelle' : 'Oluştur'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-200 text-black border-4 border-black px-6 py-3 font-black uppercase hover:bg-gray-300 transition-all"
                            >
                                İptal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Applicant Modal */}
            {showApplicantModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black shadow-neo max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b-4 border-black flex justify-between items-center">
                            <h2 className="text-xl font-black">Başvurudan Ekle</h2>
                            <button
                                onClick={() => setShowApplicantModal(false)}
                                className="text-2xl font-black hover:text-red-500"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {applicants.length === 0 ? (
                                <p className="text-gray-500 font-bold text-center">Başvuru bulunamadı</p>
                            ) : (
                                applicants.map((applicant) => (
                                    <div key={applicant._id} className="flex items-center justify-between p-4 border-2 border-black hover:bg-gray-50">
                                        <div>
                                            <p className="font-black">{applicant.fullName}</p>
                                            <p className="text-sm text-gray-600">{applicant.email}</p>
                                            <span className="text-xs bg-neo-purple text-white px-2 py-1 font-bold">
                                                {applicant.selectedDepartment}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleAddFromApplicant(applicant)}
                                            className="bg-neo-green text-black border-2 border-black px-4 py-2 font-black text-sm hover:bg-green-400"
                                        >
                                            Ekle
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Member List */}
            <div className="bg-white border-4 border-black shadow-neo">
                {members.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 font-bold text-lg">Henüz ekip üyesi bulunmuyor</p>
                    </div>
                ) : (
                    <div className="divide-y-4 divide-black">
                        {members.map((member) => (
                            <div key={member._id} className="p-6 flex items-center justify-between hover:bg-gray-50 gap-4">
                                <div className="flex items-center gap-4">
                                    {member.photo ? (
                                        <div className="relative w-16 h-16 border-2 border-black flex-shrink-0">
                                            <Image src={member.photo} alt={member.name} fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-200 border-2 border-black flex items-center justify-center flex-shrink-0">
                                            <span className="text-2xl font-black">{member.name[0]}</span>
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-lg font-black text-black">{member.name}</h3>
                                            <span className={`px-2 py-0.5 text-xs font-black border border-black ${getRoleBadgeColor(member.role)}`}>
                                                {getRoleLabel(member.role)}
                                            </span>
                                            {member.showInTeam && (
                                                <span className="px-2 py-0.5 text-xs font-black bg-neo-green border border-black">
                                                    Görünür
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 font-medium">{member.title}</p>
                                        {member.departmentId && (
                                            <span className={`text-xs px-2 py-0.5 font-bold border border-black ${member.departmentId.color} mt-1 inline-block`}>
                                                {member.departmentId.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleEdit(member)}
                                        className="px-4 py-2 bg-neo-blue text-black border-2 border-black font-black text-sm hover:bg-blue-300 transition-all"
                                    >
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={() => handleDelete(member._id)}
                                        className="px-4 py-2 bg-red-500 text-white border-2 border-black font-black text-sm hover:bg-red-600 transition-all"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
