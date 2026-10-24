import { useState } from "react";
import { CalendarDays, Clock, ImageOff, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate, formatTimeRange } from "@/lib/format";

/*
 * FE 51 Shared EventCard (Student Home and Browse Events).
 *
 * Props
 *   event       EventSummaryResponse: { id, title, category, imageUrl, imageAlt?, dateTime,
 *               endDateTime?, venueName, description? }
 *   to          optional; defaults to /student/events/{id}
 *   actionLabel optional; defaults to "View Details"
 *
 * Formatting rule: the card receives raw ISO 8601 values and formats them with lib/format
 * (en-ZA, no timezone guessing). It never makes a booking request; it only navigates.
 * Every card has the same image height, so a missing or broken image never shifts the layout.
 */
export default function EventCard({ event, to, actionLabel = "View Details" }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(event.imageUrl) && !imageFailed;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-44 shrink-0 bg-gradient-to-br from-slate-700 to-slate-900">
        {showImage ? (
          <img
            src={event.imageUrl}
            alt={event.imageAlt || `Photo for ${event.title}`}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div role="img" aria-label="No image available" className="grid h-full place-items-center text-white/60">
            <ImageOff size={32} aria-hidden="true" />
          </div>
        )}
        {event.category && (
          <span className="absolute left-3 top-3 rounded-md bg-white px-3 py-1 text-sm font-medium text-[#0072bc] shadow-sm">
            {event.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-semibold leading-7 text-slate-950">{event.title}</h3>
        <ul className="mt-3 space-y-1.5 text-slate-600">
          <li className="flex items-center gap-2.5">
            <CalendarDays size={18} className="shrink-0 text-slate-400" aria-hidden="true" />
            {formatDate(event.dateTime)}
          </li>
          <li className="flex items-center gap-2.5">
            <Clock size={18} className="shrink-0 text-slate-400" aria-hidden="true" />
            {formatTimeRange(event.dateTime, event.endDateTime) || "Time to be confirmed"}
          </li>
          <li className="flex items-center gap-2.5">
            <MapPin size={18} className="shrink-0 text-slate-400" aria-hidden="true" />
            <span className="line-clamp-1">{event.venueName || "Venue to be confirmed"}</span>
          </li>
        </ul>
        <p className="mt-3 line-clamp-2 min-h-[3rem] text-slate-500">{event.description}</p>

        <div className="mt-auto border-t border-slate-100 pt-4">
          <Link
            to={to ?? `/student/events/${event.id}`}
            className="block rounded-lg bg-[#0072bc] px-4 py-3 text-center font-semibold text-white hover:bg-[#005f9e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0072bc]"
          >
            {actionLabel}
            <span className="sr-only">: {event.title}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}