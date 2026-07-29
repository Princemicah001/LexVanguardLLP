import React from "react";

interface LexVanguardLogoProps {
  variant?: "light" | "dark" | "cream";
  size?: "sm" | "md" | "lg";
  className?: string;
  showSubtitle?: boolean;
}

export const LexVanguardLogo: React.FC<LexVanguardLogoProps> = ({
  variant = "light",
  size = "md",
  className = "",
  showSubtitle = true
}) => {
  // Theme colors based on variant
  // 'light': white text for dark hero backgrounds
  // 'dark': deep navy text (#0A1F44) for light backgrounds
  // 'cream': off-white parchment background look with navy logo as in the reference image
  
  const isLight = variant === "light";
  const textColor = isLight ? "text-white" : "text-[#0A1F44]";
  const subtitleColor = isLight ? "text-stone-300" : "text-[#0A1F44]/80";
  const shieldBorder = isLight ? "border-white" : "border-[#0A1F44]";
  const shieldIcon = isLight ? "text-white" : "text-[#0A1F44]";

  const iconSizes = {
    sm: "w-10 h-10",
    md: "w-16 h-16 md:w-20 md:h-20",
    lg: "w-24 h-24 md:w-32 md:h-32"
  };

  const titleSizes = {
    sm: "text-lg tracking-wider",
    md: "text-2xl md:text-3xl tracking-[0.18em]",
    lg: "text-4xl md:text-5xl tracking-[0.2em]"
  };

  const subtitleSizes = {
    sm: "text-[9px] tracking-[0.25em]",
    md: "text-[11px] md:text-[12px] tracking-[0.3em]",
    lg: "text-[13px] md:text-[14px] tracking-[0.35em]"
  };

  return (
    <div className={`flex flex-col items-center text-center font-sans ${className}`}>
      {/* OFFICIAL BRAND LOGO SVG */}
      <div className={`relative flex items-center justify-center mb-2 transition-transform hover:scale-105 ${iconSizes[size]}`}>
        <img 
          src="/brand-logo.svg" 
          alt="LexVanguard Advocates LLP" 
          className={`w-full h-full object-contain ${isLight ? "brightness-0 invert" : ""}`}
        />
      </div>

      {/* BRAND NAME */}
      <h1 className={`font-serif font-extrabold uppercase leading-none ${textColor} ${titleSizes[size]}`}>
        LexVanguard
      </h1>

      {/* SUBTITLE */}
      {showSubtitle && (
        <span className={`font-semibold uppercase mt-1.5 ${subtitleColor} ${subtitleSizes[size]}`}>
          Advocates LLP
        </span>
      )}
    </div>
  );
};
