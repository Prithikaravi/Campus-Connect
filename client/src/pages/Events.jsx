import { useState } from "react";
import { events, eventCategories } from "../data/mockData";
import PageHeader from "../components/PageHeader";
import EventCard from "../components/EventCard";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";

export default function Events() {
  // TODO (backend): replace `events` with data from  api.get("/api/events")
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [registered, setRegistered] = useState(new Set(events.filter((e) => e.registered).map((e) => e._id)));

  const filtered = events.filter(
    (e) =>
      (category === "All" || e.category === category) &&
      (!fromDate || e.date >= fromDate) &&
      (e.title + e.organizer + e.venue).toLowerCase().includes(search.toLowerCase())
  );

  // TODO (backend): call api.post(`/api/events/${id}/register`) here
  const handleRegister = (id) => setRegistered(new Set([...registered, id]));

  return (
    <div>
      <PageHeader title="Events" subtitle="Discover and register for what is happening on campus." />

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400"><Icon name="search" className="h-4 w-4" /></span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-[#5877D9] focus:outline-none focus:ring-2 focus:ring-[#5877D9]/20" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-[#5877D9] focus:outline-none">
          <option value="All">All categories</option>
          {eventCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} aria-label="From date"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-[#5877D9] focus:outline-none" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="calendar" title="No events found" message="Try changing your search, category or date." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => (
            <EventCard key={e._id} event={e} registered={registered.has(e._id)} onRegister={handleRegister} />
          ))}
        </div>
      )}
    </div>
  );
}