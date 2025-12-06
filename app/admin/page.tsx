"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/app/_components/LoadingSpinner";

interface DashboardButton {
  key: string;
  label: string;
  href: string;
  color: string;
  description: string;
  icon: string;
}

const DASHBOARD_BUTTONS: DashboardButton[] = [
  { key: 'announcements', label: 'Duyurular', href: '/admin/announcements', color: 'bg-white', description: 'Haber, Etkinlik, Atölye ve Makaleler', icon: '📢' },
  { key: 'events', label: 'Etkinlikler', href: '/admin/events', color: 'bg-neo-green', description: 'Etkinlik oluşturma ve yönetim', icon: '📅' },
  { key: 'applicants', label: 'Başvurular', href: '/admin/applicants', color: 'bg-neo-blue', description: 'Gelen başvuruları incele', icon: '📝' },
  { key: 'departments', label: 'Departmanlar', href: '/admin/departments', color: 'bg-neo-pink', description: 'Departman bilgileri düzenle', icon: '🏢' },
  { key: 'team', label: 'Ekip', href: '/admin/team', color: 'bg-neo-orange', description: 'Ekip üyelerini yönet', icon: '👥' },
  { key: 'projects', label: 'Projeler', href: '/admin/projects', color: 'bg-neo-blue', description: 'Proje portfolyosu', icon: '🚀' },
  { key: 'comments', label: 'Yorumlar', href: '/admin/comments', color: 'bg-neo-purple text-white', description: 'Kullanıcı yorumları', icon: '💬' },
  { key: 'elections', label: 'Seçimler', href: '/admin/elections', color: 'bg-neo-yellow', description: 'Seçim ve anketler', icon: '🗳️' },
  { key: 'stats', label: 'İstatistikler', href: '/admin/stats', color: 'bg-neo-purple text-white', description: 'Site istatistikleri', icon: '📊' },
  { key: 'settings', label: 'Ayarlar', href: '/admin/settings', color: 'bg-gray-700 text-white', description: 'Genel ayarlar ve yapılandırma', icon: '⚙️' },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/check-auth");
        if (res.ok) {
          const data = await res.json();
          setUserInfo(data);
        } else {
          // Redirect or show error if not admin (handled by layout/middleware usually, but safe check)
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-20"><LoadingSpinner size="lg" /></div>;
  }

  if (!userInfo) return <div className="p-10 text-center text-red-500 font-bold">Yetkisiz Erişim</div>;

  const { isSuperAdmin, allowedKeys, name } = userInfo;

  // Filter buttons
  const visibleButtons = DASHBOARD_BUTTONS.filter(btn => {
    if (isSuperAdmin) return true;
    return allowedKeys.includes(btn.key) || allowedKeys.includes('ALL');
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border-4 border-black shadow-neo p-8">
        <h1 className="text-3xl font-black text-black">
          {isSuperAdmin ? 'SDC SÜPERADMİN PANEL' : 'SDC ADMİN PANEL'}
        </h1>
        <p className="text-gray-600 font-bold mt-2 text-lg">
          Hoş geldin, <span className="text-black underline decoration-4 decoration-neo-green">{name}</span>
        </p>
      </div>

      {/* Vertical Menu List */}
      <div className="flex flex-col gap-4 max-w-3xl mx-auto">
        {visibleButtons.map(btn => (
          <Link key={btn.key} href={btn.href} className={`
                ${btn.color} border-4 border-black shadow-neo p-6 
                flex items-center gap-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all
                group
            `}>
            <div className="text-4xl group-hover:scale-110 transition-transform duration-300 w-16 text-center">
              {btn.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black uppercase mb-1">{btn.label}</h2>
              <p className={`text-sm font-bold opacity-80 ${btn.color.includes('text-white') ? 'text-gray-200' : 'text-gray-600'}`}>
                {btn.description}
              </p>
            </div>
            <div className="text-2xl font-black opacity-50">
              →
            </div>
          </Link>
        ))}
      </div>

      {visibleButtons.length === 0 && (
        <div className="text-center p-12 bg-gray-100 border-2 border-dashed border-gray-400 font-bold text-gray-500">
          Erişim izniniz bulunan modül yok. Yöneticinize başvurun.
        </div>
      )}
    </div>
  );
}
