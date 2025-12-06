'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import GlobalLoading from '@/app/_components/GlobalLoading';

interface Election {
    _id: string;
    title: string;
    description?: string;
    type: 'president' | 'department_head';
    status: 'draft' | 'active' | 'completed' | 'suspended';
    useRankedChoice: boolean;
    isSuspended?: boolean;
    suspensionReason?: string;
    stats: {
        candidateCount: number;
        memberCount: number;
        voteCount: number;
        votedMemberCount: number;
        turnout: string;
    };
}

interface Candidate {
    _id: string;
    name: string;
    photo?: string;
    bio?: string;
    order: number;
}

interface Member {
    _id: string;
    studentNo: string;
    fullName: string;
    department: string;
    phone: string;
    email: string;
    hasVoted: boolean;
}

interface CandidateResult {
    candidateId: string;
    name: string;
    photo?: string;
    votes: number;
    percentage: number;
    eliminated: boolean;
    eliminatedRound?: number;
}

interface IRVRound {
    round: number;
    results: CandidateResult[];
    eliminated?: string;
    winner?: string;
}

interface Results {
    election: Election;
    stats: {
        memberCount: number;
        votedCount: number;
        voteCount: number;
        turnout: string;
    };
    rounds: IRVRound[];
    winner?: string;
    totalVotes: number;
}

const statusLabels: Record<string, string> = {
    draft: 'Taslak',
    active: 'Devam Ediyor',
    completed: 'Tamamlandı',
    suspended: 'Askıya Alındı',
};

const statusColors: Record<string, string> = {
    draft: 'bg-gray-300',
    active: 'bg-neo-green',
    completed: 'bg-neo-purple text-white',
    suspended: 'bg-red-500 text-white',
};

export default function ElectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [election, setElection] = useState<Election | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [results, setResults] = useState<Results | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'candidates' | 'members' | 'results'>('candidates');
    const [uploading, setUploading] = useState(false);

    // Candidate form
    const [showCandidateForm, setShowCandidateForm] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
    const [candidateForm, setCandidateForm] = useState({ name: '', bio: '', photo: '' });

    // Pagination
    const [memberPage, setMemberPage] = useState(1);
    const membersPerPage = 25;

    // Modal states
    const [showEndModal, setShowEndModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspensionReason, setSuspensionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [electionRes, candidatesRes, membersRes] = await Promise.all([
                fetch(`/api/elections/${id}`),
                fetch(`/api/elections/${id}/candidates`),
                fetch(`/api/elections/${id}/members`),
            ]);

            if (electionRes.ok) {
                const data = await electionRes.json();
                setElection(data);
            }
            if (candidatesRes.ok) setCandidates(await candidatesRes.json());
            if (membersRes.ok) setMembers(await membersRes.json());
        } catch (error) {
            console.error('Veri yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchResults = async () => {
        try {
            const res = await fetch(`/api/elections/${id}/results`);
            if (res.ok) {
                setResults(await res.json());
            }
        } catch (error) {
            console.error('Sonuçlar yüklenemedi:', error);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === 'active' && candidates.length < 2) {
            alert('Seçimi başlatmak için en az 2 aday gerekli!');
            return;
        }
        if (newStatus === 'active' && members.length === 0) {
            alert('Seçimi başlatmak için üye listesi yüklemeniz gerekli!');
            return;
        }

        setActionLoading(true);
        try {
            const res = await fetch(`/api/elections/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    ...(newStatus === 'active' ? { startDate: new Date() } : {}),
                    ...(newStatus === 'completed' ? { endDate: new Date() } : {}),
                }),
            });

            if (res.ok) {
                fetchData();
                if (newStatus === 'completed') {
                    fetchResults();
                    setActiveTab('results');
                }
            }
        } catch (error) {
            console.error('Durum güncellenemedi:', error);
        } finally {
            setActionLoading(false);
            setShowEndModal(false);
        }
    };

    const handleSuspend = async () => {
        if (suspensionReason.trim().length < 10) {
            alert('Askıya alma nedeni en az 10 karakter olmalıdır');
            return;
        }

        setActionLoading(true);
        try {
            const res = await fetch(`/api/elections/${id}/suspend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: suspensionReason }),
            });

            if (res.ok) {
                fetchData();
                setSuspensionReason('');
            } else {
                const data = await res.json();
                alert(data.error || 'Bir hata oluştu');
            }
        } catch (error) {
            console.error('Seçim askıya alınamadı:', error);
        } finally {
            setActionLoading(false);
            setShowSuspendModal(false);
        }
    };

    const handleResume = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/elections/${id}/suspend`, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error('Seçim askıdan kaldırılamadı:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCandidateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingCandidate
                ? `/api/elections/${id}/candidates/${editingCandidate._id}`
                : `/api/elections/${id}/candidates`;

            const res = await fetch(url, {
                method: editingCandidate ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(candidateForm),
            });

            if (res.ok) {
                fetchData();
                setCandidateForm({ name: '', bio: '', photo: '' });
                setShowCandidateForm(false);
                setEditingCandidate(null);
            }
        } catch (error) {
            console.error('Aday kaydedilemedi:', error);
        }
    };

    const handleCandidateDelete = async (candidateId: string) => {
        if (!confirm('Bu adayı silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/elections/${id}/candidates/${candidateId}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Aday silinemedi:', error);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('folder', 'sdc-election-candidates');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData,
            });

            if (res.ok) {
                const { url } = await res.json();
                setCandidateForm({ ...candidateForm, photo: url });
            }
        } catch (error) {
            console.error('Fotoğraf yüklenemedi:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const res = await fetch(`/api/elections/${id}/members`, {
                method: 'POST',
                body: uploadData,
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                fetchData();
            } else {
                const error = await res.json();
                alert('Hata: ' + error.error);
            }
        } catch (error) {
            console.error('Excel yüklenemedi:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleClearMembers = async () => {
        if (!confirm('Tüm üye listesini silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/elections/${id}/members`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Üyeler silinemedi:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <GlobalLoading />
            </div>
        );
    }

    if (!election) {
        return (
            <div className="text-center py-12">
                <p className="text-xl font-black text-red-500">Seçim bulunamadı</p>
                <Link href="/admin/elections" className="text-neo-blue font-bold mt-4 inline-block">
                    ← Seçimlere Dön
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <Link href="/admin/elections" className="text-neo-blue font-bold text-sm mb-2 inline-block">
                            ← Seçimlere Dön
                        </Link>
                        <h1 className="text-2xl font-black text-black uppercase">{election.title}</h1>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className={`px-3 py-1 text-sm font-black border-2 border-black ${statusColors[election.status]}`}>
                                {statusLabels[election.status]}
                            </span>
                            {election.useRankedChoice && (
                                <span className="px-2 py-1 text-xs font-bold bg-neo-blue border border-black">
                                    IRV Oylama
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {election.status === 'draft' && (
                            <button
                                onClick={() => handleStatusChange('active')}
                                className="bg-neo-green text-black border-4 border-black shadow-neo px-6 py-3 font-black uppercase hover:bg-green-400 transition-all"
                            >
                                Seçimi Başlat
                            </button>
                        )}
                        {election.status === 'active' && !election.isSuspended && (
                            <>
                                <button
                                    onClick={() => setShowEndModal(true)}
                                    className="bg-neo-purple text-white border-4 border-black shadow-neo px-6 py-3 font-black uppercase hover:bg-purple-600 transition-all"
                                >
                                    Seçimi Bitir
                                </button>
                                <button
                                    onClick={() => setShowSuspendModal(true)}
                                    className="bg-orange-500 text-white border-4 border-black shadow-neo px-6 py-3 font-black uppercase hover:bg-orange-600 transition-all"
                                >
                                    Askıya Al
                                </button>
                            </>
                        )}
                        {election.isSuspended && (
                            <button
                                onClick={handleResume}
                                disabled={actionLoading}
                                className="bg-green-500 text-white border-4 border-black shadow-neo px-6 py-3 font-black uppercase hover:bg-green-600 transition-all disabled:opacity-50"
                            >
                                Devam Ettir
                            </button>
                        )}
                        {election.status === 'active' && (
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/vote/${id}`);
                                    alert('Oylama linki kopyalandı!');
                                }}
                                className="bg-neo-yellow text-black border-4 border-black shadow-neo px-6 py-3 font-black uppercase hover:bg-yellow-300 transition-all"
                            >
                                Linki Kopyala
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-neo-blue border-2 border-black p-4 text-center">
                        <div className="text-3xl font-black">{election.stats?.candidateCount || candidates.length}</div>
                        <div className="text-sm font-bold">Aday</div>
                    </div>
                    <div className="bg-neo-yellow border-2 border-black p-4 text-center">
                        <div className="text-3xl font-black">{election.stats?.memberCount || members.length}</div>
                        <div className="text-sm font-bold">Üye</div>
                    </div>
                    <div className="bg-neo-green border-2 border-black p-4 text-center">
                        <div className="text-3xl font-black">{election.stats?.votedMemberCount || 0}</div>
                        <div className="text-sm font-bold">Oy Kullanan</div>
                    </div>
                    <div className="bg-neo-purple text-white border-2 border-black p-4 text-center">
                        <div className="text-3xl font-black">%{election.stats?.turnout || 0}</div>
                        <div className="text-sm font-bold">Katılım</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setActiveTab('candidates')}
                    className={`px-6 py-3 font-black border-4 border-black ${activeTab === 'candidates' ? 'bg-black text-white' : 'bg-white text-black'}`}
                >
                    Adaylar ({candidates.length})
                </button>
                <button
                    onClick={() => setActiveTab('members')}
                    className={`px-6 py-3 font-black border-4 border-black ${activeTab === 'members' ? 'bg-black text-white' : 'bg-white text-black'}`}
                >
                    Üye Listesi ({members.length})
                </button>
                <button
                    onClick={() => { setActiveTab('results'); fetchResults(); }}
                    className={`px-6 py-3 font-black border-4 border-black ${activeTab === 'results' ? 'bg-black text-white' : 'bg-white text-black'}`}
                >
                    Sonuçlar
                </button>
            </div>

            {/* Candidates Tab */}
            {activeTab === 'candidates' && (
                <div className="bg-white border-4 border-black shadow-neo p-6">
                    {election.status === 'draft' && (
                        <div className="mb-4 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowCandidateForm(!showCandidateForm);
                                    setEditingCandidate(null);
                                    setCandidateForm({ name: '', bio: '', photo: '' });
                                }}
                                className="bg-neo-green text-black border-2 border-black px-4 py-2 font-bold hover:bg-green-400 transition-all"
                            >
                                {showCandidateForm ? 'İptal' : '+ Aday Ekle'}
                            </button>
                        </div>
                    )}

                    {showCandidateForm && (
                        <form onSubmit={handleCandidateSubmit} className="mb-6 p-4 bg-gray-50 border-2 border-black space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-black uppercase mb-1">İsim *</label>
                                    <input
                                        type="text"
                                        value={candidateForm.name}
                                        onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-black font-bold"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-black uppercase mb-1">Fotoğraf</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            className="border-2 border-black p-1 text-sm flex-1"
                                        />
                                        {uploading && <span className="text-sm">Yükleniyor...</span>}
                                        {candidateForm.photo && (
                                            <div className="w-10 h-10 border-2 border-black relative">
                                                <Image src={candidateForm.photo} alt="Preview" fill className="object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-black uppercase mb-1">Biyografi</label>
                                <textarea
                                    value={candidateForm.bio}
                                    onChange={(e) => setCandidateForm({ ...candidateForm, bio: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 border-2 border-black font-bold"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-black text-white px-4 py-2 font-black uppercase hover:bg-gray-800 transition-all"
                            >
                                {editingCandidate ? 'Güncelle' : 'Ekle'}
                            </button>
                        </form>
                    )}

                    {candidates.length === 0 ? (
                        <p className="text-center text-gray-500 py-8 font-bold">Henüz aday eklenmemiş</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {candidates.map((candidate) => (
                                <div key={candidate._id} className="border-2 border-black p-4 hover:shadow-neo transition-all">
                                    <div className="flex gap-4">
                                        {candidate.photo ? (
                                            <div className="w-20 h-20 border-2 border-black relative flex-shrink-0">
                                                <Image src={candidate.photo} alt={candidate.name} fill className="object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 bg-gray-200 border-2 border-black flex items-center justify-center flex-shrink-0">
                                                <span className="text-2xl font-black">{candidate.name[0]}</span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-lg">{candidate.name}</h3>
                                            {candidate.bio && (
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{candidate.bio}</p>
                                            )}
                                        </div>
                                    </div>
                                    {election.status === 'draft' && (
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => {
                                                    setEditingCandidate(candidate);
                                                    setCandidateForm({ name: candidate.name, bio: candidate.bio || '', photo: candidate.photo || '' });
                                                    setShowCandidateForm(true);
                                                }}
                                                className="flex-1 px-3 py-1 bg-neo-blue text-black border border-black text-sm font-bold hover:bg-blue-300"
                                            >
                                                Düzenle
                                            </button>
                                            <button
                                                onClick={() => handleCandidateDelete(candidate._id)}
                                                className="px-3 py-1 bg-red-500 text-white border border-black text-sm font-bold hover:bg-red-600"
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
                <div className="bg-white border-4 border-black shadow-neo p-6">
                    {election.status === 'draft' && (
                        <div className="mb-6 p-4 bg-neo-yellow border-2 border-black">
                            <h3 className="font-black mb-2">Üye Listesi Yükle (Excel veya CSV)</h3>
                            <div className="bg-white border-2 border-black p-3 mb-3">
                                <p className="text-sm font-bold mb-2">📋 Dosya formatı (sırasıyla bu 5 sütun olmalı):</p>
                                <table className="text-sm w-full">
                                    <thead>
                                        <tr className="border-b border-black">
                                            <th className="p-1 text-left">1. Öğrenci No</th>
                                            <th className="p-1 text-left">2. Ad Soyad</th>
                                            <th className="p-1 text-left">3. Bölüm</th>
                                            <th className="p-1 text-left">4. Telefon</th>
                                            <th className="p-1 text-left">5. E-posta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="text-gray-600">
                                            <td className="p-1">445851</td>
                                            <td className="p-1">Ali Veli</td>
                                            <td className="p-1">Yazılım Müh.</td>
                                            <td className="p-1">5551234567</td>
                                            <td className="p-1">ali@mail.com</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p className="text-xs text-gray-500 mt-2">⚠️ Başlık satırı varsa ilk satır atlanır. Sadece bu 5 sütun olmalı, başka sütun olmamalı.</p>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleExcelUpload}
                                    className="border-2 border-black bg-white p-2 font-bold"
                                    disabled={uploading}
                                />
                                {members.length > 0 && (
                                    <button
                                        onClick={handleClearMembers}
                                        className="px-4 py-2 bg-red-500 text-white border-2 border-black font-bold hover:bg-red-600"
                                    >
                                        Listeyi Temizle
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {members.length === 0 ? (
                        <p className="text-center text-gray-500 py-8 font-bold">Üye listesi yüklenmemiş</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-black text-white">
                                        <th className="p-3 text-left font-black">Öğrenci No</th>
                                        <th className="p-3 text-left font-black">Ad Soyad</th>
                                        <th className="p-3 text-left font-black">Bölüm</th>
                                        <th className="p-3 text-left font-black">Telefon</th>
                                        <th className="p-3 text-left font-black">E-posta</th>
                                        <th className="p-3 text-center font-black">Oy Durumu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members
                                        .slice((memberPage - 1) * membersPerPage, memberPage * membersPerPage)
                                        .map((member) => (
                                            <tr key={member._id} className="border-b-2 border-black hover:bg-gray-50">
                                                <td className="p-3 font-bold">{member.studentNo}</td>
                                                <td className="p-3 font-bold">{member.fullName}</td>
                                                <td className="p-3 text-sm">{member.department}</td>
                                                <td className="p-3 text-sm">{member.phone}</td>
                                                <td className="p-3 text-sm">{member.email}</td>
                                                <td className="p-3 text-center">
                                                    {member.hasVoted ? (
                                                        <span className="px-2 py-1 bg-neo-green border border-black text-xs font-bold">OY KULLANDI</span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-gray-200 border border-black text-xs font-bold">BEKLİYOR</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {members.length > membersPerPage && (
                                <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
                                    <button
                                        onClick={() => setMemberPage(p => Math.max(1, p - 1))}
                                        disabled={memberPage === 1}
                                        className="px-3 py-2 border-2 border-black font-bold disabled:opacity-50 hover:bg-gray-100"
                                    >
                                        ←
                                    </button>
                                    {Array.from({ length: Math.ceil(members.length / membersPerPage) }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setMemberPage(page)}
                                            className={`w-10 h-10 border-2 border-black font-bold ${memberPage === page ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setMemberPage(p => Math.min(Math.ceil(members.length / membersPerPage), p + 1))}
                                        disabled={memberPage === Math.ceil(members.length / membersPerPage)}
                                        className="px-3 py-2 border-2 border-black font-bold disabled:opacity-50 hover:bg-gray-100"
                                    >
                                        →
                                    </button>
                                    <span className="ml-4 text-sm font-bold text-gray-600">
                                        Toplam: {members.length} üye
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Results Tab */}
            {activeTab === 'results' && (
                <div className="bg-white border-4 border-black shadow-neo p-6">
                    {!results ? (
                        <p className="text-center text-gray-500 py-8 font-bold">Sonuçlar yükleniyor...</p>
                    ) : results.totalVotes === 0 ? (
                        <p className="text-center text-gray-500 py-8 font-bold">Henüz oy kullanılmamış</p>
                    ) : (
                        <div className="space-y-6">
                            {/* Winner Banner */}
                            {results.winner && election.status === 'completed' && (
                                <div className="bg-neo-green border-4 border-black p-6 text-center">
                                    <h2 className="text-2xl font-black uppercase mb-2">🏆 Kazanan 🏆</h2>
                                    <p className="text-3xl font-black">
                                        {results.rounds[results.rounds.length - 1]?.results.find(r => r.candidateId === results.winner)?.name}
                                    </p>
                                </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-100 border-2 border-black p-4 text-center">
                                    <div className="text-2xl font-black">{results.stats.memberCount}</div>
                                    <div className="text-sm font-bold">Toplam Üye</div>
                                </div>
                                <div className="bg-gray-100 border-2 border-black p-4 text-center">
                                    <div className="text-2xl font-black">{results.stats.voteCount}</div>
                                    <div className="text-sm font-bold">Toplam Oy</div>
                                </div>
                                <div className="bg-gray-100 border-2 border-black p-4 text-center">
                                    <div className="text-2xl font-black">%{results.stats.turnout}</div>
                                    <div className="text-sm font-bold">Katılım Oranı</div>
                                </div>
                                <div className="bg-gray-100 border-2 border-black p-4 text-center">
                                    <div className="text-2xl font-black">{results.rounds.length}</div>
                                    <div className="text-sm font-bold">Tur Sayısı</div>
                                </div>
                            </div>

                            {/* Rounds */}
                            {results.rounds.map((round) => (
                                <div key={round.round} className="border-2 border-black">
                                    <div className="bg-black text-white p-3 font-black">
                                        Tur {round.round}
                                        {round.winner && <span className="ml-2 text-neo-green">✓ Kazanan Belirlendi</span>}
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {round.results.map((result, idx) => (
                                            <div
                                                key={result.candidateId}
                                                className={`flex items-center gap-4 p-3 border-2 ${result.candidateId === round.winner
                                                    ? 'border-neo-green bg-green-50'
                                                    : result.eliminated
                                                        ? 'border-red-300 bg-red-50 opacity-60'
                                                        : 'border-black'
                                                    }`}
                                            >
                                                <span className="font-black text-lg w-8">{idx + 1}.</span>
                                                {result.photo ? (
                                                    <div className="w-12 h-12 border-2 border-black relative">
                                                        <Image src={result.photo} alt={result.name} fill className="object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-200 border-2 border-black flex items-center justify-center">
                                                        <span className="font-black">{result.name[0]}</span>
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="font-black">{result.name}</div>
                                                    <div className="text-sm text-gray-600">
                                                        {result.votes} oy ({result.percentage.toFixed(1)}%)
                                                    </div>
                                                </div>
                                                <div className="w-32 h-4 bg-gray-200 border border-black relative">
                                                    <div
                                                        className={`h-full ${result.candidateId === round.winner
                                                            ? 'bg-neo-green'
                                                            : result.eliminated
                                                                ? 'bg-red-400'
                                                                : 'bg-neo-blue'
                                                            }`}
                                                        style={{ width: `${result.percentage}%` }}
                                                    />
                                                </div>
                                                {result.eliminated && (
                                                    <span className="text-xs font-bold text-red-500">ELENDİ</span>
                                                )}
                                                {result.candidateId === round.winner && (
                                                    <span className="text-xs font-bold text-green-600">🏆</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* End Election Confirmation Modal */}
            {showEndModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black shadow-neo max-w-md w-full p-6">
                        <h3 className="text-xl font-black text-black mb-4">🏁 Seçimi Bitir</h3>
                        <div className="bg-red-100 border-2 border-red-500 p-4 mb-4">
                            <p className="text-red-700 font-bold text-sm">
                                ⚠️ Bu işlem geri alınamaz!
                            </p>
                        </div>
                        <p className="text-gray-700 mb-4">
                            Seçimi bitirdiğinizde:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                            <li>Artık yeni oy kullanılamayacak</li>
                            <li>Seçim sonuçları kesinleşecek ve açıklanacak</li>
                            <li>Seçim durumu "Tamamlandı" olarak değişecek</li>
                            <li>Bu işlem geri alınamaz</li>
                        </ul>
                        <p className="text-gray-700 font-bold mb-4">
                            Devam etmek istediğinize emin misiniz?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleStatusChange('completed')}
                                disabled={actionLoading}
                                className="flex-1 bg-neo-purple text-white py-3 font-bold border-2 border-black hover:bg-purple-600 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? 'İşleniyor...' : 'Evet, Seçimi Bitir'}
                            </button>
                            <button
                                onClick={() => setShowEndModal(false)}
                                disabled={actionLoading}
                                className="flex-1 bg-gray-200 text-black py-3 font-bold border-2 border-black hover:bg-gray-300 transition-all disabled:opacity-50"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Suspend Modal */}
            {showSuspendModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black shadow-neo max-w-lg w-full p-6">
                        <h3 className="text-xl font-black text-black mb-4">⚠️ Seçimi Askıya Al</h3>
                        <p className="text-gray-700 mb-4">
                            Olağanüstü durumlarda seçimi askıya alabilirsiniz. Kullanıcılara gösterilecek bir neden girmeniz gerekmektedir.
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-black text-black uppercase mb-2">
                                Askıya Alma Nedeni *
                            </label>
                            <textarea
                                value={suspensionReason}
                                onChange={(e) => setSuspensionReason(e.target.value)}
                                rows={4}
                                placeholder="Örn: Teknik sorunlar nedeniyle seçim askıya alınmıştır. En kısa sürede devam edilecektir."
                                className="w-full px-4 py-3 border-4 border-black font-medium focus:outline-none focus:shadow-neo"
                            />
                            <p className="text-xs text-gray-500 mt-1">En az 10 karakter girilmelidir. Bu mesaj oy kullanmaya çalışan üyelere gösterilecektir.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSuspend}
                                disabled={actionLoading || suspensionReason.trim().length < 10}
                                className="flex-1 bg-orange-500 text-white py-3 font-bold border-2 border-black hover:bg-orange-600 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? 'Askıya Alınıyor...' : 'Askıya Al'}
                            </button>
                            <button
                                onClick={() => { setShowSuspendModal(false); setSuspensionReason(''); }}
                                disabled={actionLoading}
                                className="flex-1 bg-gray-200 text-black py-3 font-bold border-2 border-black hover:bg-gray-300 transition-all disabled:opacity-50"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
