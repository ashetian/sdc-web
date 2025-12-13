'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SkeletonList } from '@/app/_components/Skeleton';
import { Check, X, XCircle, AlertTriangle, FileText, Users } from 'lucide-react';
import { Button } from '@/app/_components/ui';
import { useToast } from '@/app/_context/ToastContext';

interface Department {
    _id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
    order: number;
    isActive: boolean;
    leadId?: string | { _id: string, fullName: string, studentNo: string };
}

interface Member {
    _id: string;
    fullName: string;
    email: string;
    studentNo: string;
    avatar?: string;
}

interface Applicant {
    _id: string;
    fullName: string;
    faculty: string;
    department: string;
    classYear: string;
    phone: string;
    email: string;
    github?: string;
    linkedin?: string;
    selectedDepartment: string;
    motivation: string;
    hasExperience: boolean;
    experienceDescription?: string;
    departmentSpecificAnswers: Record<string, string>;
    additionalNotes?: string;
    kvkkConsent: boolean;
    communicationConsent: boolean;
    createdAt: string;
}

interface VerificationResult {
    isMember: boolean;
    member?: {
        studentNo: string;
        fullName: string;
        email: string;
        phone?: string;
        department?: string;
    };
    matches: {
        studentNo: boolean;
        fullName: boolean;
        email: boolean;
        phone: boolean;
        department: boolean;
    };
}

const colorOptions = [
    { value: 'bg-neo-blue', label: 'Mavi' },
    { value: 'bg-neo-green', label: 'Yeşil' },
    { value: 'bg-neo-purple', label: 'Mor' },
    { value: 'bg-neo-pink', label: 'Pembe' },
    { value: 'bg-neo-yellow', label: 'Sarı' },
    { value: 'bg-neo-orange', label: 'Turuncu' },
];

const iconOptions = [
    { value: 'clipboard', label: 'Proje' },
    { value: 'code', label: 'Kod' },
    { value: 'camera', label: 'Medya' },
    { value: 'briefcase', label: 'Kurumsal' },
];

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [memberQuery, setMemberQuery] = useState('');
    const [foundMembers, setFoundMembers] = useState<Member[]>([]);
    const [selectedLead, setSelectedLead] = useState<Member | null>(null);
    const { showToast } = useToast();

    // Applicants state
    const [showApplicantsModal, setShowApplicantsModal] = useState(false);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [applicantsLoading, setApplicantsLoading] = useState(false);
    const [expandedApplicantId, setExpandedApplicantId] = useState<string | null>(null);
    const [memberVerifications, setMemberVerifications] = useState<Record<string, VerificationResult>>({});
    const [verifyingMembers, setVerifyingMembers] = useState(false);

    // Add to team modal
    const [addToTeamModal, setAddToTeamModal] = useState<{ applicant: Applicant | null, departmentId: string }>({ applicant: null, departmentId: '' });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'code',
        color: 'bg-neo-blue',
        order: 0,
        leadId: '',
    });

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

    const handleSelectMember = (m: Member) => {
        setFormData(prev => ({
            ...prev,
            leadId: m._id,
        }));
        setSelectedLead(m);
        setMemberQuery('');
        setFoundMembers([]);
    };

    const handleRemoveLead = () => {
        setFormData(prev => ({ ...prev, leadId: '' }));
        setSelectedLead(null);
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/departments');
            if (res.ok) {
                const data = await res.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error('Departmanlar yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicants = async () => {
        setApplicantsLoading(true);
        try {
            const res = await fetch('/api/applicants');
            if (res.ok) {
                const data = await res.json();
                setApplicants(data);
                verifyAllMembers(data);
            }
        } catch (error) {
            console.error('Başvurular yüklenirken hata:', error);
        } finally {
            setApplicantsLoading(false);
        }
    };

    const verifyAllMembers = async (apps: Applicant[]) => {
        setVerifyingMembers(true);
        const verifications: Record<string, VerificationResult> = {};

        for (const app of apps) {
            try {
                const res = await fetch('/api/members/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName: app.fullName,
                        email: app.email,
                        phone: app.phone,
                        department: app.department,
                    }),
                });

                if (res.ok) {
                    verifications[app._id] = await res.json();
                }
            } catch (error) {
                console.error('Üyelik doğrulaması hatası:', error);
            }
        }

        setMemberVerifications(verifications);
        setVerifyingMembers(false);
    };

    const handleOpenApplicantsModal = () => {
        setShowApplicantsModal(true);
        fetchApplicants();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId ? `/api/departments/${editingId}` : '/api/departments';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchDepartments();
                resetForm();
            }
        } catch (error) {
            console.error('Departman kaydedilemedi:', error);
        }
    };

    const handleEdit = (dept: Department) => {
        setFormData({
            name: dept.name,
            description: dept.description,
            icon: dept.icon,
            color: dept.color,
            order: dept.order,
            leadId: typeof dept.leadId === 'object' ? dept.leadId._id : (dept.leadId || ''),
        });
        // Set selectedLead if department has a lead
        if (typeof dept.leadId === 'object' && dept.leadId) {
            setSelectedLead({
                _id: dept.leadId._id,
                fullName: dept.leadId.fullName,
                studentNo: dept.leadId.studentNo,
                email: '',
                avatar: undefined,
            });
        } else {
            setSelectedLead(null);
        }
        setEditingId(dept._id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu departmanı silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchDepartments();
            }
        } catch (error) {
            console.error('Departman silinemedi:', error);
        }
    };

    const handleDeleteApplicant = async (id: string, name: string) => {
        if (!confirm(`${name} adlı başvuruyu silmek istediğinizden emin misiniz?`)) return;

        try {
            const res = await fetch(`/api/applicants/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setApplicants(applicants.filter(a => a._id !== id));
            }
        } catch (error) {
            console.error('Başvuru silinemedi:', error);
        }
    };

    const handleAddToTeam = async () => {
        if (!addToTeamModal.applicant || !addToTeamModal.departmentId) return;

        try {
            const res = await fetch('/api/team/from-applicant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicantId: addToTeamModal.applicant._id,
                    departmentId: addToTeamModal.departmentId,
                    role: 'member',
                    showInTeam: false,
                }),
            });

            if (res.ok) {
                showToast('Başvuran ekibe eklendi!', 'success');
                setAddToTeamModal({ applicant: null, departmentId: '' });
                // Optionally remove from applicants list
                setApplicants(applicants.filter(a => a._id !== addToTeamModal.applicant?._id));
            } else {
                const error = await res.json();
                showToast(error.error || 'Ekibe eklenemedi', 'error');
            }
        } catch (error) {
            console.error('Ekibe eklenemedi:', error);
            showToast('Bir hata oluştu', 'error');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', icon: 'code', color: 'bg-neo-blue', order: 0, leadId: '' });
        setSelectedLead(null);
        setEditingId(null);
        setShowForm(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getDepartmentColor = (dept: string) => {
        switch (dept) {
            case "Proje Departmanı": return "bg-neo-purple text-white";
            case "Teknik Departman": return "bg-neo-green text-black";
            case "Medya Departmanı": return "bg-neo-blue text-black";
            case "Kurumsal İletişim Departmanı": return "bg-yellow-400 text-black";
            default: return "bg-gray-200 text-black";
        }
    };

    const renderMemberBadge = (appId: string) => {
        const verification = memberVerifications[appId];

        if (verifyingMembers && !verification) {
            return <span className="text-xs text-gray-400 animate-pulse">Kontrol ediliyor...</span>;
        }

        if (!verification) {
            return null;
        }

        if (!verification.isMember) {
            return (
                <span className="px-2 py-1 text-xs font-black bg-red-100 text-red-800 border-2 border-red-300 flex items-center gap-1">
                    <XCircle size={12} /> Kulüp Üyesi Değil
                </span>
            );
        }

        const importantMatches = [verification.matches.fullName, verification.matches.email];
        const allImportantMatch = importantMatches.every(Boolean);

        return (
            <div className="flex flex-col gap-1">
                <span className="px-2 py-1 text-xs font-black bg-green-100 text-green-800 border-2 border-green-300 flex items-center gap-1">
                    <Check size={12} /> Kulüp Üyesi
                </span>
                <div className="text-xs flex flex-wrap gap-1">
                    <span
                        title={verification.matches.fullName ? 'Ad Soyad eşleşiyor' : `Veritabanı: ${verification.member?.fullName}`}
                        className={`px-1 border ${verification.matches.fullName ? 'bg-green-50 text-green-700 border-green-300' : 'bg-red-50 text-red-700 border-red-300'}`}
                    >
                        Ad{verification.matches.fullName ? '✓' : '✗'}
                    </span>
                    <span
                        title={verification.matches.email ? 'E-posta eşleşiyor' : `Veritabanı: ${verification.member?.email}`}
                        className={`px-1 border ${verification.matches.email ? 'bg-green-50 text-green-700 border-green-300' : 'bg-red-50 text-red-700 border-red-300'}`}
                    >
                        E-posta{verification.matches.email ? '✓' : '✗'}
                    </span>
                </div>
                {!allImportantMatch && (
                    <span className="text-xs text-orange-600 font-bold flex items-center gap-1"><AlertTriangle size={12} /> Bilgi uyumsuzluğu var</span>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <SkeletonList items={5} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-black text-black uppercase">Departman Yönetimi</h1>
                    <p className="text-gray-600 font-medium mt-1">Departmanları, ekip üyelerini ve başvuruları yönetin</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <Button
                        onClick={handleOpenApplicantsModal}
                        className="relative"
                    >
                        <FileText size={18} className="mr-2" />
                        Başvurular
                        {applicants.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-black">
                                {applicants.length}
                            </span>
                        )}
                    </Button>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        variant="success"
                    >
                        {showForm ? 'İptal' : '+ Yeni Departman'}
                    </Button>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white border-4 border-black shadow-neo p-6">
                    <h2 className="text-xl font-black text-black mb-4">
                        {editingId ? 'Departman Düzenle' : 'Yeni Departman'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Lead Selection */}
                        <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-400 mb-4">
                            <label className="block text-sm font-black text-black uppercase mb-1">Departman Sorumlusu (Opsiyonel)</label>
                            <p className="text-xs text-gray-500 mb-2">Departman başkanını veya sorumlusunu seçin.</p>

                            {selectedLead ? (
                                <div className="flex items-center gap-4 p-4 bg-green-50 border-2 border-green-500 mt-3">
                                    <div className="relative w-14 h-14 border-2 border-black shrink-0 bg-white">
                                        {selectedLead.avatar ? (
                                            <img src={selectedLead.avatar} alt={selectedLead.fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center font-black text-xl">
                                                {selectedLead.fullName.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Check size={16} className="text-green-600" />
                                            <span className="font-black text-green-800">Seçildi</span>
                                        </div>
                                        <p className="font-black text-lg">{selectedLead.fullName}</p>
                                        <p className="text-sm text-gray-600">{selectedLead.studentNo} • {selectedLead.email}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveLead}
                                        className="px-4 py-2 bg-red-500 text-white border-2 border-black font-black text-sm hover:bg-red-600"
                                    >
                                        Kaldır
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Üye adı veya öğrenci no ara..."
                                        value={memberQuery}
                                        onChange={(e) => setMemberQuery(e.target.value)}
                                        className="w-full px-3 py-2 border-2 border-black"
                                    />
                                    {foundMembers.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 bg-white border-2 border-black border-t-0 max-h-40 overflow-y-auto z-10">
                                            {foundMembers.map(m => (
                                                <button
                                                    key={m._id}
                                                    type="button"
                                                    onClick={() => handleSelectMember(m)}
                                                    className="w-full text-left px-3 py-2 hover:bg-neo-yellow border-b border-gray-200 last:border-0 flex items-center gap-3"
                                                >
                                                    <div className="w-8 h-8 bg-gray-200 border border-black flex items-center justify-center font-bold shrink-0 overflow-hidden">
                                                        {m.avatar ? (
                                                            <img src={m.avatar} alt={m.fullName} className="w-full h-full object-cover" />
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
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">İsim</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                    required
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
                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-1">Açıklama</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">Renk</label>
                                <select
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                >
                                    {colorOptions.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">İkon</label>
                                <select
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                >
                                    {iconOptions.map((i) => (
                                        <option key={i.value} value={i.value}>{i.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button type="submit">
                                {editingId ? 'Güncelle' : 'Oluştur'}
                            </Button>
                            <Button
                                type="button"
                                onClick={resetForm}
                                variant="secondary"
                            >
                                İptal
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Department List */}
            <div className="bg-white border-4 border-black shadow-neo">
                {departments.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 font-bold text-lg">Henüz departman bulunmuyor</p>
                    </div>
                ) : (
                    <div className="divide-y-4 divide-black">
                        {departments.map((dept) => (
                            <div key={dept._id} className="p-6 flex items-center justify-between hover:bg-gray-50 flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 ${dept.color} border-4 border-black flex items-center justify-center`}>
                                        <span className="text-2xl font-black">{dept.order + 1}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-black">{dept.name}</h3>
                                        <p className="text-gray-600 font-medium">{dept.description}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <Link
                                        href={`/admin/departments/${dept._id}/members`}
                                        className="px-4 py-2 bg-neo-yellow text-black border-2 border-black font-black text-sm hover:bg-yellow-400 transition-all flex items-center gap-2"
                                    >
                                        <Users size={16} />
                                        Üyeler
                                    </Link>
                                    <Button
                                        onClick={() => handleEdit(dept)}
                                        size="sm"
                                    >
                                        Düzenle
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(dept._id)}
                                        variant="danger"
                                        size="sm"
                                    >
                                        Sil
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Applicants Modal */}
            {showApplicantsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black shadow-neo max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b-4 border-black flex justify-between items-center bg-neo-blue">
                            <h2 className="text-xl font-black flex items-center gap-2">
                                <FileText size={24} />
                                Departman Başvuruları
                                <span className="bg-white text-black px-2 py-1 text-sm border-2 border-black ml-2">
                                    {applicants.length}
                                </span>
                            </h2>
                            <button
                                onClick={() => setShowApplicantsModal(false)}
                                className="text-2xl font-black hover:text-red-500"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {applicantsLoading ? (
                                <SkeletonList items={3} />
                            ) : applicants.length === 0 ? (
                                <p className="text-gray-500 font-bold text-center py-8">Bekleyen başvuru bulunmuyor</p>
                            ) : (
                                <div className="space-y-4">
                                    {applicants.map((applicant) => (
                                        <div key={applicant._id} className="border-2 border-black p-4 hover:bg-gray-50">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-grow">
                                                    <div className="flex items-center flex-wrap gap-3 mb-2">
                                                        <h3 className="text-lg font-black">{applicant.fullName}</h3>
                                                        <span className={`px-3 py-1 text-xs font-black border-2 border-black uppercase ${getDepartmentColor(applicant.selectedDepartment)}`}>
                                                            {applicant.selectedDepartment}
                                                        </span>
                                                        {renderMemberBadge(applicant._id)}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                                        <span className="bg-gray-100 px-2 py-1 border border-black">
                                                            {applicant.faculty} - {applicant.department}
                                                        </span>
                                                        <span className="bg-gray-100 px-2 py-1 border border-black">
                                                            {applicant.classYear}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap gap-3 text-sm">
                                                        <a href={`mailto:${applicant.email}`} className="text-blue-600 hover:underline font-bold">
                                                            {applicant.email}
                                                        </a>
                                                        <a href={`tel:${applicant.phone}`} className="text-blue-600 hover:underline font-bold">
                                                            {applicant.phone}
                                                        </a>
                                                    </div>
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        Başvuru: {formatDate(applicant.createdAt)}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        onClick={() => setExpandedApplicantId(expandedApplicantId === applicant._id ? null : applicant._id)}
                                                        size="sm"
                                                    >
                                                        {expandedApplicantId === applicant._id ? 'Gizle' : 'Detaylar'}
                                                    </Button>
                                                    <Button
                                                        onClick={() => setAddToTeamModal({ applicant, departmentId: '' })}
                                                        variant="success"
                                                        size="sm"
                                                    >
                                                        Ekibe Al
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDeleteApplicant(applicant._id, applicant.fullName)}
                                                        variant="danger"
                                                        size="sm"
                                                    >
                                                        Sil
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            {expandedApplicantId === applicant._id && (
                                                <div className="mt-4 bg-gray-100 border-2 border-black p-4 space-y-4">
                                                    {/* Motivation */}
                                                    <div>
                                                        <h4 className="text-sm font-black bg-neo-green px-2 py-1 inline-block border border-black mb-2">Motivasyon</h4>
                                                        <p className="text-sm bg-white p-3 border border-black whitespace-pre-wrap">{applicant.motivation}</p>
                                                    </div>

                                                    {/* Experience */}
                                                    <div>
                                                        <h4 className="text-sm font-black bg-neo-blue px-2 py-1 inline-block border border-black mb-2">Deneyim</h4>
                                                        <p className="text-sm bg-white p-3 border border-black">
                                                            <span className="font-bold">Organizasyon deneyimi: </span>
                                                            {applicant.hasExperience ? 'EVET' : 'HAYIR'}
                                                        </p>
                                                        {applicant.hasExperience && applicant.experienceDescription && (
                                                            <p className="text-sm bg-white p-3 border border-black mt-2 whitespace-pre-wrap">{applicant.experienceDescription}</p>
                                                        )}
                                                    </div>

                                                    {/* Department Specific */}
                                                    {Object.keys(applicant.departmentSpecificAnswers).length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm font-black bg-yellow-400 px-2 py-1 inline-block border border-black mb-2">Departmana Özel Cevaplar</h4>
                                                            {Object.entries(applicant.departmentSpecificAnswers).map(([key, value]) => (
                                                                <div key={key} className="bg-white p-3 border border-black mb-2">
                                                                    <p className="text-xs font-black text-gray-700 capitalize mb-1">{key.replace(/([A-Z])/g, " $1").trim()}:</p>
                                                                    <p className="text-sm whitespace-pre-wrap">{value}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Additional Notes */}
                                                    {applicant.additionalNotes && (
                                                        <div>
                                                            <h4 className="text-sm font-black bg-gray-300 px-2 py-1 inline-block border border-black mb-2">Ek Notlar</h4>
                                                            <p className="text-sm bg-white p-3 border border-black whitespace-pre-wrap">{applicant.additionalNotes}</p>
                                                        </div>
                                                    )}

                                                    {/* Social Links */}
                                                    {(applicant.github || applicant.linkedin) && (
                                                        <div className="flex gap-4">
                                                            {applicant.github && (
                                                                <a href={applicant.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-bold">
                                                                    GitHub
                                                                </a>
                                                            )}
                                                            {applicant.linkedin && (
                                                                <a href={applicant.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-bold">
                                                                    LinkedIn
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add to Team Modal */}
            {addToTeamModal.applicant && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white border-4 border-black shadow-neo max-w-md w-full">
                        <div className="p-6 border-b-4 border-black bg-neo-green">
                            <h2 className="text-xl font-black">Ekibe Ekle</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="font-bold">
                                <span className="text-gray-600">Başvuran:</span> {addToTeamModal.applicant.fullName}
                            </p>
                            <p className="font-bold">
                                <span className="text-gray-600">Tercih ettiği departman:</span> {addToTeamModal.applicant.selectedDepartment}
                            </p>

                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-2">Departman Seçin</label>
                                <select
                                    value={addToTeamModal.departmentId}
                                    onChange={(e) => setAddToTeamModal({ ...addToTeamModal, departmentId: e.target.value })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold"
                                >
                                    <option value="">Seçiniz...</option>
                                    {departments.map(d => (
                                        <option key={d._id} value={d._id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={handleAddToTeam}
                                    disabled={!addToTeamModal.departmentId}
                                    variant="success"
                                >
                                    Ekibe Ekle
                                </Button>
                                <Button
                                    onClick={() => setAddToTeamModal({ applicant: null, departmentId: '' })}
                                    variant="secondary"
                                >
                                    İptal
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
