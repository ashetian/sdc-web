"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../_context/LanguageContext";

type Department = "Proje Departmanı" | "Teknik Departman" | "Medya Departmanı" | "Kurumsal İletişim Departmanı" | string;

interface DepartmentData {
    _id: string;
    name: string;
    nameEn?: string;
    slug: string;
}

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
    const [departments, setDepartments] = useState<DepartmentData[]>([]);
    const { language } = useLanguage();
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

    const labels = {
        tr: {
            title: 'KTÜ SDC – Departman Başvuru Formu',
            personalInfo: '1. Kişisel Bilgiler',
            fullName: 'Ad Soyad',
            faculty: 'Fakülte',
            department: 'Bölüm',
            classYear: 'Sınıf',
            classYearPlaceholder: 'Örn: 2. Sınıf, 3. Sınıf',
            phone: 'Telefon',
            email: 'E-posta',
            github: 'GitHub (varsa)',
            linkedin: 'LinkedIn (varsa)',
            deptSelection: '2. Başvurulan Departman',
            selectDept: 'Departman Seçimi',
            chooseDept: 'Departman seçiniz...',
            motivationSection: '3. Motivasyon ve Uygunluk Soruları',
            whyDept: 'Neden bu departmana başvuruyorsun?',
            hasExperience: 'Daha önce kulüp, takım, etkinlik vb. bir organizasyon tecrübem var',
            expDesc: 'Deneyimini açıkla',
            deptQuestions: '4. Departmana Özel Sorular',
            additionalNotes: '5. Ek Notlar',
            notesLabel: 'Eklemek istediğin notlar',
            optional: 'Opsiyonel',
            kvkkSection: '6. KVKK ve Onay',
            kvkkText: 'KVKK Aydınlatma Metni',
            kvkkConsent: "'ni okudum ve kişisel verilerimin kulüp içi kullanım amaçlı işleneceğini onaylıyorum.",
            commConsent: 'Kulüp tarafından e-posta/telefon yoluyla bilgilendirilmesine onay veriyorum.',
            submit: 'Başvuruyu Gönder',
            sending: 'Gönderiliyor...',
            success: 'Başvurunuz başarıyla gönderildi!',
            error: 'Bir hata oluştu',
            projectDept: 'Proje Departmanı Soruları',
            eventExp: 'Daha önce etkinlik planlama / moderasyon / görevli deneyimin var mı?',
            interpersonal: 'İnsan ilişkisi gerektiren durumlarda genelde nasıl davranırsın?',
            commIdea: 'Üyeler arası iletişimi geliştirmek için bir fikir yaz.',
            techDept: 'Teknik Departman Soruları',
            techInterests: 'Hangi teknolojilerle ilgileniyorsun? (Frontend, Backend, AI, DevOps, Mobile, Siber Güvenlik gibi...)',
            projectDesc: 'Şu ana kadar yaptığın bir projeyi kısaca anlat.',
            mediaDept: 'Medya Departmanı Soruları',
            tools: 'Hangi araçları kullanıyorsun? (Canva, Figma, Premiere, After Effects gibi...)',
            portfolio: 'Daha önce afiş veya video çalışman varsa link bırak.',
            corpDept: 'Kurumsal İletişim Departmanı Soruları',
            formalComm: 'Daha önce mail yazışması, sponsorluk görüşmesi veya resmi iletişim deneyimin var mı?',
            sponsorStrategy: 'Etkinlik için sponsorluk bulma sürecinde nasıl bir strateji izlerdin?'
        },
        en: {
            title: 'KTU SDC – Department Application Form',
            personalInfo: '1. Personal Information',
            fullName: 'Full Name',
            faculty: 'Faculty',
            department: 'Department',
            classYear: 'Class Year',
            classYearPlaceholder: 'Ex: 2nd Year, 3rd Year',
            phone: 'Phone',
            email: 'Email',
            github: 'GitHub (if any)',
            linkedin: 'LinkedIn (if any)',
            deptSelection: '2. Department Selection',
            selectDept: 'Select Department',
            chooseDept: 'Choose a department...',
            motivationSection: '3. Motivation and Suitability Questions',
            whyDept: 'Why are you applying to this department?',
            hasExperience: 'I have previous experience in a club, team, event organization etc.',
            expDesc: 'Explain your experience',
            deptQuestions: '4. Department Specific Questions',
            additionalNotes: '5. Additional Notes',
            notesLabel: 'Notes you want to add',
            optional: 'Optional',
            kvkkSection: '6. GDPR and Consent',
            kvkkText: 'GDPR Clarification Text',
            kvkkConsent: " I have read and I consent to the processing of my personal data for internal club use.",
            commConsent: 'I consent to being informed by the club via email/phone.',
            submit: 'Submit Application',
            sending: 'Sending...',
            success: 'Your application has been submitted successfully!',
            error: 'An error occurred',
            projectDept: 'Project Department Questions',
            eventExp: 'Do you have any experience in event planning / moderation / staffing?',
            interpersonal: 'How do you generally behave in situations requiring human relations?',
            commIdea: 'Write an idea to improve communication among members.',
            techDept: 'Technical Department Questions',
            techInterests: 'Which technologies are you interested in? (Frontend, Backend, AI, DevOps, Mobile, Cyber Security etc...)',
            projectDesc: 'Briefly describe a project you have done so far.',
            mediaDept: 'Media Department Questions',
            tools: 'Which tools do you use? (Canva, Figma, Premiere, After Effects etc...)',
            portfolio: 'Leave a link if you have previous poster or video work.',
            corpDept: 'Corporate Relations Department Questions',
            formalComm: 'Do you have any experience in email correspondence, sponsorship meetings or formal communication?',
            sponsorStrategy: 'What strategy would you follow in the process of finding sponsorship for an event?'
        }
    };

    const l = labels[language];

    useEffect(() => {
        const fetchDepartments = async () => {
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
        fetchDepartments();
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
                throw new Error(errorData.error || l.error);
            }

            alert(l.success);
            router.push("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : l.error);
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
                        {l.projectDept}
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {l.eventExp}
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
                            {l.interpersonal}
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
                            {l.commIdea}
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
                        {l.techDept}
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {l.techInterests}
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
                            {l.projectDesc}
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
                        {l.mediaDept}
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {l.tools}
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
                            {l.portfolio}
                        </label>
                        <textarea
                            value={formData.departmentSpecificAnswers.portfolioLinks || ""}
                            onChange={(e) => handleDepartmentAnswerChange("portfolioLinks", e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder={l.optional}
                        />
                    </div>
                </div>
            );
        } else if (formData.selectedDepartment.includes("Kurumsal")) {
            return (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-black pb-2">
                        {l.corpDept}
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {l.formalComm}
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
                            {l.sponsorStrategy}
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
                        {l.title}
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
                                {l.personalInfo}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {l.fullName} <span className="text-red-600">*</span>
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
                                        {l.faculty} <span className="text-red-600">*</span>
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
                                        {l.department} <span className="text-red-600">*</span>
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
                                        {l.classYear} <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="classYear"
                                        value={formData.classYear}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder={l.classYearPlaceholder}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {l.phone} <span className="text-red-600">*</span>
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
                                        {l.email} <span className="text-red-600">*</span>
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
                                        {l.github}
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
                                        {l.linkedin}
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
                                {l.deptSelection}
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {l.selectDept} <span className="text-red-600">*</span>
                                </label>
                                <select
                                    name="selectedDepartment"
                                    value={formData.selectedDepartment}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                >
                                    <option value="">{l.chooseDept}</option>
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
                                {l.motivationSection}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {l.whyDept} <span className="text-red-600">*</span>
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
                                            {l.hasExperience}
                                        </span>
                                    </label>
                                </div>

                                {formData.hasExperience && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {l.expDesc} <span className="text-red-600">*</span>
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
                                    {l.deptQuestions}
                                </h2>
                                {renderDepartmentQuestions()}
                            </section>
                        )}

                        {/* 5. Ek Notlar */}
                        <section>
                            <h2 className="text-xl font-bold text-black mb-4 bg-gray-100 border-2 border-black px-4 py-2">
                                {l.additionalNotes}
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {l.notesLabel}
                                </label>
                                <textarea
                                    name="additionalNotes"
                                    value={formData.additionalNotes}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder={l.optional}
                                />
                            </div>
                        </section>

                        {/* 6. KVKK ve Onay */}
                        <section>
                            <h2 className="text-xl font-bold text-black mb-4 bg-gray-100 border-2 border-black px-4 py-2">
                                {l.kvkkSection}
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
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 underline font-bold"
                                        >
                                            {l.kvkkText}
                                        </a>
                                        {l.kvkkConsent} <span className="text-red-600">*</span>
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
                                        {l.commConsent} <span className="text-red-600">*</span>
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
                                {loading ? l.sending : l.submit}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
