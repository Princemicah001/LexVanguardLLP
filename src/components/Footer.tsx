import { Globe, X, MapPin, Phone, Mail } from "lucide-react";
import RotatingPhoneDisplay from "@/components/RotatingPhoneDisplay";

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-gray-400 py-16 px-6">
      <div className="w-full px-2 sm:px-6 lg:px-10 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-10 shrink-0">
              <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M50 5 L90 20 C90 70 70 100 50 115 C30 100 10 70 10 20 Z" stroke="#FFFFFF" strokeWidth="6" fill="none" />
                <path d="M50 30 L50 85 M40 85 L60 85" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
                <path d="M28 42 L72 42" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
                <path d="M28 42 L20 62 L36 62 Z" stroke="#FFFFFF" strokeWidth="4" fill="none" />
                <path d="M72 42 L64 62 L80 62 Z" stroke="#FFFFFF" strokeWidth="4" fill="none" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-serif font-extrabold text-white uppercase tracking-[0.18em] leading-none">
                LexVanguard
              </h3>
              <span className="text-[10px] font-semibold text-[#C9A55C] uppercase tracking-[0.25em] block mt-1">
                Advocates LLP
              </span>
            </div>
          </div>
          <p className="text-sm font-light leading-relaxed text-gray-500 mb-6">
            A tradition of excellence. A commitment to rigorous and innovative legal strategy across the nation.
          </p>
          <div className="flex space-x-4">
            <Globe className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
            <X className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
            <Globe className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
        <div>
          <h4 className="text-white font-serif text-lg mb-6 uppercase tracking-wider">Practice Areas</h4>
          <ul className="space-y-2">
            {["Corporate & Technology", "Intellectual Property", "Appellate Litigation", "Pro Bono Initiative"].map(area => (
              <li key={area}><a href="#" className="text-gray-400 text-sm hover:text-yellow-500 transition-colors block mb-2">{area}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-serif text-lg mb-6 uppercase tracking-wider">The Firm</h4>
          <ul className="space-y-2">
            {[
              { label: "Attorneys & Staff", href: "/attorneys" },
              { label: "Firm History", href: "/history" },
              { label: "Events & Symposia", href: "/events" },
              { label: "Careers", href: "/careers" }
            ].map(item => (
              <li key={item.label}>
                <a href={item.href} className="text-gray-400 text-sm hover:text-yellow-500 transition-colors block mb-2">{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-serif text-lg mb-6 uppercase tracking-wider">Contact</h4>
          <ul className="space-y-4 text-sm font-light">
            <li className="flex items-start">
              <MapPin className="w-4 h-4 text-yellow-500 mr-3 mt-1 shrink-0" />
              <span>123 Legal Plaza, Suite 400<br />Metropolis, NY 10001</span>
            </li>
            <li className="flex items-center">
              <Phone className="w-4 h-4 text-yellow-500 mr-3 shrink-0" />
              <RotatingPhoneDisplay className="text-yellow-500 font-medium hover:underline" />
            </li>
            <li className="flex items-center">
              <Mail className="w-4 h-4 text-yellow-500 mr-3 shrink-0" />
              <span>lexvanguard</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="w-full px-2 sm:px-6 lg:px-10 mt-16 pt-8 border-t border-gray-800 text-xs text-gray-600 flex flex-col md:flex-row justify-between items-center">
        <p>&copy; 2026 LexVanguard. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0 uppercase tracking-widest font-semibold">
          <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Terms of Use</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Disclaimer</a>
        </div>
      </div>
    </footer>
  );
}
