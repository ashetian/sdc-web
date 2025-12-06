"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Announcement {
    _id: string;
    slug: string;
    title: string;
    date: string;
    description: string;
    type: "event" | "news" | "workshop" | "article";
    image?: string;
    isDraft: boolean;
}

export default function AnnouncementsIndexPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAnnouncements() {
            try {
                const res = await fetch("/api/announcements");
                if (!res.ok) throw new Error("Duyurular alınamadı");
                const data = await res.json();
                setAnnouncements(data);
            } catch (error) {
                console.error("Duyurular yüklenirken hata:", error);
            } finally {
                setLoading(false);
            }
        }

        loadAnnouncements();
    }, []);

    const handleDelete = async (slug: string) => {
        if (window.confirm("Bu duyuruyu silmek istediğinizden emin misiniz?")) {
            try {
                const res = await fetch(`/api/announcements/${slug}`, {
                    method: "DELETE",
                });

                if (!res.ok) throw new Error("Duyuru silinemedi");

                setAnnouncements(announcements.filter((a) => a.slug !== slug));
            } catch (error) {
                console.error("Duyuru silinirken hata:", error);
                alert("Duyuru silinirken bir hata oluştu");
            }
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "event": return "bg-neo-purple text-white";
            case "news": return "bg-neo-blue text-black";
            case "workshop": return "bg-neo-green text-black";
            case "article": return "bg-neo-peach text-black";
            default: return "bg-gray-200 text-black";
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "event": return "Etkinlik";
            case "news": return "Haber";
            case "workshop": return "Atölye";
            case "article": return "Makale";
            default: return type;
        }
    };

    if (loading) return <div className="p-12 text-center font-bold">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-black uppercase">Duyurular</h1>
                    <p className="text-gray-600 font-medium mt-1">Haber, Etkinlik, Atölye ve Makale Yönetimi</p>
                </div>
                <Link
                    href="/admin/announcements/new"
                    className="bg-neo-green text-black border-4 border-black shadow-neo px-6 py-3 font-black uppercase hover:bg-white hover:shadow-none transition-all"
                >
                    + Yeni Duyuru
                </Link>
            </div>

            {/* Announcements List */}
            <div className="bg-white border-4 border-black shadow-neo">
                {announcements.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 font-bold">Henüz duyuru bulunmuyor.</p>
                    </div>
                ) : (
                    <ul className="divide-y-4 divide-black">
                        {announcements.map((announcement) => (
                            <li key={announcement._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start space-x-4">
                                    {/* Image */}
                                    {announcement.image && (
                                        <div className="flex-shrink-0">
                                            <Image
                                                src={announcement.image}
                                                alt={announcement.title}
                                                width={120}
                                                height={80}
                                                className="border-2 border-black object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h2 className="text-lg font-black text-black truncate">
                                                {announcement.title}
                                            </h2>
                                            {announcement.isDraft && (
                                                <span className="bg-yellow-400 text-black px-2 py-1 text-xs font-black border-2 border-black">
                                                    TASLAK
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-600 font-medium mb-3 line-clamp-2">
                                            {announcement.description}
                                        </p>

                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm font-bold text-gray-500 bg-gray-100 px-2 py-1 border border-black">
                                                {announcement.date}
                                            </span>
                                            <span className={`text-xs font-black px-2 py-1 border-2 border-black uppercase ${getTypeColor(announcement.type)}`}>
                                                {getTypeLabel(announcement.type)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col space-y-2 flex-shrink-0">
                                        <Link
                                            href={`/admin/announcements/${announcement.slug}/edit`}
                                            className="bg-neo-blue text-black border-2 border-black px-4 py-2 text-sm font-black uppercase hover:bg-blue-300 transition-all text-center"
                                        >
                                            Düzenle
                                        </Link>
                                        <Link
                                            href={`/admin/announcements/${announcement.slug}/gallery`}
                                            className="bg-neo-purple text-white border-2 border-black px-4 py-2 text-sm font-black uppercase hover:bg-purple-400 transition-all text-center"
                                        >
                                            Galeri
                                        </Link>
                                        <button
                                            className="bg-red-500 text-white border-2 border-black px-4 py-2 text-sm font-black uppercase hover:bg-red-600 transition-all"
                                            onClick={() => handleDelete(announcement.slug)}
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
