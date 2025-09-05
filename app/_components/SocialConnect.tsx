import React from "react";
import { FaWhatsapp, FaInstagram, FaSlack } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { BsLinkedin } from "react-icons/bs";

export default function SocialConnect() {
  const socialLinks = [
    {
      name: "X (Twitter)",
      icon: <FaXTwitter size={32} />,
      url: "https://x.com/ktusdc",
      color: "hover:bg-black",
    },
    {
      name: "Instagram",
      icon: <FaInstagram size={32} />,
      url: "https://www.instagram.com/ktu.sdc",
      color: "hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500",
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp size={32} />,
      url: "https://chat.whatsapp.com/FH8knELNs0E5ZMd7XxH5YB",
      color: "hover:bg-green-600",
    },
    {
      name: "LinkedIn",
      icon: <BsLinkedin size={32} />,
      url: "https://www.linkedin.com/company/ktusdc/about/",
      color: "hover:bg-blue-600",
    },
    {
      name: "Slack",
      icon: <FaSlack size={32} />,
      url: "https://ktu-sdc.slack.com",
      color: "hover:bg-blue-600",
    },
  ];

  return (
    <section className="relative py-16 bg-gradient-to-b from-secondary-800 to-gray-900">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-secondary-900 opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-900/50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Bizi Takip Edin
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Sosyal medya hesaplarımızdan güncel etkinlik ve duyurularımızı takip
            edebilirsiniz
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 max-w-4xl mx-auto">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center justify-center p-8 rounded-xl 
                bg-white/5 backdrop-blur-sm transform transition-all duration-300
                hover:scale-105 hover:shadow-xl hover:shadow-primary-500/10 ${link.color}
                group border border-white/10`}
            >
              <div className="text-white/80 group-hover:text-white transition-colors duration-300">
                {link.icon}
              </div>
              <span className="mt-4 text-sm font-medium text-white/80 group-hover:text-white">
                {link.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
