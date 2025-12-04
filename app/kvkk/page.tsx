"use client";
import Link from "next/link";
import { useLanguage } from "../_context/LanguageContext";

export default function KVKKPage() {
    const { language } = useLanguage();

    const content = {
        tr: {
            title: "KVKK Aydınlatma Metni",
            controller: "Veri Sorumlusu:",
            controllerName: "Karadeniz Teknik Üniversitesi Yazılım Geliştirme Kulübü (KTÜ SDC)",
            intro: 'Karadeniz Teknik Üniversitesi Yazılım Geliştirme Kulübü ("Kulüp") tarafından düzenlenen etkinlik, başvuru ve doğrulama süreçlerinde, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla kişisel verileriniz işlenmektedir.',
            section1: "1. İşlenen Kişisel Veriler",
            section1Intro: "Form aracılığıyla tarafınızdan alınan:",
            section1List: [
                "Ad–soyad",
                "İletişim bilgileri (telefon, e-posta)",
                "Dekont / ödeme doğrulama bilgisi",
                "Başvuruya ilişkin diğer ilettiğiniz bilgiler"
            ],
            section2: "2. Kişisel Verilerin İşlenme Amaçları",
            section2Intro: "Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:",
            section2List: [
                "Başvuruların alınması, değerlendirilmesi ve doğrulanması",
                "Etkinlik/başvuru süreçlerinin yürütülmesi",
                "Gerekli durumlarda sizinle iletişime geçilmesi",
                "Katılımcı listelerinin oluşturulması ve organizasyon süreçlerinin planlanması"
            ],
            section2Outro: "Bu işlemler KVKK'nın 5. maddesi uyarınca bir sözleşmenin kurulması/ifası ve Kulübün meşru menfaatleri kapsamında yürütülmektedir. Açık rıza gerektiren bir işlem yapılmamaktadır.",
            section3: "3. Kişisel Verilerin Aktarılması",
            section3Intro: "Kişisel verileriniz, yalnızca gerekli hallerde:",
            section3List: [
                "Etkinlik organizasyonunda görev alan kulüp ekiplerine",
                "Üniversite birimlerine"
            ],
            section3Outro: "aktarılabilir. Bunun dışında üçüncü taraflarla paylaşılmamaktadır.",
            section4: "4. Kişisel Verilerin Saklama Süresi",
            section4Text: "Verileriniz yalnızca başvuru ve doğrulama sürecinin gerektirdiği süre boyunca saklanacak, süreç tamamlandıktan sonra mevzuata uygun şekilde silinecek veya anonimleştirilecektir.",
            section5: "5. KVKK Kapsamındaki Haklarınız",
            section5Intro: "KVKK'nın 11. maddesi gereğince aşağıdaki haklara sahipsiniz:",
            section5List: [
                "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
                "İşlenmişse buna ilişkin bilgi talep etme",
                "İşleme amacını ve uygun kullanılıp kullanılmadığını öğrenme",
                "Yanlış veya eksik işlenen verilerin düzeltilmesini talep etme",
                "Silinmesini veya anonimleştirilmesini talep etme",
                "İşlemenin kısıtlanmasını isteme",
                "İşlenen verilerin aktarılması ile ilgili bilgi alma"
            ],
            section5Outro: "Bu haklarınızı kullanmak için Kulüp ile resmi iletişim kanallarımız üzerinden iletişime geçebilirsiniz.",
            backHome: "Ana Sayfaya Dön"
        },
        en: {
            title: "GDPR Clarification Text",
            controller: "Data Controller:",
            controllerName: "Karadeniz Technical University Software Development Club (KTU SDC)",
            intro: 'Your personal data is processed by Karadeniz Technical University Software Development Club ("Club") as the data controller within the scope of the Law on the Protection of Personal Data No. 6698 ("KVKK") in the event, application and verification processes organized by the Club.',
            section1: "1. Processed Personal Data",
            section1Intro: "Obtained from you via the form:",
            section1List: [
                "Name-Surname",
                "Contact information (phone, email)",
                "Receipt / payment verification information",
                "Other information you submitted regarding the application"
            ],
            section2: "2. Purposes of Processing Personal Data",
            section2Intro: "Your personal data is processed for the following purposes:",
            section2List: [
                "Receiving, evaluating and verifying applications",
                "Execution of event/application processes",
                "Contacting you when necessary",
                "Creating participant lists and planning organization processes"
            ],
            section2Outro: "These operations are carried out within the scope of the establishment/performance of a contract and the legitimate interests of the Club pursuant to Article 5 of the KVKK. No operation requiring explicit consent is performed.",
            section3: "3. Transfer of Personal Data",
            section3Intro: "Your personal data may be transferred only in necessary cases to:",
            section3List: [
                "Club teams involved in event organization",
                "University units"
            ],
            section3Outro: "Apart from this, it is not shared with third parties.",
            section4: "4. Retention Period of Personal Data",
            section4Text: "Your data will be kept only for the period required by the application and verification process, and will be deleted or anonymized in accordance with the legislation after the process is completed.",
            section5: "5. Your Rights Under KVKK",
            section5Intro: "Pursuant to Article 11 of the KVKK, you have the following rights:",
            section5List: [
                "To learn whether your personal data is processed",
                "To request information if it has been processed",
                "To learn the purpose of processing and whether it is used appropriately",
                "To request correction of wrong or incomplete processed data",
                "To request deletion or anonymization",
                "To request restriction of processing",
                "To receive information about the transfer of processed data"
            ],
            section5Outro: "You can contact the Club via our official communication channels to exercise these rights.",
            backHome: "Back to Home"
        }
    };

    const t = content[language];

    return (
        <div className="min-h-screen bg-neo-yellow py-20 pt-40">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white border-4 border-black shadow-neo-lg p-8 transform -rotate-1">
                    <h1 className="text-3xl sm:text-4xl font-black text-black mb-8 border-b-4 border-black pb-4">
                        {t.title}
                    </h1>

                    <div className="prose prose-lg max-w-none text-black">
                        <p className="font-bold text-lg mb-6">
                            <strong>{t.controller}</strong> {t.controllerName}
                        </p>

                        <p className="mb-6">
                            {t.intro}
                        </p>

                        <h2 className="text-2xl font-black text-black mt-8 mb-4 bg-gray-100 border-2 border-black px-4 py-2">
                            {t.section1}
                        </h2>
                        <p className="mb-4">{t.section1Intro}</p>
                        <ul className="list-disc list-inside mb-6 space-y-2">
                            {t.section1List.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>

                        <h2 className="text-2xl font-black text-black mt-8 mb-4 bg-gray-100 border-2 border-black px-4 py-2">
                            {t.section2}
                        </h2>
                        <p className="mb-4">{t.section2Intro}</p>
                        <ul className="list-disc list-inside mb-6 space-y-2">
                            {t.section2List.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                        <p className="mb-6">
                            {t.section2Outro}
                        </p>

                        <h2 className="text-2xl font-black text-black mt-8 mb-4 bg-gray-100 border-2 border-black px-4 py-2">
                            {t.section3}
                        </h2>
                        <p className="mb-4">{t.section3Intro}</p>
                        <ul className="list-disc list-inside mb-4 space-y-2">
                            {t.section3List.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                        <p className="mb-6">{t.section3Outro}</p>

                        <h2 className="text-2xl font-black text-black mt-8 mb-4 bg-gray-100 border-2 border-black px-4 py-2">
                            {t.section4}
                        </h2>
                        <p className="mb-6">
                            {t.section4Text}
                        </p>

                        <h2 className="text-2xl font-black text-black mt-8 mb-4 bg-gray-100 border-2 border-black px-4 py-2">
                            {t.section5}
                        </h2>
                        <p className="mb-4">{t.section5Intro}</p>
                        <ul className="list-disc list-inside mb-6 space-y-2">
                            {t.section5List.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                        <p className="mb-6">
                            {t.section5Outro}
                        </p>
                    </div>

                    <div className="mt-12 border-t-4 border-black pt-8">
                        <Link
                            href="/"
                            className="inline-flex items-center text-black font-black uppercase hover:underline decoration-4 decoration-neo-purple underline-offset-4 transition-all"
                        >
                            <svg
                                className="w-6 h-6 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={4}
                            >
                                <path
                                    strokeLinecap="square"
                                    strokeLinejoin="miter"
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            {t.backHome}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
