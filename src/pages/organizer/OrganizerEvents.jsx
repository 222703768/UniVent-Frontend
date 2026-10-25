import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CircleAlert, Clock3, Plus, RefreshCw, Users } from "lucide-react";
import { cancelEvent } from "../../api/events";
import { getMyEvents } from "../../api/organizers";
import { formatDate } from "../../lib/format";
import StatusBadge from "../../components/shared/StatusBadge";

const asList = (data) => Array.isArray(data) ? data : data?.content ?? data?.events ?? [];

function Metric({ label, value, detail, icon: Icon }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div><span className="rounded-lg bg-slate-100 p-2.5 text-slate-600"><Icon size={19} /></span></div></article>;
}

export default function OrganizerEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadEvents = useCallback(async () => {
    setLoading(true); setError("");
    try { setEvents(asList(await getMyEvents())); }
    catch (requestError) { setError(requestError.response?.data?.message || "Your events could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    // Fetching the organizer's events synchronizes this screen with the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEvents();
  }, [loadEvents]);

  const summary = useMemo(() => ({
    active: events.filter((event) => ["APPROVED", "UPCOMING", "ONGOING"].includes(event.status)).length,
    pending: events.filter((event) => ["PENDING", "PENDING_APPROVAL"].includes(event.status)).length,
    attendees: events.reduce((total, event) => total + Number(event.registrationCount ?? event.attendeeCount ?? 0), 0),
  }), [events]);

  const cancel = async (event) => {
    if (!window.confirm(`Cancel “${event.title}”?`)) return;
    setBusyId(event.id); setError("");
    try { await cancelEvent(event.id); await loadEvents(); }
    catch (requestError) { setError(requestError.response?.data?.message || "This event could not be cancelled."); }
    finally { setBusyId(null); }
  };

  return (
    <main className="min-h-[calc(100vh-140px)] bg-[#f7f7f8] px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-slate-500">Organizer workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight">My events</h1><p className="mt-2 text-slate-600">Manage your events and track registration activity.</p></div><Link to="/organizer/events/create" className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800"><Plus size={17} />Create event</Link></header>
        {error && <div role="alert" className="mb-5 flex flex-wrap items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><CircleAlert size={18} />{error}<button onClick={loadEvents} className="ml-auto inline-flex items-center gap-1 font-semibold"><RefreshCw size={15} />Retry</button></div>}
        <section aria-label="Event metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Active events" value={loading ? "…" : summary.active} detail="Approved and upcoming" icon={CalendarDays} /><Metric label="Total events" value={loading ? "…" : events.length} detail="In your event list" icon={CalendarDays} /><Metric label="Pending approvals" value={loading ? "…" : summary.pending} detail="Submitted for review" icon={Clock3} /><Metric label="Registrations" value={loading ? "…" : summary.attendees || "—"} detail={summary.attendees ? "Across the events shown" : "No registration totals reported"} icon={Users} /></section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Your events</h2><p className="mt-1 text-sm text-slate-500">Status and schedule from your account</p></div><button onClick={loadEvents} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={15} />Refresh</button></div>
          <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-y border-slate-100 text-xs uppercase tracking-wide text-slate-500"><th className="px-3 py-3 font-semibold">Event</th><th className="px-3 py-3 font-semibold">Category</th><th className="px-3 py-3 font-semibold">Date</th><th className="px-3 py-3 font-semibold">Registrations</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-3 py-3 font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">
            {!loading && events.map((event) => <tr key={event.id} className="hover:bg-slate-50"><td className="px-3 py-4"><div className="font-semibold">{event.title}</div><div className="mt-1 max-w-64 truncate text-xs text-slate-500">{event.venueName ?? event.venue?.name ?? "Venue not set"}</div></td><td className="px-3 py-4">{event.category ?? "—"}</td><td className="px-3 py-4">{formatDate(event.dateTime) || "—"}</td><td className="px-3 py-4">{event.registrationCount ?? event.attendeeCount ?? "—"}{event.capacity ? ` / ${event.capacity}` : ""}</td><td className="px-3 py-4"><StatusBadge status={event.status} className="text-xs" /></td><td className="px-3 py-4"><div className="flex gap-2"><Link to={`/organizer/events/${event.id}/registrations`} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-100">Attendees</Link><Link to={`/organizer/events/${event.id}/edit`} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-100">Edit</Link>{event.status !== "CANCELLED" && <button onClick={() => cancel(event)} disabled={busyId === event.id} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">{busyId === event.id ? "Cancelling…" : "Cancel"}</button>}</div></td></tr>)}
            {loading && <tr><td colSpan="6" className="px-3 py-16 text-center text-slate-500">Loading your events…</td></tr>}
            {!loading && events.length === 0 && <tr><td colSpan="6" className="px-3 py-16 text-center"><CalendarDays className="mx-auto mb-3 text-slate-400" /><p className="font-semibold">No events to show yet</p><p className="mt-1 text-sm text-slate-500">Create an event to get started. Your data will appear here.</p></td></tr>}
          </tbody></table></div>
        </section>
      </div>
    </main>
  );
}
