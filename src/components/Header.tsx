import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Phone, Search, Menu, X } from "lucide-react";
import RotatingPhoneDisplay from "@/components/RotatingPhoneDisplay";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { firmUser, logout } = useAuth();
  const [, setLocation] = useLocation();

  const navLinks = [
    { label: "Our Firm", href: "/" },
    { label: "Attorneys", href: "/attorneys" },
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
      <div className="max-w-[1600px] mx-auto px-6 py-6 flex justify-between items-start">
        <Link href="/" className="flex flex-col cursor-pointer border-l-[3px] border-yellow-500 pl-3 mt-2">
          <span className="text-3xl md:text-4xl font-extrabold text-white leading-none tracking-wide">
            LEX<br />VANGUARD
          </span>
          <span className="text-[9px] md:text-[10px] tracking-[0.15em] text-gray-400 uppercase mt-1">Counsels at Law</span>
        </Link>

        <div className="flex flex-col items-end mt-1">
          <div className="flex items-center mb-5">
            <Phone className="text-white mr-3 w-4 h-4 fill-current" />
            <div className="h-5 w-px bg-white/50 mr-3" />
            <RotatingPhoneDisplay className="text-yellow-500 font-bold text-lg md:text-xl tracking-wider mr-6" />
            <button className="border-2 border-white p-1 hover:bg-white hover:text-black transition-colors group">
              <Search className="w-4 h-4 group-hover:text-black" strokeWidth={3} />
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
