import type { Metadata } from "next";
import AdminNavbar from "./_components/AdminNavbar";

export const metadata: Metadata = {
  title: "SDC Admin Paneli",
  description: "Software Development Club Admin Paneli",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Hide main navbar and footer for admin */}
      {/* Hide main navbar and footer for admin - handled in components now */}

      <div className="min-h-screen bg-neo-yellow">
        {/* Admin Navbar */}
        <AdminNavbar />

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          {children}
        </main>
      </div>
    </>
  );
}
