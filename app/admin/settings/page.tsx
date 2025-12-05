'use client';

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
}

export default function AdminSettingsPage() {
    const [whatsappLink, setWhatsappLink] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

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

    useEffect(() => {
        fetchSettings();
        fetchMemberCount();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                if (data.whatsappLink) {
                    setWhatsappLink(data.whatsappLink);
                }
            }
        } catch (error) {
            console.error('Ayarlar yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    key: 'whatsappLink',
                    value: whatsappLink,
                }),
            });

            if (res.ok) {
                setMessage('Ayarlar başarıyla kaydedildi.');
            } else {
                setMessage('Kaydedilirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Hata:', error);
            setMessage('Bir hata oluştu.');
        } finally {
            setSaving(false);
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
        if (!confirm('Tüm üye listesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
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
                setMemberCount(0);
                setMembers([]);
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

    if (loading) return (
        <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="md" />
        </div>
    );

    return (
        <>
            <div className="space-y-6">
                {/* WhatsApp Settings */}
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Genel Ayarlar</h1>
                        <Link href="/admin" className="text-blue-600 hover:text-blue-800">
                            &larr; Geri Dön
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                        <div>
                            <label htmlFor="whatsappLink" className="block text-sm font-medium text-gray-700">
                                WhatsApp Davet Linki
                            </label>
                            <div className="mt-1">
                                <input
                                    type="url"
                                    name="whatsappLink"
                                    id="whatsappLink"
                                    value={whatsappLink}
                                    onChange={(e) => setWhatsappLink(e.target.value)}
                                    placeholder="https://chat.whatsapp.com/..."
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                Sitedeki tüm WhatsApp butonlarının yönlendireceği grup linki.
                            </p>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {saving ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-md ${message.includes('hata') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                {message}
                            </div>
                        )}
                    </form>
                </div>

                {/* Member Management */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Kulüp Üye Yönetimi</h2>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                            <span className="text-blue-600 font-bold text-lg">{memberCount}</span>
                            <span className="text-blue-600 ml-2">kayıtlı üye</span>
                        </div>

                        <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
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
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            {showMembers ? '📋 Listeyi Gizle' : '📋 Üye Listesi'}
                        </button>

                        {memberCount > 0 && (
                            <button
                                onClick={handleClearMembers}
                                disabled={clearingMembers}
                                className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                            >
                                {clearingMembers ? 'Siliniyor...' : '🗑️ Tümünü Sil'}
                            </button>
                        )}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <h3 className="font-bold text-yellow-800 mb-2">📋 Dosya Formatı</h3>
                        <p className="text-sm text-yellow-700 mb-2">
                            Excel (.xlsx, .xls) veya CSV dosyası yükleyin. Sütun sırası önemlidir:
                        </p>
                        <div className="overflow-x-auto">
                            <table className="text-xs border border-yellow-300 w-full">
                                <thead className="bg-yellow-100">
                                    <tr>
                                        <th className="border border-yellow-300 px-2 py-1">A: Öğrenci No</th>
                                        <th className="border border-yellow-300 px-2 py-1">B: Ad Soyad</th>
                                        <th className="border border-yellow-300 px-2 py-1">C: Bölüm</th>
                                        <th className="border border-yellow-300 px-2 py-1">D: Telefon</th>
                                        <th className="border border-yellow-300 px-2 py-1">E: E-posta</th>
                                    </tr>
                                </thead>
                                <tbody className="text-yellow-700">
                                    <tr>
                                        <td className="border border-yellow-300 px-2 py-1">123456789</td>
                                        <td className="border border-yellow-300 px-2 py-1">Ahmet Yılmaz</td>
                                        <td className="border border-yellow-300 px-2 py-1">Bilgisayar Müh.</td>
                                        <td className="border border-yellow-300 px-2 py-1">5551234567</td>
                                        <td className="border border-yellow-300 px-2 py-1">ahmet@ktu.edu.tr</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-yellow-600 mt-2">
                            İlk satır başlık olabilir, sistem otomatik olarak öğrenci numarasıyla başlayan satırdan itibaren okur.
                        </p>
                    </div>

                    {memberMessage && (
                        <div className={`p-4 rounded-md mb-4 ${memberMessage.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                            {memberMessage}
                        </div>
                    )}

                    {showMembers && (
                        <div className="border-t pt-4">
                            <form onSubmit={handleMemberSearch} className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    placeholder="İsim, öğrenci no veya email ile ara..."
                                    className="flex-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Öğrenci No</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ad Soyad</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nickname</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">E-posta</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {members.map((member) => (
                                                    <tr
                                                        key={member._id}
                                                        onClick={() => {
                                                            setSelectedMember(member);
                                                            setEditingMember(member);
                                                        }}
                                                        className="cursor-pointer hover:bg-gray-50"
                                                    >
                                                        <td className="px-4 py-2 text-sm text-gray-900">{member.studentNo}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{member.fullName}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-500">{member.nickname || '-'}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-500">{member.email}</td>
                                                        <td className="px-4 py-2 text-sm">
                                                            {member.isRegistered ? (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                    ✓ Kayıtlı
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
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
                                        <div className="flex items-center justify-between mt-4 px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
                                            <div className="text-sm text-gray-700">
                                                Sayfa <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handlePageChange(1)}
                                                    disabled={currentPage === 1}
                                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    ««
                                                </button>
                                                <button
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    «
                                                </button>
                                                <button
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    »
                                                </button>
                                                <button
                                                    onClick={() => handlePageChange(totalPages)}
                                                    disabled={currentPage === totalPages}
                                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    »»
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-500 text-center py-4">Üye bulunamadı</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Member Detail Modal */}
            {selectedMember && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold">Üye Detayı</h3>
                                <button
                                    onClick={() => setSelectedMember(null)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Öğrenci No</label>
                                <input
                                    type="text"
                                    value={editingMember.studentNo || ''}
                                    disabled
                                    className="w-full p-2 border rounded bg-gray-100 text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                                <input
                                    type="text"
                                    value={editingMember.fullName || ''}
                                    onChange={(e) => setEditingMember({ ...editingMember, fullName: e.target.value })}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                                <input
                                    type="email"
                                    value={editingMember.email || ''}
                                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                <input
                                    type="text"
                                    value={editingMember.phone || ''}
                                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bölüm</label>
                                <input
                                    type="text"
                                    value={editingMember.department || ''}
                                    onChange={(e) => setEditingMember({ ...editingMember, department: e.target.value })}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
                                <input
                                    type="text"
                                    value={editingMember.nickname || ''}
                                    onChange={(e) => setEditingMember({ ...editingMember, nickname: e.target.value })}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    placeholder="Kullanıcı tarafından belirlenir"
                                />
                            </div>



                            <div className="flex gap-2 p-3 bg-gray-50 rounded">
                                <span className="text-sm font-medium">Kayıt Durumu:</span>
                                {selectedMember.isRegistered ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                        ✓ Kayıtlı (Şifresi var)
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                                        Kayıtsız (Henüz şifre oluşturmadı)
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50 flex flex-wrap gap-2 justify-between">
                            <div className="flex gap-2">
                                {selectedMember.isRegistered && (
                                    <>
                                        <button
                                            onClick={async () => {
                                                if (!confirm(`${selectedMember.fullName} için şifre sıfırlama maili gönderilsin mi?`)) return;
                                                setResettingPassword(selectedMember._id);
                                                try {
                                                    const res = await fetch(`/api/members/${selectedMember._id}`, { method: 'POST' });
                                                    const data = await res.json();
                                                    if (res.ok) {
                                                        setMemberMessage(`✅ ${data.message} (${data.email})`);
                                                        setSelectedMember(null);
                                                    } else {
                                                        setMemberMessage(`❌ ${data.error}`);
                                                    }
                                                } catch {
                                                    setMemberMessage('❌ Bir hata oluştu');
                                                } finally {
                                                    setResettingPassword(null);
                                                }
                                            }}
                                            disabled={resettingPassword === selectedMember._id}
                                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                                        >
                                            {resettingPassword === selectedMember._id ? 'Gönderiliyor...' : '🔑 Şifre Sıfırla'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setConfirmResetId(selectedMember._id);
                                            }}
                                            className={`px-4 py-2 rounded font-bold transition-colors ${resettingProfile === selectedMember._id
                                                ? 'bg-gray-400 cursor-not-allowed text-white'
                                                : 'bg-red-100 text-red-700 border-2 border-red-200 hover:bg-red-200'
                                                }`}
                                            disabled={resettingProfile === selectedMember._id}
                                        >
                                            {resettingProfile === selectedMember._id ? 'İşlem yapılıyor...' : '⚠️ Hesabı Sıfırla'}
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedMember(null)}
                                    className="px-4 py-2 border border-black rounded hover:bg-gray-100 transition-colors bg-white font-bold"
                                >
                                    Kapat
                                </button>
                                <button
                                    onClick={async () => {
                                        setSavingMember(true);
                                        try {
                                            const res = await fetch(`/api/members/${selectedMember._id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify(editingMember),
                                            });
                                            const data = await res.json();
                                            if (res.ok) {
                                                setMemberMessage(`✅ ${data.message}`);
                                                setSelectedMember(null);
                                                fetchMembers(memberSearch, currentPage);
                                            } else {
                                                setMemberMessage(`❌ ${data.error}`);
                                            }
                                        } catch {
                                            setMemberMessage('❌ Bir hata oluştu');
                                        } finally {
                                            setSavingMember(false);
                                        }
                                    }}
                                    disabled={savingMember}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {savingMember ? 'Kaydediliyor...' : 'Kaydet'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Reset Confirmation Modal (Overlay) */}
            {confirmResetId && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setConfirmResetId(null)}>
                    <div className="bg-white border-4 border-red-600 shadow-2xl p-6 rounded-lg max-w-sm w-full animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="text-4xl mb-4">⚠️</div>
                            <h3 className="text-xl font-black text-red-600 mb-2">Hesabı Sıfırla?</h3>
                            <p className="text-gray-600 mb-6 font-medium">
                                Bu işlem üyenin giriş bilgilerini (şifre, oturum) silecektir. Üye listesinde kalmaya devam eder ancak tekrar kayıt olması gerekir.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={async () => {
                                        const memberId = confirmResetId;
                                        setResettingProfile(memberId);
                                        try {
                                            const res = await fetch(`/api/members/${memberId}/reset-profile`, { method: 'POST' });
                                            const data = await res.json();
                                            if (res.ok) {
                                                setMemberMessage(`✅ ${data.message}`);
                                                setSelectedMember(null); // Close main modal
                                                fetchMembers(memberSearch, currentPage);
                                            } else {
                                                setMemberMessage(`❌ ${data.error}`);
                                            }
                                        } catch {
                                            setMemberMessage('❌ Bir hata oluştu');
                                        } finally {
                                            setResettingProfile(null);
                                            setConfirmResetId(null);
                                        }
                                    }}
                                    className="w-full py-3 bg-red-600 text-white font-black rounded hover:bg-red-700 shadow-md transition-transform active:scale-95"
                                >
                                    EVET, Hesabı Sıfırla
                                </button>
                                <button
                                    onClick={() => setConfirmResetId(null)}
                                    className="w-full py-3 bg-gray-200 text-gray-800 font-bold rounded hover:bg-gray-300 transition-colors"
                                >
                                    Vazgeç
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
