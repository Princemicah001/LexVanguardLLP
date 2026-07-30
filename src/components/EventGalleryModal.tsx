import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Download, Calendar, MapPin, Image as ImageIcon } from "lucide-react";
import type { FirmEvent } from "@/lib/events-store";

interface EventGalleryModalProps {
  event: FirmEvent;
  onClose: () => void;
}

const DEFAULT_GALLERY_PHOTOS = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80"
];

export function EventGalleryModal({ event, onClose }: EventGalleryModalProps) {
  const images = (event.gallery && event.gallery.length > 0) ? event.gallery : [event.image, ...DEFAULT_GALLERY_PHOTOS];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentImg = images[selectedIndex] || event.image;

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white border border-neutral-300 shadow-2xl rounded-2xl overflow-hidden text-black flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-black text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-neutral-800">
          <div className="flex items-center space-x-3">
            <span className="bg-white text-black text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-xs">
              Past Event Gallery
            </span>
            <h3 className="text-base sm:text-lg font-bold truncate max-w-md sm:max-w-xl text-white">
              {event.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 transition-colors cursor-pointer"
            title="Close Gallery"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-white">
          
          {/* Metadata bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200 text-xs text-neutral-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center font-medium">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-black" />
                {event.displayDate}
              </span>
              <span className="flex items-center font-medium">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-black" />
                {event.location}
              </span>
            </div>
            <span className="font-mono text-xs uppercase tracking-wider text-black font-bold">
              Photo {selectedIndex + 1} of {images.length}
            </span>
          </div>

          {/* Main Stage Display */}
          <div className="relative w-full aspect-[16/9] max-h-[460px] bg-neutral-950 rounded-xl overflow-hidden group flex items-center justify-center border border-neutral-200">
            <img
              src={currentImg}
              alt={`${event.title} photo ${selectedIndex + 1}`}
              className="w-full h-full object-contain"
            />

            {/* Previous Button */}
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2.5 rounded-full border border-neutral-700 transition-all cursor-pointer opacity-90 group-hover:opacity-100"
              title="Previous Photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2.5 rounded-full border border-neutral-700 transition-all cursor-pointer opacity-90 group-hover:opacity-100"
              title="Next Photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Download Link */}
            <a
              href={currentImg}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="absolute bottom-3 right-3 bg-black/80 hover:bg-black text-white text-xs px-3 py-1.5 rounded-md border border-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> High-Res
            </a>
          </div>

          {/* Thumbnails Row */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-black" /> Event Photo Highlights
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedIndex === idx
                      ? "border-black ring-2 ring-black/20 scale-95"
                      : "border-neutral-200 hover:border-neutral-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Description / Summary */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-1">
              Event Retrospective
            </h4>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
              {event.fullDetails || event.description}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-black hover:bg-neutral-800 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close Gallery
          </button>
        </div>

      </div>
    </div>
  );
}
