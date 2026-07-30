import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Phone, Search, Menu, X } from "lucide-react";
import RotatingPhoneDisplay from "@/components/RotatingPhoneDisplay";
import { LexVanguardLogo } from "@/components/LexVanguardLogo";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { firmUser, logout } = useAuth();
  const [, setLocation] = useLocation();

  const navLinks = [
    { label: "Our Firm", href: "/" },
    { label: "Attorneys", href: "/attorneys" },
    { label: "Legal Research", href: "/research" },
    { label: "Events & Symposia", href: "/events" },
    { label: "Practice Areas", href: "/services" },
    { label: "History", href: "/history" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ];

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 md:py-6 flex justify-between items-start gap-2">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group shrink-0">
          {/* Official Brand Logo SVG */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 shrink-0 transition-transform group-hover:scale-105">
            <img 
              src="/brand-logo.svg" 
              alt="LexVanguard Logo" 
              className="w-full h-full object-contain brightness-0 invert"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl md:text-2xl font-serif font-extrabold text-white leading-none tracking-[0.16em] uppercase">
              LEXVANGUARD
            </span>
            <span className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold tracking-[0.25em] text-[#C9A55C] uppercase mt-1">
              ADVOCATES LLP
            </span>
          </div>
        </Link>

        <div className="flex flex-col items-end mt-1 shrink-0">
          <div className="flex items-center mb-2 sm:mb-4 shrink-0">
            <Phone className="text-white mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" />
            <div className="h-4 sm:h-5 w-px bg-white/50 mr-2 shrink-0" />
            <RotatingPhoneDisplay className="text-yellow-500 font-bold text-xs sm:text-base md:text-xl tracking-wider mr-2 sm:mr-6" />
            <button className="border-2 border-white p-1 hover:bg-white hover:text-black transition-colors group shrink-0">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-black" strokeWidth={3} />
            </button>
          </div>

          <nav className="hidden lg:flex space-x-7 items-center">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className="text-[13px] font-bold text-white hover:text-yellow-500 transition-colors">
                {link.label}
              </Link>
            ))}

            {firmUser ? (
              <>
                <Link href={`/office/${firmUser.officeId}`}
                  className="text-[13px] font-bold text-yellow-500 hover:text-white transition-colors">
                  My Office
                </Link>
                <button onClick={handleLogout}
                  className="text-[13px] font-bold text-red-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login"
                className="text-[13px] font-bold text-yellow-500 hover:text-white transition-colors">
                Portal Login
              </Link>
            )}
          </nav>

          <button className="lg:hidden text-white mt-4" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-black border-t border-gray-800 text-white absolute w-full left-0 top-full">
          <div className="flex flex-col px-6 py-4 space-y-4">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-left text-sm font-bold py-2 border-b border-white/10 block">
                {link.label}
              </Link>
            ))}
            {firmUser ? (
              <>
                <Link href={`/office/${firmUser.officeId}`}
                  onClick={() => setMobileOpen(false)}
                  className="text-left text-sm font-bold text-yellow-500 py-2 border-b border-white/10 block">
                  My Office
                </Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="text-left text-sm font-bold text-red-400 py-2 border-b border-white/10 w-full">
                  Logout ({firmUser.name})
                </button>
              </>
            ) : (
              <Link href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-left text-sm font-bold text-yellow-500 py-2 border-b border-white/10 block">
                Portal Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
