"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../_context/LanguageContext";
import { Button } from '@/app/_components/ui';

type Department = "Proje Departmanı" | "Teknik Departman" | "Medya Departmanı" | "Kurumsal İletişim Departmanı" | string;

interface DepartmentData {
    _id: string;
    name: string;
    nameEn?: string;
    slug: string;
}

interface FormData {
    fullName: string;
    department: string;
    classYear: string;
    phone: string;
    email: string;
    github: string;
    linkedin: string;
    selectedDepartment: Department | "";
    motivation: string;
    hasExperience: boolean;
    experienceDescription: string;
    departmentSpecificAnswers: Record<string, string>;
    additionalNotes: string;
    kvkkConsent: boolean;
    communicationConsent: boolean;
}

export default function ApplyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [departments, setDepartments] = useState<DepartmentData[]>([]);
    const { t, language } = useLanguage();
    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        department: "",
        classYear: "",
        phone: "",
        email: "",
        github: "",
        linkedin: "",
        selectedDepartment: "",
        motivation: "",
        hasExperience: false,
        experienceDescription: "",
        departmentSpecificAnswers: {},
        additionalNotes: "",
        kvkkConsent: false,
        communicationConsent: false,
    });


    useEffect(() => {
        const init = async () => {
            // Check Auth & Pre-fill
            try {
                const authRes = await fetch('/api/auth/me');
                if (!authRes.ok) {
                    router.push('/auth/login?redirect=/apply');
                    return;
                }
                const authData = await authRes.json();
                const user = authData.user;
                if (user) {
                    setFormData(prev => ({
                        ...prev,
                        fullName: user.fullName || "",
                        email: user.email || "",
                        phone: user.phone || "",
                        // If user.department exists, use it. NOTE: This might ideally map to 'faculty' or 'department' field differently depending on data source, 
                        // but sticking to simple mapping for now.
                        department: user.department || prev.department,
                    }));
                }
            } catch (error) {
                console.error("Auth check failed", error);
                router.push('/auth/login?returnUrl=/apply');
                return;
            }

            // Fetch Departments
            try {
                const res = await fetch('/api/departments');
                if (res.ok) {
                    const data = await res.json();
                    setDepartments(data);
                }
            } catch (error) {
                console.error('Departmanlar yüklenemedi:', error);
            }
        };

        init();
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            if (name === "hasExperience") {
                setFormData((prev) => ({
                    ...prev,
                    hasExperience: checked,
                    experienceDescription: checked ? prev.experienceDescription : ""
                }));
            } else {
                setFormData((prev) => ({ ...prev, [name]: checked }));
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleDepartmentAnswerChange = (questionKey: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            departmentSpecificAnswers: {
                ...prev.departmentSpecificAnswers,
                [questionKey]: value,
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/applicants", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || t('apply.error'));
            }

            alert(t('apply.applicationSuccess'));
            router.push("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : t('apply.error'));
        } finally {
            setLoading(false);
        }
    };

    const renderDepartmentQuestions = () => {
        // Map department names to keys if needed, or use string matching
        // For simplicity, we'll check against Turkish names as they are the values

        if (formData.selectedDepartment.includes("Proje")) {
            return (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-black pb-2">
                        {t('apply.projectDept')}
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('apply.eventExp')}
                        </label>
                        <textarea
                            value={formData.departmentSpecificAnswers.eventExperience || ""}
                            onChange={(e) => handleDepartmentAnswerChange("eventExperience", e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('apply.interpersonal')}
                        </label>
                        <textarea
                            value={formData.departmentSpecificAnswers.interpersonalSkills || ""}
                            onChange={(e) => handleDepartmentAnswerChange("interpersonalSkills", e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('apply.commIdea')}
                        </label>
                        <textarea
                            value={formData.departmentSpecificAnswers.communicationIdea || ""}
                            onChange={(e) => handleDepartmentAnswerChange("communicationIdea", e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>
                </div>
            );
        } else if (formData.selectedDepartment.includes("Teknik")) {
            return (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-black pb-2">
                        {t('apply.techDept')}
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('apply.techInterests')}
                        </label>
                        <textarea
                            value={formData.departmentSpecificAnswers.technologies || ""}
                            onChange={(e) => handleDepartmentAnswerChange("technologies", e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('apply.projectDesc')}
                        </label>
                        <textarea
                            value={formData.departmentSpecificAnswers.projectDescription || ""}
                            onChange={(e) => handleDepartmentAnswerChange("projectDescription", e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>
                </div>
            );
        } else if (formData.selectedDepartment.includes("Medya")) {
            return (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-black pb-2">
                        {t('apply.mediaDept')}
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('apply.tools')}
                        </label>
                        <textarea
                            value={formData.departmentSpecificAnswers.tools || ""}
                            onChange={(e) => handleDepartmentAnswerChange("tools", e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('apply.portfolio')}
                        </label>
                        <textarea
                            value={formData.departmentSpecificAnswers.portfolioLinks || ""}
                            onChange={(e) => handleDepartmentAnswerChange("portfolioLinks", e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder={t('apply.optional')}
                        />
                    </div>
                </div>
            );
        } else if (formData.selectedDepartment.includes("Kurumsal")) {
            return (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-black pb-2">
                        {t('apply.corpDept')}
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('apply.formalComm')}
                        </label>
                        <textarea
                            value={formData.departmentSpecificAnswers.formalCommunicationExperience || ""}
                            onChange={(e) => handleDepartmentAnswerChange("formalCommunicationExperience", e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('apply.sponsorStrategy')}
                        </label>
                        <textarea
                            value={formData.departmentSpecificAnswers.sponsorshipStrategy || ""}
                            onChange={(e) => handleDepartmentAnswerChange("sponsorshipStrategy", e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-white py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white border-4 border-black shadow-neo p-8">
                    <h1 className="text-3xl font-black text-black mb-2 border-b-4 border-black pb-4">
                        {t('apply.title')}
                    </h1>

                    {error && (
                        <div className="mt-4 bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-8 space-y-8">
                        {/* 1. Kişisel Bilgiler */}
                        <section>
                            <h2 className="text-xl font-bold text-black mb-4 bg-gray-100 border-2 border-black px-4 py-2">
                                {t('apply.personalInfo')}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('apply.fullName')} <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                    />
                                </div>



                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('apply.departmentLabel')} <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('apply.classYear')} <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="classYear"
                                        value={formData.classYear}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder={t('apply.classYearPlaceholder')}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('apply.phone')} <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('apply.email')} <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('apply.github')}
                                    </label>
                                    <input
                                        type="url"
                                        name="github"
                                        value={formData.github}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="https://github.com/..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('apply.linkedin')}
                                    </label>
                                    <input
                                        type="url"
                                        name="linkedin"
                                        value={formData.linkedin}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 2. Başvurulan Departman */}
                        <section>
                            <h2 className="text-xl font-bold text-black mb-4 bg-gray-100 border-2 border-black px-4 py-2">
                                {t('apply.deptSelection')}
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('apply.selectDept')} <span className="text-red-600">*</span>
                                </label>
                                <select
                                    name="selectedDepartment"
                                    value={formData.selectedDepartment}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                >
                                    <option value="">{t('apply.chooseDept')}</option>
                                    {departments.length > 0 ? (
                                        departments.map((dept) => (
                                            <option key={dept._id} value={dept.name}>
                                                {language === 'en' && dept.nameEn ? dept.nameEn : dept.name}
                                            </option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="Proje Departmanı">Proje Departmanı</option>
                                            <option value="Teknik Departman">Teknik Departman</option>
                                            <option value="Medya Departmanı">Medya Departmanı</option>
                                            <option value="Kurumsal İletişim Departmanı">Kurumsal İletişim Departmanı</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </section>

                        {/* 3. Motivasyon ve Uygunluk Soruları */}
                        <section>
                            <h2 className="text-xl font-bold text-black mb-4 bg-gray-100 border-2 border-black px-4 py-2">
                                {t('apply.motivationSection')}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('apply.whyDept')} <span className="text-red-600">*</span>
                                    </label>
                                    <textarea
                                        name="motivation"
                                        value={formData.motivation}
                                        onChange={handleInputChange}
                                        rows={5}
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="hasExperience"
                                            checked={formData.hasExperience}
                                            onChange={handleInputChange}
                                            className="w-5 h-5 border-2 border-black"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            {t('apply.hasExperience')}
                                        </span>
                                    </label>
                                </div>

                                {formData.hasExperience && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('apply.expDesc')} <span className="text-red-600">*</span>
                                        </label>
                                        <textarea
                                            name="experienceDescription"
                                            value={formData.experienceDescription}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 4. Departmanlara Özel Sorular */}
                        {formData.selectedDepartment && (
                            <section>
                                <h2 className="text-xl font-bold text-black mb-4 bg-gray-100 border-2 border-black px-4 py-2">
                                    {t('apply.deptQuestions')}
                                </h2>
                                {renderDepartmentQuestions()}
                            </section>
                        )}

                        {/* 5. Ek Notlar */}
                        <section>
                            <h2 className="text-xl font-bold text-black mb-4 bg-gray-100 border-2 border-black px-4 py-2">
                                {t('apply.additionalNotes')}
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('apply.notesLabel')}
                                </label>
                                <textarea
                                    name="additionalNotes"
                                    value={formData.additionalNotes}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder={t('apply.optional')}
                                />
                            </div>
                        </section>

                        {/* 6. KVKK ve Onay */}
                        <section>
                            <h2 className="text-xl font-bold text-black mb-4 bg-gray-100 border-2 border-black px-4 py-2">
                                {t('apply.kvkkSection')}
                            </h2>
                            <div className="space-y-3">
                                <label className="flex items-start space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="kvkkConsent"
                                        checked={formData.kvkkConsent}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 border-2 border-black mt-0.5"
                                        required
                                    />
                                    <span className="text-sm text-gray-700">
                                        <a
                                            href="/kvkk"

                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 underline font-bold"
                                        >
                                            {t('apply.kvkkText')}
                                        </a>
                                        {t('apply.kvkkConsent')} <span className="text-red-600">*</span>
                                    </span>
                                </label>

                                <label className="flex items-start space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="communicationConsent"
                                        checked={formData.communicationConsent}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 border-2 border-black mt-0.5"
                                        required
                                    />
                                    <span className="text-sm text-gray-700">
                                        {t('apply.commConsent')} <span className="text-red-600">*</span>
                                    </span>
                                </label>
                            </div>
                        </section>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <Button
                                type="submit"
                                disabled={loading}
                                isLoading={loading}
                                fullWidth
                            >
                                {t('apply.submitApplication')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
