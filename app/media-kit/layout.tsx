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
