import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Calendar, Clock, MapPin, Users, Award, ChevronRight, Video, Sparkles, CheckCircle2 } from "lucide-react";
import { subscribeEvents, generateIcsCalendar, type FirmEvent } from "@/lib/events-store";
import { RsvpModal } from "./RsvpModal";

export default function EventsSection() {
  const [events, setEvents] = useState<FirmEvent[]>([]);
  const [activeRsvpEvent, setActiveRsvpEvent] = useState<FirmEvent | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeEvents((list) => {
      setEvents(list);
    });
    return () => unsubscribe();
  }, []);

  const featured = events.find(e => e.featured) || events[0];
  const upcomingList = events.filter(e => e.id !== featured?.id && e.status !== "Past Event").slice(0, 3);

  return (
    <section id="events-section" className="py-24 bg-[#0a0a0a] text-white border-t border-yellow-500/20">
      {activeRsvpEvent && (
        <RsvpModal event={activeRsvpEvent} onClose={() => setActiveRsvpEvent(null)} />
      )}

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-gray-800 pb-8">
          <div>
            <div className="flex items-center space-x-2 text-yellow-500 text-xs font-extrabold uppercase tracking-[0.25em] mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Symposia & Leadership</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white uppercase tracking-tight">
              Firm Events & Symposia
            </h2>
          </div>
          <div className="mt-6 md:mt-0 flex items-center space-x-4">
            <Link 
              href="/events" 
              className="inline-flex items-center text-sm font-extrabold text-yellow-500 hover:text-white uppercase tracking-widest border-b-2 border-yellow-500 hover:border-white pb-1 transition-all group"
            >
              <span>Explore All Events & Symposia</span>
              <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Featured Flagship Event Hero Card */}
        {featured && (
          <div className="mb-16 bg-gradient-to-br from-neutral-900 via-black to-neutral-950 border border-yellow-500/40 rounded-none overflow-hidden shadow-2xl relative group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Event Image */}
              <div className="lg:col-span-6 relative min-h-[340px] lg:min-h-[460px] overflow-hidden">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black" />
                <div className="absolute top-4 left-4 bg-yellow-500 text-black text-[11px] font-black uppercase tracking-widest px-3 py-1.5 shadow-lg flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Flagship Summit
                </div>
                {featured.cpdCredits && (
                  <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-md text-gray-200 border-l-2 border-yellow-500 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5">
                    {featured.cpdCredits}
                  </div>
                )}
              </div>

              {/* Event Details */}
              <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-yellow-500 font-bold uppercase tracking-wider mb-4">
                    <span className="bg-yellow-500/10 border border-yellow-500/30 px-3 py-1">
                      {featured.category}
                    </span>
                    <span className="flex items-center text-gray-400">
                      <Calendar className="w-3.5 h-3.5 text-yellow-500 mr-1.5" />
                      {featured.displayDate}
                    </span>
                  </div>

                  <h3 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-4 group-hover:text-yellow-500 transition-colors">
                    {featured.title}
                  </h3>

                  <p className="text-gray-300 text-sm leading-relaxed mb-6 font-light">
                    {featured.description}
                  </p>

                  <div className="space-y-3 mb-8 text-xs font-medium text-gray-400 border-y border-white/10 py-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-yellow-500 mr-3 shrink-0" />
                      <span>{featured.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-yellow-500 mr-3 shrink-0" />
                      <span>{featured.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-yellow-500 mr-3 shrink-0" />
                      <span>{featured.registeredCount} Confirmed Attendees / {featured.capacity} Seat Capacity</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => setActiveRsvpEvent(featured)}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black px-7 py-3.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-yellow-500/10 flex items-center gap-2"
                  >
                    <span>Reserve Your Seat</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <a
                    href={generateIcsCalendar(featured)}
                    download={`${featured.title.replace(/\s+/g, "_")}.ics`}
                    className="border border-white/20 hover:border-yellow-500 text-white hover:text-yellow-500 px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center"
                  >
                    <Calendar className="w-3.5 h-3.5 mr-2" /> Add to Calendar
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {upcomingList.map((evt) => (
            <div
              key={evt.id}
              className="bg-neutral-900 border border-white/10 hover:border-yellow-500/50 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-yellow-500 uppercase tracking-wider mb-3">
                  <span className="bg-white/5 px-2.5 py-1 border border-white/10">{evt.category}</span>
                  {evt.isVirtual && (
                    <span className="flex items-center text-emerald-400">
                      <Video className="w-3 h-3 mr-1" /> Virtual Stream
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-400 flex items-center mb-2">
                  <Calendar className="w-3.5 h-3.5 text-yellow-500 mr-1.5" />
                  <span>{evt.displayDate}</span>
                </div>

                <h4 className="text-lg font-bold text-white group-hover:text-yellow-500 transition-colors mb-3 line-clamp-2">
                  {evt.title}
                </h4>

                <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-6 font-light">
                  {evt.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 font-medium">
                  {evt.registeredCount} RSVP'd
                </span>
                <button
                  onClick={() => setActiveRsvpEvent(evt)}
                  className="text-xs font-extrabold text-yellow-500 hover:text-white uppercase tracking-wider transition-colors inline-flex items-center"
                >
                  RSVP <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
