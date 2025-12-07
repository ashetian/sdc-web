"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SkeletonAdminMenu, SkeletonPageHeader } from "@/app/_components/Skeleton";
import {
  Megaphone,
  CalendarDays,
  CalendarClock,
  FileText,
  Building2,
  Users,
  Rocket,
  MessageSquare,
  Vote,
  BarChart3,
  ClipboardList,
  Settings,
  Heart,
  LucideIcon,
  ChevronRight,
  MessagesSquare,
  Code2,
  Mail,
  Bug
} from "lucide-react";
import AdminNotificationBadge from "@/app/_components/AdminNotificationBadge";

interface DashboardButton {
  key: string;
  label: string;
  href: string;
  color: string;
  description: string;
  icon: LucideIcon;
  notificationType?: 'comment' | 'project' | 'forum_topic' | 'registration' | 'applicant';
}

const DASHBOARD_BUTTONS: DashboardButton[] = [
  { key: 'announcements', label: 'Duyurular', href: '/admin/announcements', color: 'bg-white', description: 'Haber, Etkinlik, Atölye ve Makaleler', icon: Megaphone },
  { key: 'events', label: 'Etkinlikler', href: '/admin/events', color: 'bg-neo-green', description: 'Etkinlik oluşturma ve yönetim', icon: CalendarDays, notificationType: 'registration' },
  { key: 'calendar', label: 'Takvim', href: '/admin/calendar', color: 'bg-neo-orange', description: 'Sınav haftaları, tatiller ve özel günler', icon: CalendarClock },
  { key: 'emails', label: 'E-postalar', href: '/admin/emails', color: 'bg-neo-yellow', description: 'Toplu veya özel e-posta gönderimi', icon: Mail },
  { key: 'applicants', label: 'Başvurular', href: '/admin/applicants', color: 'bg-neo-blue', description: 'Gelen başvuruları incele', icon: FileText, notificationType: 'applicant' },
  { key: 'departments', label: 'Departmanlar', href: '/admin/departments', color: 'bg-neo-pink', description: 'Departman bilgileri düzenle', icon: Building2 },
  { key: 'team', label: 'Ekip', href: '/admin/team', color: 'bg-neo-orange', description: 'Ekip üyelerini yönet', icon: Users },
  { key: 'sponsors', label: 'Sponsorlar', href: '/admin/sponsors', color: 'bg-white', description: 'Sponsor ve partner yönetimi', icon: Heart },
  { key: 'projects', label: 'Projeler', href: '/admin/projects', color: 'bg-neo-blue', description: 'Proje portfolyosu', icon: Rocket, notificationType: 'project' },
  { key: 'comments', label: 'Yorumlar', href: '/admin/comments', color: 'bg-neo-purple text-white', description: 'Kullanıcı yorumları', icon: MessageSquare, notificationType: 'comment' },
  { key: 'forum', label: 'Forum', href: '/admin/forum', color: 'bg-neo-green', description: 'Forum konuları ve mesajlar', icon: MessagesSquare, notificationType: 'forum_topic' },
  { key: 'code', label: 'Kod Atölyesi', href: '/admin/code', color: 'bg-gray-800 text-white', description: 'Kod örnekleri yönetimi', icon: Code2 },
  { key: 'elections', label: 'Seçimler', href: '/admin/elections', color: 'bg-neo-yellow', description: 'Seçim ve anketler', icon: Vote },
  { key: 'bug-reports', label: 'Hata Bildirimleri', href: '/admin/bug-reports', color: 'bg-red-500 text-white', description: 'Kullanıcı hata bildirimleri', icon: Bug },
  { key: 'stats', label: 'İstatistikler', href: '/admin/stats', color: 'bg-neo-purple text-white', description: 'Site istatistikleri', icon: BarChart3 },
  { key: 'audit-log', label: 'İşlem Geçmişi', href: '/admin/audit-log', color: 'bg-neo-pink', description: 'Admin işlem kayıtları', icon: ClipboardList },
  { key: 'settings', label: 'Ayarlar', href: '/admin/settings', color: 'bg-gray-700 text-white', description: 'Genel ayarlar ve yapılandırma', icon: Settings },
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
    return (
      <div className="space-y-8">
        <SkeletonPageHeader />
        <SkeletonAdminMenu items={8} />
      </div>
    );
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
            <div className="group-hover:scale-110 transition-transform duration-300 w-16 flex items-center justify-center">
              <btn.icon size={32} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black uppercase mb-1">{btn.label}</h2>
              <p className={`text-sm font-bold opacity-80 ${btn.color.includes('text-white') ? 'text-gray-200' : 'text-gray-600'}`}>
                {btn.description}
              </p>
            </div>
            {btn.notificationType && (
              <AdminNotificationBadge type={btn.notificationType} />
            )}
            <div className="text-2xl font-black opacity-50">
              <ChevronRight size={24} />
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
