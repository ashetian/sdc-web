"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/app/_components/LoadingSpinner';

interface Member {
    _id: string;
    studentNo: string;
    fullName: string;
    email: string;
    phone?: string;
    department?: string;
    isRegistered?: boolean;
    nickname?: string;
    isTestAccount?: boolean;
}

interface TestMemberForm {
    studentNo: string;
    fullName: string;
    email: string;
    password: string;
    department: string;
    nickname: string;
    phone: string;
}

export default function MembersSettingsPage() {
    // Member management state
    const [memberCount, setMemberCount] = useState(0);
    const [members, setMembers] = useState<Member[]>([]);
    const [memberSearch, setMemberSearch] = useState('');
    const [showMembers, setShowMembers] = useState(false);
    const [uploadingMembers, setUploadingMembers] = useState(false);
    const [memberMessage, setMemberMessage] = useState('');
    const [clearingMembers, setClearingMembers] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const MEMBERS_PER_PAGE = 20;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [resettingPassword, setResettingPassword] = useState<string | null>(null);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [editingMember, setEditingMember] = useState<Partial<Member>>({});
    const [savingMember, setSavingMember] = useState(false);
    const [resettingProfile, setResettingProfile] = useState<string | null>(null);
    const [confirmResetId, setConfirmResetId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creatingMember, setCreatingMember] = useState(false);
    const [newMemberData, setNewMemberData] = useState<TestMemberForm>({
        studentNo: '',
        fullName: '',
        email: '',
        password: '',
        department: '',
        nickname: '',
        phone: ''
    });
    // Multi-select state
    const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
    const [batchDeleting, setBatchDeleting] = useState(false);

    useEffect(() => {
        fetchMemberCount();
    }, []);

    const fetchMemberCount = async () => {
        try {
            const res = await fetch('/api/members?countOnly=true');
            if (res.ok) {
                const data = await res.json();
                setMemberCount(data.count);
            }
        } catch (error) {
            console.error('Üye sayısı alınamadı:', error);
        }
    };

    const fetchMembers = async (search = '', page = 1) => {
        setLoadingMembers(true);
        try {
            const res = await fetch(`/api/members?search=${encodeURIComponent(search)}&page=${page}&limit=${MEMBERS_PER_PAGE}`);
            if (res.ok) {
                const data = await res.json();
                setMembers(data.members);
                setTotalPages(data.pagination?.totalPages || 1);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Üyeler alınamadı:', error);
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleMemberUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingMembers(true);
        setMemberMessage('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/members', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setMemberMessage(`✅ ${data.message}`);
                fetchMemberCount();
                if (showMembers) {
                    fetchMembers(memberSearch);
                }
            } else {
                setMemberMessage(`❌ ${data.error || 'Yükleme başarısız'}`);
            }
        } catch (error) {
            console.error('Hata:', error);
            setMemberMessage('❌ Yükleme sırasında bir hata oluştu.');
        } finally {
            setUploadingMembers(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleClearMembers = async () => {
        if (!confirm('Tüm kayıtsız üyeleri silmek istediğinizden emin misiniz? Kayıtlı üyeler korunacak.')) {
            return;
        }

        setClearingMembers(true);
        setMemberMessage('');

        try {
            const res = await fetch('/api/members', {
                method: 'DELETE',
            });

            const data = await res.json();

            if (res.ok) {
                setMemberMessage(`✅ ${data.message}`);
                fetchMemberCount();
                if (showMembers) {
                    fetchMembers(memberSearch, 1);
                }
            } else {
                setMemberMessage(`❌ ${data.error || 'Silme başarısız'}`);
            }
        } catch (error) {
            console.error('Hata:', error);
            setMemberMessage('❌ Silme sırasında bir hata oluştu.');
        } finally {
            setClearingMembers(false);
        }
    };

    const handleBatchDelete = async () => {
        if (selectedMemberIds.size === 0) return;

        if (!confirm(`Seçili ${selectedMemberIds.size} üyeyi silmek istediğinizden emin misiniz? Kayıtlı üyeler korunacak.`)) {
            return;
        }

        setBatchDeleting(true);
        setMemberMessage('');

        try {
            const res = await fetch('/api/members/batch', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberIds: Array.from(selectedMemberIds) })
            });

            const data = await res.json();

            if (res.ok) {
                setMemberMessage(`✅ ${data.message}`);
                setSelectedMemberIds(new Set());
                fetchMemberCount();
                fetchMembers(memberSearch, currentPage);
            } else {
                setMemberMessage(`❌ ${data.error || 'Silme başarısız'}`);
            }
        } catch (error) {
            console.error('Hata:', error);
            setMemberMessage('❌ Silme sırasında bir hata oluştu.');
        } finally {
            setBatchDeleting(false);
        }
    };

    const toggleMemberSelection = (memberId: string, isRegistered: boolean) => {
        if (isRegistered) return; // Kayıtlı üyeler seçilemez

        setSelectedMemberIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(memberId)) {
                newSet.delete(memberId);
            } else {
                newSet.add(memberId);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        const selectableMembers = members.filter(m => !m.isRegistered);
        const allSelected = selectableMembers.every(m => selectedMemberIds.has(m._id));

        if (allSelected) {
            // Deselect all
            setSelectedMemberIds(new Set());
        } else {
            // Select all non-registered
            setSelectedMemberIds(new Set(selectableMembers.map(m => m._id)));
        }
    };

    const handleCreateTestMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingMember(true);
        setMemberMessage('');

        try {
            const res = await fetch('/api/admin/members/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMemberData)
            });
            const data = await res.json();

            if (res.ok) {
                setMemberMessage(`✅ ${data.message}`);
                setShowCreateModal(false);
                setNewMemberData({
                    studentNo: '', fullName: '', email: '', password: '',
                    department: '', nickname: '', phone: ''
                });
                fetchMemberCount();
                if (showMembers) fetchMembers(memberSearch);
            } else {
                alert(`Hata: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            alert('Bir hata oluştu.');
        } finally {
            setCreatingMember(false);
        }
    };

    const handleToggleMembers = () => {
        if (!showMembers) {
            setCurrentPage(1);
            fetchMembers(memberSearch, 1);
        }
        setShowMembers(!showMembers);
    };

    const handleMemberSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchMembers(memberSearch, 1);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchMembers(memberSearch, newPage);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6 flex justify-between items-center">
                <h1 className="text-2xl font-black text-black uppercase">Kulüp Üye Yönetimi</h1>
                <Link href="/admin/settings" className="font-bold text-gray-500 hover:text-black hover:underline">
                    &larr; Geri Dön
                </Link>
            </div>

            <div className="bg-white border-4 border-black shadow-neo p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
                    <div className="bg-blue-100 border-2 border-neo-blue text-neo-blue rounded-none px-4 py-2 font-black shadow-neo-sm transform -rotate-1">
                        <span className="text-2xl">{memberCount}</span>
                        <span className="text-sm ml-2 font-bold uppercase">kayıtlı üye</span>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-3 border-2 border-black shadow-neo text-sm font-black uppercase text-black bg-neo-yellow hover:bg-yellow-400 hover:shadow-none transition-all"
                    >
                        + Test Üyesi Ekle
                    </button>

                    <label className="cursor-pointer inline-flex items-center px-4 py-3 border-2 border-black shadow-neo text-sm font-black uppercase text-white bg-neo-green hover:bg-green-500 hover:shadow-none transition-all disabled:opacity-50">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleMemberUpload}
                            disabled={uploadingMembers}
                            className="hidden"
                        />
                        {uploadingMembers ? 'Yükleniyor...' : '📁 Excel/CSV Yükle'}
                    </label>

                    <button
                        onClick={handleToggleMembers}
                        className="inline-flex items-center px-4 py-3 border-2 border-black shadow-neo text-sm font-black uppercase text-black bg-white hover:bg-gray-100 hover:shadow-none transition-all"
                    >
                        {showMembers ? 'Listeyi Gizle' : 'Üye Listesi'}
                    </button>

                    {selectedMemberIds.size > 0 && (
                        <button
                            onClick={handleBatchDelete}
                            disabled={batchDeleting}
                            className="inline-flex items-center px-4 py-3 border-2 border-black shadow-neo text-sm font-black uppercase text-white bg-orange-600 hover:bg-orange-700 hover:shadow-none disabled:opacity-50"
                        >
                            {batchDeleting ? 'Siliniyor...' : `🗑️ Seçilenleri Sil (${selectedMemberIds.size})`}
                        </button>
                    )}
                    {memberCount > 0 && (
                        <button
                            onClick={handleClearMembers}
                            disabled={clearingMembers}
                            className="inline-flex items-center px-4 py-3 border-2 border-black shadow-neo text-sm font-black uppercase text-white bg-red-600 hover:bg-red-700 hover:shadow-none disabled:opacity-50 ml-auto"
                        >
                            {clearingMembers ? 'Siliniyor...' : '🗑️ Kayıtsızları Sil'}
                        </button>
                    )}
                </div>

                <div className="bg-yellow-50 border-2 border-black border-dashed p-4 mb-6">
                    <h3 className="font-black text-black uppercase mb-2 text-sm">📋 Dosya Formatı (Excel/CSV)</h3>
                    <div className="overflow-x-auto">
                        <table className="text-xs border-2 border-black w-full bg-white">
                            <thead className="bg-gray-100 border-b-2 border-black">
                                <tr>
                                    <th className="border-r border-black px-2 py-1">A: Öğrenci No</th>
                                    <th className="border-r border-black px-2 py-1">B: Ad Soyad</th>
                                    <th className="border-r border-black px-2 py-1">C: Bölüm</th>
                                    <th className="border-r border-black px-2 py-1">D: Telefon</th>
                                    <th className="px-2 py-1">E: E-posta</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border-r border-black px-2 py-1">123456789</td>
                                    <td className="border-r border-black px-2 py-1">Ahmet Yılmaz</td>
                                    <td className="border-r border-black px-2 py-1">Bilgisayar Müh.</td>
                                    <td className="border-r border-black px-2 py-1">5551234567</td>
                                    <td className="px-2 py-1">ahmet@example.com</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {memberMessage && (
                    <div className={`p-4 font-bold border-2 border-black mb-6 ${memberMessage.includes('❌') ? 'bg-red-100 text-red-900' : 'bg-green-100 text-green-900'}`}>
                        {memberMessage}
                    </div>
                )}

                {showMembers && (
                    <div className="border-t-4 border-black pt-6">
                        <form onSubmit={handleMemberSearch} className="flex gap-2 mb-6">
                            <input
                                type="text"
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                                placeholder="İsim, öğrenci no veya email..."
                                className="flex-1 border-2 border-black p-3 font-bold focus:shadow-neo focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-neo-blue border-2 border-black font-black uppercase shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                            >
                                Ara
                            </button>
                        </form>

                        {loadingMembers ? (
                            <div className="flex justify-center py-8">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : members.length > 0 ? (
                            <>
                                <div className="overflow-x-auto border-2 border-black">
                                    <table className="min-w-full divide-y-2 divide-black">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-3 py-3 text-center text-xs font-black text-black uppercase w-10">
                                                    <input
                                                        type="checkbox"
                                                        checked={members.filter(m => !m.isRegistered).length > 0 &&
                                                            members.filter(m => !m.isRegistered).every(m => selectedMemberIds.has(m._id))}
                                                        onChange={toggleSelectAll}
                                                        className="w-4 h-4 accent-orange-600 cursor-pointer"
                                                        title="Tüm kayıtsız üyeleri seç"
                                                    />
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-black text-black uppercase">Öğrenci No</th>
                                                <th className="px-4 py-3 text-left text-xs font-black text-black uppercase">Ad Soyad</th>
                                                <th className="px-4 py-3 text-left text-xs font-black text-black uppercase">Takma Ad</th>
                                                <th className="px-4 py-3 text-left text-xs font-black text-black uppercase">Bölüm</th>
                                                <th className="px-4 py-3 text-left text-xs font-black text-black uppercase">Telefon</th>
                                                <th className="px-4 py-3 text-left text-xs font-black text-black uppercase">E-posta</th>
                                                <th className="px-4 py-3 text-left text-xs font-black text-black uppercase">Durum</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {members.map((member) => (
                                                <tr
                                                    key={member._id}
                                                    className={`transition-colors ${member.isTestAccount ? 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-l-yellow-400' : 'hover:bg-blue-50'} ${selectedMemberIds.has(member._id) ? 'bg-orange-100' : ''}`}
                                                >
                                                    <td className="px-3 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMemberIds.has(member._id)}
                                                            onChange={() => toggleMemberSelection(member._id, member.isRegistered || false)}
                                                            disabled={member.isRegistered}
                                                            className="w-4 h-4 accent-orange-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                            onClick={(e) => e.stopPropagation()}
                                                            title={member.isRegistered ? 'Kayıtlı üyeler silinemez' : 'Silmek için seç'}
                                                        />
                                                    </td>
                                                    <td
                                                        className="px-4 py-3 text-sm font-bold cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedMember(member);
                                                            setEditingMember(member);
                                                        }}
                                                    >
                                                        {member.isTestAccount && (
                                                            <span className="mr-2 text-xs bg-yellow-400 text-black px-1.5 py-0.5 font-black uppercase rounded-sm border border-black">TEST</span>
                                                        )}
                                                        {member.studentNo}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-bold cursor-pointer" onClick={() => { setSelectedMember(member); setEditingMember(member); }}>{member.fullName}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 font-medium">{member.nickname || '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{member.department || '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{member.phone || '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {member.isRegistered ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 border border-black bg-green-200 text-black text-xs font-black uppercase">
                                                                ✓ Kayıtlı
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 border border-black bg-gray-200 text-gray-600 text-xs font-black uppercase">
                                                                Kayıtsız
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm font-bold text-gray-700">
                                            Sayfa {currentPage} / {totalPages}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 border-2 border-black font-bold disabled:opacity-50 ml-2"
                                            >
                                                &larr; Önceki
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 border-2 border-black font-bold disabled:opacity-50"
                                            >
                                                Sonraki &rarr;
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-gray-500 text-center py-8 font-bold">Üye bulunamadı.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {selectedMember && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm" onClick={() => setSelectedMember(null)}>
                    <div className="bg-white border-4 border-black shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b-4 border-black flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-black uppercase">Üye Düzenle</h3>
                            <button onClick={() => setSelectedMember(null)} className="text-2xl font-black hover:text-red-500">×</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Ad Soyad</label>
                                <input
                                    className="w-full border-2 border-black p-2 font-medium"
                                    value={editingMember.fullName || ''}
                                    onChange={e => setEditingMember({ ...editingMember, fullName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Takma Ad (Nickname)</label>
                                <input
                                    className="w-full border-2 border-black p-2 font-medium"
                                    value={editingMember.nickname || ''}
                                    placeholder="Opsiyonel"
                                    onChange={e => setEditingMember({ ...editingMember, nickname: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">E-posta</label>
                                <input
                                    className="w-full border-2 border-black p-2 font-medium"
                                    value={editingMember.email || ''}
                                    onChange={e => setEditingMember({ ...editingMember, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Telefon</label>
                                <input
                                    className="w-full border-2 border-black p-2 font-medium"
                                    value={editingMember.phone || ''}
                                    onChange={e => setEditingMember({ ...editingMember, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Bölüm</label>
                                <input
                                    className="w-full border-2 border-black p-2 font-medium"
                                    value={editingMember.department || ''}
                                    onChange={e => setEditingMember({ ...editingMember, department: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                {selectedMember.isRegistered && (
                                    <>
                                        <button
                                            onClick={async () => {
                                                if (!confirm(`${selectedMember.fullName} için şifre sıfırlama maili gönderilsin mi?`)) return;
                                                setResettingPassword(selectedMember._id);
                                                try {
                                                    const res = await fetch(`/api/members/${selectedMember._id}`, { method: 'POST' });
                                                    const data = await res.json();
                                                    if (res.ok) alert(`✅ ${data.message}`);
                                                    else alert(`❌ ${data.error}`);
                                                } catch { alert('Hata oluştu'); }
                                                finally { setResettingPassword(null); }
                                            }}
                                            className="w-full py-2 bg-yellow-400 border-2 border-black font-black uppercase hover:bg-yellow-500"
                                        >
                                            {resettingPassword === selectedMember._id ? 'Gönderiliyor...' : '🔑 Şifre Sıfırla'}
                                        </button>

                                        <button
                                            onClick={() => setConfirmResetId(selectedMember._id)}
                                            className="w-full py-2 bg-red-100 text-red-700 border-2 border-red-700 font-black uppercase hover:bg-red-200"
                                        >
                                            ⚠️ Hesabı Sıfırla (Reseti)
                                        </button>
                                    </>
                                )}



                                <div className="pt-4 border-t-2 border-dashed border-gray-300">
                                    <h4 className="font-bold text-red-600 text-sm mb-2 uppercase">Tehlikeli Bölge</h4>
                                    <button
                                        onClick={async () => {
                                            if (!confirm(`DİKKAT: "${selectedMember.fullName}" isimli üyeyi tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileri kaybolur.`)) return;
                                            try {
                                                const res = await fetch(`/api/members/${selectedMember._id}`, { method: 'DELETE' });
                                                if (res.ok) {
                                                    alert('Üye başarıyla silindi.');
                                                    setSelectedMember(null);
                                                    fetchMembers(memberSearch, currentPage);
                                                    fetchMemberCount();
                                                } else {
                                                    const text = await res.text();
                                                    try {
                                                        const err = JSON.parse(text);
                                                        alert('Hata: ' + (err.error || 'Silinemedi'));
                                                    } catch {
                                                        alert(`Hata (${res.status}): ${text.substring(0, 100)}`);
                                                    }
                                                }
                                            } catch (e: any) { alert('Hata oluştu: ' + e.message); }
                                        }}
                                        className="w-full py-2 bg-white border-2 border-red-600 text-red-600 font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-none hover:shadow-neo"
                                    >
                                        🗑️ Üyeyi Veritabanından Sil
                                    </button>
                                </div>

                                <button
                                    onClick={async () => {
                                        setSavingMember(true);
                                        try {
                                            const res = await fetch(`/api/members/${selectedMember._id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify(editingMember),
                                            });
                                            if (res.ok) {
                                                fetchMembers(memberSearch, currentPage);
                                                setSelectedMember(null);
                                            } else {
                                                alert('Kaydedilemedi');
                                            }
                                        } catch { alert('Hata'); }
                                        finally { setSavingMember(false); }
                                    }}
                                    className="w-full py-3 bg-neo-blue border-2 border-black text-white font-black uppercase hover:bg-blue-600 shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all mt-2"
                                >
                                    {savingMember ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Create Test User Modal */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
                        <div className="bg-white border-4 border-black shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b-4 border-black flex justify-between items-center bg-gray-50">
                                <h3 className="text-xl font-black uppercase">Test Üyesi Oluştur</h3>
                                <button onClick={() => setShowCreateModal(false)} className="text-2xl font-black hover:text-red-500">×</button>
                            </div>
                            <form onSubmit={handleCreateTestMember} className="p-6 space-y-4">
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm text-blue-800 font-bold mb-4">
                                    Bu kullanıcı direkt olarak "Kayıtlı" statüsünde oluşturulacak ve belirlediğiniz şifre ile giriş yapabilecektir.
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Öğrenci No *</label>
                                        <input
                                            required
                                            className="w-full border-2 border-black p-2 font-medium"
                                            value={newMemberData.studentNo}
                                            onChange={e => setNewMemberData({ ...newMemberData, studentNo: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Şifre *</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full border-2 border-black p-2 font-medium bg-yellow-50"
                                            value={newMemberData.password}
                                            placeholder="En az 6 karakter"
                                            onChange={e => setNewMemberData({ ...newMemberData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1">Ad Soyad *</label>
                                    <input
                                        required
                                        className="w-full border-2 border-black p-2 font-medium"
                                        value={newMemberData.fullName}
                                        onChange={e => setNewMemberData({ ...newMemberData, fullName: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1">E-posta *</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full border-2 border-black p-2 font-medium"
                                        value={newMemberData.email}
                                        onChange={e => setNewMemberData({ ...newMemberData, email: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Takma Ad</label>
                                        <input
                                            className="w-full border-2 border-black p-2 font-medium"
                                            value={newMemberData.nickname}
                                            onChange={e => setNewMemberData({ ...newMemberData, nickname: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Telefon</label>
                                        <input
                                            className="w-full border-2 border-black p-2 font-medium"
                                            value={newMemberData.phone}
                                            onChange={e => setNewMemberData({ ...newMemberData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1">Bölüm</label>
                                    <input
                                        className="w-full border-2 border-black p-2 font-medium"
                                        value={newMemberData.department}
                                        placeholder="Örn: Bilgisayar Müh."
                                        onChange={e => setNewMemberData({ ...newMemberData, department: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={creatingMember}
                                    className="w-full py-3 bg-neo-green border-2 border-black text-white font-black uppercase hover:bg-green-600 shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all mt-4"
                                >
                                    {creatingMember ? 'Oluşturuluyor...' : '✅ Üyeyi Oluştur'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Reset Profile Confirm Modal */}
            {
                confirmResetId && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm" onClick={() => setConfirmResetId(null)}>
                        <div className="bg-white border-4 border-red-600 shadow-2xl p-6 rounded-none max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                            <div className="text-center">
                                <h3 className="text-xl font-black text-red-600 mb-2 uppercase">Hesabı Sıfırla?</h3>
                                <p className="text-gray-600 mb-6 font-bold text-sm">
                                    Bu işlem üyenin giriş bilgilerini ve şifresini silecektir.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={async () => {
                                            // Reset Logic
                                            try {
                                                const res = await fetch(`/api/members/${confirmResetId}/reset-profile`, { method: 'POST' });
                                                if (res.ok) {
                                                    fetchMembers(memberSearch, currentPage);
                                                    setConfirmResetId(null);
                                                    setSelectedMember(null);
                                                    alert('Hesap sıfırlandı.');
                                                } else {
                                                    alert('Hata oluştu.');
                                                }
                                            } catch { alert('Hata'); }
                                        }}
                                        className="w-full py-3 bg-red-600 border-2 border-black text-white font-black uppercase hover:bg-red-700 hover:shadow-none shadow-neo transition-all"
                                    >
                                        EVET, Hesabı Sıfırla
                                    </button>
                                    <button
                                        onClick={() => setConfirmResetId(null)}
                                        className="w-full py-3 bg-gray-200 border-2 border-black text-black font-bold uppercase hover:bg-gray-300"
                                    >
                                        Vazgeç
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
