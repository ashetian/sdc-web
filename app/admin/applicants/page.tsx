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

export default function ApplicantsPage() {
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        loadApplicants();
    }, []);

    const loadApplicants = async () => {
        try {
            const res = await fetch("/api/applicants");
            if (!res.ok) throw new Error("Başvurular alınamadı");
            const data = await res.json();
            setApplicants(data);
        } catch (error) {
            console.error("Başvurular yüklenirken hata:", error);
            alert("Başvurular yüklenirken bir hata oluştu");
        } finally {
            setLoading(false);
        }
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
