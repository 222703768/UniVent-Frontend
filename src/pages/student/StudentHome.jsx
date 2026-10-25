import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Award, Bell, CalendarCheck, CalendarDays, Ticket } from "lucide-react";
import { getMyBookings } from "@/api/bookings";
import { getEvents } from "@/api/events";
import { getNotifications } from "@/api/notifications";
import { getCurrentUser } from "@/api/users";
import AppShell from "@/components/AppShell";
import EmptyState from "@/components/EmptyState";
import EventCard from "@/components/EventCard";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/apiError";
import { demoBookings, demoEvents, demoNotifications, demoProfile } from "@/lib/demoData";
import { formatDate, formatTimeRange, relativeTime } from "@/lib/format";


const DEMO = import.meta.env.DEV && new URLSearchParams(window.location.search).get("demo") === "1";

const asList = (r) => (Array.isArray(r) ? r : r?.content ?? []);

const fetchEvents = () => getEvents({ status: "APPROVED", sort: "dateTime", size: 4 }).then(asList);
const fetchNotifications = () => getNotifications({ size: 3 }).then(asList);
const fetchBookings = () => getMyBookings().then(asList);

const EMPTY_LIST = [];
const EMPTY_OBJECT = {};

function useLoad(fetcher, fallbackMessage, demoValue, emptyValue = EMPTY_LIST) {
  const [state, setState] = useState(() =>
    DEMO ? { loading: false, data: demoValue, error: "" } : { loading: true, data: null, error: "" },
  );

  useEffect(() => {
    if (DEMO) return undefined;
    let active = true;
    fetcher()
      .then((data) => active && setState({ loading: false, data, error: "" }))
      .catch((e) => {
        if (!active) return;
        // DEV only: backend offline (no server response) is treated as "no data yet",
        // so the empty states show instead of red errors. Delete before the PR.
        if (import.meta.env.DEV && !e.response) {
          setState({ loading: false, data: emptyValue, error: "" });
        } else {
          setState({ loading: false, data: null, error: getApiErrorMessage(e, fallbackMessage) });
        }
      });
    return () => {
      active = false;
    };
  }, [fetcher, fallbackMessage, emptyValue]);

  return state;
}

const cardClass = "rounded-xl border border-slate-200 bg-white shadow-sm";

function ErrorNote({ children }) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, Icon, loading }) {
  return (
    <div className={`${cardClass} flex items-start justify-between p-6`}>
      <div>
        <p className="text-slate-500">{label}</p>
        {loading ? (
          <div className="mt-2 h-9 w-12 animate-pulse rounded bg-slate-100" />
        ) : (
          <p className="mt-1 text-4xl font-semibold">{value}</p>
        )}
        <p className="mt-2 text-slate-500">{loading ? " " : sub}</p>
      </div>
      <span className="grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-600" aria-hidden="true">
        <Icon size={22} />
      </span>
    </div>
  );
}

function StatusPill({ status }) {
  const waitlisted = status === "WAITLISTED";
  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 text-sm font-medium ${
        waitlisted ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-300 bg-slate-100 text-slate-700"
      }`}
    >
      {waitlisted ? "Waitlisted" : "Registered"}
    </span>
  );
}

export default function StudentHome() {
  const { user } = useAuth();
  const events = useLoad(fetchEvents, "We could not load recommended events.", demoEvents);
  const notes = useLoad(fetchNotifications, "We could not load notifications.", demoNotifications);
  const bookings = useLoad(fetchBookings, "We could not load your registrations.", demoBookings);
  const profile = useLoad(getCurrentUser, "", demoProfile, EMPTY_OBJECT);

  const firstName = user?.name?.split(" ")[0];
  const unread = notes.data ? notes.data.filter((n) => !n.read).length : 0;

  const stats = useMemo(() => {
    const list = (bookings.data || []).filter((b) => b.status !== "CANCELLED");
    const now = Date.now();
    const when = (b) => Date.parse(b.event?.dateTime);
    const upcoming = list.filter((b) => when(b) >= now).sort((a, b) => when(a) - when(b));
    const month = new Date().getMonth();
    return {
      registered: list.length,
      thisMonth: upcoming.filter((b) => new Date(when(b)).getMonth() === month).length,
      attended: list.filter((b) => when(b) < now).length,
      upcoming: upcoming.slice(0, 3),
    };
  }, [bookings.data]);

  const faculty = profile.data?.faculty;
  const points = profile.data?.participationPoints;

  return (
    <AppShell unreadOverride={DEMO ? unread : undefined}>
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
            </h1>
            <p className="mt-1 text-slate-500">Semester 2, 2026{faculty ? ` · Faculty of ${faculty}` : ""}</p>
          </div>
          <Link
            to="/student/events"
            className="rounded-lg bg-[#0072bc] px-6 py-3 font-semibold text-white hover:bg-[#005f9e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0072bc]"
          >
            Browse events
          </Link>
        </header>

        <section aria-label="Your summary" className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Registered events"
            value={stats.registered}
            sub={stats.registered === 0 ? "No registrations yet" : `${stats.thisMonth} upcoming this month`}
            Icon={Ticket}
            loading={bookings.loading}
          />
          <StatCard
            label="Events attended"
            value={stats.attended}
            sub={stats.attended === 0 ? "No events attended yet" : "Completed events"}
            Icon={CalendarCheck}
            loading={bookings.loading}
          />
          <StatCard
            label="Unread notifications"
            value={unread}
            sub={
              notes.data?.[0]
                ? `Last update ${relativeTime(notes.data[0].createdAt).toLowerCase()}`
                : "No notifications yet"
            }
            Icon={Bell}
            loading={notes.loading}
          />
          <StatCard
            label="Participation points"
            value={points ?? "–"}
            sub={points == null ? "Not available yet" : "Keep attending to earn more"}
            Icon={Award}
            loading={profile.loading}
          />
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section aria-labelledby="recommended-heading">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="recommended-heading" className="text-xl font-semibold">
                Recommended for you
              </h2>
              <Link to="/student/events" className="inline-flex items-center gap-1 font-medium text-[#0072bc] hover:underline">
                View all <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            {events.loading && (
              <div className="grid animate-pulse gap-5 sm:grid-cols-2" aria-busy="true">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-96 rounded-xl bg-white" />
                ))}
              </div>
            )}
            {events.error && <ErrorNote>{events.error}</ErrorNote>}
            {events.data?.length === 0 && (
              <EmptyState
                icon={CalendarDays}
                title="No events yet"
                message="Events will appear here once they are added."
                action={{ label: "Browse events", to: "/student/events" }}
              />
            )}
            {events.data?.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2">
                {events.data.map((event) => (
                  <EventCard key={event.id} event={event} to={`/student/events/${event.id}`} actionLabel="View Details" />
                ))}
              </div>
            )}
          </section>

          <div className="space-y-6">
            <section aria-labelledby="upcoming-heading" className={cardClass}>
              <h2 id="upcoming-heading" className="border-b border-slate-100 px-6 py-5 text-xl font-semibold">
                Your upcoming events
              </h2>
              {bookings.loading && <div className="m-6 h-32 animate-pulse rounded bg-slate-100" aria-busy="true" />}
              {bookings.error && (
                <div className="p-4">
                  <ErrorNote>{bookings.error}</ErrorNote>
                </div>
              )}
              {bookings.data && stats.upcoming.length === 0 && (
                <p className="px-6 py-8 text-slate-500">No upcoming events yet.</p>
              )}
              <ul className="divide-y divide-slate-100">
                {stats.upcoming.map((b) => (
                  <li key={b.id} className="flex items-start justify-between gap-3 px-6 py-4">
                    <div className="min-w-0">
                      <p className="font-medium">{b.event?.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDate(b.event?.dateTime).replace(/^\w+,?\s/, "")} ·{" "}
                        {formatTimeRange(b.event?.dateTime, b.event?.endDateTime)}
                      </p>
                    </div>
                    <StatusPill status={b.status} />
                  </li>
                ))}
              </ul>
              <div className="border-t border-slate-100 px-6 py-4">
                <Link to="/student/my-events" className="font-medium text-[#0072bc] hover:underline">
                  Manage my events
                </Link>
              </div>
            </section>

            <section aria-labelledby="recent-heading" className={cardClass}>
              <h2 id="recent-heading" className="border-b border-slate-100 px-6 py-5 text-xl font-semibold">
                Recent notifications
              </h2>
              {notes.loading && <div className="m-6 h-32 animate-pulse rounded bg-slate-100" aria-busy="true" />}
              {notes.error && (
                <div className="p-4">
                  <ErrorNote>{notes.error}</ErrorNote>
                </div>
              )}
              {notes.data?.length === 0 && <p className="px-6 py-8 text-slate-500">No notifications yet.</p>}
              <ul className="divide-y divide-slate-100">
                {notes.data?.slice(0, 3).map((n) => (
                  <li key={n.id} className="px-6 py-4">
                    <p className="font-medium">{n.title}</p>
                    <p className="mt-1 text-slate-500">{n.message}</p>
                    <p className="mt-1 text-sm text-slate-400">{relativeTime(n.createdAt)}</p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-slate-100 px-6 py-4">
                <Link to="/student/notifications" className="font-medium text-[#0072bc] hover:underline">
                  See all notifications
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
