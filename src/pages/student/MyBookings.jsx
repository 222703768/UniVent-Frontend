import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { cancelBooking, getMyBookings } from "@/api/bookings";
import AppShell from "@/components/AppShell";
import EmptyState from "@/components/EmptyState";
import { getApiErrorMessage } from "@/lib/apiError";
import { demoBookings } from "@/lib/demoData";
import { formatDate, formatTimeRange } from "@/lib/format";

// SMOKE TEST ONLY (dev builds). Delete before the PR.
//   ?demo=1      -> populated tabs (uses demoBookings)
//   ?demo=empty  -> new student, every tab empty
const DEMO_PARAM = import.meta.env.DEV ? new URLSearchParams(window.location.search).get("demo") : null;
const DEMO = DEMO_PARAM === "1" || DEMO_PARAM === "empty";

const asList = (r) => (Array.isArray(r) ? r : r?.content ?? []);

const TABS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
];

const EMPTY_COPY = {
  upcoming: {
    title: "No upcoming events",
    message: "You haven't registered for any events yet. Find something to attend.",
  },
  past: {
    title: "No past events",
    message: "Events you have attended will show up here.",
  },
  cancelled: {
    title: "No cancelled registrations",
    message: "Registrations you cancel will show up here.",
  },
};

const cardClass = "rounded-xl border border-slate-200 bg-white shadow-sm";
const outlineBtn =
  "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0072bc]";

const whenOf = (b) => Date.parse(b.event?.dateTime);
const isCancelled = (b) => b.status === "CANCELLED";

function StatusPill({ status }) {
  const styles = {
    WAITLISTED: ["Waitlisted", "border-amber-200 bg-amber-50 text-amber-700"],
    CANCELLED: ["Cancelled", "border-red-200 bg-red-50 text-red-700"],
  };
  const [label, cls] = styles[status] ?? ["Registered", "border-slate-300 bg-slate-100 text-slate-700"];
  return <span className={`shrink-0 rounded-full border px-3 py-1 text-sm font-medium ${cls}`}>{label}</span>;
}

function ConfirmCancel({ booking, busy, error, onKeep, onConfirm }) {
  // Close on Escape unless a request is in flight.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !busy && onKeep();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onKeep]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancel-title"
        aria-describedby="cancel-desc"
        className={`${cardClass} w-full max-w-md p-6`}
      >
        <h2 id="cancel-title" className="text-xl font-semibold">
          Cancel this registration?
        </h2>
        <p id="cancel-desc" className="mt-2 text-slate-600">
          You will lose your {booking.status === "WAITLISTED" ? "place on the waitlist" : "spot"} for{" "}
          <span className="font-medium text-slate-900">{booking.event?.title}</span>. This can't be undone.
        </p>
        {error && (
          <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onKeep} disabled={busy} className={outlineBtn}>
            Keep registration
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            {busy ? "Cancelling…" : "Cancel registration"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingRow({ booking, tab, onCancel }) {
  const navigate = useNavigate();
  const ev = booking.event ?? {};
  const ref = booking.ticketReference ?? booking.bookingReference;
  const dateText = ev.dateTime ? formatDate(ev.dateTime).replace(/^\w+,?\s/, "") : "";
  const timeText = ev.dateTime ? formatTimeRange(ev.dateTime, ev.endDateTime) : "";
  const details = [dateText, timeText, ev.venue ?? ev.location].filter(Boolean).join(" · ");

  return (
    <li className={`${cardClass} flex flex-col gap-4 p-5 sm:flex-row sm:p-6`}>
      {ev.imageUrl ? (
        <img
          src={ev.imageUrl}
          alt=""
          className="h-32 w-full shrink-0 rounded-lg object-cover sm:h-[118px] sm:w-[198px]"
        />
      ) : (
        <div
          aria-hidden="true"
          className="grid h-32 w-full shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-400 sm:h-[118px] sm:w-[198px]"
        >
          <CalendarDays size={32} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold">{ev.title}</h3>
          <StatusPill status={booking.status} />
        </div>
        <p className="mt-2 text-slate-500">{details}</p>
        {ref && (
          <p className="mt-1 text-sm text-slate-500">
            Ticket reference: <span className="font-mono">{ref}</span>
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {ev.id != null && (
            <Link to={`/student/events/${ev.id}`} className={outlineBtn}>
              View details
            </Link>
          )}
          {tab !== "cancelled" && (
            <button type="button" className={outlineBtn} onClick={() => navigate(`/student/tickets/${booking.id}`)}>
              Download ticket
            </button>
          )}
          {tab === "upcoming" && (
            <button
              type="button"
              onClick={() => onCancel(booking)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Cancel registration
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

export default function MyEvents() {
  const [tab, setTab] = useState("upcoming");
  const [state, setState] = useState(() =>
    DEMO
      ? { loading: false, error: "", bookings: DEMO_PARAM === "1" ? demoBookings : [] }
      : { loading: true, error: "", bookings: [] },
  );
  const [pending, setPending] = useState(null); // booking awaiting cancel confirmation
  const [busy, setBusy] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    if (DEMO) return undefined;
    let active = true;
    getMyBookings()
      .then((r) => active && setState({ loading: false, error: "", bookings: asList(r) }))
      .catch((e) => {
        if (!active) return;
        // DEV only: backend offline is treated as "no bookings yet". Delete before the PR.
        if (import.meta.env.DEV && !e.response) {
          setState({ loading: false, error: "", bookings: [] });
        } else {
          setState({
            loading: false,
            error: getApiErrorMessage(e, "We could not load your events."),
            bookings: [],
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const groups = useMemo(() => {
    const now = Date.now();
    const live = state.bookings.filter((b) => !isCancelled(b));
    return {
      upcoming: live.filter((b) => whenOf(b) >= now).sort((a, b) => whenOf(a) - whenOf(b)),
      past: live.filter((b) => whenOf(b) < now).sort((a, b) => whenOf(b) - whenOf(a)),
      cancelled: state.bookings.filter(isCancelled),
    };
  }, [state.bookings]);

  const list = groups[tab];

  const closeDialog = () => {
    setPending(null);
    setCancelError("");
  };

  const confirmCancel = async () => {
    if (!pending) return;
    setBusy(true);
    setCancelError("");
    try {
      if (!DEMO) await cancelBooking(pending.bookingReference);
      // Update local state so the row moves to Cancelled without a reload.
      setState((s) => ({
        ...s,
        bookings: s.bookings.map((b) => (b.id === pending.id ? { ...b, status: "CANCELLED" } : b)),
      }));
      closeDialog();
    } catch (e) {
      setCancelError(getApiErrorMessage(e, "We could not cancel this registration. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">My events</h1>
          <p className="mt-1 text-slate-500">Registrations, tickets and attendance history</p>
        </header>

        <div role="tablist" aria-label="My events" className="mt-8 flex gap-8 border-b border-slate-200 px-2">
          {TABS.map(({ id, label }) => {
            const selected = tab === id;
            return (
              <button
                key={id}
                id={`tab-${id}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls="my-events-panel"
                onClick={() => setTab(id)}
                className={`-mb-px border-b-2 px-2 pb-3 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0072bc] ${
                  selected
                    ? "border-[#0072bc] text-[#0072bc]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <section id="my-events-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-6">
          {state.loading && (
            <div className="space-y-4 animate-pulse" aria-busy="true">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 rounded-xl bg-white" />
              ))}
            </div>
          )}

          {state.error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {state.error}
            </div>
          )}

          {!state.loading && !state.error && list.length === 0 && (
            <EmptyState
              icon={CalendarDays}
              title={EMPTY_COPY[tab].title}
              message={EMPTY_COPY[tab].message}
              action={{ label: "Browse events", to: "/student/events" }}
            />
          )}

          {list.length > 0 && (
            <ul className="space-y-4">
              {list.map((b) => (
                <BookingRow key={b.id} booking={b} tab={tab} onCancel={setPending} />
              ))}
            </ul>
          )}
        </section>
      </main>

      {pending && (
        <ConfirmCancel booking={pending} busy={busy} error={cancelError} onKeep={closeDialog} onConfirm={confirmCancel} />
      )}
    </AppShell>
  );
}
