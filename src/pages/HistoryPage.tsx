import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MILESTONES = [
  { year: "Founded", title: "LexVanguard Established", desc: "LexVanguard was founded at Mounk Kenya University with a vision to bridge the gap between academic theory and real-world legal practice. A small group of passionate students united by the belief that justice requires spirit and tenacity." },
  { year: "Year 1", title: "First National Competition", desc: "Members attended their first national moot court competition, representing Mounk Kenya University with distinction and establishing the firm's competitive reputation on a national stage." },
  { year: "Growth", title: "Expanding Membership", desc: "The firm grew to encompass a diverse tapestry of perspectives, backgrounds, and intellectual approaches — welcoming all who possess the visceral urge to see justice persevere." },
  { year: "Today", title: "Recognized Excellence", desc: "Recognized as one of the most prestigious student-led law firms in Kenya, LexVanguard has amassed a collection of accolades that belie its relative youth. Members have attended numerous prestigious legal events, symposia, and conferences, networking with seasoned practitioners across the country." },
  { year: "Vision", title: "World-Class Pillar of Justice", desc: "The firm's trajectory is set toward international recognition — standing shoulder to shoulder with the finest law firms and institutions globally, while remaining intrinsically tied to the mission of ensuring equal access to justice for all." }
];

export default function HistoryPage() {
  return (
    <div className="w-full bg-white">
      <Header />

      <div className="bg-black pt-40 pb-20 px-6 text-center border-b-4 border-yellow-500">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white uppercase tracking-wider">Firm History</h1>
        <div className="h-1 w-16 bg-yellow-500 mx-auto mt-6" />
        <p className="text-gray-400 max-w-xl mx-auto mt-6 text-sm leading-relaxed">
          A crucible where raw talent is forged into professional excellence through rigorous training and unwavering mutual support.
        </p>
      </div>

      {/* About */}
      <div className="w-full px-6 sm:px-10 lg:px-16 py-20 text-center">
        <p className="text-yellow-600 uppercase tracking-[0.2em] text-xs font-bold mb-4">Our Story</p>
        <h2 className="text-3xl font-extrabold text-black mb-8 uppercase tracking-wide">From Vision to Reality</h2>
        <div className="max-w-5xl mx-auto space-y-6">
          <p className="text-gray-700 leading-loose text-lg">
            In the competitive landscape of legal education, where theory often meets the daunting threshold of practice, few organizations stand as beacons of excellence and opportunity. LexVanguard is one such institution. Recognized as one of the most prestigious student-led law firms at Mounk Kenya University, its reputation extends scalably across the country, marking it not merely as a university society, but as a formidable incubator for legal talent.
          </p>
          <p className="text-gray-600 leading-loose text-base">
            The foundation of LexVanguard's success lies in its deeply ingrained culture of inclusivity. The firm operates on the belief that the pursuit of justice is not the exclusive domain of the privileged few, but a calling that requires only spirit and tenacity. By welcoming a diversity of perspectives, backgrounds, and intellectual approaches, the firm ensures that every member contributes uniquely to the collective pursuit of justice.
          </p>
          <p className="text-gray-600 leading-loose text-base">
            Membership within LexVanguard is structured around a set of core principles that elevate the group from a simple club to a professional entity. The pillars of this community are co-working, professionalism, friendship, respect, and, above all, teamwork. In the high-stakes world of legal practice, isolation is a liability — recognizing this, LexVanguard fosters a co-working environment where students collaborate on complex case studies, share research burdens, and refine arguments together.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-black py-20 px-6">
        <div className="w-full px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white uppercase tracking-wider mb-4">Our Journey</h2>
            <div className="h-1 w-16 bg-yellow-500 mx-auto" />
          </div>
          <div className="relative">
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-yellow-500/30 md:transform md:-translate-x-px" />
            <div className="space-y-12">
              {MILESTONES.map((m, i) => (
                <div key={i} className={`relative flex flex-col md:flex-row gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="md:w-1/2 md:text-right md:pr-12 pl-8 md:pl-0">
                    {i % 2 === 0 && (
                      <div className={`${i % 2 !== 0 ? 'md:hidden' : ''}`}>
                        <span className="text-yellow-500 font-extrabold text-sm uppercase tracking-widest block mb-2">{m.year}</span>
                        <h3 className="text-white font-extrabold text-lg uppercase tracking-wide mb-3">{m.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{m.desc}</p>
                      </div>
                    )}
                    {i % 2 !== 0 && <div />}
                  </div>
                  <div className="absolute left-0 md:left-1/2 top-1 w-4 h-4 bg-yellow-500 rounded-full md:-translate-x-1/2 -translate-x-1/2 shadow-lg shadow-yellow-500/50 shrink-0" />
                  <div className="md:w-1/2 md:pl-12 pl-8">
                    {i % 2 !== 0 && (
                      <div>
                        <span className="text-yellow-500 font-extrabold text-sm uppercase tracking-widest block mb-2">{m.year}</span>
                        <h3 className="text-white font-extrabold text-lg uppercase tracking-wide mb-3">{m.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{m.desc}</p>
                      </div>
                    )}
                    {i % 2 === 0 && <div className="hidden md:block" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-black uppercase tracking-wider mb-4">Our Values</h2>
          <div className="h-1 w-16 bg-yellow-500 mx-auto mb-12" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {["Co-working", "Professionalism", "Friendship", "Respect", "Teamwork"].map((v, i) => (
              <div key={i} className="bg-white border-t-4 border-yellow-500 p-6 text-center shadow-sm">
                <p className="font-extrabold text-black text-sm uppercase tracking-widest">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
