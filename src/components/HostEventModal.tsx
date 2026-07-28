import { useState } from "react";
import { X, Calendar, Clock, MapPin, Plus, Sparkles, Image as ImageIcon } from "lucide-react";
import { createFirmEvent, type FirmEvent, type EventSpeaker } from "@/lib/events-store";
import { useAuth } from "@/lib/auth-context";

interface HostEventModalProps {
  onClose: () => void;
  onCreated: (evt: FirmEvent) => void;
}

export function HostEventModal({ onClose, onCreated }: HostEventModalProps) {
  const { firmUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<FirmEvent["category"]>("Symposium");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("Lex Vanguard Chambers Auditorium & Virtual Stream");
  const [isVirtual, setIsVirtual] = useState(false);
  const [cpdCredits, setCpdCredits] = useState("3.0 LSK CPD Units");
  const [capacity, setCapacity] = useState(200);
  const [image, setImage] = useState("https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80");
  const [description, setDescription] = useState("");
  const [fullDetails, setFullDetails] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    setLoading(true);

    const d = new Date(date);
    const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    const displayDate = `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;

    const hostSpeaker: EventSpeaker = firmUser
      ? { name: firmUser.name, role: firmUser.title || "Firm Member", uid: firmUser.id }
      : { name: "Prince Micah", role: "Founding & Managing Partner", uid: "n6NKoyAIuVSXYEaIbRVN9drINNy1" };

    const created = await createFirmEvent({
      title,
      category,
      date,
      displayDate,
      time,
      location,
      isVirtual,
      featured: false,
      image,
      description: description || "Join Lex Vanguard for an exclusive leadership and legal symposium.",
      fullDetails: fullDetails || description,
      cpdCredits,
      speakers: [hostSpeaker],
      capacity: Number(capacity) || 200,
      agenda: [
        { time: time.split("-")[0] || "09:00 AM", topic: "Opening Address & Keynote", presenter: hostSpeaker.name },
        { time: "Interactive Panel", topic: "Advocacy & Strategic Q&A", presenter: "Panellists" }
      ],
      status: "Upcoming",
      createdBy: firmUser?.id || "admin"
    });

    setLoading(false);
    onCreated(created);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-950 border-2 border-yellow-500 shadow-2xl overflow-hidden text-white">
        <div className="bg-neutral-900 p-6 border-b border-yellow-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h3 className="text-xl font-extrabold uppercase tracking-wide text-white">
              Host New Firm Event / Symposium
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2026 East Africa Corporate Law & Tax Summit"
              className="w-full bg-neutral-900 border border-white/20 focus:border-yellow-500 text-white px-4 py-2.5 text-sm focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-neutral-900 border border-white/20 focus:border-yellow-500 text-white px-4 py-2.5 text-sm focus:outline-none"
              >
                <option value="Keynote & Summit">Keynote & Summit</option>
                <option value="CLE & Workshop">CLE & Masterclass</option>
                <option value="Symposium">Symposium</option>
                <option value="Community & Pro Bono">Community & Pro Bono</option>
                <option value="Special Lecture">Special Lecture</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300 mb-1">
                CPD Units / Accreditation
              </label>
              <input
                type="text"
                value={cpdCredits}
                onChange={(e) => setCpdCredits(e.target.value)}
                placeholder="e.g. 3.0 LSK CPD Units"
                className="w-full bg-neutral-900 border border-white/20 focus:border-yellow-500 text-white px-4 py-2.5 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-neutral-900 border border-white/20 focus:border-yellow-500 text-white px-4 py-2.5 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300 mb-1">
                Time Window *
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 09:00 AM - 04:00 PM EAT"
                className="w-full bg-neutral-900 border border-white/20 focus:border-yellow-500 text-white px-4 py-2.5 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300 mb-1">
              Venue / Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Supreme Court Conference Hall & Virtual"
              className="w-full bg-neutral-900 border border-white/20 focus:border-yellow-500 text-white px-4 py-2.5 text-sm focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-3 py-1">
            <input
              type="checkbox"
              id="isVirtual"
              checked={isVirtual}
              onChange={(e) => setIsVirtual(e.target.checked)}
              className="w-4 h-4 accent-yellow-500"
            />
            <label htmlFor="isVirtual" className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Includes Live Virtual Broadcast Stream
            </label>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300 mb-1">
              Banner Image URL
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full bg-neutral-900 border border-white/20 focus:border-yellow-500 text-white px-4 py-2.5 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300 mb-1">
              Short Overview
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary shown on cards..."
              className="w-full bg-neutral-900 border border-white/20 focus:border-yellow-500 text-white px-4 py-2 text-sm focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300 mb-1">
              Detailed Agenda & Agenda Description
            </label>
            <textarea
              rows={4}
              value={fullDetails}
              onChange={(e) => setFullDetails(e.target.value)}
              placeholder="Comprehensive agenda breakdown, panel topics, and key takeaways..."
              className="w-full bg-neutral-900 border border-white/20 focus:border-yellow-500 text-white px-4 py-2 text-sm focus:outline-none resize-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
