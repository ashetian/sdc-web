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
    slug: "ornek-workshop",
    title: "Örnek Workshop",
    date: "1 Ocak 2024",
    description: "Bu bir örnek workshop duyurusudur.",
    type: "workshop",
    content: `
      # Örnek Workshop

      ## Workshop İçeriği
      - Konu 1
      - Konu 2
      - Konu 3
      - Uygulama

      ## Program Akışı
      - 13:00 - Açılış
      - 13:30 - Eğitim
      - 14:30 - Uygulama
      - 15:30 - Kapanış

      ## Detaylar
      📅 Tarih: 1 Ocak 2024
      🕐 Saat: 13:00 - 15:30
      📍 Yer: KTÜ
      
      ⚡ Kontenjan: 30 kişi
      🎯 Son başvuru: 30 Aralık 2023
    `
  },
  {
    slug: "ornek-haber",
    title: "Örnek Haber",
    date: "2 Ocak 2024",
    description: "Bu bir örnek haber duyurusudur.",
    type: "news",
    content: `
      # Örnek Haber Başlığı

      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

      ## Alt Başlık
      - Madde 1
      - Madde 2
      - Madde 3

      ### Detaylar
      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

      📅 Tarih: 2 Ocak 2024
      📍 Yer: KTÜ
    `
  },
  
];

export function getAnnouncement(slug: string) {
  return announcements.find(a => a.slug === slug);
}

export function getAllAnnouncements() {
  return announcements;
}