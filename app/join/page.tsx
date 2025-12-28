import { Metadata } from "next";
import JoinClient from "./JoinClient";

export const metadata: Metadata = {
    title: "Bize Katil | KTU Yazilim Gelistirme Kulubu",
    description: "KTU Yazilim Gelistirme Kulubune uye olmak icin basvuru adimlari ve bilgiler.",
    alternates: {
        canonical: "https://ktusdc.com/join",
    },
    openGraph: {
        title: "Bize Katil | KTU Yazilim Gelistirme Kulubu",
        description: "KTU Yazilim Gelistirme Kulubune uye olmak icin basvuru adimlari ve bilgiler.",
        url: "https://ktusdc.com/join",
        type: "website",
    },
};

export default function JoinPage() {
    return <JoinClient />;
}
