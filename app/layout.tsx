import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskSync – Joyful & Professional Task Management",
  description:
    "Task & Team Management application built with Next.js App Router, Prisma ORM, and Supabase PostgreSQL. Featuring a magical Snow Fox mascot and streamlined productivity workflow.",
  icons: {
    icon: "/mascot-fox.png",
    apple: "/mascot-fox.png",
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
        className={`${inter.className} min-h-full flex flex-col luminous-bg text-slate-800 antialiased selection:bg-cyan-500 selection:text-white transition-colors duration-300`}
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
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
