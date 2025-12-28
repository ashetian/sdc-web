import { Metadata } from "next";
import connectDB from "../lib/db";
import { Announcement as AnnouncementModel, IAnnouncement } from "../lib/models/Announcement";
import AnnouncementsClient from "./AnnouncementsClient";

export const metadata: Metadata = {
    title: "Duyurular | KTU Yazilim Gelistirme Kulubu",
    description: "KTU Yazilim Gelistirme Kulubu duyurulari, haberler, etkinlikler ve firsatlar.",
    alternates: {
        canonical: "https://ktusdc.com/announcements",
    },
    openGraph: {
        title: "Duyurular | KTU Yazilim Gelistirme Kulubu",
        description: "KTU Yazilim Gelistirme Kulubu duyurulari, haberler, etkinlikler ve firsatlar.",
        url: "https://ktusdc.com/announcements",
        type: "website",
    },
};

async function getAnnouncements() {
    await connectDB();

    const announcements = await AnnouncementModel.find({
        isDraft: false,
        isArchived: { $ne: true },
    })
        .sort({ createdAt: -1 })
        .lean() as any[];

    // Separate into announcements and opportunities
    const regularAnnouncements = announcements
        .filter(item => ['event', 'news', 'article'].includes(item.type))
        .map(item => ({
            _id: item._id.toString(),
            slug: item.slug,
            title: item.title,
            titleEn: item.titleEn,
            date: item.date,
            dateEn: item.dateEn,
            description: item.description,
            descriptionEn: item.descriptionEn,
            type: item.type,
            image: item.image,
            isDraft: item.isDraft,
            isArchived: item.isArchived,
        }));

    const opportunities = announcements
        .filter(item => item.type === 'opportunity')
        .map(item => ({
            _id: item._id.toString(),
            slug: item.slug,
            title: item.title,
            titleEn: item.titleEn,
            date: item.date,
            dateEn: item.dateEn,
            description: item.description,
            descriptionEn: item.descriptionEn,
            type: item.type,
            image: item.image,
            isDraft: item.isDraft,
            isArchived: item.isArchived,
        }));

    return { regularAnnouncements, opportunities };
}

export default async function AnnouncementsPage() {
    const { regularAnnouncements, opportunities } = await getAnnouncements();

    return (
        <AnnouncementsClient
            initialAnnouncements={regularAnnouncements as any}
            initialOpportunities={opportunities as any}
        />
    );
}
