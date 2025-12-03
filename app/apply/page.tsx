"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Department = "Proje Departmanı" | "Teknik Departman" | "Medya Departmanı" | "Kurumsal İletişim Departmanı";

interface FormData {
    fullName: string;
    faculty: string;
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
    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        faculty: "",
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
                throw new Error(errorData.error || "Başvuru gönderilemedi");
            }

            alert("Başvurunuz başarıyla gönderildi!");
            router.push("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    const renderDepartmentQuestions = () => {
        switch (formData.selectedDepartment) {
            case "Proje Departmanı":
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-black pb-2">
                            Proje Departmanı Soruları
                        </h3>

                        {/* Organizasyon Birimi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Daha önce etkinlik planlama / moderasyon / görevli deneyimin var mı?
                            </label>
                            <textarea
                                value={formData.departmentSpecificAnswers.eventExperience || ""}
                                onChange={(e) => handleDepartmentAnswerChange("eventExperience", e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                required
                            />
                        </div>

                        {/* Topluluk & İK Birimi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                İnsan ilişkisi gerektiren durumlarda genelde nasıl davranırsın?
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
                                Üyeler arası iletişimi geliştirmek için bir fikir yaz.
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

            case "Teknik Departman":
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-black pb-2">
                            Teknik Departman Soruları
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hangi teknolojilerle ilgileniyorsun? (Frontend, Backend, AI, DevOps, Mobile, Siber Güvenlik gibi...)
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
                                Şu ana kadar yaptığın bir projeyi kısaca anlat.
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

            case "Medya Departmanı":
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-black pb-2">
                            Medya Departmanı Soruları
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hangi araçları kullanıyorsun? (Canva, Figma, Premiere, After Effects gibi...)
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
                                Daha önce afiş veya video çalışman varsa link bırak.
                            </label>
                            <textarea
                                value={formData.departmentSpecificAnswers.portfolioLinks || ""}
                                onChange={(e) => handleDepartmentAnswerChange("portfolioLinks", e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="Opsiyonel"
                            />
                        </div>
                    </div>
                );

            case "Kurumsal İletişim Departmanı":
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-black pb-2">
                            Kurumsal İletişim Departmanı Soruları
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Daha önce mail yazışması, sponsorluk görüşmesi veya resmi iletişim deneyimin var mı?
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
                                Etkinlik için sponsorluk bulma sürecinde nasıl bir strateji izlerdin?
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

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-white py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white border-4 border-black shadow-neo p-8">
                    <h1 className="text-3xl font-black text-black mb-2 border-b-4 border-black pb-4">
                        KTÜ SDC – Departman Başvuru Formu
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
                                1. Kişisel Bilgiler
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ad Soyad <span className="text-red-600">*</span>
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
                                        Fakülte <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="faculty"
                                        value={formData.faculty}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bölüm <span className="text-red-600">*</span>
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
                                        Sınıf <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="classYear"
                                        value={formData.classYear}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="Örn: 2. Sınıf, 3. Sınıf"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Telefon <span className="text-red-600">*</span>
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
                                        E-posta <span className="text-red-600">*</span>
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
                                        GitHub (varsa)
                                    </label>
                                    <input
                                        type="url"
                                        name="github"
                                        value={formData.github}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="https://github.com/kullanici-adi"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        LinkedIn (varsa)
                                    </label>
                                    <input
                                        type="url"
                                        name="linkedin"
                                        value={formData.linkedin}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="https://linkedin.com/in/kullanici-adi"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 2. Başvurulan Departman */}
                        <section>
                            <h2 className="text-xl font-bold text-black mb-4 bg-gray-100 border-2 border-black px-4 py-2">
                                2. Başvurulan Departman
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Departman Seçimi <span className="text-red-600">*</span>
                                </label>
                                <select
                                    name="selectedDepartment"
                                    value={formData.selectedDepartment}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                >
                                    <option value="">Departman seçiniz...</option>
                                    <option value="Proje Departmanı">Proje Departmanı</option>
                                    <option value="Teknik Departman">Teknik Departman</option>
                                    <option value="Medya Departmanı">Medya Departmanı</option>
                                    <option value="Kurumsal İletişim Departmanı">Kurumsal İletişim Departmanı</option>
                                </select>
                            </div>
                        </section>

                        {/* 3. Motivasyon ve Uygunluk Soruları */}
                        <section>
                            <h2 className="text-xl font-bold text-black mb-4 bg-gray-100 border-2 border-black px-4 py-2">
                                3. Motivasyon ve Uygunluk Soruları
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Neden bu departmana başvuruyorsun? <span className="text-red-600">*</span>
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
                                            Daha önce kulüp, takım, etkinlik vb. bir organizasyon tecrübem var
                                        </span>
                                    </label>
                                </div>

                                {formData.hasExperience && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Deneyimini açıkla <span className="text-red-600">*</span>
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
                                    4. Departmana Özel Sorular
                                </h2>
                                {renderDepartmentQuestions()}
                            </section>
                        )}

                        {/* 5. Ek Notlar */}
                        <section>
                            <h2 className="text-xl font-bold text-black mb-4 bg-gray-100 border-2 border-black px-4 py-2">
                                5. Ek Notlar
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Eklemek istediğin notlar
                                </label>
                                <textarea
                                    name="additionalNotes"
                                    value={formData.additionalNotes}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="Opsiyonel"
                                />
                            </div>
                        </section>

                        {/* 6. KVKK ve Onay */}
                        <section>
                            <h2 className="text-xl font-bold text-black mb-4 bg-gray-100 border-2 border-black px-4 py-2">
                                6. KVKK ve Onay
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
                                        Verilerimin kulüp içi kullanım amaçlı işleneceğini onaylıyorum. <span className="text-red-600">*</span>
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
                                        Kulüp tarafından e-posta/telefon yoluyla bilgilendirilmesine onay veriyorum. <span className="text-red-600">*</span>
                                    </span>
                                </label>
                            </div>
                        </section>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white border-4 border-black px-8 py-4 text-lg font-bold 
                         hover:bg-white hover:text-black transition-colors duration-200 
                         disabled:opacity-50 disabled:cursor-not-allowed shadow-neo hover:shadow-neo-lg"
                            >
                                {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
