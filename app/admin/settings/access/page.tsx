"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SkeletonList, SkeletonPageHeader } from '@/app/_components/Skeleton';
import { Button } from '@/app/_components/ui';

interface AccessRule {
    _id: string;
    memberId: {
        _id: string;
        fullName: string;
        email: string;
        studentNo: string;
    };
    allowedKeys: string[];
    createdAt: string;
}

const ALL_KEYS = [
    { key: 'ALL', label: 'Tam Yetki (Hepsi)' },
    { key: 'announcements', label: 'Duyurular' },
    { key: 'events', label: 'Etkinlikler' },
    { key: 'calendar', label: 'Takvim Yönetimi' },
    { key: 'room', label: 'Kulüp Odası (IoT)' },
    { key: 'inventory', label: 'Envanter/Demirbaş' },
    { key: 'emails', label: 'E-postalar' },
    { key: 'applicants', label: 'Başvurular' },
    { key: 'departments', label: 'Departmanlar' },
    { key: 'team', label: 'Ekip Yönetimi' },
    { key: 'sponsors', label: 'Sponsorlar' },
    { key: 'projects', label: 'Projeler' },
    { key: 'comments', label: 'Yorumlar' },
    { key: 'forum', label: 'Forum Yönetimi' },
    { key: 'code', label: 'Kod Atölyesi' },
    { key: 'elections', label: 'Seçimler' },
    { key: 'bug-reports', label: 'Hata Bildirimleri' },
    { key: 'stats', label: 'İstatistikler' },
    { key: 'audit-log', label: 'İşlem Geçmişi' },
    { key: 'settings', label: 'Ayarlar (Genel)' },
];

export default function AccessControlPage() {
    const [rules, setRules] = useState<AccessRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [foundMembers, setFoundMembers] = useState<any[]>([]);
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await fetch('/api/admin/access');
            if (res.ok) {
                const data = await res.json();
                setRules(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Search members to add new rule
    useEffect(() => {
        if (searchQuery.length < 2) {
            setFoundMembers([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/members?search=${searchQuery}&limit=5`);
                if (res.ok) {
                    const data = await res.json();
                    setFoundMembers(data.members || []);
                }
            } catch (e) { console.error(e); }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSave = async () => {
        if (!selectedMember) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memberId: selectedMember._id,
                    allowedKeys: selectedKeys
                })
            });

            if (res.ok) {
                alert('Yetkilendirme kaydedildi.');
                setSelectedMember(null);
                setSelectedKeys([]);
                setSearchQuery('');
                fetchRules(); // Refresh list
            } else {
                const err = await res.json();
                alert('Hata: ' + err.error);
            }
        } catch (e) {
            alert('Bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (ruleId: string) => {
        if (!confirm('Bu yetkiyi kaldırmak istediğinizden emin misiniz?')) return;
        try {
            const res = await fetch(`/api/admin/access?id=${ruleId}`, { method: 'DELETE' });
            if (res.ok) {
                setRules(rules.filter(r => r._id !== ruleId));
            } else {
                alert('Silinemedi.');
            }
        } catch (e) { alert('Hata oluştu.'); }
    };

    const toggleKey = (key: string) => {
        if (selectedKeys.includes(key)) {
            setSelectedKeys(selectedKeys.filter(k => k !== key));
        } else {
            setSelectedKeys([...selectedKeys, key]);
        }
    };

    if (loading) return (
        <div className="space-y-8">
            <SkeletonPageHeader />
            <SkeletonList items={5} />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="bg-white border-4 border-black shadow-neo p-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-black uppercase">Panel Yetkileri</h1>
                    <p className="text-sm font-bold text-gray-500">Kullanıcı bazlı yönetici izinleri</p>
                </div>
                <Link href="/admin/settings" className="font-bold text-gray-500 hover:text-black hover:underline">
                    &larr; Geri Dön
                </Link>
            </div>

            {/* Form Area */}
            <div className="bg-white border-4 border-black shadow-neo p-6">
                <h2 className="text-xl font-black uppercase mb-4">Yeni Yetki Ekle</h2>

                {/* Search Member */}
                <div className="mb-6 relative">
                    <label className="block text-sm font-bold mb-2">Üye Ara</label>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="İsim veya Öğrenci No..."
                        className="w-full border-2 border-black p-3 font-bold focus:shadow-neo focus:outline-none"
                        disabled={!!selectedMember}
                    />

                    {/* Search Results Dropdown */}
                    {searchQuery.length >= 2 && !selectedMember && foundMembers.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border-2 border-black border-t-0 shadow-lg mt-1 max-h-48 overflow-y-auto">
                            {foundMembers.map(m => (
                                <button
                                    key={m._id}
                                    onClick={() => {
                                        setSelectedMember(m);
                                        setSearchQuery(m.fullName);
                                        setFoundMembers([]);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 font-bold border-b border-gray-100 last:border-0"
                                >
                                    {m.fullName} <span className="text-gray-400 text-xs ml-2">({m.studentNo})</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {selectedMember && (
                    <div className="bg-gray-50 border-2 border-black p-4 mb-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-black text-lg">{selectedMember.fullName}</h3>
                                <p className="text-sm text-gray-600 font-bold">{selectedMember.studentNo}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedMember(null);
                                    setSearchQuery('');
                                    setSelectedKeys([]);
                                }}
                                className="text-red-500 font-black text-sm hover:underline"
                            >
                                İPTAL
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {ALL_KEYS.map(item => (
                                <label key={item.key} className={`
                                    cursor-pointer border-2 border-black p-2 flex items-center justify-center text-center text-sm font-bold uppercase transition-all select-none
                                    ${selectedKeys.includes(item.key) ? 'bg-neo-green text-white shadow-neo' : 'bg-white text-gray-400 hover:border-gray-400'}
                                `}>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedKeys.includes(item.key)}
                                        onChange={() => toggleKey(item.key)}
                                    />
                                    {item.label}
                                </label>
                            ))}
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={saving || selectedKeys.length === 0}
                            isLoading={saving}
                            fullWidth
                            className="mt-6"
                        >
                            Yetki Ver
                        </Button>
                    </div>
                )}
            </div>

            {/* List Area */}
            <div className="bg-white border-4 border-black shadow-neo p-6">
                <h2 className="text-xl font-black uppercase mb-4">Mevcut Yetkiler</h2>
                {rules.length === 0 ? (
                    <p className="text-gray-500 font-bold">Henüz verilmiş bir yetki yok.</p>
                ) : (
                    <div className="space-y-4">
                        {rules.map(rule => (
                            <div key={rule._id} className="border-2 border-black p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-gray-50">
                                <div>
                                    <h3 className="font-black text-lg">{rule.memberId ? rule.memberId.fullName : 'Silinmiş Üye'}</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {rule.allowedKeys.map(k => (
                                            <span key={k} className="px-2 py-1 bg-gray-200 border border-black text-xs font-bold uppercase">
                                                {ALL_KEYS.find(ak => ak.key === k)?.label || k}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleDelete(rule._id)}
                                    variant="danger"
                                    size="sm"
                                >
                                    Kaldır
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
