import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, ChevronDown, Scale, Users, Globe } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SLIDES = [
  {
    image: "assets/WhatsApp%20Image%202026-03-15%20at%202.49.52%20PM.jpeg",
    fallback: "https://placehold.co/1920x1080/0a0a0a/EAB308?text=LexVanguard",
    lines: ["MERGING A", "MODERN MINDSET", "WITH THE PRACTICES WE", "VALUE"],
    gold: [true, true, false, false]
  },
  {
    image: "assets/conference.jpeg",
    fallback: "https://placehold.co/1920x1080/0a0a0a/EAB308?text=LexVanguard",
    lines: ["PIONEERING", "LEGAL RESEARCH", "AND ELITE APPELLATE", "ADVOCACY"],
    gold: [true, true, false, false]
  },
  {
    image: "assets/conference2.jpeg",
    fallback: "https://placehold.co/1920x1080/0a0a0a/EAB308?text=LexVanguard",
    lines: ["ENTERPRISE-GRADE", "LEGAL COUNSEL", "FOR TOMORROW'S", "CHALLENGES"],
    gold: [true, true, false, false]
  }
];

const PHILOSOPHY = [
  {
    icon: <Scale className="w-10 h-10 text-yellow-500 mx-auto" />,
    title: "A Vision for Lasting Change",
    short: "LexVanguard stands at the forefront of modern advocacy, driven by a relentless commitment to systemic change.",
    full: "LexVanguard stands at the forefront of modern advocacy, driven by a relentless commitment to systemic change. We don't just react to the legal landscape — we actively reshape it to ensure a more equitable future. By combining strategic foresight with a passion for justice, the firm serves as a powerful engine for progress, turning ambitious ideals into tangible societal shifts. Our ambition is to scale the heights of international legal education, standing shoulder to shoulder with the finest law firms and institutions globally."
  },
  {
    icon: <Users className="w-10 h-10 text-yellow-500 mx-auto" />,
    title: "Inclusivity & Teamwork",
    short: "LexVanguard operates on the belief that the pursuit of justice is not the exclusive domain of the privileged few.",
    full: "LexVanguard operates on the belief that the pursuit of justice is not the exclusive domain of the privileged few, but a calling that requires only spirit and tenacity. The doors of LexVanguard are open to all who possess the visceral urge to see justice persevere. The firm's pillars — co-working, professionalism, friendship, respect, and teamwork — elevate the group from a simple club to a professional entity. Every member is acknowledged and respected as intrinsically valuable to the whole."
  },
  {
    icon: <Globe className="w-10 h-10 text-yellow-500 mx-auto" />,
    title: "Open Doors, Open Solutions",
    short: "High-level advocacy should be available to everyone. LexVanguard is an accessible, always-on resource for the community.",
    full: "At the heart of our mission is the belief that high-level advocacy should be available to everyone, regardless of background or circumstance. LexVanguard prides itself on being an accessible, 'always-on' resource for the community. We bridge the gap between complex legal structures and the people who need them most, ensuring that our doors remain open and our experts remain ready to serve whenever change is needed — from legal research and litigation, to mooting, negotiation, and client advisory."
  }
];

export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setSlide(s => s === 0 ? SLIDES.length - 1 : s - 1);
  const next = () => setSlide(s => (s + 1) % SLIDES.length);

  return (
    <div className="w-full bg-black">
      <Header />

      {/* Hero Slider */}
      <div className="relative h-screen w-full flex items-center overflow-hidden">
        {SLIDES.map((s, i) => (
          <div key={i} className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${i === slide ? 'opacity-100' : 'opacity-0'}`}>
            <img
              src={s.image}
              onError={(e) => { (e.target as HTMLImageElement).src = s.fallback; }}
              alt={`Slide ${i + 1}`}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/40 to-black/90" />
            <div className="relative z-10 w-full h-full max-w-[1600px] mx-auto px-6 pt-32 pb-24 flex items-center justify-end">
              <div className="w-full sm:w-[80%] md:w-[70%] lg:w-[60%] border-l-[4px] md:border-l-[6px] border-yellow-500 pl-4 md:pl-8 lg:pr-20">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] md:leading-[1.1] tracking-tight">
                  {s.lines.map((line, j) => (
                    <span key={j} className={`block ${s.gold[j] ? 'text-yellow-500' : 'text-white'}`}>{line}</span>
                  ))}
                </h1>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-10 left-0 w-full px-6 md:px-10 z-20 flex justify-between items-end">
          <button className="border-2 border-yellow-500 text-white w-10 h-10 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-colors">
            <span className="font-bold text-xl italic">i</span>
          </button>
          <button className="absolute left-1/2 transform -translate-x-1/2 bottom-0 flex items-center bg-black/40 border border-transparent hover:border-white/20 px-6 py-3 text-white font-bold text-sm tracking-widest transition-all"
            onClick={() => { document.getElementById('intro-section')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <ChevronDown className="w-4 h-4 text-yellow-500 mr-3" /> EXPLORE
          </button>
          <div className="hidden md:flex items-center text-white space-x-6 text-sm font-bold tracking-widest">
            <button onClick={prev} className="cursor-pointer hover:text-yellow-500 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">{String(slide + 1).padStart(2, '0')}</span>
              <span className="text-gray-400">/</span>
              <span className="text-white">{String(SLIDES.length).padStart(2, '0')}</span>
            </div>
            <button onClick={next} className="cursor-pointer hover:text-yellow-500 transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {/* Intro Section */}
      <div id="intro-section" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-black uppercase tracking-wider">Welcome to LexVanguard</h2>
          <div className="h-1 w-16 bg-yellow-500 mx-auto mb-8" />
          <p className="text-gray-700 leading-loose text-lg mb-6">
            Recognized as one of the most prestigious student-led law firms at Mounk Kenya University, LexVanguard's reputation extends across the country. We are not merely a university society — we are a formidable incubator for legal talent, providing hands-on experience that bridges the gap between academic theory and real-world legal practice.
          </p>
          <p className="text-gray-600 leading-loose text-base mb-10">
            In an environment where students often feel underprepared for the rigors of legal practice, LexVanguard offers a structured, professional space where emerging legal minds are equipped with the skills, networks, and confidence to succeed. Our members engage in rigorous legal research, litigation training, moot court advocacy, legal writing, and client advisory — developing the full spectrum of skills demanded by the modern legal profession.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            {[
              { value: "50+", label: "Members" },
              { value: "10+", label: "Competitions" },
              { value: "5+", label: "Practice Areas" },
              { value: "1", label: "University" }
            ].map((stat, i) => (
              <div key={i} className="border-t-4 border-yellow-500 pt-4">
                <span className="block text-4xl font-extrabold text-black mb-1">{stat.value}</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Philosophy */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-black uppercase tracking-wider">Our Core Philosophy</h2>
            <div className="h-1 w-16 bg-yellow-500 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PHILOSOPHY.map((box, i) => (
              <div key={i} className="bg-white border-t-4 border-black p-10 text-center hover:shadow-lg transition-all duration-300 text-gray-800 flex flex-col">
                {box.icon}
                <h3 className="uppercase text-lg font-extrabold mt-5 mb-4 text-black tracking-wide">{box.title}</h3>
                <p className="text-sm text-gray-600 mb-5 leading-relaxed flex-1">
                  {expanded === i ? box.full : box.short}
                </p>
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="text-black font-bold uppercase text-xs tracking-widest hover:text-yellow-500 transition-colors bg-transparent border-b-2 border-black hover:border-yellow-500 pb-1 cursor-pointer self-center">
                  {expanded === i ? 'Show Less «' : 'Learn More »'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What We Do */}
      <div className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white uppercase tracking-wider">What We Do</h2>
            <div className="h-1 w-16 bg-yellow-500 mx-auto mb-6" />
            <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">
              LexVanguard moves beyond the textbook to provide hands-on experience across the full spectrum of legal practice.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Legal Research", desc: "Navigate complex statutes, case law, and international legal instruments with precision. Members build research skills that rival seasoned practitioners." },
              { title: "Litigation Training", desc: "Hone your advocacy and argumentation skills through simulated trials and real case analysis. Step confidently into any courtroom." },
              { title: "Moot Court & ADR", desc: "Master negotiation, mediation, and alternative dispute resolution. Justice is often served through strategic compromise and persuasive diplomacy." },
              { title: "Legal Writing & Drafting", desc: "Craft airtight contracts, persuasive briefs, and clear legal opinions. A well-drafted document is the bedrock of effective advocacy." },
              { title: "Client Advisory", desc: "Develop the interpersonal and analytical skills needed to counsel clients, understand their needs, and translate complex legal issues into actionable strategies." },
              { title: "Competitions & Conferences", desc: "Represent Mounk Kenya University at national and international moot court competitions, symposia, and legal conferences." }
            ].map((item, i) => (
              <div key={i} className="border border-white/10 p-8 hover:border-yellow-500 hover:bg-white/5 transition-all duration-300">
                <div className="w-8 h-1 bg-yellow-500 mb-5" />
                <h3 className="font-extrabold text-white uppercase tracking-wider text-sm mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attorneys Teaser */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-2/3 pr-8 mb-8 md:mb-0">
            <h2 className="text-4xl font-bold text-black mb-2 uppercase tracking-wider">Our Attorneys</h2>
            <div className="h-1 w-10 bg-yellow-500 mb-6" />
            <p className="text-gray-600 leading-loose text-lg mb-8">
              Our team comprises distinguished legal professionals, leading academics, and national moot court champions dedicated to providing strategic, result-oriented representation. Every member is acknowledged and respected as intrinsically valuable to the whole.
            </p>
            <Link href="/attorneys" className="bg-yellow-500 text-black px-8 py-3 font-extrabold text-sm uppercase tracking-widest hover:bg-yellow-600 transition-colors inline-block">
              Meet Our Team
            </Link>
          </div>
          <div className="md:w-1/3">
            <div className="grid grid-cols-2 gap-4">
              <img src="assets/prince.png" onError={(e)=>{(e.target as HTMLImageElement).src='https://placehold.co/400x400/0a0a0a/EAB308?text=Prince+Micah'}} alt="Prince Micah" className="w-full h-40 object-cover border-2 border-yellow-500" />
              <img src="assets/kmusya.jpeg" onError={(e)=>{(e.target as HTMLImageElement).src='https://placehold.co/400x400/0a0a0a/EAB308?text=Kelvin+Musya'}} alt="Kelvin Musya" className="w-full h-40 object-cover border-2 border-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Vision Banner */}
      <div className="bg-black border-t-4 border-yellow-500 py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-yellow-500 uppercase tracking-[0.3em] text-xs font-bold mb-4">Our Vision</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-6">
            To become a world-class pillar of justice
          </h2>
          <p className="text-gray-400 text-base leading-relaxed mb-8">
            This is not merely a slogan but a guiding star for every initiative LexVanguard undertakes. The ambition is to scale the heights of international legal education, standing shoulder to shoulder with the finest law firms and institutions globally — while remaining intrinsically tied to the mission of ensuring equal access to justice.
          </p>
          <Link href="/history" className="border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black px-8 py-3 font-extrabold text-xs uppercase tracking-widest transition-colors inline-block">
            Our Story
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
