import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Media Kit | KTU SDC",
    robots: {
        index: false,
        follow: false,
    },
};

// Media kit has its own standalone layout (no navbar/footer)
export default function MediaKitLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="media-kit-standalone">
            {children}
        </div>
    );
}
