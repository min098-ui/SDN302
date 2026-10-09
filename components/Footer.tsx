"use client";

import Logo from "@/components/Logo";
import { useLanguage } from "@/lib/languageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/75 backdrop-blur-md transition-colors py-6">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Logo size="md" subtitle={t("footerSubtitle")} layout="row" />
          </div>

          <div className="text-sm text-slate-500 font-medium" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} AuraSync. Built with Next.js, Prisma & Supabase.
          </div>
        </div>
      </div>
    </footer>
  );
}
