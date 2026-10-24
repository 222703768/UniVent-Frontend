import { useCallback, useEffect, useState } from "react";
import { CalendarX, CircleAlert, RefreshCw } from "lucide-react";
import { getEvents } from "@/api/events";
import EventCard from "@/components/shared/EventCard";

export default function StudentEventFeed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getEvents();
      setEvents(Array.isArray(response) ? response : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "We could not load the available events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Loading remote event data is the synchronization performed by this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEvents();
  }, [loadEvents]);

  return (
    <main className="bg-[#f7f6f4] px-5 py-10 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Browse events</h1>
          <p className="mt-2 text-slate-600">
            {loading ? "Loading available events..." : `${events.length} event${events.length === 1 ? "" : "s"} available`}
          </p>
        </header>

        {error && (
          <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-800">
            <span className="flex items-center gap-3"><CircleAlert size={20} />{error}</span>
            <button type="button" onClick={loadEvents} className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 font-semibold">
              <RefreshCw size={17} /> Try again
            </button>
          </div>
        )}

        {loading ? (
          <section aria-label="Loading events" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-[28rem] animate-pulse rounded-xl bg-white shadow-sm" />)}
          </section>
        ) : !error && events.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <CalendarX className="mx-auto text-slate-400" size={46} />
            <h2 className="mt-5 text-xl font-bold">No events available yet</h2>
            <p className="mt-2 text-slate-600">Approved events will appear here when organizers publish them.</p>
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => <EventCard key={event.id} event={event} />)}
          </section>
        )}
      </div>
    </main>
  );
}
