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
📍 Yer: Yazılım Geliştirme Bölümü DZ-01

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
  {
    slug: "github",
    title: "Git ve GitHub ile Sürüm Kontrol Sistemlerine İlk Adım",
    date: "10 Mart 2025",
    description: "Projelerini daha düzenli ve verimli yönetmek için Git ve GitHub kullanmayı öğreniyoruz! Bu etkinlikte, sürüm kontrol sistemlerinin temellerini kavrayarak organize proje yönetimi süreçlerini inceleyeceğiz.",
    type: "event",
    content: `
    KODLA GIT

📌 Git ve GitHub ile Sürüm Kontrol Sistemlerine İlk Adım

Projelerini daha düzenli ve verimli yönetmek için Git ve GitHub kullanmayı öğreniyoruz! Bu etkinlikte, sürüm kontrol sistemlerinin temellerini kavrayarak organize proje yönetimi süreçlerini inceleyeceğiz.

📍 Yer: Yazılım Geliştirme Bölümü DZ-01
⏰ Zaman: 10 Mart Pazartesi, 13:00

Kodlarını güvenle sakla, iş akışlarını hızlandır! 🚀
    `
  },
  {
    slug: "cpp_pair_programming",
    title: "Eşli Kodlama ile C++ Pratiği ve Problem Çözme Etkinliği",
    date: "10 Mart 2025",
    description: "Kod yazarken yalnız değilsin! Bu etkinlikte Pair Coding (Eşli Kodlama) yöntemi ile C++ pratiği yapacak, problem çözme becerilerini geliştireceksin.",
    type: "event",
    content: `
    🚀 Eşli Kodlama ile C++ Pratiği ve Problem Çözme Etkinliği

Kod yazarken yalnız değilsin! Bu etkinlikte Pair Coding (Eşli Kodlama) yöntemi ile C++ pratiği yapacak, problem çözme becerilerini geliştireceksin.

📍 Yer: Yazılım Geliştirme Bölümü DZ-01
⏰ Zaman: 10 Mart Pazartesi, 15:00

Birlikte öğrenelim, birlikte geliştirelim! 💻✨
    `
  },
  {
    slug: "hello-web-2",
    title: "'Hello, web!' Etkinliği",
    date: "17 Mart 2025",
    description: "Web geliştirmeye ilk adımını atmak isteyenler için harika bir fırsat!",
    type: "event",
    content: `
      HTML & CSS ile İnteraktif Web Sitesi Geliştirme Etkinliği
Web geliştirmeye ilk adımını atmak isteyenler için harika bir fırsat! 🎉

📌 Etkinlik İçeriği:

✅Web geliştirme temelleri (HTML & CSS)
✅Gerçek zamanlı kod yazma ve öğrenme
✅Mentor eşliğinde interaktif uygulama

🗓 Tarih: 17 Mart Pazartesi
🕒 Saat: 13:00
📍 Yer: Yazılım Geliştirme Bölümü DZ-01

👨‍💻 Mentor: Deneyimli arkadaşlarımız kod yazmanıza yardımcı olacak, sorularınızı cevaplayacak!

🎯 Kimler Katılabilir?
Web geliştirmeyi öğrenmek isteyen herkesi bekliyoruz. Bilgisayarınızı kapın ve aramıza katılın!

🎟 Katılım Ücretsizdir!

KTÜ Software Development Club 💻
Birlikte öğrenelim, birlikte geliştirelim!☺️☺️
    `
  },
  
  
];

export function getAnnouncement(slug: string) {
  return announcements.find(a => a.slug === slug);
}

export function getAllAnnouncements() {
  return announcements;
}