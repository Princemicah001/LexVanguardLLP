import { useState } from "react";
import { X, Calendar, MapPin, Clock, CheckCircle2, User, Mail, Building2, Download, ExternalLink } from "lucide-react";
import { rsvpToEvent, generateIcsCalendar, isUserRegisteredForEvent, type FirmEvent } from "@/lib/events-store";

interface RsvpModalProps {
  event: FirmEvent;
  onClose: () => void;
}

export function RsvpModal({ event, onClose }: RsvpModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    phone: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(() => isUserRegisteredForEvent(event.id, ""));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setLoading(true);
    await rsvpToEvent(event.id, formData);
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-950 border-2 border-yellow-500 shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-900 via-black to-neutral-900 p-6 border-b border-yellow-500/30 flex items-start justify-between">
          <div>
            <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 inline-block mb-2">
              {event.category}
            </span>
            <h3 className="text-xl font-extrabold text-white leading-snug">
              {event.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 transition-colors bg-transparent border-none cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Quick Details Bar */}
          <div className="bg-neutral-900/80 border border-white/10 p-4 mb-6 space-y-2 text-xs text-gray-300">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-yellow-500 mr-2 shrink-0" />
              <span className="font-bold text-white">{event.displayDate}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-yellow-500 mr-2 shrink-0" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-yellow-500 mr-2 shrink-0" />
              <span>{event.location}</span>
            </div>
          </div>

          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-yellow-500 mx-auto" />
              <h4 className="text-2xl font-bold uppercase tracking-wide text-white">
                RSVP Confirmed
              </h4>
              <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                Thank you for registering. An event confirmation ticket and instructions have been reserved under <span className="text-yellow-500 font-semibold">{formData.email || "your email"}</span>.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={generateIcsCalendar(event)}
                  download={`${event.title.replace(/\s+/g, "_")}.ics`}
                  className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download .ICS Ticket
                </a>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto border border-white/20 hover:border-white text-white px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300 mb-1.5">
                  Full Name <span className="text-yellow-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Adv. Jane Doe"
                    className="w-full bg-neutral-900 border border-white/20 focus:border-yellow-500 text-white pl-10 pr-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300 mb-1.5">
                  Official Email Address <span className="text-yellow-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. jane.doe@lawfirm.com"
                    className="w-full bg-neutral-900 border border-white/20 focus:border-yellow-500 text-white pl-10 pr-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300 mb-1.5">
                    Organization / Institution
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="e.g. Law Society / University"
                      className="w-full bg-neutral-900 border border-white/20 focus:border-yellow-500 text-white pl-10 pr-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+254 700 000 000"
                    className="w-full bg-neutral-900 border border-white/20 focus:border-yellow-500 text-white px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300 mb-1.5">
                  Special Accessibility or Dietary Requirements
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional requests for physical or virtual attendance..."
                  className="w-full bg-neutral-900 border border-white/20 focus:border-yellow-500 text-white px-4 py-2 text-sm focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white bg-transparent border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer shadow-lg shadow-yellow-500/20 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Confirm RSVP"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
