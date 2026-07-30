import { useState, useEffect } from "react";
import { 
  Calendar, Clock, MapPin, Heart, Search, Plus, 
  Download, X, Image as ImageIcon 
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { subscribeEvents, generateIcsCalendar, type FirmEvent } from "@/lib/events-store";
import { RsvpModal } from "@/components/RsvpModal";
import { HostEventModal } from "@/components/HostEventModal";
import { EventGalleryModal } from "@/components/EventGalleryModal";
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
  const [activeGalleryEvent, setActiveGalleryEvent] = useState<FirmEvent | null>(null);
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

  const handleCardClick = (evt: FirmEvent) => {
    if (evt.status === "Past Event") {
      setActiveGalleryEvent(evt);
    } else {
      setDetailedEvent(evt);
    }
  };

  return (
    <div className="w-full bg-white text-black min-h-screen flex flex-col">
      <Header />

      {/* RSVP Modal */}
      {activeRsvpEvent && (
        <RsvpModal event={activeRsvpEvent} onClose={() => setActiveRsvpEvent(null)} />
      )}

      {/* Gallery Modal for Past Events */}
      {activeGalleryEvent && (
        <EventGalleryModal event={activeGalleryEvent} onClose={() => setActiveGalleryEvent(null)} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white border border-neutral-300 shadow-2xl rounded-2xl overflow-hidden text-black my-8 max-h-[90vh] flex flex-col">
            <div className="bg-black p-6 flex items-start justify-between shrink-0 text-white border-b border-neutral-800">
              <div>
                <span className="bg-white text-black text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 inline-block mb-2 rounded-xs">
                  {detailedEvent.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {detailedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setDetailedEvent(null)}
                className="text-neutral-400 hover:text-white p-1 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-black mr-2 shrink-0" />
                  <div>
                    <p className="text-neutral-500 uppercase text-[10px] font-bold tracking-wider">Date</p>
                    <p className="font-bold text-black">{detailedEvent.displayDate}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-black mr-2 shrink-0" />
                  <div>
                    <p className="text-neutral-500 uppercase text-[10px] font-bold tracking-wider">Time</p>
                    <p className="font-bold text-black">{detailedEvent.time}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-black mr-2 shrink-0" />
                  <div>
                    <p className="text-neutral-500 uppercase text-[10px] font-bold tracking-wider">Venue</p>
                    <p className="font-bold text-black truncate">{detailedEvent.location}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-2">
                  Event Overview
                </h4>
                <p className="text-neutral-700 text-sm leading-relaxed">
                  {detailedEvent.fullDetails || detailedEvent.description}
                </p>
              </div>

              {/* Speakers Section */}
              {detailedEvent.speakers && detailedEvent.speakers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-3">
                    Speakers & Presenters
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {detailedEvent.speakers.map((s, idx) => {
                      const profile = loadProfile(s.name);
                      return (
                        <div key={idx} className="flex items-center space-x-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                          <img
                            src={profile.image}
                            alt={s.name}
                            onError={(e) => handleProfileImageError(e, s.name)}
                            className="w-12 h-12 object-cover rounded-lg border border-neutral-300"
                          />
                          <div>
                            <p className="text-sm font-bold text-black">{s.name}</p>
                            <p className="text-xs text-neutral-600 font-medium">{s.role}</p>
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
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-3">
                    Agenda Breakdown
                  </h4>
                  <div className="space-y-2 border-l-2 border-black pl-4">
                    {detailedEvent.agenda.map((ag, i) => (
                      <div key={i} className="pb-3 border-b border-neutral-200 last:border-none">
                        <div className="flex items-center justify-between text-xs text-black font-bold mb-1">
                          <span>{ag.time}</span>
                          <span className="text-neutral-500 font-normal">{ag.presenter}</span>
                        </div>
                        <p className="text-sm font-bold text-black">{ag.topic}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-neutral-50 p-6 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
              <span className="text-xs text-neutral-600 font-medium">
                {detailedEvent.cpdCredits} • {detailedEvent.registeredCount} Confirmed Attendees
              </span>
              <div className="flex items-center space-x-3">
                <a
                  href={generateIcsCalendar(detailedEvent)}
                  download={`${detailedEvent.title.replace(/\s+/g, "_")}.ics`}
                  className="border border-neutral-300 hover:border-black bg-white text-black px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors inline-flex items-center"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5 text-black" /> Calendar
                </a>
                {detailedEvent.status !== "Past Event" ? (
                  <button
                    onClick={() => {
                      const target = detailedEvent;
                      setDetailedEvent(null);
                      setActiveRsvpEvent(target);
                    }}
                    className="bg-black hover:bg-neutral-800 text-white px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Reserve Seat
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const target = detailedEvent;
                      setDetailedEvent(null);
                      setActiveGalleryEvent(target);
                    }}
                    className="bg-black hover:bg-neutral-800 text-white px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> View Gallery
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Events Container */}
      <main className="w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20 flex-1">

        {/* Section Heading & Host Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-200">
          <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight font-mono uppercase">
            Events
          </h1>

          {firmUser && (
            <button
              onClick={() => setShowHostModal(true)}
              className="bg-black hover:bg-neutral-800 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-xs flex items-center gap-2 cursor-pointer w-fit"
            >
              <Plus className="w-4 h-4 text-white" /> Host Event
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedStatus("Upcoming")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                selectedStatus === "Upcoming"
                  ? "bg-black text-white border border-black shadow-xs"
                  : "bg-white text-black hover:bg-neutral-100 border border-neutral-300"
              }`}
            >
              Upcoming ({upcomingCount || 18})
            </button>

            <button
              onClick={() => setSelectedStatus("Past Event")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                selectedStatus === "Past Event"
                  ? "bg-black text-white border border-black shadow-xs"
                  : "bg-white text-black hover:bg-neutral-100 border border-neutral-300"
              }`}
            >
              Past ({pastCount || 203})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px] w-full sm:w-auto">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, speakers..."
              className="w-full bg-white border border-neutral-300 focus:border-black text-black pl-10 pr-4 py-2 rounded-full text-xs focus:outline-none shadow-xs"
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
                  ? "border-black text-white bg-black font-bold"
                  : "border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200 p-8 shadow-xs">
            <Calendar className="w-12 h-12 text-black mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-bold text-black mb-2">No Events Found</h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">
              There are currently no events matching your selected filter or search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
                setSelectedStatus("Upcoming");
              }}
              className="text-xs font-bold text-black uppercase tracking-widest hover:underline"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEvents.map((evt) => {
              const isLiked = !!likedEvents[evt.id];
              const isPast = evt.status === "Past Event";

              return (
                <div
                  key={evt.id}
                  onClick={() => handleCardClick(evt)}
                  className="bg-white rounded-xl border border-neutral-200 hover:border-black transition-all duration-200 overflow-hidden flex flex-col group cursor-pointer relative shadow-xs"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full bg-neutral-100 overflow-hidden">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gallery indicator tag for past events */}
                    {isPast && (
                      <span className="absolute bottom-3 left-3 bg-white/90 text-black text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-xs flex items-center gap-1 border border-neutral-300">
                        <ImageIcon className="w-3 h-3 text-black" /> View Gallery
                      </span>
                    )}

                    {/* Floating Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(evt.id);
                      }}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white text-black p-2 rounded-full border border-neutral-200 shadow-sm transition-transform active:scale-95 cursor-pointer z-10"
                      title={isLiked ? "Remove bookmark" : "Bookmark event"}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-colors ${
                          isLiked
                            ? "fill-black text-black"
                            : "text-neutral-600 hover:text-black"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 flex flex-col justify-between flex-1 bg-white">
                    <div>
                      <h3 className="font-bold text-black text-sm sm:text-base group-hover:underline leading-snug line-clamp-2 mb-2">
                        {evt.title}
                      </h3>

                      <p className="text-xs font-semibold text-neutral-800 mb-1 flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 shrink-0 text-black" />
                        {evt.displayDate}
                      </p>

                      <p className="text-xs text-neutral-500 truncate flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0 text-neutral-400" />
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
