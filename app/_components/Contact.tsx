"use client";
import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "../_context/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
    const [status, setStatus] = useState<
        "idle" | "sending" | "success" | "error"
    >("idle");
    const formRef = useRef<HTMLFormElement>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef(null);
    const formContainerRef = useRef(null);
    const { language, t } = useLanguage();

    useGSAP(() => {
        if (!titleRef.current || !sectionRef.current || !formContainerRef.current) return;

        gsap.fromTo(titleRef.current,
            { scale: 0.5, rotation: 360, opacity: 0 },
            {
                scrollTrigger: { trigger: sectionRef.current, start: "top 60%", toggleActions: "play none none reverse" },
                scale: 1, rotation: 1, opacity: 1, duration: 1, ease: "back.out(1.7)",
            }
        );

        gsap.fromTo(formContainerRef.current,
            { y: 200, rotation: 5, opacity: 0 },
            {
                scrollTrigger: { trigger: formContainerRef.current, start: "top 60%", toggleActions: "play none none reverse" },
                y: 0, rotation: -1, opacity: 1, duration: 1, ease: "power4.out",
            }
        );
    }, { scope: sectionRef });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formRef.current) return;

        setStatus("sending");

        try {
            await emailjs.sendForm(
                "service_sdc",
                "template_0619veg",
                formRef.current,
                process.env.NEXT_PUBLIC_EMAILJS_API_KEY || ""
            );
            setStatus("success");
            formRef.current.reset();
            setTimeout(() => setStatus("idle"), 3000);
        } catch (error) {
            console.error(error);
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    const labels = {
        tr: {
            title: 'İletişim',
            subtitle: 'Sorularınız, önerileriniz veya işbirliği için bize ulaşın.',
            name: 'Ad Soyad',
            namePlaceholder: 'Adınız Soyadınız',
            email: 'E-posta',
            emailPlaceholder: 'ornek@email.com',
            subject: 'Konu',
            subjectSelect: 'Seçiniz',
            subjectGeneral: 'Genel Soru',
            subjectMembership: 'Üyelik',
            subjectCollaboration: 'İşbirliği',
            subjectOther: 'Diğer',
            message: 'Mesaj',
            messagePlaceholder: 'Mesajınız...',
            sending: 'Gönderiliyor...',
            sent: 'Gönderildi!',
            error: 'Hata Oluştu',
            send: 'Gönder',
            successMsg: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
            errorMsg: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        },
        en: {
            title: 'Contact',
            subtitle: 'Reach out to us for questions, suggestions or collaboration.',
            name: 'Full Name',
            namePlaceholder: 'Your Full Name',
            email: 'Email',
            emailPlaceholder: 'example@email.com',
            subject: 'Subject',
            subjectSelect: 'Select',
            subjectGeneral: 'General Question',
            subjectMembership: 'Membership',
            subjectCollaboration: 'Collaboration',
            subjectOther: 'Other',
            message: 'Message',
            messagePlaceholder: 'Your message...',
            sending: 'Sending...',
            sent: 'Sent!',
            error: 'Error Occurred',
            send: 'Send',
            successMsg: 'Your message has been sent successfully. We will get back to you soon.',
            errorMsg: 'An error occurred. Please try again later.',
        }
    };

    const l = labels[language];

    return (
        <section ref={sectionRef} id="contact" className="relative py-20 bg-neo-blue border-b-4 border-black">
            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 ref={titleRef} className="inline-block text-4xl sm:text-5xl font-black text-black mb-6 bg-white border-4 border-black shadow-neo px-6 py-2 transform rotate-1">
                        {l.title}
                    </h2>
                    <p className="text-xl font-bold text-black mt-4">{l.subtitle}</p>
                </div>

                <div ref={formContainerRef} className="bg-white border-4 border-black shadow-neo-lg p-8 transform -rotate-1">
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-black text-black mb-2 uppercase">{l.name}</label>
                                <input type="text" id="name" name="user_name" required
                                    className="w-full px-4 py-3 bg-gray-100 border-4 border-black text-black font-bold focus:outline-none focus:shadow-neo focus:bg-white transition-all"
                                    placeholder={l.namePlaceholder} />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-black text-black mb-2 uppercase">{l.email}</label>
                                <input type="email" id="email" name="user_email" required
                                    className="w-full px-4 py-3 bg-gray-100 border-4 border-black text-black font-bold focus:outline-none focus:shadow-neo focus:bg-white transition-all"
                                    placeholder={l.emailPlaceholder} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-sm font-black text-black mb-2 uppercase">{l.subject}</label>
                            <select id="subject" name="subject" required
                                className="w-full px-4 py-3 bg-gray-100 border-4 border-black text-black font-bold focus:outline-none focus:shadow-neo focus:bg-white transition-all appearance-none">
                                <option value="">{l.subjectSelect}</option>
                                <option value="general">{l.subjectGeneral}</option>
                                <option value="membership">{l.subjectMembership}</option>
                                <option value="collaboration">{l.subjectCollaboration}</option>
                                <option value="other">{l.subjectOther}</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-black text-black mb-2 uppercase">{l.message}</label>
                            <textarea id="message" name="message" rows={4} required
                                className="w-full px-4 py-3 bg-gray-100 border-4 border-black text-black font-bold focus:outline-none focus:shadow-neo focus:bg-white transition-all resize-none"
                                placeholder={l.messagePlaceholder} />
                        </div>

                        <button type="submit" disabled={status === "sending"}
                            className={`w-full py-4 text-lg font-black uppercase tracking-wider border-4 border-black shadow-neo transition-all
                                ${status === "sending" ? "bg-gray-400 cursor-not-allowed"
                                    : status === "success" ? "bg-neo-green text-black"
                                        : status === "error" ? "bg-red-500 text-white"
                                            : "bg-neo-yellow text-black hover:bg-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none"}`}>
                            {status === "sending" ? l.sending : status === "success" ? l.sent : status === "error" ? l.error : l.send}
                        </button>

                        {status === "success" && (
                            <div className="text-neo-green font-bold mt-4 text-center border-2 border-black p-2 bg-black">{l.successMsg}</div>
                        )}

                        {status === "error" && (
                            <div className="text-red-500 font-bold mt-4 text-center border-2 border-black p-2 bg-white">{l.errorMsg}</div>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
}
