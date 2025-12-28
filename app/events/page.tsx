import { Metadata } from "next";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
    title: "Etkinlikler | KTU Yazilim Gelistirme Kulubu",
    description: "KTU Yazilim Gelistirme Kulubu etkinlik takvimi ve yaklasan etkinlikler.",
    alternates: {
        canonical: "https://ktusdc.com/events",
    },
    openGraph: {
        title: "Etkinlikler | KTU Yazilim Gelistirme Kulubu",
        description: "KTU Yazilim Gelistirme Kulubu etkinlik takvimi ve yaklasan etkinlikler.",
        url: "https://ktusdc.com/events",
        type: "website",
    },
};

export default function EventsPage() {
    return <EventsClient />;
}
