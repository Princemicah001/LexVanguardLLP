import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Heart, Calendar, MapPin, Sparkles, ChevronRight } from "lucide-react";
import { subscribeEvents, type FirmEvent } from "@/lib/events-store";
import { RsvpModal } from "./RsvpModal";

export default function EventsSection() {
  const [events, setEvents] = useState<FirmEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"Upcoming" | "Past">("Upcoming");
  const [likedEvents, setLikedEvents] = useState<Record<string, boolean>>({});
  const [activeRsvpEvent, setActiveRsvpEvent] = useState<FirmEvent | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeEvents((list) => {
      setEvents(list);
    });
    
    try {
      const stored = localStorage.getItem("lexvanguard_liked_events");
      if (stored) setLikedEvents(JSON.parse(stored));
    } catch {}

    return () => unsubscribe();
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

  const upcomingCount = events.filter((e) => e.status !== "Past Event").length;
  const pastCount = events.filter((e) => e.status === "Past Event").length;

  const displayList = events.filter((e) => {
    if (activeTab === "Upcoming") return e.status !== "Past Event";
    return e.status === "Past Event";
  });

  return (
    <section id="events-section" className="py-16 md:py-24 bg-white text-slate-900 border-t border-slate-100">
      {activeRsvpEvent && (
        <RsvpModal event={activeRsvpEvent} onClose={() => setActiveRsvpEvent(null)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section Breadcrumb Indicator */}
        <div className="mb-2">
          <span className="text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600 pb-1 inline-block">
            Events
          </span>
        </div>

        {/* Section Heading & View All Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Events
          </h2>

          <Link
            href="/events"
            className="inline-flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors group"
          >
            <span>View All Events ({events.length})</span>
            <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Filter Pills (Exact replica of attached screenshot) */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setActiveTab("Upcoming")}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "Upcoming"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
            }`}
          >
            Upcoming ({upcomingCount || 18})
          </button>

          <button
            onClick={() => setActiveTab("Past")}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "Past"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
            }`}
          >
            Past ({pastCount || 203})
          </button>
        </div>

        {/* 4-Column Responsive Event Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayList.slice(0, 8).map((evt) => {
            const isLiked = !!likedEvents[evt.id];

            return (
              <div
                key={evt.id}
                onClick={() => setActiveRsvpEvent(evt)}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer relative"
              >
                {/* Event Image */}
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

                  {/* Floating Action Heart Button */}
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

                {/* Event Information */}
                <div className="p-5 flex flex-col justify-between flex-1 bg-white">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base md:text-lg group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2 mb-2">
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
      </div>
    </section>
  );
}
