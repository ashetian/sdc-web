'use client';
import { useEffect, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';

export default function Contact() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_EMAILJS_API_KEY) {
      emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_API_KEY);
    } else {
      console.error('Missing NEXT_PUBLIC_EMAILJS_API_KEY in environment variables.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) {
      console.error('Form reference is null');
      return;
    }

    setFormStatus('sending');
    try {
      await emailjs.sendForm(
        'SERVİCE_ID',
       'TEMPLATE_ID',
        formRef.current,
        process.env.NEXT_PUBLIC_EMAILJS_API_KEY
      );
      setFormStatus('success');
      formRef.current.reset();
    } catch (error) {
      console.error('Error sending email:', error);
      setFormStatus('error');
    }
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative py-20 bg-gradient-to-b from-secondary-800 to-secondary-900 overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-secondary-900 opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-tl from-primary-500/10 via-transparent to-secondary-900/50" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">İletişime Geçin</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-16">
            Sorularınız ve işbirliği önerileriniz için bize ulaşın.
          </p>

          <div className="max-w-2xl mx-auto">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300 text-left mb-2"
                  >
                    İsim
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 bg-secondary-800/50 border border-secondary-700 rounded-lg 
                             text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 
                             focus:border-transparent transition-all duration-300"
                    placeholder="Adınız Soyadınız"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 text-left mb-2"
                  >
                    E-posta
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-secondary-800/50 border border-secondary-700 rounded-lg 
                             text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 
                             focus:border-transparent transition-all duration-300"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-300 text-left mb-2"
                >
                  Mesaj
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full px-4 py-3 bg-secondary-800/50 border border-secondary-700 rounded-lg 
                           text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 
                           focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="Mesajınızı buraya yazın..."
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={formStatus === 'sending'}
                  className={`w-full sm:w-auto px-8 py-3 bg-primary-600 text-white rounded-full font-medium 
                           hover:bg-primary-700 transform hover:scale-105 transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed
                           ${formStatus === 'sending' ? 'animate-pulse' : ''}`}
                >
                  {formStatus === 'sending'
                    ? 'Gönderiliyor...'
                    : formStatus === 'success'
                    ? 'Gönderildi!'
                    : formStatus === 'error'
                    ? 'Hata Oluştu'
                    : 'Gönder'}
                </button>
              </div>

              {formStatus === 'success' && (
                <div className="text-green-400 mt-4">
                  Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
                </div>
              )}

              {formStatus === 'error' && (
                <div className="text-red-400 mt-4">
                  Bir hata oluştu. Lütfen daha sonra tekrar deneyin.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
