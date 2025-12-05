"use client";
import React, { useState, useEffect } from "react";
import { FaWhatsapp, FaInstagram, FaSlack } from "react-icons/fa";
import { BsLinkedin } from "react-icons/bs";
import { useLanguage } from "../_context/LanguageContext";

export default function SocialConnect() {
  const [whatsappLink, setWhatsappLink] = useState("https://chat.whatsapp.com/FH8knELNs0E5ZMd7XxH5YB");
  const { language } = useLanguage();

  const t = {
    tr: {
      title: "Bizi Takip Edin",
      description: "Sosyal medya hesaplarımızdan güncel etkinlik ve duyurularımızı takip edebilirsiniz"
    },
    en: {
      title: "Follow Us",
      description: "You can follow our current events and announcements from our social media accounts"
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.whatsappLink) {
            setWhatsappLink(data.whatsappLink);
          }
        }
      } catch (error) {
        console.error('Ayarlar yüklenirken hata:', error);
      }
    };

    fetchSettings();
  }, []);

  const socialLinks = [
    {
      name: "Instagram",
      icon: <FaInstagram size={32} />,
      url: "https://www.instagram.com/ktu.sdc",
      color: "bg-neo-pink text-black hover:bg-white hover:text-black",
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp size={32} />,
      url: whatsappLink,
      color: "bg-neo-green text-black hover:bg-white hover:text-black",
    },
    {
      name: "LinkedIn",
      icon: <BsLinkedin size={32} />,
      url: "https://www.linkedin.com/company/ktusdc/about/",
      color: "bg-neo-blue text-black hover:bg-white hover:text-black",
    },
    {
      name: "Slack",
      icon: <FaSlack size={32} />,
      url: "https://ktu-sdc.slack.com",
      color: "bg-neo-purple text-white hover:bg-white hover:text-black",
    },
  ];

  return (
    <section className="relative py-16 bg-neo-white border-b-4 border-black">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="inline-block text-4xl sm:text-5xl font-black text-black mb-4 bg-neo-orange border-4 border-black shadow-neo px-6 py-2 transform -rotate-1">
            {t[language].title}
          </h2>
          <p className="text-xl font-bold text-black max-w-2xl mx-auto mt-4">
            {t[language].description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center justify-center p-8 border-4 border-black shadow-neo 
                transform transition-all duration-200 hover:-translate-y-2 hover:shadow-neo-lg ${link.color}`}
            >
              <div className="mb-4">
                {link.icon}
              </div>
              <span className="text-lg font-black uppercase" lang="en">
                {link.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
