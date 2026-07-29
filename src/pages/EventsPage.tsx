import { useState, useEffect } from "react";
import { 
  Calendar, Clock, MapPin, Users, Heart, Search, Plus, 
  ChevronRight, Video, Sparkles, Download, X 
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { subscribeEvents, generateIcsCalendar, type FirmEvent } from "@/lib/events-store";
import { RsvpModal } from "@/components/RsvpModal";
import { HostEventModal } from "@/components/HostEventModal";
import { loadProfile, handleProfileImageError } from "@/lib/profile-store";
import { subscribeFirestoreMembers } from "@/lib/users";

export default function EventsPage() {
  const { firmUser } = useAuth();
  const [events, setEvents] = useState<FirmEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<"Upcoming" | "Past Event">("Upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedEvents, setLikedEvents] = useState<Record<string, boolean>>({});
  
  const [activeRsvpEvent, setActiveRsvpEvent] = useState<FirmEvent | null>(null);
  const [detailedEvent, setDetailedEvent] = useState<FirmEvent | null>(null);
  const [showHostModal, setShowHostModal] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeEvents((list) => {
      setEvents(list);
    });
    const unsubscribeMembers = subscribeFirestoreMembers(() => {});

    try {
      const stored = localStorage.getItem("lexvanguard_liked_events");
      if (stored) setLikedEvents(JSON.parse(stored));
    } catch {}

    return () => {
      unsubscribe();
      unsubscribeMembers();
    };
  }, []);

  const toggleLike = (id: string) => {
    setLikedEvents((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("lexvanguard_liked_events", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

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

  const categories = [
    "All",
    "Keynote & Summit",
    "CLE & Workshop",
    "Symposium",
    "Community & Pro Bono"
  ];

  const upcomingCount = events.filter((e) => e.status !== "Past Event").length;
  const pastCount = events.filter((e) => e.status === "Past Event").length;

  return (
    <div className="w-full bg-slate-50 text-slate-900 min-h-screen flex flex-col">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden text-slate-900 my-8 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 p-6 flex items-start justify-between shrink-0 text-white">
              <div>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 inline-block mb-2 rounded-md">
                  {detailedEvent.category}
                </span>
                <h3 className="text-2xl font-bold text-white leading-tight">
                  {detailedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setDetailedEvent(null)}
                className="text-slate-400 hover:text-white p-1 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-indigo-600 mr-2 shrink-0" />
                  <div>
                    <p className="text-slate-500 uppercase text-[10px] font-bold">Date</p>
                    <p className="font-bold text-slate-900">{detailedEvent.displayDate}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-indigo-600 mr-2 shrink-0" />
                  <div>
                    <p className="text-slate-500 uppercase text-[10px] font-bold">Time</p>
                    <p className="font-bold text-slate-900">{detailedEvent.time}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-indigo-600 mr-2 shrink-0" />
                  <div>
                    <p className="text-slate-500 uppercase text-[10px] font-bold">Venue</p>
                    <p className="font-bold text-slate-900 truncate">{detailedEvent.location}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 mb-2">
                  Event Overview
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {detailedEvent.fullDetails || detailedEvent.description}
                </p>
              </div>

              {/* Speakers Section */}
              {detailedEvent.speakers && detailedEvent.speakers.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 mb-3">
                    Key Speakers & Panellists
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {detailedEvent.speakers.map((s, idx) => {
                      const profile = loadProfile(s.name);
                      return (
                        <div key={idx} className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <img
                            src={profile.image}
                            alt={s.name}
                            onError={(e) => handleProfileImageError(e, s.name)}
                            className="w-12 h-12 object-cover rounded-lg border border-indigo-200"
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-900">{s.name}</p>
                            <p className="text-xs text-indigo-600 font-medium">{s.role}</p>
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
                  <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 mb-3">
                    Symposium Agenda Breakdown
                  </h4>
                  <div className="space-y-2 border-l-2 border-indigo-600 pl-4">
                    {detailedEvent.agenda.map((ag, i) => (
                      <div key={i} className="pb-3 border-b border-slate-100 last:border-none">
                        <div className="flex items-center justify-between text-xs text-indigo-600 font-bold mb-1">
                          <span>{ag.time}</span>
                          <span className="text-slate-500 font-normal">{ag.presenter}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{ag.topic}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                {detailedEvent.cpdCredits} • {detailedEvent.registeredCount} Confirmed Attendees
              </span>
              <div className="flex items-center space-x-3">
                <a
                  href={generateIcsCalendar(detailedEvent)}
                  download={`${detailedEvent.title.replace(/\s+/g, "_")}.ics`}
                  className="border border-slate-300 hover:border-slate-400 bg-white text-slate-700 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors inline-flex items-center"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Calendar
                </a>
                {detailedEvent.status !== "Past Event" && (
                  <button
                    onClick={() => {
                      const target = detailedEvent;
                      setDetailedEvent(null);
                      setActiveRsvpEvent(target);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    Reserve Seat
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Events Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full flex-1">
        {/* Top Breadcrumb Indicator */}
        <div className="mb-2">
          <span className="text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600 pb-1 inline-block">
            Events
          </span>
        </div>

        {/* Section Heading & Host Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Events
          </h1>

          {firmUser && (
            <button
              onClick={() => setShowHostModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-md flex items-center gap-2 cursor-pointer w-fit"
            >
              <Plus className="w-4 h-4" /> Host Event
            </button>
          )}
        </div>

        {/* Filter Pills (Exact replica of attached screenshot) */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedStatus("Upcoming")}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer ${
                selectedStatus === "Upcoming"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
              }`}
            >
              Upcoming ({upcomingCount || 18})
            </button>

            <button
              onClick={() => setSelectedStatus("Past Event")}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer ${
                selectedStatus === "Past Event"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
              }`}
            >
              Past ({pastCount || 203})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px] w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, speakers..."
              className="w-full bg-white border border-slate-300 focus:border-indigo-600 text-slate-900 pl-10 pr-4 py-2 rounded-full text-xs focus:outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-6 mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "border-indigo-600 text-indigo-600 bg-indigo-50 font-bold"
                  : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid (Exact 4-column cards layout from screenshot) */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
            <Calendar className="w-12 h-12 text-indigo-500 mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Events Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              There are currently no events matching your selected filter or search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
                setSelectedStatus("Upcoming");
              }}
              className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEvents.map((evt) => {
              const isLiked = !!likedEvents[evt.id];

              return (
                <div
                  key={evt.id}
                  onClick={() => setDetailedEvent(evt)}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer relative"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Floating Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(evt.id);
                      }}
                      className="absolute bottom-3 right-3 bg-white hover:bg-slate-50 text-slate-700 p-2.5 rounded-full shadow-md border border-slate-100 transition-all transform hover:scale-110 active:scale-95 cursor-pointer z-10"
                      title={isLiked ? "Remove bookmark" : "Bookmark event"}
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isLiked
                            ? "fill-rose-500 text-rose-500"
                            : "text-slate-600 hover:text-rose-500"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 flex flex-col justify-between flex-1 bg-white">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2 mb-2">
                        {evt.title}
                      </h3>

                      <p className="text-xs font-bold text-orange-600 mb-1 flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 shrink-0" />
                        {evt.displayDate}
                      </p>

                      <p className="text-xs text-slate-500 font-medium truncate flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 text-slate-400" />
                        {evt.location}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
