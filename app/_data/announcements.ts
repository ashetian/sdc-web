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
    slug: "terminal",
    title: "Unix Terminal ve IDE Kullanımı",
    date: "7 Mart 2025",
    description: "Terminal Kullanımı ve VSCode Konfigürasyonu Atölyesi ile Geliştirici araçlarını daha verimli kullanmak isteyenler için harika bir fırsat!",
    type: "event",
    content: `
      🚀 SUDO Etkinliğine Hazır mısınız? 🚀

Terminal Kullanımı ve VSCode Konfigürasyonu Atölyesi ile
Geliştirici araçlarını daha verimli kullanmak isteyenler için harika bir fırsat! 🎉

📌 Etkinlik İçeriği:

Terminal komutları ile sistem yönetimi

VSCode ipuçları

Geliştirme sürecini hızlandıracak püf noktaları

Gerçek zamanlı uygulamalar ve interaktif öğrenme


🗓 Tarih: 7 Mart Cuma
🕒 Saat: 15:00
📍 Yer: Yazılım Geliştirme Bölümü DZ-01

👨‍💻 Mentor: Deneyimli yazılım geliştiricilerimiz sizlerle olacak, terminal konusunda sorularınızı yanıtlayacak!

🎯 Kimler Katılabilir?
Terminal kullanmayı öğrenmek ve etkili kullanmak isteyen herkesi bekliyoruz. Bilgisayarınızı kapın ve aramıza katılın!

🎟 Katılım Ücretsizdir!

KTÜ Software Development Club 💻
Birlikte öğrenelim, birlikte geliştirelim!
    `
  },
  
];

export function getAnnouncement(slug: string) {
  return announcements.find(a => a.slug === slug);
}

export function getAllAnnouncements() {
  return announcements;
}