import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LanguageProvider } from "@/lib/languageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AuraSync – Joyful & Professional Task Management",
  description:
    "Task & Team Management application built with Next.js App Router, Prisma ORM, and Supabase PostgreSQL. Featuring a magical Snow Bunny mascot and streamlined productivity workflow.",
  icons: {
    icon: "/mascot-bunny-nobg.png",
    apple: "/mascot-bunny-nobg.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-full flex flex-col luminous-bg text-slate-800 antialiased selection:bg-secondary-500 selection:text-white transition-colors duration-300`}
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `try {
              document.documentElement.classList.remove('dark');
              localStorage.removeItem('theme');
              var t = localStorage.getItem('color-theme') || 'ocean';
              document.documentElement.setAttribute('data-theme', t);
            } catch(e) {}`,
          }}
        />
        <Providers>
          <LanguageProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster position="top-right" />
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
