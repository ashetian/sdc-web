"use client";
import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
    const [status, setStatus] = useState<
        "idle" | "sending" | "success" | "error"
    >("idle");
    const formRef = useRef<HTMLFormElement>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef(null);
    const formContainerRef = useRef(null);

    useGSAP(() => {
        gsap.fromTo(titleRef.current,
            {
                scale: 0.5,
                rotation: 360,
                opacity: 0,
            },
            {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 60%",
                    toggleActions: "play none none reverse",
                },
                scale: 1,
                rotation: 1, // Target rotation from className
                opacity: 1,
                duration: 1,
                ease: "back.out(1.7)",
            }
        );

        gsap.fromTo(formContainerRef.current,
            {
                y: 200,
                rotation: 5,
                opacity: 0,
            },
            {
                scrollTrigger: {
                    trigger: formContainerRef.current,
                    start: "top 60%",
                    toggleActions: "play none none reverse",
                },
                y: 0,
                rotation: -1, // Target rotation from className
                opacity: 1,
                duration: 1,
                ease: "power4.out",
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

    return (
        <section
            ref={sectionRef}
            id="contact"
            className="relative py-20 bg-neo-blue border-b-4 border-black"
        >
            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 ref={titleRef} className="inline-block text-4xl sm:text-5xl font-black text-black mb-6 bg-white border-4 border-black shadow-neo px-6 py-2 transform rotate-1">
                        İletişim
                    </h2>
                    <p className="text-xl font-bold text-black mt-4">
                        Sorularınız, önerileriniz veya işbirliği için bize ulaşın.
                    </p>
                </div>

                <div ref={formContainerRef} className="bg-white border-4 border-black shadow-neo-lg p-8 transform -rotate-1">
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-black text-black mb-2 uppercase"
                                >
                                    Ad Soyad
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="user_name"
                                    required
                                    className="w-full px-4 py-3 bg-gray-100 border-4 border-black text-black font-bold focus:outline-none focus:shadow-neo focus:bg-white transition-all"
                                    placeholder="Adınız Soyadınız"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-black text-black mb-2 uppercase"
                                >
                                    E-posta
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="user_email"
                                    required
                                    className="w-full px-4 py-3 bg-gray-100 border-4 border-black text-black font-bold focus:outline-none focus:shadow-neo focus:bg-white transition-all"
                                    placeholder="ornek@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="subject"
                                className="block text-sm font-black text-black mb-2 uppercase"
                            >
                                Konu
                            </label>
                            <select
                                id="subject"
                                name="subject"
                                required
                                className="w-full px-4 py-3 bg-gray-100 border-4 border-black text-black font-bold focus:outline-none focus:shadow-neo focus:bg-white transition-all appearance-none"
                            >
                                <option value="">Seçiniz</option>
                                <option value="general">Genel Soru</option>
                                <option value="membership">Üyelik</option>
                                <option value="collaboration">İşbirliği</option>
                                <option value="other">Diğer</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="message"
                                className="block text-sm font-black text-black mb-2 uppercase"
                            >
                                Mesaj
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={4}
                                required
                                className="w-full px-4 py-3 bg-gray-100 border-4 border-black text-black font-bold focus:outline-none focus:shadow-neo focus:bg-white transition-all resize-none"
                                placeholder="Mesajınız..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === "sending"}
                            className={`w-full py-4 text-lg font-black uppercase tracking-wider border-4 border-black shadow-neo transition-all
                ${status === "sending"
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : status === "success"
                                        ? "bg-neo-green text-black"
                                        : status === "error"
                                            ? "bg-red-500 text-white"
                                            : "bg-neo-yellow text-black hover:bg-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                                }`}
                        >
                            {status === "sending"
                                ? "Gönderiliyor..."
                                : status === "success"
                                    ? "Gönderildi!"
                                    : status === "error"
                                        ? "Hata Oluştu"
                                        : "Gönder"}
                        </button>

                        {status === "success" && (
                            <div className="text-neo-green font-bold mt-4 text-center border-2 border-black p-2 bg-black">
                                Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
                            </div>
                        )}

                        {status === "error" && (
                            <div className="text-red-500 font-bold mt-4 text-center border-2 border-black p-2 bg-white">
                                Bir hata oluştu. Lütfen daha sonra tekrar deneyin.
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
}
