import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, CircleAlert, Clock3, ImagePlus, MapPin, ShieldCheck } from "lucide-react";
import { createEvent } from "../../api/events";
import { getVenues } from "../../api/venues";

const inputClass = "mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-100";
const categories = ["Workshop", "Career", "Sports", "Cultural", "Academic", "Social", "Other"];

function Field({ label, children, className = "" }) { return <label className={`block text-sm font-medium text-slate-800 ${className}`}>{label}{children}</label>; }
function Panel({ title, children, className = "" }) { return <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}><h2 className="mb-5 text-lg font-bold">{title}</h2>{children}</section>; }

export default function CreateEvent() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [form, setForm] = useState({ title: "", category: "Workshop", organizingDepartment: "", description: "", date: "", startTime: "", endTime: "", venueId: "", capacity: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    getVenues().then((data) => { if (active) setVenues(Array.isArray(data) ? data : data?.content ?? data?.venues ?? []); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Venues could not be loaded."); })
      .finally(() => { if (active) setVenuesLoading(false); });
    return () => { active = false; };
  }, []);

  const setValue = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event) => {
    event.preventDefault(); setError("");
    if (!form.title.trim() || !form.description.trim() || !form.date || !form.startTime || !form.endTime || !form.venueId || !form.capacity) { setError("Complete the required event details before submitting."); return; }
    const start = new Date(`${form.date}T${form.startTime}`);
    const end = new Date(`${form.date}T${form.endTime}`);
    if (end <= start) { setError("The end time must be after the start time."); return; }
    setLoading(true);
    try {
      await createEvent({ title: form.title.trim(), category: form.category, organizingDepartment: form.organizingDepartment.trim(), description: form.description.trim(), dateTime: start.toISOString(), endDateTime: end.toISOString(), venueId: form.venueId, capacity: Number(form.capacity) });
      navigate("/organizer", { replace: true });
    } catch (requestError) { setError(requestError.response?.data?.message || "The event could not be submitted. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-[calc(100vh-140px)] bg-[#f7f7f8] px-5 py-8 text-slate-950 sm:px-8">
      <form onSubmit={submit} className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-slate-500">Organizer workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Create event</h1><p className="mt-2 text-slate-600">Complete the details below and submit for approval.</p></div><div className="flex gap-3"><Link to="/organizer" className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50">Cancel</Link><button type="submit" disabled={loading} className="rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50">{loading ? "Submitting…" : "Submit for approval"}</button></div></header>
        {error && <div role="alert" className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><CircleAlert size={18} />{error}</div>}
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
          <div className="space-y-6">
            <Panel title="Event details">
              <div className="grid gap-5">
                <Field label="Event name"><input className={inputClass} placeholder="Give your event a title" value={form.title} onChange={(e) => setValue("title", e.target.value)} disabled={loading} required /></Field>
                <div className="grid gap-5 sm:grid-cols-2"><Field label="Category"><select className={inputClass} value={form.category} onChange={(e) => setValue("category", e.target.value)} disabled={loading}>{categories.map((category) => <option key={category}>{category}</option>)}</select></Field><Field label="Organizing department / society"><input className={inputClass} value={form.organizingDepartment} onChange={(e) => setValue("organizingDepartment", e.target.value)} disabled={loading} /></Field></div>
                <Field label="Short description"><textarea maxLength={200} rows={4} className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none placeholder:text-slate-400 focus:border-sky-600 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-100" placeholder="Summarize the event for its listing" value={form.description} onChange={(e) => setValue("description", e.target.value)} disabled={loading} required /><span className="mt-1 block text-xs text-slate-500">Shown on the event card. Maximum 200 characters.</span></Field>
              </div>
            </Panel>
            <Panel title="Date, time and venue">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Date"><span className="relative block"><CalendarDays size={17} className="absolute left-3 top-[23px] text-slate-400" /><input type="date" className={`${inputClass} pl-10`} value={form.date} onChange={(e) => setValue("date", e.target.value)} disabled={loading} required /></span></Field>
                <Field label="Venue"><span className="relative block"><MapPin size={17} className="absolute left-3 top-[23px] text-slate-400" /><select className={`${inputClass} pl-10`} value={form.venueId} onChange={(e) => setValue("venueId", e.target.value)} disabled={loading || venuesLoading} required><option value="">{venuesLoading ? "Loading venues…" : "Select venue"}</option>{venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name ?? venue.venueName}</option>)}</select></span></Field>
                <Field label="Start time"><span className="relative block"><Clock3 size={17} className="absolute left-3 top-[23px] text-slate-400" /><input type="time" className={`${inputClass} pl-10`} value={form.startTime} onChange={(e) => setValue("startTime", e.target.value)} disabled={loading} required /></span></Field>
                <Field label="End time"><span className="relative block"><Clock3 size={17} className="absolute left-3 top-[23px] text-slate-400" /><input type="time" className={`${inputClass} pl-10`} value={form.endTime} onChange={(e) => setValue("endTime", e.target.value)} disabled={loading} required /></span></Field>
                <Field label="Registration capacity"><input type="number" min="1" className={inputClass} placeholder="Maximum number of attendees" value={form.capacity} onChange={(e) => setValue("capacity", e.target.value)} disabled={loading} required /></Field>
              </div>
            </Panel>
          </div>
          <aside className="space-y-6">
            <Panel title="Event image"><div className="grid min-h-44 place-items-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 px-6 text-center"><div><ImagePlus className="mx-auto text-slate-400" size={30} /><p className="mt-3 font-medium text-slate-700">Image upload is not available</p><p className="mt-1 text-sm text-slate-500">The current event API does not provide an image upload endpoint.</p></div></div></Panel>
            <Panel title="Approval workflow"><ol className="space-y-4 text-sm"><li className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-sky-700" />Submitted by organizer</li><li className="flex items-center gap-3 text-slate-500"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" />Faculty review</li><li className="flex items-center gap-3 text-slate-500"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" />ICT Services approval</li><li className="flex items-center gap-3 text-slate-500"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" />Published to students</li></ol><div className="mt-5 rounded-lg bg-sky-50 p-3 text-sm leading-5 text-sky-900"><ShieldCheck className="mb-2" size={18} />Your event is submitted to administrators for review.</div></Panel>
          </aside>
        </div>
      </form>
    </main>
  );
}
