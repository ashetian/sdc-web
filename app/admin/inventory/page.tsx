'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    User,
    Calendar,
    RotateCcw,
    Trash2,
    Settings,
    Package,
    AlertTriangle,
    Save,
    X,
    Filter
} from 'lucide-react';

interface InventoryItem {
    _id: string;
    name: string;
    category: string;
    serialNumber?: string;
    description?: string;
    status: 'available' | 'assigned' | 'maintenance' | 'lost' | 'broken';
    assignedTo?: string;
    assignedToName?: string;
    assignedAt?: string;
    dueDate?: string;
    photo?: string;
    notes?: string;
}

interface Member {
    _id: string;
    fullName: string;
    studentNo: string;
    nickname?: string;
}

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState<InventoryItem | null>(null);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    // Form Data
    const [formData, setFormData] = useState<Partial<InventoryItem>>({});

    // Member Search
    const [memberSearch, setMemberSearch] = useState('');
    const [members, setMembers] = useState<Member[]>([]);
    const [searchingMembers, setSearchingMembers] = useState(false);

    useEffect(() => {
        fetchItems();
    }, [categoryFilter, statusFilter]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            let url = '/api/admin/inventory?';
            if (categoryFilter) url += `category=${categoryFilter}&`;
            if (statusFilter) url += `status=${statusFilter}&`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const searchMembers = async (query: string) => {
        if (query.length < 2) return;
        setSearchingMembers(true);
        try {
            // Using existing members API (assuming it supports search or returning all to filter client side for now if needed)
            // But ideally we'd have a search param. Let's try fetching all and filtering if API is simple
            const res = await fetch('/api/admin/members/list');
            if (res.ok) {
                const data = await res.json();
                const membersList = data.members || [];
                // Client side filter
                const filtered = membersList.filter((m: any) =>
                    m.fullName.toLowerCase().includes(query.toLowerCase()) ||
                    m.studentNo.includes(query) ||
                    (m.nickname && m.nickname.toLowerCase().includes(query.toLowerCase()))
                ).slice(0, 10);
                setMembers(filtered);
            }
        } catch (error) {
            console.error('Member search error:', error);
        } finally {
            setSearchingMembers(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setShowCreateModal(false);
                setFormData({});
                fetchItems();
            } else {
                alert('Oluşturulurken hata oluştu.');
            }
        } catch (error) {
            console.error('Create error:', error);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        try {
            const res = await fetch('/api/admin/inventory', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingItem._id, ...formData }),
            });
            if (res.ok) {
                setEditingItem(null);
                setFormData({});
                fetchItems();
            }
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const handleAssign = async (memberId: string) => {
        if (!showAssignModal) return;
        const dueDate = formData.dueDate; // Optional

        try {
            const res = await fetch('/api/admin/inventory', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: showAssignModal._id,
                    action: 'assign',
                    memberId,
                    dueDate
                }),
            });
            if (res.ok) {
                setShowAssignModal(null);
                setFormData({});
                fetchItems();
            }
        } catch (error) {
            console.error('Assign error:', error);
        }
    };

    const handleReturn = async (item: InventoryItem) => {
        if (!confirm(`${item.name} iade alındı olarak işaretlensin mi?`)) return;

        try {
            const res = await fetch('/api/admin/inventory', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: item._id, action: 'return' }),
            });
            if (res.ok) {
                fetchItems();
            }
        } catch (error) {
            console.error('Return error:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu demirbaşı silmek istediğinize emin misiniz?')) return;
        try {
            const res = await fetch(`/api/admin/inventory?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchItems();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available': return <span className="bg-neo-green text-black px-2 py-1 text-xs font-black uppercase border border-black">Müsait</span>;
            case 'assigned': return <span className="bg-neo-blue text-black px-2 py-1 text-xs font-black uppercase border border-black">Zimmetli</span>;
            case 'maintenance': return <span className="bg-neo-yellow text-black px-2 py-1 text-xs font-black uppercase border border-black">Bakımda</span>;
            case 'lost': return <span className="bg-red-500 text-white px-2 py-1 text-xs font-black uppercase border border-black">Kayıp</span>;
            case 'broken': return <span className="bg-gray-800 text-white px-2 py-1 text-xs font-black uppercase border border-black">Kırık</span>;
            default: return status;
        }
    };

    // Filter displayed items by search text
    const displayItems = items.filter(item =>
        item.name.toLowerCase().includes(filter.toLowerCase()) ||
        (item.serialNumber && item.serialNumber.toLowerCase().includes(filter.toLowerCase())) ||
        (item.assignedToName && item.assignedToName.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-black uppercase">Envanter Takibi</h1>
                    <p className="text-gray-600 font-bold">Kulüp demirbaş ve zimmet yönetimi</p>
                </div>
                <button
                    onClick={() => { setFormData({}); setShowCreateModal(true); }}
                    className="bg-black text-white px-6 py-3 font-black uppercase border-4 border-black hover:bg-white hover:text-black transition-all shadow-neo"
                >
                    <Plus className="inline mr-2" /> Yeni Eşya
                </button>
            </div>

            {/* Controls */}
            <div className="bg-white border-4 border-black shadow-neo p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Eşya adı, seri no veya kişi ara..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border-2 border-black font-bold focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="border-2 border-black p-2 font-bold"
                >
                    <option value="">Tüm Kategoriler</option>
                    <option value="Electronics">Elektronik</option>
                    <option value="Furniture">Mobilya</option>
                    <option value="Stationary">Kırtasiye</option>
                    <option value="Other">Diğer</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border-2 border-black p-2 font-bold"
                >
                    <option value="">Tüm Durumlar</option>
                    <option value="available">Müsait</option>
                    <option value="assigned">Zimmetli</option>
                    <option value="maintenance">Bakımda</option>
                </select>
            </div>

            {/* Inventory List */}
            <div className="bg-white border-4 border-black shadow-neo overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-black text-white">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-black uppercase">Eşya</th>
                            <th className="px-6 py-4 text-left text-sm font-black uppercase">Kategori</th>
                            <th className="px-6 py-4 text-left text-sm font-black uppercase">Durum</th>
                            <th className="px-6 py-4 text-left text-sm font-black uppercase">Zimmet</th>
                            <th className="px-6 py-4 text-right text-sm font-black uppercase">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center font-bold">Yükleniyor...</td></tr>
                        ) : displayItems.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center font-bold text-gray-500">Kayıt bulunamadı.</td></tr>
                        ) : (
                            displayItems.map(item => (
                                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-black text-lg">{item.name}</div>
                                        {item.serialNumber && <div className="text-xs text-gray-500 font-mono">{item.serialNumber}</div>}
                                    </td>
                                    <td className="px-6 py-4 font-bold">{item.category}</td>
                                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                                    <td className="px-6 py-4">
                                        {item.status === 'assigned' ? (
                                            <div>
                                                <div className="font-bold flex items-center gap-1">
                                                    <User size={14} /> {item.assignedToName}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {item.assignedAt && new Date(item.assignedAt).toLocaleDateString()}
                                                    {item.dueDate && <span className="text-red-600 ml-1">(Son: {new Date(item.dueDate).toLocaleDateString()})</span>}
                                                </div>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {item.status === 'assigned' ? (
                                            <button
                                                onClick={() => handleReturn(item)}
                                                className="inline-flex items-center px-3 py-1 bg-white border-2 border-black shadow-neo text-xs font-black uppercase hover:bg-gray-100"
                                                title="İade Al"
                                            >
                                                <RotateCcw size={14} className="mr-1" /> İade
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => { setFormData({}); setShowAssignModal(item); }}
                                                className="inline-flex items-center px-3 py-1 bg-neo-blue text-black border-2 border-black shadow-neo text-xs font-black uppercase hover:brightness-110"
                                                disabled={item.status !== 'available'}
                                                title="Zimmetle"
                                            >
                                                <User size={14} className="mr-1" /> Ver
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { setFormData(item); setEditingItem(item); }}
                                            className="inline-flex items-center px-3 py-1 bg-neo-yellow text-black border-2 border-black shadow-neo text-xs font-black uppercase hover:brightness-110"
                                        >
                                            <Settings size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingItem) && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-white border-4 border-black shadow-neo-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black uppercase">{editingItem ? 'Düzenle' : 'Yeni Demirbaş'}</h2>
                            <button onClick={() => { setShowCreateModal(false); setEditingItem(null); setFormData({}); }}><X size={24} /></button>
                        </div>
                        <form onSubmit={editingItem ? handleUpdate : handleCreate} className="space-y-4">
                            <div>
                                <label className="block font-bold mb-1">Eşya Adı</label>
                                <input
                                    required
                                    className="w-full border-2 border-black p-2 font-bold"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold mb-1">Kategori</label>
                                    <input
                                        required
                                        className="w-full border-2 border-black p-2 font-bold"
                                        placeholder="Elektronik, Mobilya..."
                                        value={formData.category || ''}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">Seri No</label>
                                    <input
                                        className="w-full border-2 border-black p-2 font-bold"
                                        value={formData.serialNumber || ''}
                                        onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Durum</label>
                                <select
                                    className="w-full border-2 border-black p-2 font-bold"
                                    value={formData.status || 'available'}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                >
                                    <option value="available">Müsait</option>
                                    <option value="assigned">Zimmetli (Manuel Atama)</option>
                                    <option value="maintenance">Bakımda</option>
                                    <option value="lost">Kayıp</option>
                                    <option value="broken">Kırık</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Açıklama / Notlar</label>
                                <textarea
                                    className="w-full border-2 border-black p-2 font-bold"
                                    rows={3}
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button type="submit" className="flex-1 bg-black text-white py-3 font-black uppercase border-2 border-black hover:bg-white hover:text-black transition-all">Kaydet</button>
                                {editingItem && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm('Silmek istediğine emin misin?')) {
                                                handleDelete(editingItem._id);
                                                setEditingItem(null);
                                            }
                                        }}
                                        className="px-4 bg-red-500 text-white border-2 border-black font-black uppercase hover:bg-red-600"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-white border-4 border-black shadow-neo-lg w-full max-w-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black uppercase">Zimmetle: {showAssignModal.name}</h2>
                            <button onClick={() => setShowAssignModal(null)}><X size={24} /></button>
                        </div>

                        <div className="mb-4">
                            <label className="block font-bold mb-1">Teslim Edilecek Üye Ara</label>
                            <input
                                className="w-full border-2 border-black p-2 font-bold mb-2"
                                placeholder="İsim veya numara yaz..."
                                value={memberSearch}
                                onChange={e => {
                                    setMemberSearch(e.target.value);
                                    searchMembers(e.target.value);
                                }}
                            />
                            {members.length > 0 && (
                                <div className="border-2 border-black max-h-40 overflow-y-auto mb-4">
                                    {members.map(m => (
                                        <div
                                            key={m._id}
                                            onClick={() => handleAssign(m._id)}
                                            className="p-2 hover:bg-neo-blue hover:text-white cursor-pointer border-b border-gray-200 last:border-0 font-bold"
                                        >
                                            {m.fullName} <span className="text-xs opacity-70">({m.studentNo})</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {searchingMembers && <div className="text-sm text-gray-500">Aranıyor...</div>}
                        </div>

                        <div className="mb-6">
                            <label className="block font-bold mb-1">Son İade Tarihi (Opsiyonel)</label>
                            <input
                                type="date"
                                className="w-full border-2 border-black p-2 font-bold"
                                value={formData.dueDate || ''}
                                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>

                        <button onClick={() => setShowAssignModal(null)} className="w-full py-3 border-2 border-black font-black uppercase hover:bg-gray-100">İptal</button>
                    </div>
                </div>
            )}
        </div>
    );
}
