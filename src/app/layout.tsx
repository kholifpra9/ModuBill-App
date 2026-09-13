import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ModuBill - Pembuat Struk & Invoice Fleksibel",
    template: "%s - ModuBill",
  },
  description:
    "Buat struk dan invoice dengan kolom dan rumus yang bisa dikustomisasi sendiri. Mudah, cepat, dan tanpa ribet.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-700">
        <ToastProvider>{children}</ToastProvider>
        <NextTopLoader
          color="#2563EB"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2563EB,0 0 5px #2563EB"
        />
      </body>
    </html>
  );
}