"use client";

import { useEffect, useState } from "react";

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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-600">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
                <h1 className="text-xl font-semibold text-gray-900">
                    Başvurular ({applicants.length})
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Departman başvurularını inceleyin ve yönetin
                </p>
            </div>

            <div className="border-t border-gray-200">
                {applicants.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                        Henüz başvuru bulunmuyor
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {applicants.map((applicant) => (
                            <li key={applicant._id} className="px-4 py-4">
                                <div className="space-y-3">
                                    {/* Summary View */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-grow">
                                            <div className="flex items-center space-x-3">
                                                <h2 className="text-lg font-medium text-gray-900">
                                                    {applicant.fullName}
                                                </h2>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {applicant.selectedDepartment}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                                <span>{applicant.faculty} - {applicant.department}</span>
                                                <span>•</span>
                                                <span>{applicant.classYear}</span>
                                                <span>•</span>
                                                <span>{applicant.email}</span>
                                                <span>•</span>
                                                <span>{applicant.phone}</span>
                                            </div>
                                            <div className="mt-1 text-xs text-gray-400">
                                                Başvuru Tarihi: {formatDate(applicant.createdAt)}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 ml-4">
                                            <button
                                                onClick={() => toggleExpand(applicant._id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                {expandedId === applicant._id ? "Gizle" : "Detayları Gör"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(applicant._id, applicant.fullName)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded View */}
                                    {expandedId === applicant._id && (
                                        <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
                                            {/* Social Links */}
                                            {(applicant.github || applicant.linkedin) && (
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                                        Sosyal Bağlantılar
                                                    </h3>
                                                    <div className="space-y-1 text-sm">
                                                        {applicant.github && (
                                                            <div>
                                                                <span className="font-medium">GitHub:</span>{" "}
                                                                <a
                                                                    href={applicant.github}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:underline"
                                                                >
                                                                    {applicant.github}
                                                                </a>
                                                            </div>
                                                        )}
                                                        {applicant.linkedin && (
                                                            <div>
                                                                <span className="font-medium">LinkedIn:</span>{" "}
                                                                <a
                                                                    href={applicant.linkedin}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:underline"
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
                                                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                                    Motivasyon
                                                </h3>
                                                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                                    {applicant.motivation}
                                                </p>
                                            </div>

                                            {/* Experience */}
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                                    Deneyim
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">
                                                        Organizasyon deneyimi var mı?
                                                    </span>{" "}
                                                    {applicant.hasExperience ? "Evet" : "Hayır"}
                                                </p>
                                                {applicant.hasExperience && applicant.experienceDescription && (
                                                    <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                                                        {applicant.experienceDescription}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Department Specific Answers */}
                                            {Object.keys(applicant.departmentSpecificAnswers).length > 0 && (
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                                        Departmana Özel Cevaplar
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {Object.entries(applicant.departmentSpecificAnswers).map(
                                                            ([key, value]) => (
                                                                <div key={key}>
                                                                    <p className="text-sm font-medium text-gray-700 capitalize">
                                                                        {key.replace(/([A-Z])/g, " $1").trim()}:
                                                                    </p>
                                                                    <p className="text-sm text-gray-600 whitespace-pre-wrap mt-1">
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
                                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                                        Ek Notlar
                                                    </h3>
                                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                                        {applicant.additionalNotes}
                                                    </p>
                                                </div>
                                            )}

                                            {/* KVKK Consent */}
                                            <div className="text-xs text-gray-500 border-t border-gray-300 pt-3">
                                                <p>KVKK Onayı: {applicant.kvkkConsent ? "✓ Verildi" : "✗ Verilmedi"}</p>
                                                <p>İletişim Onayı: {applicant.communicationConsent ? "✓ Verildi" : "✗ Verilmedi"}</p>
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
