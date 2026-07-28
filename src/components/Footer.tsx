import { Globe, X, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-gray-400 py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 text-left">
          <h3 className="text-2xl font-serif text-white mb-6 uppercase tracking-widest">LexVanguard</h3>
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
            {["Attorneys & Staff", "Firm History", "Careers", "News & Insights"].map(item => (
              <li key={item}><a href="#" className="text-gray-400 text-sm hover:text-yellow-500 transition-colors block mb-2">{item}</a></li>
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
              <span>+254116171396</span>
            </li>
            <li className="flex items-center">
              <Mail className="w-4 h-4 text-yellow-500 mr-3 shrink-0" />
              <span>lexvanguard</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-800 text-xs text-gray-600 flex flex-col md:flex-row justify-between items-center">
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
