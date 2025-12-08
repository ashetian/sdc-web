"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, BookOpen, Gift, Clock, AlertCircle, Sparkles } from "lucide-react";
import { SkeletonList } from "@/app/_components/Skeleton";

interface CalendarMarker {
    _id: string;
    title: string;
    titleEn?: string;
    type: 'holiday' | 'exam_week' | 'registration_period' | 'semester_break' | 'important';
    startDate: string;
    endDate: string;
    isActive: boolean;
}

const markerTypes = [
    { value: 'exam_week', label: 'Sınav Haftası (Vize/Final)', icon: BookOpen, color: 'bg-red-200 text-red-800' },
    { value: 'holiday', label: 'Tatil', icon: Gift, color: 'bg-green-200 text-green-800' },
    { value: 'semester_break', label: 'Yarıyıl Tatili', icon: Calendar, color: 'bg-orange-200 text-orange-800' },
    { value: 'registration_period', label: 'Kayıt Dönemi', icon: Clock, color: 'bg-blue-200 text-blue-800' },
    { value: 'important', label: 'Önemli Tarih', icon: AlertCircle, color: 'bg-yellow-200 text-yellow-800' },
];

// Turkish official holidays - returns holidays for a given year
const getTurkishHolidays = (year: number) => [
    // Fixed holidays
    { title: 'Yılbaşı', titleEn: 'New Year', type: 'holiday', startDate: `${year}-01-01`, endDate: `${year}-01-01` },
    { title: 'Ulusal Egemenlik ve Çocuk Bayramı', titleEn: 'National Sovereignty and Children\'s Day', type: 'holiday', startDate: `${year}-04-23`, endDate: `${year}-04-23` },
    { title: 'Emek ve Dayanışma Günü', titleEn: 'Labour Day', type: 'holiday', startDate: `${year}-05-01`, endDate: `${year}-05-01` },
    { title: 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı', titleEn: 'Commemoration of Atatürk, Youth and Sports Day', type: 'holiday', startDate: `${year}-05-19`, endDate: `${year}-05-19` },
    { title: 'Demokrasi ve Milli Birlik Günü', titleEn: 'Democracy and National Unity Day', type: 'holiday', startDate: `${year}-07-15`, endDate: `${year}-07-15` },
    { title: 'Zafer Bayramı', titleEn: 'Victory Day', type: 'holiday', startDate: `${year}-08-30`, endDate: `${year}-08-30` },
    { title: 'Cumhuriyet Bayramı', titleEn: 'Republic Day', type: 'holiday', startDate: `${year}-10-29`, endDate: `${year}-10-29` },
];

// Religious holidays (approximate dates - need to be adjusted each year based on lunar calendar)
const getReligiousHolidays2025 = () => [
    { title: 'Ramazan Bayramı', titleEn: 'Eid al-Fitr', type: 'holiday', startDate: '2025-03-30', endDate: '2025-04-01' },
    { title: 'Kurban Bayramı', titleEn: 'Eid al-Adha', type: 'holiday', startDate: '2025-06-06', endDate: '2025-06-09' },
];

const getReligiousHolidays2026 = () => [
    { title: 'Ramazan Bayramı', titleEn: 'Eid al-Fitr', type: 'holiday', startDate: '2026-03-20', endDate: '2026-03-22' },
    { title: 'Kurban Bayramı', titleEn: 'Eid al-Adha', type: 'holiday', startDate: '2026-05-27', endDate: '2026-05-30' },
];

export default function AdminCalendarPage() {
    const [markers, setMarkers] = useState<CalendarMarker[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showPresets, setShowPresets] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        titleEn: '',
        type: 'exam_week' as CalendarMarker['type'],
        startDate: '',
        endDate: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchMarkers();
    }, []);

    const fetchMarkers = async () => {
        try {
            const res = await fetch('/api/admin/calendar-markers');
            if (res.ok) {
                const data = await res.json();
                setMarkers(data);
            }
        } catch (error) {
            console.error('Error fetching markers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/admin/calendar-markers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setFormData({ title: '', titleEn: '', type: 'exam_week', startDate: '', endDate: '' });
                setShowForm(false);
                fetchMarkers();
            } else {
                const error = await res.json();
                alert(error.error || 'Bir hata oluştu');
            }
        } catch (error) {
            console.error('Error creating marker:', error);
            alert('Bir hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu işaretçiyi silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/admin/calendar-markers?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchMarkers();
            }
        } catch (error) {
            console.error('Error deleting marker:', error);
        }
    };

    const addPresetHolidays = async (holidays: { title: string; titleEn: string; type: string; startDate: string; endDate: string }[]) => {
        setSubmitting(true);
        let successCount = 0;

        for (const holiday of holidays) {
            try {
                const res = await fetch('/api/admin/calendar-markers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(holiday),
                });
                if (res.ok) successCount++;
            } catch (error) {
                console.error('Error adding holiday:', error);
            }
        }

        alert(`${successCount}/${holidays.length} tatil başarıyla eklendi.`);
        setShowPresets(false);
        fetchMarkers();
        setSubmitting(false);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const getTypeConfig = (type: string) => {
        return markerTypes.find(t => t.value === type) || markerTypes[0];
    };

    const allHolidays2025 = [...getTurkishHolidays(2025), ...getReligiousHolidays2025()];
    const allHolidays2026 = [...getTurkishHolidays(2026), ...getReligiousHolidays2026()];

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white border-4 border-black shadow-neo p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-black uppercase">Takvim Yönetimi</h1>
                            <p className="text-gray-600 font-medium mt-2">Sınav haftaları, tatiller ve özel günler</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setShowPresets(!showPresets); setShowForm(false); }}
                                className="flex items-center gap-2 px-4 py-2 bg-neo-yellow border-2 border-black font-bold shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                            >
                                <Sparkles size={20} />
                                Hazır Tatiller
                            </button>
                            <button
                                onClick={() => { setShowForm(!showForm); setShowPresets(false); }}
                                className="flex items-center gap-2 px-4 py-2 bg-neo-green border-2 border-black font-bold shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                            >
                                <Plus size={20} />
                                Yeni Ekle
                            </button>
                        </div>
                    </div>
                </div>

                {/* Presets Panel */}
                {showPresets && (
                    <div className="bg-white border-4 border-black shadow-neo p-6 mb-8">
                        <h2 className="text-xl font-black mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
                            <Sparkles size={24} />
                            Türkiye Resmi Tatilleri
                        </h2>

                        {/* Dynamic Year Import */}
                        <div className="bg-neo-blue/20 border-2 border-black p-4 mb-6">
                            <h3 className="font-black text-lg mb-2 flex items-center gap-2">
                                🌐 İnternet'ten Otomatik Çek
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Nager.Date API ile herhangi bir yıl için Türkiye resmi tatillerini otomatik olarak çekin.
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="p-2 border-2 border-black font-bold bg-white"
                                >
                                    {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={async () => {
                                        setSubmitting(true);
                                        try {
                                            const res = await fetch('/api/admin/calendar-markers/import', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ year: selectedYear }),
                                            });
                                            const data = await res.json();
                                            if (res.ok) {
                                                alert(`${selectedYear} yılı için ${data.added} tatil eklendi. (${data.skipped} zaten mevcut)`);
                                                fetchMarkers();
                                            } else {
                                                alert(data.error || 'Bir hata oluştu');
                                            }
                                        } catch (error) {
                                            console.error('Import error:', error);
                                            alert('Tatiller çekilirken bir hata oluştu');
                                        } finally {
                                            setSubmitting(false);
                                        }
                                    }}
                                    disabled={submitting}
                                    className="px-4 py-2 bg-black text-white font-bold border-2 border-black hover:bg-neo-green hover:text-black transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Çekiliyor...' : `${selectedYear} Tatillerini Çek`}
                                </button>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-4">Veya hazır şablonları kullanın (dini bayramlar dahil):</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <button
                                onClick={() => addPresetHolidays(allHolidays2025)}
                                disabled={submitting}
                                className="p-4 border-2 border-black bg-neo-green hover:bg-green-400 transition-colors disabled:opacity-50"
                            >
                                <div className="font-black text-2xl mb-1">2025</div>
                                <div className="text-sm font-bold">{allHolidays2025.length} tatil günü</div>
                                <div className="text-xs text-gray-600 mt-2">Yılbaşı, 23 Nisan, 1 Mayıs, 19 Mayıs, 15 Temmuz, 30 Ağustos, 29 Ekim, Ramazan & Kurban Bayramı</div>
                            </button>
                            <button
                                onClick={() => addPresetHolidays(allHolidays2026)}
                                disabled={submitting}
                                className="p-4 border-2 border-black bg-neo-blue hover:bg-blue-400 transition-colors disabled:opacity-50"
                            >
                                <div className="font-black text-2xl mb-1">2026</div>
                                <div className="text-sm font-bold">{allHolidays2026.length} tatil günü</div>
                                <div className="text-xs text-gray-600 mt-2">Yılbaşı, 23 Nisan, 1 Mayıs, 19 Mayıs, 15 Temmuz, 30 Ağustos, 29 Ekim, Ramazan & Kurban Bayramı</div>
                            </button>
                        </div>

                        <div className="bg-yellow-50 border-2 border-yellow-400 p-3 text-sm">
                            <strong>Not:</strong> İnternet'ten çekilen tatiller sadece resmi tatilleri içerir. Dini bayramlar (Ramazan ve Kurban Bayramı) hazır şablonlarda mevcuttur.
                        </div>
                    </div>
                )}

                {/* Form */}
                {showForm && (
                    <div className="bg-white border-4 border-black shadow-neo p-6 mb-8">
                        <h2 className="text-xl font-black mb-4 border-b-2 border-black pb-2">Yeni Takvim İşaretçisi</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold mb-1">Başlık (TR) *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className="w-full p-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-blue"
                                        placeholder="örn. Vize Haftası"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">Başlık (EN)</label>
                                    <input
                                        type="text"
                                        value={formData.titleEn}
                                        onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                                        className="w-full p-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-blue"
                                        placeholder="e.g. Midterm Week"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold mb-1">Tür *</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {markerTypes.map((type) => {
                                        const Icon = type.icon;
                                        return (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: type.value as CalendarMarker['type'] })}
                                                className={`flex items-center gap-2 p-2 border-2 border-black font-bold text-sm transition-all ${formData.type === type.value
                                                    ? `${type.color} shadow-neo`
                                                    : 'bg-white hover:bg-gray-100'
                                                    }`}
                                            >
                                                <Icon size={16} />
                                                <span className="truncate">{type.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold mb-1">Başlangıç Tarihi *</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                        className="w-full p-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-blue"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">Bitiş Tarihi *</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                        className="w-full p-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-blue"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-black text-white font-bold border-2 border-black hover:bg-neo-green hover:text-black transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-2 bg-white font-bold border-2 border-black hover:bg-gray-100 transition-colors"
                                >
                                    İptal
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Markers List */}
                <div className="bg-white border-4 border-black shadow-neo overflow-hidden">
                    {loading ? (
                        <SkeletonList items={5} />
                    ) : markers.length === 0 ? (
                        <div className="p-8 text-center">
                            <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
                            <p className="font-bold text-gray-600">Henüz takvim işaretçisi eklenmemiş.</p>
                            <p className="text-sm text-gray-500 mt-1">"Hazır Tatiller" butonuna tıklayarak Türkiye resmi tatillerini ekleyin.</p>
                        </div>
                    ) : (
                        <div className="divide-y-2 divide-black">
                            {markers.map((marker) => {
                                const typeConfig = getTypeConfig(marker.type);
                                const Icon = typeConfig.icon;
                                return (
                                    <div key={marker._id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 border-2 border-black ${typeConfig.color}`}>
                                                <Icon size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-black text-lg">{marker.title}</h3>
                                                {marker.titleEn && (
                                                    <p className="text-sm text-gray-500">{marker.titleEn}</p>
                                                )}
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    <span className={`text-xs font-bold px-2 py-0.5 border border-black ${typeConfig.color}`}>
                                                        {typeConfig.label}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        {formatDate(marker.startDate)} - {formatDate(marker.endDate)}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(marker._id)}
                                                className="p-2 text-red-600 hover:bg-red-100 border-2 border-transparent hover:border-red-600 transition-all"
                                                title="Sil"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

