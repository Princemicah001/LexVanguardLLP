import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  Calendar, Clock, MapPin, Users, Award, Search, Filter, Plus, 
  ChevronRight, Video, Sparkles, CheckCircle2, Download, ArrowUpRight, X, FileText 
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { subscribeEvents, generateIcsCalendar, type FirmEvent } from "@/lib/events-store";
import { RsvpModal } from "@/components/RsvpModal";
import { HostEventModal } from "@/components/HostEventModal";
import { loadProfile } from "@/lib/profile-store";

export default function EventsPage() {
  const { firmUser } = useAuth();
  const [events, setEvents] = useState<FirmEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<"Upcoming" | "Past Event">("Upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [activeRsvpEvent, setActiveRsvpEvent] = useState<FirmEvent | null>(null);
  const [detailedEvent, setDetailedEvent] = useState<FirmEvent | null>(null);
  const [showHostModal, setShowHostModal] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeEvents((list) => {
      setEvents(list);
    });
    return () => unsubscribe();
  }, []);

  // Filter events
  const filteredEvents = events.filter((evt) => {
    // Status filter
    if (selectedStatus === "Upcoming" && evt.status === "Past Event") return false;
    if (selectedStatus === "Past Event" && evt.status !== "Past Event") return false;

    // Category filter
    if (selectedCategory !== "All" && !evt.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = evt.title.toLowerCase().includes(q);
      const matchDesc = evt.description.toLowerCase().includes(q);
      const matchSpeakers = evt.speakers.some(s => s.name.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchSpeakers) return false;
    }

    return true;
  });

  const featured = events.find((e) => e.featured && e.status !== "Past Event") || events.find(e => e.status !== "Past Event");

  const categories = [
    "All",
    "Keynote & Summit",
    "CLE & Workshop",
    "Symposium",
    "Community & Pro Bono"
  ];

  return (
    <div className="w-full bg-black text-white min-h-screen flex flex-col">
      <Header />

      {/* RSVP Modal */}
      {activeRsvpEvent && (
        <RsvpModal event={activeRsvpEvent} onClose={() => setActiveRsvpEvent(null)} />
      )}

      {/* Host Event Modal */}
      {showHostModal && (
        <HostEventModal
          onClose={() => setShowHostModal(false)}
          onCreated={(newEvt) => {
            setShowHostModal(false);
            setDetailedEvent(newEvt);
          }}
        />
      )}

      {/* Detailed Agenda Modal */}
      {detailedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-neutral-950 border-2 border-yellow-500 shadow-2xl overflow-hidden text-white my-8 max-h-[90vh] flex flex-col">
            <div className="bg-neutral-900 p-6 border-b border-yellow-500/30 flex items-start justify-between shrink-0">
              <div>
                <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 inline-block mb-2">
                  {detailedEvent.category}
                </span>
                <h3 className="text-2xl font-extrabold text-white leading-tight">
                  {detailedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setDetailedEvent(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-900 p-4 border border-white/10 text-xs">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-yellow-500 mr-2 shrink-0" />
                  <div>
                    <p className="text-gray-400 uppercase text-[10px] font-bold">Date</p>
                    <p className="font-bold text-white">{detailedEvent.displayDate}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-yellow-500 mr-2 shrink-0" />
                  <div>
                    <p className="text-gray-400 uppercase text-[10px] font-bold">Time</p>
                    <p className="font-bold text-white">{detailedEvent.time}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-yellow-500 mr-2 shrink-0" />
                  <div>
                    <p className="text-gray-400 uppercase text-[10px] font-bold">Venue</p>
                    <p className="font-bold text-white">{detailedEvent.location}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-yellow-500 mb-2">
                  Event Overview
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed font-light">
                  {detailedEvent.fullDetails || detailedEvent.description}
                </p>
              </div>

              {/* Speakers Section */}
              {detailedEvent.speakers && detailedEvent.speakers.length > 0 && (
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-yellow-500 mb-3">
                    Key Speakers & Panellists
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {detailedEvent.speakers.map((s, idx) => {
                      const profile = loadProfile(s.name);
                      return (
                        <div key={idx} className="flex items-center space-x-3 bg-neutral-900/80 p-3 border border-white/10">
                          <img
                            src={profile.image}
                            alt={s.name}
                            className="w-12 h-12 object-cover border border-yellow-500/50 grayscale"
                          />
                          <div>
                            <p className="text-sm font-bold text-white uppercase tracking-wide">{s.name}</p>
                            <p className="text-xs text-yellow-500/80">{s.role}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Agenda Section */}
              {detailedEvent.agenda && detailedEvent.agenda.length > 0 && (
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-yellow-500 mb-3">
                    Symposium Agenda Breakdown
                  </h4>
                  <div className="space-y-2 border-l-2 border-yellow-500 pl-4">
                    {detailedEvent.agenda.map((ag, i) => (
                      <div key={i} className="pb-3 border-b border-white/5 last:border-none">
                        <div className="flex items-center justify-between text-xs text-yellow-500 font-bold mb-1">
                          <span>{ag.time}</span>
                          <span className="text-gray-400 font-normal">{ag.presenter}</span>
                        </div>
                        <p className="text-sm font-bold text-white">{ag.topic}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-neutral-900 p-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 shrink-0">
              <span className="text-xs text-gray-400 font-medium">
                {detailedEvent.cpdCredits} • {detailedEvent.registeredCount} Confirmed Attendees
              </span>
              <div className="flex items-center space-x-3">
                <a
                  href={generateIcsCalendar(detailedEvent)}
                  download={`${detailedEvent.title.replace(/\s+/g, "_")}.ics`}
                  className="border border-white/20 hover:border-yellow-500 text-white hover:text-yellow-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" /> .ICS
                </a>
                {detailedEvent.status !== "Past Event" && (
                  <button
                    onClick={() => {
                      const target = detailedEvent;
                      setDetailedEvent(null);
                      setActiveRsvpEvent(target);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-colors"
                  >
                    Reserve Seat
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="pt-36 pb-20 bg-gradient-to-b from-neutral-950 via-black to-neutral-950 border-b border-yellow-500/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center space-x-2 text-yellow-500 text-xs font-black uppercase tracking-[0.3em] mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Academic & Professional Leadership</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white uppercase tracking-tight leading-none mb-6">
                Events & <span className="text-yellow-500">Symposia</span>
              </h1>
              <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed">
                Lex Vanguard hosts national legal summits, appellate masterclasses, continuing legal education (CLE) workshops, and community pro bono initiatives connecting scholars, jurists, and advocates across East Africa.
              </p>
            </div>

            {firmUser && (
              <div className="mt-8 md:mt-0">
                <button
                  onClick={() => setShowHostModal(true)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3.5 text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-yellow-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Host Firm Event
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-900 border-b border-white/10 sticky top-0 z-30 backdrop-blur-md bg-neutral-900/90">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center space-x-2 border-r border-white/10 pr-4 shrink-0">
            <button
              onClick={() => setSelectedStatus("Upcoming")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                selectedStatus === "Upcoming"
                  ? "bg-yellow-500 text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Upcoming ({events.filter(e => e.status !== "Past Event").length})
            </button>
            <button
              onClick={() => setSelectedStatus("Past Event")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                selectedStatus === "Past Event"
                  ? "bg-yellow-500 text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Past Symposia ({events.filter(e => e.status === "Past Event").length})
            </button>
          </div>

          {/* Categories Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "border-yellow-500 text-yellow-500 bg-yellow-500/10"
                    : "border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symposia, speakers..."
              className="w-full bg-black/60 border border-white/20 focus:border-yellow-500 text-white pl-9 pr-4 py-2 text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-16 flex-1 w-full">
        {/* Featured Flagship Spotlight (When showing upcoming & no active search filter) */}
        {selectedStatus === "Upcoming" && selectedCategory === "All" && !searchQuery && featured && (
          <div className="mb-16 bg-gradient-to-r from-neutral-900 via-black to-neutral-950 border-2 border-yellow-500 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-7 relative min-h-[360px] lg:min-h-[480px]">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute top-4 left-4 bg-yellow-500 text-black text-[11px] font-black uppercase tracking-widest px-3 py-1.5 shadow-lg flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Spotlight Flagship Summit
                </div>
              </div>

              <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-3 text-xs text-yellow-500 font-extrabold uppercase tracking-wider mb-3">
                    <span className="border border-yellow-500/40 px-2.5 py-1 bg-yellow-500/10">
                      {featured.category}
                    </span>
                    <span>{featured.displayDate}</span>
                  </div>

                  <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-4">
                    {featured.title}
                  </h2>

                  <p className="text-gray-300 text-xs leading-relaxed mb-6 font-light">
                    {featured.description}
                  </p>

                  <div className="space-y-2 text-xs text-gray-400 border-t border-white/10 pt-4 mb-6">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-yellow-500 mr-2 shrink-0" />
                      <span>{featured.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-yellow-500 mr-2 shrink-0" />
                      <span>{featured.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 text-yellow-500 mr-2 shrink-0" />
                      <span>{featured.cpdCredits}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveRsvpEvent(featured)}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    RSVP / Reserve Seat
                  </button>
                  <button
                    onClick={() => setDetailedEvent(featured)}
                    className="border border-white/30 hover:border-white text-white px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    View Full Agenda
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-neutral-950 border border-white/10">
            <Calendar className="w-12 h-12 text-yellow-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold uppercase tracking-wider mb-2">
              No Events Found
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              There are currently no events matching your selected filter or search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
                setSelectedStatus("Upcoming");
              }}
              className="mt-6 text-xs font-bold text-yellow-500 uppercase tracking-widest border-b border-yellow-500 hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-neutral-950 border border-white/10 hover:border-yellow-500/60 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
              >
                <div>
                  {/* Event Thumbnail */}
                  <div className="relative h-48 overflow-hidden bg-neutral-900">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/10 text-yellow-500 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1">
                      {evt.category}
                    </div>

                    {evt.isVirtual && (
                      <div className="absolute top-3 right-3 bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 flex items-center gap-1">
                        <Video className="w-3 h-3" /> Virtual Stream
                      </div>
                    )}

                    {evt.status === "Past Event" && (
                      <div className="absolute bottom-3 left-3 bg-neutral-900/90 border border-white/20 text-gray-400 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
                        Past Event
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <div className="flex items-center text-xs text-yellow-500 font-bold mb-2">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      <span>{evt.displayDate}</span>
                    </div>

                    <h3 className="text-xl font-extrabold text-white group-hover:text-yellow-500 transition-colors mb-3 line-clamp-2">
                      {evt.title}
                    </h3>

                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-6 font-light">
                      {evt.description}
                    </p>

                    {/* Metadata */}
                    <div className="space-y-2 border-t border-white/10 pt-4 text-xs text-gray-400">
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 text-yellow-500 mr-2 shrink-0" />
                        <span>{evt.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 text-yellow-500 mr-2 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-6 pt-0 border-t border-white/5 flex items-center justify-between gap-3 mt-4">
                  <button
                    onClick={() => setDetailedEvent(evt)}
                    className="text-xs font-extrabold uppercase tracking-wider text-gray-300 hover:text-white transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1"
                  >
                    <span>Agenda & Details</span>
                    <ChevronRight className="w-3 h-3 text-yellow-500" />
                  </button>

                  {evt.status !== "Past Event" ? (
                    <button
                      onClick={() => setActiveRsvpEvent(evt)}
                      className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      RSVP
                    </button>
                  ) : (
                    <a
                      href={generateIcsCalendar(evt)}
                      download={`${evt.title.replace(/\s+/g, "_")}.ics`}
                      className="text-[11px] font-bold text-gray-400 hover:text-yellow-500 uppercase tracking-wider inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Calendar Record
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
