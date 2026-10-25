import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight, CalendarDays, CircleAlert, RefreshCw, Users } from "lucide-react";
import { getAdminEvents, getStats } from "../../api/admin";
import { approveEvent } from "../../api/events";
import StatusBadge from "../../components/shared/StatusBadge";

const listFrom = (value) => Array.isArray(value) ? value : value?.content ?? value?.events ?? [];
const firstNumber = (...values) => values.find((value) => Number.isFinite(Number(value)) && value !== null && value !== "") ?? null;

function Metric({ label, value, note, icon: Icon }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value ?? "—"}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div>
        <span className="rounded-lg bg-slate-100 p-2.5 text-slate-600"><Icon size={19} /></span>
      </div>
    </article>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const [statsResult, eventsResult] = await Promise.allSettled([getStats(), getAdminEvents("PENDING_APPROVAL")]);
    if (statsResult.status === "fulfilled") setStats(statsResult.value);
    if (eventsResult.status === "fulfilled") setPendingEvents(listFrom(eventsResult.value));
    const failed = [statsResult, eventsResult].find((result) => result.status === "rejected");
    if (failed) setError(failed.reason?.response?.data?.message || "Some dashboard information could not be loaded.");
    setLoading(false);
  }, []);

  useEffect(() => {
    // Fetching dashboard data synchronizes this page with the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const approve = async (eventId) => {
    setWorkingId(eventId); setError("");
    try { await approveEvent(eventId); await load(); }
    catch (requestError) { setError(requestError.response?.data?.message || "This event could not be approved."); }
    finally { setWorkingId(null); }
  };

  const users = firstNumber(stats?.registeredUsers, stats?.totalUsers, stats?.userCount);
  const events = firstNumber(stats?.eventsThisSemester, stats?.totalEvents, stats?.eventCount);
  const approvals = firstNumber(stats?.pendingApprovals, stats?.pendingEvents, pendingEvents.length);
  const uptime = firstNumber(stats?.uptime, stats?.uptimePercent);

  return (
    <main className="min-h-[calc(100vh-140px)] bg-[#f7f7f8] px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm text-slate-500">System overview · ICT Services</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Administrator dashboard</h1></div>
          <Link to="/admin/events" className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800">Manage events <ArrowRight size={16} /></Link>
        </header>

        {error && <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><span className="flex items-center gap-2"><CircleAlert size={18} />{error}</span><button onClick={load} className="inline-flex items-center gap-2 font-semibold"><RefreshCw size={15} /> Retry</button></div>}

        <section aria-label="Platform metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Registered users" value={loading ? "…" : users?.toLocaleString() ?? "—"} note="Current platform accounts" icon={Users} />
          <Metric label="Events this semester" value={loading ? "…" : events?.toLocaleString() ?? "—"} note="Events in the system" icon={CalendarDays} />
          <Metric label="Pending approvals" value={loading ? "…" : approvals?.toLocaleString() ?? "—"} note="Awaiting administrator review" icon={Activity} />
          <Metric label="System uptime" value={uptime == null ? "—" : `${uptime}%`} note="Reported by the service" icon={Activity} />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between"><div><h2 className="text-lg font-bold">Platform activity</h2><p className="mt-1 text-sm text-slate-500">Monthly figures from the admin service</p></div><Activity className="text-slate-400" size={20} /></div>
            {Array.isArray(stats?.monthlyActivity) && stats.monthlyActivity.length > 0 ? (
              <div className="mt-8 flex h-56 items-end gap-3 border-b border-l border-slate-200 px-3">
                {stats.monthlyActivity.map((point, index) => { const value = Number(point.count ?? point.value ?? 0); const max = Math.max(...stats.monthlyActivity.map((item) => Number(item.count ?? item.value ?? 0)), 1); return <div key={point.month ?? index} className="flex h-full min-w-0 flex-1 flex-col justify-end text-center"><span className="mb-2 text-xs text-slate-500">{value.toLocaleString()}</span><div className="mx-auto w-full max-w-12 rounded-t bg-sky-600" style={{ height: `${Math.max(4, (value / max) * 72)}%` }} /><span className="mt-2 truncate text-xs text-slate-500">{point.month ?? point.label ?? ""}</span></div>; })}
              </div>
            ) : <div className="mt-6 grid min-h-56 place-items-center rounded-lg bg-slate-50 px-6 text-center text-sm text-slate-500">Monthly activity data will appear here when the service provides it.</div>}
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-bold">Events awaiting approval</h2><p className="mt-1 text-sm text-slate-500">Review submitted events</p></div><Link to="/admin/events" className="text-sm font-semibold text-sky-700 hover:underline">View all</Link></div>
            {pendingEvents.length === 0 ? <p className="rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">{loading ? "Loading pending events…" : "No events are waiting for approval."}</p> : <ul className="divide-y divide-slate-100">{pendingEvents.slice(0, 5).map((event) => <li key={event.id} className="py-4 first:pt-0 last:pb-0"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-semibold">{event.title}</p><p className="mt-1 text-xs text-slate-500">{event.organizerName ?? event.organizer?.name ?? event.organizingDepartment ?? "Organizer"}</p></div><StatusBadge status={event.status ?? "PENDING_APPROVAL"} className="text-xs" /></div><button onClick={() => approve(event.id)} disabled={workingId === event.id} className="mt-3 rounded-md bg-sky-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50">{workingId === event.id ? "Approving…" : "Approve event"}</button></li>)}</ul>}
          </article>
        </section>
      </div>
    </main>
  );
}
