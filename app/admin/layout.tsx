import type { Metadata } from "next";
import Link from "next/link";

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
    <div className="min-h-screen bg-gray-100">
      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <Link href="/" className="flex flex-shrink-0 items-center">
                  <span className="text-xl font-bold text-gray-900">
                    SDC Admin
                  </span>
                </Link>
                <div className="ml-6 flex items-center space-x-8">
                  <Link
                    href="/admin"
                    className="inline-flex items-center border-b-2 border-blue-500 px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    Duyurular
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20">
        {children}
      </main>
    </div>
  );
}
