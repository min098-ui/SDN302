"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showSubtitle?: boolean;
  subtitle?: string;
  className?: string;
  href?: string;
  animate?: boolean;
}

export default function Logo({
  size = "md",
  showText = true,
  showSubtitle = true,
  subtitle = "Joyful Task & Team Hub",
  className = "",
  href,
  animate = true,
}: LogoProps) {
  // Dimensions mapping
  const sizeMap = {
    sm: { img: 32, box: "w-8 h-8", text: "text-base", sub: "text-[10px]" },
    md: { img: 44, box: "w-11 h-11", text: "text-lg", sub: "text-[11px]" },
    lg: { img: 64, box: "w-16 h-16", text: "text-2xl", sub: "text-xs" },
    xl: { img: 88, box: "w-22 h-22", text: "text-3xl", sub: "text-sm" },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Pure Transparent Snow Fox Mascot - No white box! */}
      <div className="relative group shrink-0">
        <div
          className={`${currentSize.box} relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot-fox.png"
            alt="Snow Fox Mascot Logo"
            width={currentSize.img}
            height={currentSize.img}
            className={`object-contain drop-shadow-md mascot-fox-img transition-transform duration-300 ${
              animate ? "animate-cute-float" : ""
            }`}
          />
        </div>

        {/* Tiny playful sparkle badge */}
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full mascot-sparkle-badge flex items-center justify-center text-white shadow-sm ring-1 ring-white scale-90 group-hover:scale-110 transition-transform">
          <Sparkles className="w-2.5 h-2.5 text-white" />
        </span>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight theme-gradient-text ${currentSize.text}`}
            >
              TaskSync
            </span>
          </div>

          {showSubtitle && (
            <span
              className={`text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5 ${currentSize.sub}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center group">
        {content}
      </Link>
    );
  }

  return content;
}
