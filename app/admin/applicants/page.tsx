"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from '@/app/_components/LoadingSpinner';

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

export default function ApplicantsPage() {
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [memberVerifications, setMemberVerifications] = useState<Record<string, VerificationResult>>({});
    const [verifyingMembers, setVerifyingMembers] = useState(false);

    useEffect(() => {
        loadApplicants();
    }, []);

    const loadApplicants = async () => {
        try {
            const res = await fetch("/api/applicants");
            if (!res.ok) throw new Error("Başvurular alınamadı");
            const data = await res.json();
            setApplicants(data);
            // Auto-verify members
            verifyAllMembers(data);
        } catch (error) {
            console.error("Başvurular yüklenirken hata:", error);
            alert("Başvurular yüklenirken bir hata oluştu");
        } finally {
            setLoading(false);
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

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`${name} adlı başvuruyu silmek istediğinizden emin misiniz?`)) {
            try {
                const res = await fetch(`/api/applicants/${id}`, {
                    method: "DELETE",
                });

                if (!res.ok) throw new Error("Başvuru silinemedi");

                setApplicants(applicants.filter((a) => a._id !== id));
                alert("Başvuru başarıyla silindi");
            } catch (error) {
                console.error("Başvuru silinirken hata:", error);
                alert("Başvuru silinirken bir hata oluştu");
            }
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
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
                <span className="px-2 py-1 text-xs font-black bg-red-100 text-red-800 border-2 border-red-300">
                    ❌ Kulüp Üyesi Değil
                </span>
            );
        }

        // Count matches
        const matchCount = Object.values(verification.matches).filter(Boolean).length;
        const importantMatches = [verification.matches.fullName, verification.matches.email];
        const allImportantMatch = importantMatches.every(Boolean);

        return (
            <div className="flex flex-col gap-1">
                <span className="px-2 py-1 text-xs font-black bg-green-100 text-green-800 border-2 border-green-300">
                    ✅ Kulüp Üyesi
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
                    <span
                        title={verification.matches.phone ? 'Telefon eşleşiyor' : `Veritabanı: ${verification.member?.phone || 'yok'}`}
                        className={`px-1 border ${verification.matches.phone ? 'bg-green-50 text-green-700 border-green-300' : 'bg-orange-50 text-orange-700 border-orange-300'}`}
                    >
                        Tel{verification.matches.phone ? '✓' : '?'}
                    </span>
                </div>
                {!allImportantMatch && (
                    <span className="text-xs text-orange-600 font-bold">⚠️ Bilgi uyumsuzluğu var</span>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6">
                <h1 className="text-2xl font-black text-black uppercase">
                    Başvurular
                    <span className="ml-3 bg-neo-purple text-white px-3 py-1 text-lg border-2 border-black">
                        {applicants.length}
                    </span>
                </h1>
                <p className="mt-2 text-gray-600 font-bold">
                    Departman başvurularını inceleyin ve yönetin
                </p>
            </div>

            {/* Applicants List */}
            <div className="bg-white border-4 border-black shadow-neo">
                {applicants.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 font-bold text-lg">Henüz başvuru bulunmuyor</p>
                    </div>
                ) : (
                    <ul className="divide-y-4 divide-black">
                        {applicants.map((applicant) => (
                            <li key={applicant._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="space-y-4">
                                    {/* Summary View */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-grow">
                                            <div className="flex items-center flex-wrap gap-3 mb-2">
                                                <h2 className="text-xl font-black text-black">
                                                    {applicant.fullName}
                                                </h2>
                                                <span className={`px-3 py-1 text-xs font-black border-2 border-black uppercase ${getDepartmentColor(applicant.selectedDepartment)}`}>
                                                    {applicant.selectedDepartment}
                                                </span>
                                                {/* Member Badge */}
                                                {renderMemberBadge(applicant._id)}
                                            </div>
                                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600 font-medium">
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
                                            <div className="mt-2 text-xs text-gray-500 font-medium">
                                                Başvuru: {formatDate(applicant.createdAt)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-2 ml-4">
                                            <button
                                                onClick={() => toggleExpand(applicant._id)}
                                                className={`px-4 py-2 text-sm font-black border-2 border-black transition-all ${expandedId === applicant._id
                                                    ? "bg-black text-white"
                                                    : "bg-neo-blue text-black hover:bg-blue-300"
                                                    }`}
                                            >
                                                {expandedId === applicant._id ? "Gizle" : "Detaylar"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(applicant._id, applicant.fullName)}
                                                className="px-4 py-2 text-sm font-black bg-red-500 text-white border-2 border-black hover:bg-red-600 transition-all"
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded View */}
                                    {expandedId === applicant._id && (
                                        <div className="mt-4 bg-gray-100 border-4 border-black p-6 space-y-6">
                                            {/* Member Verification Details */}
                                            {memberVerifications[applicant._id]?.isMember && (
                                                <div>
                                                    <h3 className="text-sm font-black text-black mb-3 bg-green-400 px-3 py-1 inline-block border-2 border-black">
                                                        Üyelik Bilgileri Karşılaştırması
                                                    </h3>
                                                    <div className="bg-white p-4 border-2 border-black overflow-x-auto">
                                                        <table className="text-xs w-full">
                                                            <thead>
                                                                <tr className="border-b-2 border-black">
                                                                    <th className="text-left p-2">Alan</th>
                                                                    <th className="text-left p-2">Başvurudaki</th>
                                                                    <th className="text-left p-2">Veritabanındaki</th>
                                                                    <th className="text-center p-2">Durum</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr className="border-b border-gray-200">
                                                                    <td className="p-2 font-bold">Ad Soyad</td>
                                                                    <td className="p-2">{applicant.fullName}</td>
                                                                    <td className="p-2">{memberVerifications[applicant._id].member?.fullName}</td>
                                                                    <td className="p-2 text-center">{memberVerifications[applicant._id].matches.fullName ? '✅' : '❌'}</td>
                                                                </tr>
                                                                <tr className="border-b border-gray-200">
                                                                    <td className="p-2 font-bold">E-posta</td>
                                                                    <td className="p-2">{applicant.email}</td>
                                                                    <td className="p-2">{memberVerifications[applicant._id].member?.email}</td>
                                                                    <td className="p-2 text-center">{memberVerifications[applicant._id].matches.email ? '✅' : '❌'}</td>
                                                                </tr>
                                                                <tr className="border-b border-gray-200">
                                                                    <td className="p-2 font-bold">Telefon</td>
                                                                    <td className="p-2">{applicant.phone}</td>
                                                                    <td className="p-2">{memberVerifications[applicant._id].member?.phone || '-'}</td>
                                                                    <td className="p-2 text-center">{memberVerifications[applicant._id].matches.phone ? '✅' : '⚠️'}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="p-2 font-bold">Bölüm</td>
                                                                    <td className="p-2">{applicant.department}</td>
                                                                    <td className="p-2">{memberVerifications[applicant._id].member?.department || '-'}</td>
                                                                    <td className="p-2 text-center">{memberVerifications[applicant._id].matches.department ? '✅' : '⚠️'}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Social Links */}
                                            {(applicant.github || applicant.linkedin) && (
                                                <div>
                                                    <h3 className="text-sm font-black text-black mb-3 bg-neo-purple text-white px-3 py-1 inline-block border-2 border-black">
                                                        Sosyal Bağlantılar
                                                    </h3>
                                                    <div className="space-y-2 text-sm">
                                                        {applicant.github && (
                                                            <div>
                                                                <span className="font-black">GitHub:</span>{" "}
                                                                <a
                                                                    href={applicant.github}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:underline font-bold"
                                                                >
                                                                    {applicant.github}
                                                                </a>
                                                            </div>
                                                        )}
                                                        {applicant.linkedin && (
                                                            <div>
                                                                <span className="font-black">LinkedIn:</span>{" "}
                                                                <a
                                                                    href={applicant.linkedin}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:underline font-bold"
                                                                >
                                                                    {applicant.linkedin}
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Motivation */}
                                            <div>
                                                <h3 className="text-sm font-black text-black mb-3 bg-neo-green px-3 py-1 inline-block border-2 border-black">
                                                    Motivasyon
                                                </h3>
                                                <p className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-4 border-2 border-black">
                                                    {applicant.motivation}
                                                </p>
                                            </div>

                                            {/* Experience */}
                                            <div>
                                                <h3 className="text-sm font-black text-black mb-3 bg-neo-blue px-3 py-1 inline-block border-2 border-black">
                                                    Deneyim
                                                </h3>
                                                <p className="text-sm text-gray-800 bg-white p-4 border-2 border-black">
                                                    <span className="font-black">
                                                        Organizasyon deneyimi:
                                                    </span>{" "}
                                                    {applicant.hasExperience ? (
                                                        <span className="bg-neo-green px-2 py-0.5 text-xs font-black border border-black">EVET</span>
                                                    ) : (
                                                        <span className="bg-gray-200 px-2 py-0.5 text-xs font-black border border-black">HAYIR</span>
                                                    )}
                                                </p>
                                                {applicant.hasExperience && applicant.experienceDescription && (
                                                    <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap bg-white p-4 border-2 border-black">
                                                        {applicant.experienceDescription}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Department Specific Answers */}
                                            {Object.keys(applicant.departmentSpecificAnswers).length > 0 && (
                                                <div>
                                                    <h3 className="text-sm font-black text-black mb-3 bg-yellow-400 px-3 py-1 inline-block border-2 border-black">
                                                        Departmana Özel Cevaplar
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {Object.entries(applicant.departmentSpecificAnswers).map(
                                                            ([key, value]) => (
                                                                <div key={key} className="bg-white p-4 border-2 border-black">
                                                                    <p className="text-sm font-black text-gray-700 capitalize mb-2">
                                                                        {key.replace(/([A-Z])/g, " $1").trim()}:
                                                                    </p>
                                                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                                                        {value}
                                                                    </p>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Additional Notes */}
                                            {applicant.additionalNotes && (
                                                <div>
                                                    <h3 className="text-sm font-black text-black mb-3 bg-gray-300 px-3 py-1 inline-block border-2 border-black">
                                                        Ek Notlar
                                                    </h3>
                                                    <p className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-4 border-2 border-black">
                                                        {applicant.additionalNotes}
                                                    </p>
                                                </div>
                                            )}

                                            {/* KVKK Consent */}
                                            <div className="border-t-4 border-black pt-4 flex gap-4 text-sm">
                                                <span className={`px-3 py-1 font-black border-2 border-black ${applicant.kvkkConsent ? 'bg-neo-green' : 'bg-red-300'}`}>
                                                    KVKK: {applicant.kvkkConsent ? "✓" : "✗"}
                                                </span>
                                                <span className={`px-3 py-1 font-black border-2 border-black ${applicant.communicationConsent ? 'bg-neo-green' : 'bg-red-300'}`}>
                                                    İletişim: {applicant.communicationConsent ? "✓" : "✗"}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
