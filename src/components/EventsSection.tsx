import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Heart, Calendar, MapPin, ChevronRight, Image as ImageIcon } from "lucide-react";
import { subscribeEvents, type FirmEvent } from "@/lib/events-store";
import { RsvpModal } from "./RsvpModal";
import { EventGalleryModal } from "./EventGalleryModal";

export default function EventsSection() {
  const [events, setEvents] = useState<FirmEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"Upcoming" | "Past">("Upcoming");
  const [likedEvents, setLikedEvents] = useState<Record<string, boolean>>({});
  const [activeRsvpEvent, setActiveRsvpEvent] = useState<FirmEvent | null>(null);
  const [activeGalleryEvent, setActiveGalleryEvent] = useState<FirmEvent | null>(null);

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

  const handleCardClick = (evt: FirmEvent) => {
    if (evt.status === "Past Event") {
      setActiveGalleryEvent(evt);
    } else {
      setActiveRsvpEvent(evt);
    }
  };

  return (
    <section id="events-section" className="py-12 md:py-16 bg-white text-black border-t border-neutral-200">
      {activeRsvpEvent && (
        <RsvpModal event={activeRsvpEvent} onClose={() => setActiveRsvpEvent(null)} />
      )}

      {activeGalleryEvent && (
        <EventGalleryModal event={activeGalleryEvent} onClose={() => setActiveGalleryEvent(null)} />
      )}

      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & View All Link */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-200">
          <h2 className="text-2xl md:text-3xl font-bold text-black tracking-tight uppercase font-mono">
            Events
          </h2>

          <Link
            href="/events"
            className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-black hover:underline transition-all group"
          >
            <span>View All ({events.length})</span>
            <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Filter Tabs - Precision Black & White */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab("Upcoming")}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === "Upcoming"
                ? "bg-black text-white border border-black shadow-xs"
                : "bg-white text-black hover:bg-neutral-100 border border-neutral-300"
            }`}
          >
            Upcoming ({upcomingCount || 18})
          </button>

          <button
            onClick={() => setActiveTab("Past")}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === "Past"
                ? "bg-black text-white border border-black shadow-xs"
                : "bg-white text-black hover:bg-neutral-100 border border-neutral-300"
            }`}
          >
            Past ({pastCount || 203})
          </button>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayList.slice(0, 8).map((evt) => {
            const isLiked = !!likedEvents[evt.id];
            const isPast = evt.status === "Past Event";

            return (
              <div
                key={evt.id}
                onClick={() => handleCardClick(evt)}
                className="bg-white rounded-xl border border-neutral-200 hover:border-black transition-all duration-200 overflow-hidden flex flex-col group cursor-pointer relative shadow-xs"
              >
                {/* Event Image */}
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

                  {/* Past Gallery Overlay Tag */}
                  {isPast && (
                    <span className="absolute bottom-3 left-3 bg-white/90 text-black text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-xs flex items-center gap-1 border border-neutral-300">
                      <ImageIcon className="w-3 h-3 text-black" /> View Gallery
                    </span>
                  )}

                  {/* Floating Bookmark Heart */}
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

                {/* Event Info */}
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
      </div>
    </section>
  );
}
