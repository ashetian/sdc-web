export interface Announcement {
  slug: string;
  title: string;
  date: string;
  description: string;
  type: 'event' | 'news' | 'workshop';
  content: string;
}

export const announcements: Announcement[] = [
  {
    slug: "hello-web",
    title: "'Hello, web!' Etkinliği",
    date: "20 Aralık 2024",
    description: "Web geliştirmeye ilk adımını atmak isteyenler için harika bir fırsat!",
    type: "event",
    content: `
      HTML & CSS ile İnteraktif Web Sitesi Geliştirme Etkinliği
Web geliştirmeye ilk adımını atmak isteyenler için harika bir fırsat! 🎉

📌 Etkinlik İçeriği:

✅Web geliştirme temelleri (HTML & CSS)
✅Gerçek zamanlı kod yazma ve öğrenme
✅Mentor eşliğinde interaktif uygulama
✅Kulüp web sitesinin nasıl yapıldığını öğrenme

🗓 Tarih: 20 Aralık Cuma
🕒 Saat: 15:00
📍 Yer: Matematik Bölümü DZ-01

👨‍💻 Mentor: Deneyimli arkadaşlarımız kod yazmanıza yardımcı olacak, sorularınızı cevaplayacak!

🎯 Kimler Katılabilir?
Web geliştirmeyi öğrenmek isteyen herkesi bekliyoruz. Bilgisayarınızı kapın ve aramıza katılın!

🎟 Katılım Ücretsizdir!

KTÜ Software Development Club 💻
Birlikte öğrenelim, birlikte geliştirelim!☺️☺️
    `
  },
  {
    slug: "yapay-zeka-workshop",
    title: "Yapay Zeka Workshop'u",
    date: "25 Aralık 2024",
    description: "ChatGPT ve yapay zeka araçlarının etkin kullanımı hakkında uygulamalı workshop.",
    type: "workshop",
    content: `
      # Yapay Zeka Araçları Workshop'u

      Yapay zeka dünyasına adım atmaya hazır mısınız? 🤖

      ## Workshop İçeriği
      - ChatGPT'nin etkili kullanımı
      - Prompt mühendisliği temelleri
      - Midjourney ile görsel tasarım
      - GitHub Copilot ile kod geliştirme
      - Claude ve diğer AI asistanlar

      ## Program Akışı
      - 13:00 - Açılış ve Tanışma
      - 13:30 - Teorik Eğitim
      - 14:30 - Uygulama ve Pratik
      - 15:30 - Ara
      - 16:00 - İleri Seviye Uygulamalar
      - 17:00 - Soru & Cevap

      ## Neler Kazanacaksınız?
      ✨ Yapay zeka araçlarını profesyonel şekilde kullanabilme
      ✨ Prompt yazma ve optimizasyon yetenekleri
      ✨ AI destekli iş akışı oluşturma becerisi
      ✨ Sertifika ve katılım belgesi

      ## Detaylar
      📅 Tarih: 25 Aralık 2024, Pazartesi
      🕐 Saat: 13:00 - 17:00
      📍 Yer: KTÜ Bilgisayar Mühendisliği Lab-3
      
      ⚡ Kontenjan sınırlıdır!
      🎯 Son başvuru: 23 Aralık 2024
    `
  },
  {
    slug: "yilbasi-hackathon",
    title: "Yılbaşı Hackathon'u",
    date: "30-31 Aralık 2024",
    description: "48 saatlik yılbaşı özel hackathon etkinliği. Yaratıcı projeler, ödüller ve eğlence!",
    type: "news",
    content: `
      # KTÜ SDC Yılbaşı Hackathon'u 2024 🎄

      Yılı en eğlenceli şekilde bitirmeye hazır mısın? 48 saat boyunca kod, pizza ve eğlence! 🚀

      ## Hackathon Teması
      "Sosyal İyilik için Teknoloji"

      ## Ödüller 🏆
      - 🥇 Birinci Takım: Gaming Laptop
      - 🥈 İkinci Takım: Mekanik Klavye Seti
      - 🥉 Üçüncü Takım: Kablosuz Kulaklık
      - 🎁 Sürpriz Ödüller ve Hediyeler

      ## Program
      ### 30 Aralık
      - 10:00 - Açılış ve Kayıt
      - 11:00 - Takım Oluşturma
      - 12:00 - Hackathon Başlangıcı
      
      ### 31 Aralık
      - 12:00 - Proje Teslimi
      - 14:00 - Sunumlar
      - 16:00 - Ödül Töreni
      - 17:00 - Yılbaşı Partisi 🎉

      ## Önemli Bilgiler
      - 2-4 kişilik takımlar
      - 24 saat boyunca mentorluk desteği
      - Ücretsiz yemek ve içecek
      - Networking fırsatları
      
      ## Sponsorlarımız
      - TechCorp
      - DevCompany
      - StartupHub

      🎯 Son başvuru: 25 Aralık 2024
      📍 Yer: KTÜ Teknoloji Transfer Ofisi
    `
  },
  
];

export function getAnnouncement(slug: string) {
  return announcements.find(a => a.slug === slug);
}

export function getAllAnnouncements() {
  return announcements;
}